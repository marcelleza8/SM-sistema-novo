import axios from "axios";
import { useAuthStore } from "./stores/authStore"; // Importe a store de autenticação

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // Definindo a URL base da API
});

// Interceptor de solicitações para adicionar o token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore(); // Acessa a store de autenticação

    // Verifica se o usuário está autenticado e se o token está disponível
    if (authStore.isLoggedIn) {
      config.headers.Authorization = `Bearer ${authStore.token}`; // Adiciona o token ao cabeçalho Authorization
    }

    return config; // Retorna a configuração atualizada da requisição
  },
  (error) => {
    return Promise.reject(error); // Lida com erros ao configurar a requisição
  }
);

// Interceptor de respostas para verificar erros relacionados à autenticação (ex: token expirado)
api.interceptors.response.use(
  (response) => {
    return response; // Se a resposta for bem-sucedida, retorna a resposta normalmente
  },
  async (error) => {
    const authStore = useAuthStore();

    // Verifica se o erro é 401 (não autorizado, o que pode indicar token expirado)
    if (
      error.response &&
      error.response.status === 401 &&
      !authStore.isTokenExpired()
    ) {
      console.error("Token expirado ou inválido.");

      // Chama o logout na store, removendo o token e deslogando o usuário
      // await authStore.logout();

      // Aqui você pode redirecionar o usuário para a página de login ou mostrar uma notificação
    }

    return Promise.reject(error); // Lida com outros erros
  }
);

export default api;
