// src/context/CategoryContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const { token } = useContext(AuthContext);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories"); // backend returns global + user when token present
      const raw = Array.isArray(res.data) ? res.data : [];

      // Deduplicate by name (case-insensitive),
      // prefer user-specific categories over global ones
      const map = new Map();
      raw.forEach((c) => {
        const key = (c.name || "").trim().toLowerCase();
        if (!key) return;
        const existing = map.get(key);
        // if existing is global and current is user-specific -> replace
        const curIsGlobal = !!c.is_global;
        const existIsGlobal = existing ? !!existing.is_global : null;
        if (!existing) {
          map.set(key, c);
        } else if (existIsGlobal && !curIsGlobal) {
          map.set(key, c);
        }
        // otherwise keep existing (first occurrence)
      });

      setCategories(Array.from(map.values()));
      console.log("[CategoryContext] Categories loaded (deduped):", Array.from(map.values()));
    } catch (error) {
      console.error("[CategoryContext] Error fetching categories:", error);
      setCategories([]); // safe fallback
    }
  };

  useEffect(() => {
    // refetch when token changes (login/logout)
    fetchCategories();
  }, [token]);

  return (
    <CategoryContext.Provider value={{ categories, fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};
