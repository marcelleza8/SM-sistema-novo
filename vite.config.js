import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import packageJson from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    "process.env": {
      VUE_APP_VERSION: packageJson.version,
    },
  },
});
