// src/context/AuthContext.jsx
/**
 * AuthContext
 *
 * Cookie-first authentication strategy:
 * - login() posts credentials as form-encoded to /login. Server sets HttpOnly cookie.
 * - refreshUser() calls /users/me which is validated server-side using the cookie.
 * - logout() calls /logout endpoint to clear cookie and clears client state.
 *
 * Exposed API:
 *  - user: currently authenticated user object (or null)
 *  - token: legacy fallback token stored in localStorage (optional)
 *  - loading: boolean for async operations
 *  - login(username, password)
 *  - signup(userData)
 *  - logout()
 *  - refreshUser()
 *
 * Important:
 *  - Ensure src/services/api.js sets withCredentials: true so cookies are sent.
 *  - The backend must have CORS allow_credentials=True and the correct frontend origin.
 */

import { createContext, useEffect, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // fallback token while migrating clients — optional
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(false);

  // Refresh user data (server-side validated via cookie)
  const refreshUser = async () => {
    setLoading(true);
    try {
      // api instance should include withCredentials: true
      const res = await api.get("/users/me");
      setUser(res.data);
      return res.data;
    } catch (err) {
      // If unauthorized, clear local session state; rethrow for callers if needed
      console.warn("[AuthContext] refreshUser failed:", err?.response?.status, err?.message);
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
      // OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
      const form = new URLSearchParams();
      form.append("username", username);
      form.append("password", password);

      const res = await api.post("/login", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        withCredentials: true, // defensive: ensure cookie flows even if api instance is changed
      });

      // Debugging help while developing:
      console.debug("[AuthContext] /login response data:", res.data);
      // NOTE: browsers hide Set-Cookie in JS; but you can inspect res.headers in devtools:
      console.debug("[AuthContext] /login response headers:", res.headers);

      // If backend returns an access_token (legacy), keep it as fallback
      if (res.data?.access_token) {
        localStorage.setItem("token", res.data.access_token);
        setToken(res.data.access_token);
      }

      // Refresh user after login (server will validate cookie)
      await refreshUser();
    } catch (err) {
      console.error("[AuthContext] Login error:", err?.response?.status, err?.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Signup — creates the user. Note: signup returns the created user.
  const signup = async (data) => {
    try {
      const res = await api.post("/signup", data, { withCredentials: true });
      return res.data;
    } catch (err) {
      console.error("[AuthContext] Signup error", err);
      throw err;
    }
  };

  // Logout: call backend to clear cookie, then clear local state.
  const logout = async () => {
    setLoading(true);
    try {
      await api.post("/logout", {}, { withCredentials: true });
    } catch (err) {
      console.warn("[AuthContext] Logout request error:", err);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    // on mount try to rehydrate user session (cookie-based session persisted)
    refreshUser().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, logout, refreshUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
