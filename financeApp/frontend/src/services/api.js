// src/services/api.js
/**
 * Axios instance configured for cookie-based auth (HttpOnly cookie 'access_token').
 *
 * - withCredentials: true ensures the browser sends cookies to the backend.
 * - This version intentionally does NOT attach Authorization header from localStorage.
 *   The backend is configured to read the 'access_token' cookie only.
 *
 * All API helper functions are exported for convenience.
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  withCredentials: true, // send cookies on cross-site requests
});

export default api;

// --- Convenience exports (same signatures used by the app) ---
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
