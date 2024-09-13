<template>
  <div class="flex flex-col h-screen">
    <!-- Cabeçalho -->
    <header class="bg-blue-500 text-white p-4 flex justify-between">
      <RouterLink :to="{ name: 'Admin/Dashboard' }">{{ APPNAME }}</RouterLink>
      <span class="cursor-pointer" @click="logout">LOGOUT</span>
    </header>

    <!-- Menu Superior -->
    <nav class="bg-gray-200 p-4">
      <!-- Links do Menu -->
    </nav>

    <!-- Área do Dashboard -->
    <main class="flex-1 p-4 overflow-auto">
      <slot></slot>
    </main>

    <!-- Rodapé -->
    <footer class="bg-gray-500 text-white p-4 flex justify-end">
      <div>V. {{ appVersion }}</div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";

const APPNAME = import.meta.env.VITE_APPNAME;
const appVersion = process.env.VUE_APP_VERSION;
const router = useRouter();

const logout = async () => {
  await useAuthStore().logout();
  router.push({ name: "Login" });
};
</script>

<style>
/* Estilos adicionais se necessário */
</style>
