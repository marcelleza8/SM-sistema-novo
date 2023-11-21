<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { onMounted } from "vue";

onMounted(() => {
  const script = document.createElement("script");

  script.src = "https://buttons.github.io/buttons.js";
  script.async = true;

  document.body.appendChild(script);
});
</script>

<template>
  <RouterView />
</template>
