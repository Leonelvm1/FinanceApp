// src/services/api.js
/**
 * Axios API instance (cookie-first)
 *
 * Purpose:
 *  - Centralized API client for the frontend.
 *  - withCredentials: true ensures HttpOnly cookies are sent/received.
 *
 * Usage:
 *  - Import the default `api` for custom requests.
 *  - Use the convenience functions below for standard endpoints.
 *
 * Environment:
 *  - Use VITE_API_URL to change the backend base URL in production/deploys.
 *  - For dev you can also use a Vite proxy to avoid CORS.
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
  headers: {
    // Sensible default — axios sets content-type automatically for URLSearchParams
    "Accept": "application/json",
  },
});

// Minimal interceptor; keep it light. Expand to add auth/refresh logic if needed.
api.interceptors.request.use((cfg) => cfg, (err) => Promise.reject(err));

export default api;

// Convenience exports for endpoints used by the UI
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
