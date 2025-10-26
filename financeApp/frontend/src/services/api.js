// src/services/api.js
/**
 * Axios instance configured for cookie-based auth.
 * - withCredentials: true lets browser send HttpOnly cookies to backend.
 * - We keep a localStorage token fallback for backward compatibility.
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  withCredentials: true, // send cookies on cross-site requests
});

// Fallback: attach Authorization header if a token exists in localStorage.
// This maintains compatibility with older token-based clients.
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token && !config.headers?.Authorization) {
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
      }
    } catch (err) {
      // ignore errors (e.g., SSR, incognito)
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

/* --- Convenience exports (same as before) --- */
export const getIncomes = () => api.get("/incomes");
export const createIncome = (data) => api.post("/incomes", data);
export const updateIncome = (id, data) => api.put(`/incomes/${id}`, data);
export const deleteIncome = (id) => api.delete(`/incomes/${id}`);

export const getExpenses = () => api.get("/expenses");
export const createExpense = (data) => api.post("/expenses", data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

export const getCategories = () => api.get("/categories");
export const createCategory = (data) => api.post("/categories", data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);
