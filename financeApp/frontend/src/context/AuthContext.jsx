import { createContext, useEffect, useState } from "react"

import api from "../api/axios"

export const AuthContext = createContext();

export const AuthProvider = ({children})=> {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    useEffect(() =>{
        if (token){
            api.get("/users/me")
            .then((res) => setUser(res.data))
            .catch(() => logout());
        }
    }, [token]);

    const login = async (username, password) => {
        const form = new URLSearchParams();
        form.append("username", username);
        form.append("password", password);

        const res = await api.post("/login", form);
        localStorage.setItem("token", res.data.access_token);
        setToken(res.data.access_token);
    };

    const signup = async (data) => {
        await api.post("/signup", data);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{user, token, login,signup, logout}}>
        {children}    
        </AuthContext.Provider>
    );
};