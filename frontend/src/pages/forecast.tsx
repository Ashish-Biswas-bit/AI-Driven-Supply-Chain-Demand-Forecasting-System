import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { getProducts, generateForecast, getLatestForecast } from "../utils/api";
import { Sparkles, RefreshCw } from "lucide-react";

interface Product { id: number; name: string; sku: string; category: string; }
interface ForecastPoint { date: string; predicted: number; lower: number; upper: number; }

export default function ForecastPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [periods, setPeriods] = useState(30);
  const [forecastData, setForecastData] = useState<ForecastPoint[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getProducts({ limit: 100 }).then((r) => {
      setProducts(r.data);
      if (r.data.length > 0) setSelectedId(r.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedId) loadLatest(selectedId);
  }, [selectedId]);

  const loadLatest = async (id: number) => {
    setLoading(true);
    try {
      const r = await getLatestForecast(id);
      setForecastData(r.data);
    } catch { setForecastData([]); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    if (!selectedId) return;
    setGenerating(true);
    try {
      const r = await generateForecast(selectedId, periods);
      setForecastData(r.data.forecast);
      setMeta(r.data);
    } catch (e: any) {
      alert(e.response?.data?.detail || "Forecast generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  const chartData = forecastData.map((p) => ({
    date: p.date.slice(5),
    predicted: Math.round(p.predicted),
    lower: Math.round(p.lower),
    upper: Math.round(p.upper),
  }));

  const total = forecastData.reduce((s, p) => s + p.predicted, 0);
  const avg = forecastData.length > 0 ? total / forecastData.length : 0;
  const peak = forecastData.length > 0 ? Math.max(...forecastData.map((p) => p.predicted)) : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Demand Forecast</h1>
        <p className="text-sm text-gray-500 mt-0.5">AI-powered sales predictions using Facebook Prophet</p>
      </div>

      {/* Controls */}
      <div className="card flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-48">
          <label htmlFor="forecast-product" className="block text-xs font-medium text-gray-600 mb-1.5">Product</label>
          <select
            id="forecast-product"
            className="input"
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(+e.target.value)}
            aria-label="Select product for forecast"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
        </div>
        <div className="w-40">
          <label htmlFor="forecast-period" className="block text-xs font-medium text-gray-600 mb-1.5">Forecast Period</label>
          <select
            id="forecast-period"
            className="input"
            value={periods}
            onChange={(e) => setPeriods(+e.target.value)}
            aria-label="Select forecast period"
          >
            {[14, 30, 60, 90].map((d) => (
              <option key={d} value={d}>{d} days</option>
            ))}
          </select>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={handleGenerate}
          disabled={generating || !selectedId}
        >
          {generating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {generating ? "Generating..." : "Run Forecast"}
        </button>
      </div>

      {/* Summary stats */}
      {forecastData.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Forecasted (units)", value: Math.round(total).toLocaleString() },
            { label: "Avg Daily Demand", value: avg.toFixed(1) + " units/day" },
            { label: "Peak Demand Day", value: Math.round(peak) + " units" },
          ].map(({ label, value }) => (
            <div key={label} className="card text-center py-4">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-xl font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Demand Forecast Chart</h2>
          {meta?.model_used && (
            <span className="badge badge-info">Model: {meta.model_used}</span>
          )}
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
        ) : forecastData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Sparkles size={32} className="text-gray-300" />
            <p className="text-sm">Select a product and click "Run Forecast" to generate predictions.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="predicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a7fc1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1a7fc1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f4c81" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#0f4c81" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(chartData.length / 6)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="upper" stroke="none" fill="url(#band)" name="Upper bound" />
              <Area type="monotone" dataKey="lower" stroke="none" fill="white" name="Lower bound" />
              <Area type="monotone" dataKey="predicted" stroke="#1a7fc1" fill="url(#predicted)" strokeWidth={2} name="Predicted demand" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* AI Insight */}
      {meta?.ai_insight && (
        <div className="card border-l-4 border-brand-700 bg-blue-50">
          <div className="flex items-start gap-3">
            <Sparkles size={16} className="text-brand-700 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-brand-700 mb-1">AI Insight</p>
              <p className="text-sm text-gray-700">{meta.ai_insight}</p>
              {meta.accuracy_score && (
                <p className="text-xs text-gray-500 mt-1">
                  Model accuracy: {(meta.accuracy_score * 100).toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
