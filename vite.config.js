import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

import packageJson from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    "process.env": {
      VUE_APP_VERSION: packageJson.version,
    },

    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
