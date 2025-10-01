// context/CategoryContext.jsx
import { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories/");
      setCategories(res.data);
      console.log("[CategoryContext] Categories loaded:", res.data);
    } catch (error) {
      console.error("[CategoryContext] Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider value={{ categories, fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};

