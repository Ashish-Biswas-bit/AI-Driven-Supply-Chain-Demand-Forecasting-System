import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: API_URL });

// ── Dashboard ─────────────────────────────────────────
export const getDashboardStats = () => api.get("/api/dashboard/stats");

// ── Products ──────────────────────────────────────────
export const getProducts = (params?: { category?: string; skip?: number; limit?: number }) =>
  api.get("/api/products", { params });

export const createProduct = (data: object) => api.post("/api/products", data);
export const updateProduct = (id: number, data: object) => api.put(`/api/products/${id}`, data);
export const deleteProduct = (id: number) => api.delete(`/api/products/${id}`);
export const getInventory = (id: number) => api.get(`/api/products/${id}/inventory`);
export const updateInventory = (id: number, data: { current_stock: number; warehouse_location?: string }) =>
  api.put(`/api/products/${id}/inventory`, data);

// ── Sales ─────────────────────────────────────────────
export const getSales = (params?: { product_id?: number; days?: number }) =>
  api.get("/api/sales", { params });

export const recordSale = (data: { product_id: number; quantity: number; channel?: string }) =>
  api.post("/api/sales", data);

export const getMonthlySales = (months = 12) =>
  api.get("/api/sales/summary/monthly", { params: { months } });

// ── Forecasts ─────────────────────────────────────────
export const generateForecast = (product_id: number, periods = 30) =>
  api.post("/api/forecasts/generate", { product_id, periods });

export const getLatestForecast = (product_id: number) =>
  api.get(`/api/forecasts/${product_id}/latest`);

// ── Alerts ────────────────────────────────────────────
export const getAlerts = (resolved = false, severity?: string) =>
  api.get("/api/alerts", { params: { resolved, severity } });

export const resolveAlert = (id: number) => api.put(`/api/alerts/${id}/resolve`);
export const runAlertCheck = () => api.post("/api/alerts/run-check");

// ── Data Import ───────────────────────────────────────
export const importExploreFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/api/import-data", formData);
};

export default api;
