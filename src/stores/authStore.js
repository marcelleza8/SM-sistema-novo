import { defineStore } from "pinia";
import api from "../api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("auth-token") || "",
    isAuthenticated: false,
  }),
  getters: {
    // Getter para verificar se o usuário está autenticado
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    async login(credentials) {
      const response = await api.post("/oauth/token", {
        ...credentials,
        grant_type: import.meta.env.VITE_GRANT_TYPE,
        client_id: import.meta.env.VITE_CLIENT_ID,
        client_secret: import.meta.env.VITE_CLIENT_SECRET,
        scope: import.meta.env.VITE_SCOPE,
      });
      this.token = response.data.token;
      this.isAuthenticated = true;
      localStorage.setItem("auth-token", this.token);
      return response;
    },
    async logout() {
      this.token = "";
      this.isAuthenticated = false;
      try {
        await api.post("/logout");
        localStorage.clear();
        // localStorage.removeItem("auth-token");
      } catch (error) {
        throw "Erro ao logout";
      }
    },
    // Inicializa o estado de autenticação com base no Local Storage
    initializeAuth() {
      this.token = localStorage.getItem("auth-token") || "";
      this.isAuthenticated = !!this.token;
    },
  },
});
