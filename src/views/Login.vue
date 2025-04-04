<template>
  <v-app>
    <v-main class="bg-[url('./public/login001.png')] bg-cover">
      <v-container class="fill-height d-flex align-center justify-center">
        <LoginForm />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import LoginForm from "../components/LoginForm.vue";
</script>

<style>
.glass {
  @apply bg-pink-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-100;
}
</style>
