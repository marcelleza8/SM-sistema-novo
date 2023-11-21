// api.js
import axios from "axios";
import { useAuthStore } from "./stores/authStore"; // Importe a store de autenticação

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

// Interceptor de solicitações
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();

    if (authStore.isLoggedIn) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
