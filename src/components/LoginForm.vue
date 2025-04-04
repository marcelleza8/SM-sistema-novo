<template>
  <v-card min-width="400" outlined color="transparent" class="pa-4 glass">
    <v-card-title class="text-h5">SM Gestão M2M - Sistema Novo</v-card-title>
    <v-form @submit.prevent="login">
      <v-text-field
        label="E-mail"
        v-model="credentials.email"
        :disabled="requesting"
        type="email"
        required
        outlined
      />
      <v-text-field
        label="Senha"
        v-model="credentials.password"
        :disabled="requesting"
        type="password"
        required
        outlined
      />
      <div class="d-flex">
        <v-spacer></v-spacer>
        <v-btn
          :disabled="requesting"
          :loading="requesting"
          color="primary"
          size="x-large"
          type="submit"
          class="ma-2"
        >
          Login
        </v-btn>
      </div>

      <v-alert type="error" v-if="error">
        {{ error }}
      </v-alert>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/authStore";
import router from "../router";

const authStore = useAuthStore();
const credentials = ref({ email: "", password: "" });
const error = ref("");
const requesting = ref(false);

async function login() {
  requesting.value = true;
  try {
    await authStore.login(credentials.value);
    router.push({ name: "Admin/Dashboard" });
  } catch {
    error.value = "Falha no login. Verifique suas credenciais.";
    setTimeout(() => (error.value = ""), 3500);
  }
  requesting.value = false;
}
</script>
