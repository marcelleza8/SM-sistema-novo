<template>
  <div class="flex flex-col h-screen">
    <!-- Cabeçalho -->
    <header
      v-if="!showOnlyContent"
      class="bg-blue-500 text-white p-4 flex justify-between items-center"
    >
      <RouterLink :to="{ name: 'Admin/Dashboard' }" class="font-semibold">{{ APPNAME }}</RouterLink>
      <button class="cursor-pointer hover:text-gray-200" title="Sair" @click="logout">
        <i class="mdi mdi-logout text-2xl leading-none"></i>
      </button>
    </header>

    <!-- Menu Superior (árvore em cascata + faixa de favoritos/recentes) -->
    <nav
      v-if="!showOnlyContent"
      class="bg-gray-200 px-4 py-2"
    >
      <MenuBar />
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
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { useMenuStore } from "../stores/menuStore";
import { findLeaf } from "../utils/menuTree";
import MenuBar from "../components/MenuBar.vue";

const APPNAME = import.meta.env.VITE_APPNAME;
const appVersion = process.env.VUE_APP_VERSION;

const props = defineProps({
  showOnlyContent: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();
const route = useRoute();
const menu = useMenuStore();

// Registra a visita a cada navegação — alimenta a fila de recentes.
watch(
  () => route.name,
  (name) => {
    const leaf = findLeaf(name);
    if (leaf) menu.visit(leaf);
  },
  { immediate: true }
);

const logout = async () => {
  await useAuthStore().logout();
  router.push({ name: "Login" });
};
</script>

<style>
.nav-link {
  color: #374151;
  padding-bottom: 2px;
  border-bottom: 2px solid transparent;
}
.nav-link:hover {
  color: #2563eb;
}
.nav-link.router-link-active {
  color: #2563eb;
  font-weight: 600;
  border-bottom-color: #2563eb;
}
</style>
