// src/context/CategoryContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const { token } = useContext(AuthContext); // to re-fetch when auth changes

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories"); // now handles optional auth
      setCategories(res.data);
      console.log("[CategoryContext] Categories loaded:", res.data);
    } catch (error) {
      console.error("[CategoryContext] Error fetching categories:", error);
    }
  };

  // fetch at mount and whenever token changes (login/logout)
  useEffect(() => {
    fetchCategories();
  }, [token]);

  return (
    <CategoryContext.Provider value={{ categories, fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};

