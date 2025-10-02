import { createContext, useEffect, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

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

  const login = async (username, password) => {
    try {
      const form = new URLSearchParams();
      form.append("username", username);
      form.append("password", password);
      const res = await api.post("/login", form);
      localStorage.setItem("token", res.data.access_token);
      setToken(res.data.access_token);
    } catch (err) {
      console.error("[AuthContext] Login error", err);
      throw err;
    }
  };

  const signup = async (data) => {
    try {
      const res = await api.post("/signup", data);
      console.log("[AuthContext] User registered:", res.data);
      // optionally setUser/res directly if you want to auto-login after signup
    } catch (err) {
      console.error("[AuthContext] Signup error", err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) refreshUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
