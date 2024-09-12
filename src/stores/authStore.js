import { defineStore } from "pinia";
import api from "../api";
import useLocalStorage from "../composable/useLocalStorage"; // Importe o composable

const localStorageHandler = useLocalStorage(); // Inicializa o composable

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorageHandler.get("auth-token"),
    isAuthenticated: !!localStorageHandler.get("auth-token"),
  }),
  getters: {
    // Getter para verificar se o usuário está autenticado
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    async login(credentials) {
      // const localStorageHandler = useLocalStorage(); // Inicializa o composable

      // Faz a requisição para autenticação e obtenção do token
      const response = await api.post("/oauth/token", {
        ...credentials,
        grant_type: import.meta.env.VITE_GRANT_TYPE,
        client_id: import.meta.env.VITE_CLIENT_ID,
        client_secret: import.meta.env.VITE_CLIENT_SECRET,
        scope: import.meta.env.VITE_SCOPE,
      });

      this.token = response.data.token;
      this.isAuthenticated = true;

      // Armazena o token com uma expiração de 1 hora (60 minutos)
      localStorageHandler.set("auth-token", this.token, 60); // Expira em 60 minutos

      return response;
    },
    async logout() {
      // const localStorageHandler = useLocalStorage(); // Inicializa o composable
      try {
        await api.post("/logout");
      } catch (error) {
        throw "Erro ao logout";
      }
      localStorageHandler.clear("auth-token"); // Remove o token ao fazer logout
      this.token = "";
      this.isAuthenticated = false;
    },
    // Verifica se o token já expirou com base no "e" (expiração) do localStorage
    isTokenExpired() {
      // const localStorageHandler = useLocalStorage();
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
      // const localStorageHandler = useLocalStorage(); // Inicializa o composable

      const token = localStorageHandler.get("auth-token"); // Recupera o token se ainda estiver válido
      if (token) {
        this.token = token;
        this.isAuthenticated = true;
      } else {
        this.token = "";
        this.isAuthenticated = false;
      }
    },
  },
});
