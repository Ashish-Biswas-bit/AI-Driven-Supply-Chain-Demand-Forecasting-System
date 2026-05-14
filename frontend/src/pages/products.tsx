import { useEffect, useState } from "react";
import { getProducts, createProduct, updateInventory, deleteProduct } from "../utils/api";
import { Plus, Pencil, Trash2, Warehouse } from "lucide-react";

interface Product {
  id: number; name: string; sku: string; category: string;
  unit_price: number; safety_stock: number; reorder_point: number; lead_time_days: number;
}

const EMPTY_FORM = {
  name: "", sku: "", category: "Electronics", unit_price: 0,
  safety_stock: 10, reorder_point: 20, lead_time_days: 7,
};
const CATEGORIES = ["Electronics", "Apparel", "Home & Garden", "Sports", "Food & Beverage", "Other"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [stockQty, setStockQty] = useState(0);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const load = () =>
    getProducts({ category: categoryFilter || undefined })
      .then((r) => setProducts(r.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [categoryFilter]);

  const handleCreate = async () => {
    await createProduct(form);
    setShowModal(false);
    setForm(EMPTY_FORM);
    load();
  };

  const handleUpdateStock = async () => {
    if (!activeProduct) return;
    await updateInventory(activeProduct.id, { current_stock: stockQty });
    setShowStockModal(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    await deleteProduct(id);
    load();
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} total SKUs</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <label className="sr-only" htmlFor="product-search">
          Search products
        </label>
        <input
          id="product-search"
          className="input max-w-xs"
          placeholder="Search name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="sr-only" htmlFor="category-filter">
          Filter products by category
        </label>
        <select
          id="category-filter"
          className="input max-w-xs"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label="Filter products by category"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Product", "SKU", "Category", "Price", "Safety Stock", "Reorder Point", "Lead Time", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No products found.</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3"><span className="badge badge-info">{p.category}</span></td>
                  <td className="px-4 py-3 text-gray-700">${p.unit_price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-700">{p.safety_stock}</td>
                  <td className="px-4 py-3 text-gray-700">{p.reorder_point}</td>
                  <td className="px-4 py-3 text-gray-700">{p.lead_time_days}d</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        title="Update stock"
                        className="p-1.5 text-gray-400 hover:text-brand-700 hover:bg-blue-50 rounded transition-colors"
                        onClick={() => { setActiveProduct(p); setStockQty(0); setShowStockModal(true); }}
                      >
                        <Warehouse size={14} />
                      </button>
                      <button
                        title="Delete"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showModal && (
        <Modal title="Add New Product" onClose={() => setShowModal(false)} onConfirm={handleCreate} confirmLabel="Create Product">
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Product Name", "name", "text"],
              ["SKU", "sku", "text"],
              ["Unit Price ($)", "unit_price", "number"],
              ["Safety Stock", "safety_stock", "number"],
              ["Reorder Point", "reorder_point", "number"],
              ["Lead Time (days)", "lead_time_days", "number"],
            ].map(([label, key, type]) => (
              <div key={key}>
                <label htmlFor={`product-${key}`} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input
                  id={`product-${key}`}
                  type={type}
                  className="input"
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: type === "number" ? +e.target.value : e.target.value })}
                />
              </div>
            ))}
            <div>
              <label htmlFor="product-category" className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select id="product-category" className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} aria-label="Select product category">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Stock Update Modal */}
      {showStockModal && activeProduct && (
        <Modal title={`Update Stock — ${activeProduct.name}`} onClose={() => setShowStockModal(false)} onConfirm={handleUpdateStock} confirmLabel="Update">
          <div>
            <label htmlFor="stock-quantity" className="block text-xs font-medium text-gray-600 mb-1">New Stock Quantity</label>
            <input
              id="stock-quantity"
              type="number"
              className="input"
              value={stockQty}
              onChange={(e) => setStockQty(+e.target.value)}
              aria-label="New stock quantity"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose, onConfirm, confirmLabel }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {children}
        <div className="flex justify-end gap-3 pt-2">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
