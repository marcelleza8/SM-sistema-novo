import { createApp } from "vue";
import "./style.css";
import "vuetify/styles"; // Importa os estilos básicos do Vuetify
import App from "./App.vue";
import axios from "axios";
import router from "./router";
import { createPinia } from "pinia";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const app = createApp(App);

// Crie a instância do Vuetify
const vuetify = createVuetify({
  components,
  directives,
});

// Configuração global do Axios
app.config.globalProperties.$axios = axios;

app.use(router).use(vuetify).use(createPinia()).mount("#app");
