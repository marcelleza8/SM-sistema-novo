<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div>
        <label for="username">Username:</label>
        <input id="username" v-model="credentials.email" type="text" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input
          id="password"
          v-model="credentials.password"
          type="password"
          required
        />
      </div>
      <button type="submit">Login</button>
      <p v-if="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/authStore";

const authStore = useAuthStore();
const credentials = ref({ email: "", password: "" });
const error = ref("");

async function login() {
  try {
    await authStore.login(credentials.value);
    // Redirecionar para a página principal ou dashboard após o login
  } catch (err) {
    error.value = "Falha no login. Verifique suas credenciais.";
  }
}
</script>

<style>
/* Estilos básicos para a página de login */
.login-container {
  max-width: 300px;
  margin: auto;
  padding: 20px;
}

.login-container h1 {
  text-align: center;
}

.login-container form {
  display: flex;
  flex-direction: column;
}

.login-container label {
  margin-bottom: 5px;
}

.login-container input {
  margin-bottom: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.login-container button {
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: blue;
  color: white;
  cursor: pointer;
}

.login-container button:hover {
  background-color: navy;
}

.login-container p {
  color: red;
  text-align: center;
}
</style>
