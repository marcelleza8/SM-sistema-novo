import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import axios from "axios";
import router from "./router";
import { createPinia } from "pinia";

const app = createApp(App);

// Configuração global do Axios
app.config.globalProperties.$axios = axios;

app.use(router).use(createPinia()).mount("#app");
