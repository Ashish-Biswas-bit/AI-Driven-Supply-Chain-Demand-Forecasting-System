import { useState } from "react";
import { useRouter } from "next/router";
import { importExploreFile } from "../utils/api";
import { UploadCloud, Database, ArrowRight } from "lucide-react";

export default function ImportDataPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    setResult(null);
    try {
      const response = await importExploreFile(file);
      setResult(response.data);
    } catch (uploadError: any) {
      setError(uploadError.response?.data?.detail || "Import failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Import Real Data</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload a CSV or Excel explore file to replace the demo dataset and refresh the dashboards.
        </p>
      </div>

      <div className="card space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <UploadCloud className="text-brand-700" size={20} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Upload your explore file</h2>
            <p className="text-sm text-gray-500 mt-1">
              Supported columns: product_id, product_name, category, unit_price, quantity, total, date, channel.
              Excel sheets and CSV files are both supported.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="data-file" className="block text-xs font-medium text-gray-600">
            Choose a file
          </label>
          <input
            id="data-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            className="input"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          <p className="text-xs text-gray-400">The import will clear the current products, sales, forecasts, inventory, and alerts data.</p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        {result && (
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-2 text-sm text-green-900">
            <p className="font-medium">{result.message}</p>
            <p>Sales imported: {result.sales_imported}</p>
            <p>Products created: {result.products_created}</p>
            <p>Products updated: {result.products_updated}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button className="btn-primary flex items-center gap-2" onClick={handleUpload} disabled={!file || uploading}>
            <Database size={14} />
            {uploading ? "Importing..." : "Import Data"}
          </button>
          <button className="btn-secondary flex items-center gap-2" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}