<template>
  <DashboardLayout>
    <h1>Dashboard</h1>
    <div class="flex space-x-4">
      <RouterLink
        class="px-8 py-7 bg-pink-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30 border border-gray-100"
        :to="{ name: 'Admin/Chip/Busca' }"
        >Busca de Chip</RouterLink
      >
      <RouterLink
        v-if="false"
        class="px-8 py-7 bg-pink-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30 border border-gray-100"
        :to="{ name: 'AdminChipListPage' }"
        >Lista de Chip</RouterLink
      >
      <RouterLink
        class="px-8 py-7 bg-pink-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30 border border-gray-100"
        :to="{ name: 'AdminOperadoraListPage' }"
        >Operadoras</RouterLink
      >
      <RouterLink
        class="px-8 py-7 bg-pink-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30 border border-gray-100"
        :to="{ name: 'AdminChipListPage' }"
        >SIM card</RouterLink
      >
      <RouterLink
        class="px-8 py-7 bg-pink-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30 border border-gray-100"
        :to="{ name: 'AdminOperadoraAccountListPage' }"
        >Contas de operadora</RouterLink
      >
      <RouterLink
        class="px-8 py-7 bg-pink-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30 border border-gray-100"
        :to="{ name: 'AdminSystemJobsList' }"
        >Jobs</RouterLink
      >
      <!-- <RouterLink
        class="px-8 py-7 bg-pink-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30 border border-gray-100"
        :to="{ name: 'ExcessConsumption' }"
        >Excesso de consumo de Chip</RouterLink
      > -->
      <RouterLink
        class="px-8 py-7 bg-pink-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-30 border border-gray-100"
        :to="{ name: 'ReportConsumption' }"
        >Relatório consumo</RouterLink
      >
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from "../layouts/DashboardLayout.vue";
</script>

<style scoped></style>
