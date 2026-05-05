import axios from "axios";

const denoApi = axios.create({
  baseURL: import.meta.env.VITE_API_DENO_URL,
});

export default denoApi;
