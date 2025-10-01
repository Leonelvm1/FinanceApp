// src/services/api.js
import axios from "axios";

/**
 * Axios instance configured with base URL and token interceptor.
 * The token is automatically attached to every request.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

// ✅ Request interceptor to attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[Axios Interceptor] Sending token in headers:", token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

// ===== Incomes =====
export const getIncomes = () => api.get("/incomes");
export const createIncome = (data) => api.post("/incomes", data);
export const updateIncome = (id, data) => api.put(`/incomes/${id}`, data);
export const deleteIncome = (id) => api.delete(`/incomes/${id}`);

// ===== Expenses =====
export const getExpenses = () => api.get("/expenses");
export const createExpense = (data) => api.post("/expenses", data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// ===== Categories =====
export const getCategories = () => api.get("/categories");
export const createCategory = (data) => api.post("/categories", data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);
