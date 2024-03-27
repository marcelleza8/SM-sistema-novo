<template>
  <DashboardLayout>
    <h1>Dashboard</h1>
    <div class="flex">
      <RouterLink
        class="px-8 py-7 bg-pink-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30 border border-gray-100"
        :to="{ name: 'Admin/Chip/Busca' }"
        >Busca de Chip</RouterLink
      >
      <RouterLink
        class="px-8 py-7 bg-pink-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30 border border-gray-100"
        :to="{ name: 'AdminChipListPage' }"
        >Busca de chip</RouterLink
      >
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from "../layouts/DashboardLayout.vue";
</script>

<style scoped></style>
