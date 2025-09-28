import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000", // Back end URL
});

//Interceptor to add token automaticly

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.authotization = `Bearer ${token}`;
            console.log("[Axios Interceptor] Enviando token en headers:", token)
        }

        return config
    });

export default api;
