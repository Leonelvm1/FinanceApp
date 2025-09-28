import { createContext, useEffect, useState } from "react";
import api from "../api/axios"; // Asegúrate de que esta instancia tenga el interceptor configurado

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // ✅ Verificamos el token al montar o cuando cambia
  useEffect(() => {
    if (token) {
      console.log("[AuthContext] Token encontrado, verificando usuario...");
      api
        .get("/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          console.log("[AuthContext] Usuario obtenido:", res.data);
          setUser(res.data);
        })
        .catch((err) => {
          console.error("[AuthContext] Error al obtener usuario:", err);
          logout();
        });
    }
  }, [token]);

  // ✅ Login
  const login = async (username, password) => {
    try {
      const form = new URLSearchParams();
      form.append("username", username);
      form.append("password", password);

      console.log("[AuthContext] Enviando login con:", username);

      const res = await api.post("/login", form);
      console.log("[AuthContext] Respuesta login:", res.data);

      localStorage.setItem("token", res.data.access_token);
      setToken(res.data.access_token);
    } catch (error) {
      console.error("[AuthContext] Error en login:", error);
    }
  };

  // ✅ Registro
  const signup = async (data) => {
    try {
      const res = await api.post("/signup", data);
      console.log("[AuthContext] Usuario registrado:", res.data);
    } catch (error) {
      console.error("[AuthContext] Error en signup:", error);
    }
  };

  // ✅ Logout
  const logout = () => {
    console.log("[AuthContext] Cerrando sesión...");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
