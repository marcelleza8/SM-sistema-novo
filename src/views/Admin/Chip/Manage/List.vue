<template>
  <DashboardLayout>
    <div class="flex justify-between my-4 mb-6 mr-4">
      <h1 class="text-3xl">Lista de Chip</h1>
      <button class="bg-green-200 px-4 py-1 rounded-md font-bold">
        Adicionar
      </button>
    </div>
    <DataTable :items="items"></DataTable>
    <Pagination
      class="mt-4"
      :currentPage="currentPage"
      :totalPages="totalPages"
      @update:currentPage="fetchData"
    />
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from "../../../../layouts/DashboardLayout.vue";
import DataTable from "../../../../components/Tables/DataTable.vue";
import Pagination from "../../../../components/Paginations/Pagination.vue";
import api from "../../../../api";
import { onMounted, ref } from "vue";

const items = ref([]);
const currentPage = ref(1);
const totalPages = ref(0);

async function fetchData(page = 1) {
  const response = await api.get(`admin/chip/?page=${page}`);
  console.log(response.data);
  items.value = response.data.data;
  currentPage.value = response.data.meta.current_page;
  totalPages.value = response.data.meta.last_page;
}

onMounted(() => fetchData());
</script>

<style scoped>
table {
  @apply w-full border;
}

table tr,
table tr th,
table tr td {
  @apply border;
}
</style>
