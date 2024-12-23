import { defineStore } from "pinia";
import api from "../api";
import useLocalStorage from "../composable/useLocalStorage";

const localStorageHandler = useLocalStorage();

export const useAuthStore = defineStore("auth", {
  getters: {
    // Getter para verificar se o usuário está autenticado
    isLoggedIn: (state) => !!localStorageHandler.get("auth-token"),
    token: (state) => localStorageHandler.get("auth-token"),
  },
  actions: {
    async login(credentials) {
      // Faz a requisição para autenticação e obtenção do token
      const response = await api.post("/oauth/token", {
        ...credentials,
        grant_type: import.meta.env.VITE_GRANT_TYPE,
        client_id: import.meta.env.VITE_CLIENT_ID,
        client_secret: import.meta.env.VITE_CLIENT_SECRET,
        scope: import.meta.env.VITE_SCOPE,
      });

      // Armazena o token com uma expiração de 1 hora (60 minutos)
      localStorageHandler.set("auth-token", response.data.token, 60);

      return response;
    },
    async logout() {
      try {
        await api.post("/logout");
      } catch (error) {
        // throw "Erro ao logout";
      }
      this.clear();
    },
    // Verifica se o token já expirou com base no "e" (expiração) do localStorage
    isTokenExpired() {
      const storedToken = localStorageHandler.get("auth-token");

      if (!storedToken) return true; // Sem token, considera expirado

      const dataAtual = new Date().getTime();

      // Verifica se o token expirou baseado no valor "e" (expiração)
      if (dataAtual > storedToken.e) {
        return true; // Token expirado
      }

      return false; // Token ainda válido
    },
    // Inicializa o estado de autenticação com base no Local Storage
    initializeAuth() {
      const token = localStorageHandler.get("auth-token"); // Recupera o token se ainda estiver válido
      if (token) {
      } else {
        this.clear();
      }
    },
    clear() {
      localStorageHandler.clear("auth-token"); // Remove o token ao fazer logout
    },
  },
});
