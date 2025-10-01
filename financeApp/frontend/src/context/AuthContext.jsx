import { createContext, useEffect, useState } from "react";
import api from "../services/api"; // ✅ Axios instance with interceptors

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  /**
   * 🔄 Refresh the currently authenticated user's data.
   * This will be called automatically when the app mounts
   * if a token is found in localStorage.
   */
  const refreshUser = async () => {
    try {
      const res = await api.get("/users/me");
      console.log("[AuthContext] User refreshed:", res.data);
      setUser(res.data);
    } catch (err) {
      console.error("[AuthContext] Error refreshing user", err);
      logout();
    }
  };

  /**
   * 🔐 Log in the user with credentials.
   * The backend returns a JWT token which is stored in localStorage
   * and automatically sent in subsequent requests by Axios interceptor.
   */
  const login = async (username, password) => {
    try {
      const form = new URLSearchParams();
      form.append("username", username);
      form.append("password", password);

      console.log("[AuthContext] Logging in with:", username);

      const res = await api.post("/login", form);
      console.log("[AuthContext] Login response:", res.data);

      localStorage.setItem("token", res.data.access_token);
      setToken(res.data.access_token);
    } catch (error) {
      console.error("[AuthContext] Login error:", error);
    }
  };

  /**
   * 📝 Register a new user.
   * Once registration is successful, the user can log in normally.
   */
  const signup = async (data) => {
    try {
      const res = await api.post("/signup", data);
      console.log("[AuthContext] User registered:", res.data);
    } catch (error) {
      console.error("[AuthContext] Signup error:", error);
    }
  };

  /**
   * 🚪 Log out the user.
   * Clears token and user state from both localStorage and React state.
   */
  const logout = () => {
    console.log("[AuthContext] Logging out...");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  /**
   * 🧠 When the app mounts or the token changes:
   * If a token is found, try to refresh the current user's data.
   */
  useEffect(() => {
    if (token) {
      console.log("[AuthContext] Token found, verifying user...");
      refreshUser();
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        signup,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
