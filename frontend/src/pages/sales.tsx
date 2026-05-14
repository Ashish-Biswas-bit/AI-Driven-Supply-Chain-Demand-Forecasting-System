import { useEffect, useState } from "react";
import { getSales, recordSale, getProducts, getMonthlySales } from "../utils/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Plus, ShoppingCart } from "lucide-react";

interface Sale {
  id: number; product_id: number; quantity: number;
  unit_price: number; total_amount: number; sale_date: string; channel: string;
}
interface Product { id: number; name: string; sku: string; }

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ product_id: 0, quantity: 1, channel: "online" });
  const [days, setDays] = useState(365);

  const load = () => {
    setLoading(true);
    const months = Math.max(1, Math.ceil(days / 30));
    Promise.all([getSales({ days }), getMonthlySales(months)])
      .then(([s, m]) => {
        setSales(s.data || []);
        setMonthly((m.data || []).map((r: any) => ({
          month: r.month?.slice(5) || r.month || "",
          revenue: Math.round(r.revenue || 0),
          units: r.units || 0
        })));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [days]);

  useEffect(() => {
    getProducts({ limit: 100 }).then((r) => {
      setProducts(r.data);
      if (r.data.length > 0) setForm((f) => ({ ...f, product_id: r.data[0].id }));
    });
  }, []);

  const handleRecord = async () => {
    try {
      await recordSale(form);
      setShowModal(false);
      load();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Failed to record sale.");
    }
  };

  const totalRevenue = sales.reduce((s, r) => s + r.total_amount, 0);
  const totalUnits   = sales.reduce((s, r) => s + r.quantity, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Sales</h1>
          <p className="text-sm text-gray-500 mt-0.5">{sales.length} transactions in last {days} days</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Record Sale
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",    value: `$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: "Units Sold",       value: totalUnits.toLocaleString() },
          { label: "Transactions",     value: sales.length },
          { label: "Avg Order Value",  value: sales.length ? `$${(totalRevenue / sales.length).toFixed(2)}` : "$0" },
        ].map(({ label, value }) => (
          <div key={label} className="card text-center py-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-xl font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Period filter + Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-sm font-semibold text-gray-700">Monthly Revenue Trend</h2>
          <label htmlFor="sales-days-filter" className="sr-only">
            Select sales time range
          </label>
          <select
            id="sales-days-filter"
            className="input w-36"
            value={days}
            onChange={(e) => setDays(+e.target.value)}
            aria-label="Select sales time range"
          >
            {[7, 30, 60, 90, 180, 365, 730].map((d) => (
              <option key={d} value={d}>Last {d} days</option>
            ))}
          </select>
        </div>
        {monthly.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#0f4c81" radius={[3, 3, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
            No monthly data available. Import data to see revenue trends.
          </div>
        )}
      </div>

      {/* Sales table */}
      <div className="card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Date", "Product ID", "Qty", "Unit Price", "Total", "Channel"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>{[...Array(6)].map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                ))}</tr>
              ))
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No sales records found. Record a sale or import data to see transactions.
                </td>
              </tr>
            ) : sales.slice(0, 50).map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(s.sale_date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-gray-700">#{s.product_id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{s.quantity}</td>
                <td className="px-4 py-3 text-gray-600">${s.unit_price.toFixed(2)}</td>
                <td className="px-4 py-3 font-medium text-green-700">${s.total_amount.toFixed(2)}</td>
                <td className="px-4 py-3"><span className="badge badge-info capitalize">{s.channel}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center gap-3">
              <ShoppingCart size={20} className="text-brand-700" />
              <h2 className="text-base font-semibold text-gray-900">Record New Sale</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="sale-product" className="block text-xs font-medium text-gray-600 mb-1.5">Product</label>
                <select
                  id="sale-product"
                  className="input"
                  value={form.product_id}
                  onChange={(e) => setForm({ ...form, product_id: +e.target.value })}
                  aria-label="Select product for sale"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sale-quantity" className="block text-xs font-medium text-gray-600 mb-1.5">Quantity</label>
                <input
                  id="sale-quantity"
                  type="number" min={1} className="input"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: +e.target.value })}
                  aria-label="Sale quantity"
                />
              </div>
              <div>
                <label htmlFor="sale-channel" className="block text-xs font-medium text-gray-600 mb-1.5">Channel</label>
                <select id="sale-channel" className="input" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} aria-label="Select sales channel">
                  {["online", "retail", "wholesale"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleRecord}>Record Sale</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
