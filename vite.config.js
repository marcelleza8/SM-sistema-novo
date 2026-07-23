import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import packageJson from "./package.json";

// Alvo do backend para o proxy do dev server (nginx do docker, porta 8000).
// Sobrescreva com VITE_DEV_PROXY_TARGET se usar outra porta/host.
const devProxyTarget =
  process.env.VITE_DEV_PROXY_TARGET || "http://localhost:8000";

export default defineConfig({
  // Servido sob /sistema-novo/ (mesmo base do router: createWebHistory("/sistema-novo")).
  // Sem isto o Vite gera assets em "/assets" (raiz) e eles dao 404 sob /sistema-novo/.
  base: "/sistema-novo/",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  define: {
    "process.env": {
      VUE_APP_VERSION: packageJson.version,
    },
  },
  // Aplica-se apenas ao `npm run dev` (não afeta o build de produção).
  server: {
    host: true,
    port: 5173,
    proxy: {
      // API Laravel (/api/v1) e Deno (/api/v2) passam pelo nginx.
      "/api": {
        target: devProxyTarget,
        changeOrigin: true,
      },
    },
  },
});
