// src/context/AuthContext.jsx
/**
 * AuthContext - cookie-first approach (HttpOnly cookie)
 * - login() posts credentials as form-encoded to /login. Server sets HttpOnly cookie.
 * - refreshUser() calls /users/me which is validated server-side using the cookie.
 * - logout() calls /logout endpoint to clear cookie and clears client state.
 *
 * Keep a token in localStorage only as a fallback while migrating (optional).
 */

import { createContext, useEffect, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);

  // Refresh user data (server-side validated via cookie)
  const refreshUser = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/me");
      setUser(res.data);
      return res.data;
    } catch (err) {
      setUser(null);
      localStorage.removeItem("token");
      setToken(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login: expect server to set HttpOnly cookie; also keep access_token fallback.
  const login = async (username, password) => {
    setLoading(true);
    try {
      const form = new URLSearchParams();
      form.append("username", username);
      form.append("password", password);

      const res = await api.post("/login", form);
      // If backend returns an access_token (legacy), keep it as fallback
      if (res.data?.access_token) {
        localStorage.setItem("token", res.data.access_token);
        setToken(res.data.access_token);
      }

      // Refresh user after login (server will use cookie if set)
      await refreshUser();
    } catch (err) {
      console.error("[AuthContext] Login error", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Signup — creates the user. Note: signup returns the created user.
  const signup = async (data) => {
    try {
      const res = await api.post("/signup", data);
      return res.data;
    } catch (err) {
      console.error("[AuthContext] Signup error", err);
      throw err;
    }
  };

  // Logout: call backend to clear cookie, then clear local state.
  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.warn("[AuthContext] Logout request error:", err);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    // on mount try to rehydrate user session (cookie-based session persisted)
    refreshUser().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
