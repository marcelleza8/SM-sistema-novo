<template>
  <div class="bg-[url('./public/login001.png')] bg-cover w-full">
    <div class="grid place-content-center place-items-center h-screen">
      <form
        class="bg-pink-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30 border border-gray-100 p-8 flex space-y-8 flex-col"
        @submit.prevent="login"
      >
        <!-- <img src="logo-sm-Solucoes.png" /> -->
        <div class="flex flex-col">
          <label class="text-xl text-white" for="username">E-mail:</label>
          <input
            id="username"
            v-model="credentials.email"
            type="text"
            required
          />
        </div>
        <div class="flex flex-col">
          <label class="text-xl text-white" for="password">Senha:</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            required
          />
        </div>
        <button class="px-4 py-3 text-2xl text-white bg-pink-800" type="submit">
          Login
        </button>
        <p
          class="bg-white/50 text-red-800 text-2xl max-w-sm px-2 py-1 rounded-lg"
          v-if="error"
        >
          {{ error }}
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const credentials = ref({ email: "", password: "" });
const error = ref("");

const router = useRouter();

async function login() {
  try {
    const request = await authStore.login(credentials.value);
    router.push({ name: "Admin/Dashboard" });
  } catch (err) {
    error.value = "Falha no login. Verifique suas credenciais.";
    setTimeout(() => {
      error.value = "";
    }, 3500);
  }
}
</script>

<style></style>
