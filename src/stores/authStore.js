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
      try {
        const response = await api.post("/oauth/token", {
          ...credentials,
          grant_type: "password",
          client_id: "6",
          client_secret: "ltmQDoZTXiwPOuYAdx1bI9z1KvJBB0dzHixtv20x",
          scope: "",
        });
        this.token = response.data.token;
        this.isAuthenticated = true;
        localStorage.setItem("auth-token", this.token);
      } catch (error) {
        console.log(error);
        // Tratar erro de login
      }
    },
    logout() {
      this.token = "";
      this.isAuthenticated = false;
      localStorage.removeItem("auth-token");
      // Talvez fazer uma chamada API para invalidar o token no servidor
    },
    // Inicializa o estado de autenticação com base no Local Storage
    initializeAuth() {
      this.token = localStorage.getItem("auth-token") || "";
      this.isAuthenticated = !!this.token;
    },
  },
});
