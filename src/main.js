import { createApp } from "vue";
import "./style.css";
import "vuetify/styles"; // Importa os estilos básicos do Vuetify
import "@mdi/font/css/materialdesignicons.css";

import App from "./App.vue";
import axios from "axios";
import router from "./router";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import { pt } from "vuetify/locale";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import { VDateInput } from "vuetify/labs/components";

const app = createApp(App);

// Crie a instância do Vuetify
const vuetify = createVuetify({
  components: {
    ...components,
    VDateInput,
  },
  directives,
  theme: {
    defaultTheme: "light", // Padrão claro
    themes: {
      light: {
        colors: {
          background: "#FFFFFF",
          surface: "#FFFFFF",
          primary: "#ce4b6c",
          secondary: "#bc2841",
        },
      },
      dark: {
        colors: {
          background: "#121212",
          surface: "#121212",
          primary: "#BB86FC",
          secondary: "#03DAC6",
        },
      },
    },
  },
  locale: {
    locale: "pt",
    messages: { pt },
  },
});

// Configuração global do Axios
app.config.globalProperties.$axios = axios;

app.use(router).use(vuetify).use(createPinia()).mount("#app");
