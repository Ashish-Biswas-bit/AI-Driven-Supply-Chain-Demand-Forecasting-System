import axios from "axios";
import Router from "next/router";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: API_URL });

// Request interceptor — attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      try {
        const token = localStorage.getItem("sc_access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // localStorage unavailable
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      // Clear expired/invalid token
      try {
        localStorage.removeItem("sc_access_token");
      } catch {
        // localStorage unavailable
      }
      Router.push("/login");
    }
    return Promise.reject(error);
  }
);

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

// ── Subscription ───────────────────────────────────────
export const getCurrentUser = () => api.get("/api/auth/me");

export const updateSubscription = (plan: string) =>
  api.put(`/api/auth/subscription?plan=${plan}`);

export default api;
