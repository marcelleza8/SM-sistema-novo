<template>
  <DashboardLayout>
    <div class="flex justify-between my-4 mb-6 mr-4">
      <h1 class="text-3xl">Lista de Chips</h1>
      <RouterLink
        :to="{ name: 'AdminChipAddFormPage' }"
        class="bg-green-200 px-4 py-1 rounded-md font-bold"
      >
        Adicionar
      </RouterLink>
    </div>

    <p>
      <span>Total: {{ pagination.total }}</span>
    </p>

    <DataTable
      :items="items"
      :pagination="pagination"
      :loading="loading"
      @update:search="onFiltro"
      @update:items-per-page="onItemsPerPageChange"
    />
    <AdvancedPaginator
      v-if="false"
      :page="pagination.page"
      :total-pages="Math.ceil(pagination.total / pagination.itemsPerPage)"
      @update:page="onPageChange"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, emit } from "vue";
import DashboardLayout from "../../../../layouts/DashboardLayout.vue";
import DataTable from "../../../../components/Tables/DataTable.vue";
import api from "../../../../api";
import AdvancedPaginator from "../../../../components/Paginations/AdvancedPaginator.vue";

const items = ref([]);
const loading = ref(false);
const search = ref("");

const emit = defineEmits([
  "update:search",
  "update:page",
  "update:items-per-page",
]);

const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  total: 0,
});

const filtros = reactive({
  search: "",
  status: null,
  cliente: null,
  conta: null,
});

async function fetchData() {
  loading.value = true;
  try {
    const response = await api.get("/admin/chip", {
      params: {
        page: pagination.page,
        per_page: pagination.itemsPerPage,
        search: filtros.search,
        status: filtros.status,
        cliente: filtros.cliente,
        conta: filtros.conta,
      },
    });

    items.value = response.data.data;

    pagination.total = response.data.meta.total;
  } finally {
    loading.value = false;
  }
}

function onPageChange(val: number) {
  //
  pagination.page = val;
  fetchData();
}

function onFiltro(payload: any) {
  filtros.search = payload.search;
  filtros.status = payload.status;
  filtros.cliente = payload.cliente;
  filtros.conta = payload.conta;
  pagination.page = 1;
  fetchData();
}

function onItemsPerPageChange(val: number) {
  pagination.itemsPerPage = val;
  pagination.page = 1;
  fetchData();
}

onMounted(fetchData);
</script>
