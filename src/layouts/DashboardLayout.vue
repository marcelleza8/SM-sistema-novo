<template>
  <div class="flex flex-col h-screen">
    <!-- Cabeçalho -->
    <header
      v-if="!showOnlyContent"
      class="bg-blue-500 text-white p-4 flex justify-between items-center"
    >
      <div class="flex items-center space-x-6">
        <RouterLink :to="{ name: 'Admin/Dashboard' }">{{ APPNAME }}</RouterLink>
        <RouterLink
          :to="{ name: 'AdminKnowledgeBase' }"
          class="text-sm hover:underline"
          >Base de Conhecimento</RouterLink
        >
      </div>
      <span class="cursor-pointer" @click="logout">LOGOUT</span>
    </header>

    <!-- Menu Superior -->
    <nav v-if="!showOnlyContent" class="bg-gray-200 p-4">
      <!-- Links do Menu -->
    </nav>

    <!-- Área do Dashboard -->
    <main class="flex-1 p-4">
      <slot></slot>
    </main>

    <!-- Rodapé -->
    <footer
      v-if="!showOnlyContent"
      class="bg-gray-500 text-white px-6 py-0.5 flex justify-end"
    >
      <div>V. {{ appVersion }}</div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";

const APPNAME = import.meta.env.VITE_APPNAME;
const appVersion = process.env.VUE_APP_VERSION;

const props = defineProps({
  showOnlyContent: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();

const logout = async () => {
  await useAuthStore().logout();
  router.push({ name: "Login" });
};
</script>

<style>
/* Estilos adicionais se necessário */
</style>
