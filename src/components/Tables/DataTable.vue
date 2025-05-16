<template>
  <v-container fluid>
    <v-row no-gutters>
      <v-col cols="12" md="4">
        <v-select
          label="Filtrar por Status"
          :items="statusOptions"
          v-model="selectedStatus"
          item-value="id"
          @update:modelValue="emitFiltro"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          label="Filtrar por Cliente"
          :items="clienteOptions"
          item-value="id"
          v-model="selectedCliente"
          @update:modelValue="emitFiltro"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          label="Filtrar por Conta"
          :items="contaOptions"
          item-value="id"
          v-model="selectedConta"
          @update:modelValue="emitFiltro"
        />
      </v-col>
    </v-row>

    <v-text-field
      v-model="search"
      label="Buscar"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      class="mb-4"
      @input="emitFiltro"
    />

    <v-data-table
      :headers="headers"
      :items="items"
      :page="pagination.page"
      @update:page="$emit('update:page', $event)"
      :items-per-page="pagination.itemsPerPage"
      :server-items-length="pagination.total"
      @update:items-per-page="$emit('update:items-per-page', $event)"
      :loading="loading"
      class="elevation-1"
    >
      <template #item.actions="{ item }">
        <div class="d-flex justify-end ga-2">
          <v-btn
            size="small"
            color="green"
            :to="{ name: 'AdminChipEditFormPage', params: { id: item.id } }"
          >
            Editar
          </v-btn>
        </div>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import api from "../../api";

const props = defineProps({
  items: Array,
  loading: Boolean,
  pagination: {
    type: Object,
    required: true, // { page, itemsPerPage, total }
  },
});

const emit = defineEmits([
  "update:search",
  "update:page",
  "update:items-per-page",
]);

const search = ref("");

const statusOptions = ref([
  {
    id: null,
    title: "Todos",
  },
  {
    id: 4,
    title: "Disponível",
  },
  {
    id: 1,
    title: "Ativo",
  },
  {
    id: 5,
    title: "Bloqueio",
  },
  {
    id: 3,
    title: "Cancelado",
  },
  {
    id: 6,
    title: "Comodato",
  },
  {
    id: 2,
    title: "Inativo",
  },
  {
    id: 7,
    title: "Inativo Novo",
  },
  {
    id: 8,
    title: "Suspenso",
  },
]); // virá via props ou fetch externo
const clienteOptions = ref([]);
const contaOptions = ref([]);

const selectedStatus = ref(null);
const selectedCliente = ref(null);
const selectedConta = ref(null);

function emitFiltro() {
  const payload = {
    search: search.value,
    status: selectedStatus.value,
    cliente: selectedCliente.value,
    conta: selectedConta.value,
  };

  emit("update:search", payload);
}

const headers = [
  { title: "Linha", value: "line" },
  { title: "ICCID", value: "iccid" },
  { title: "Status", value: "status" },
  { title: "Ações", value: "actions", sortable: false },
];

onMounted(async () => {
  const resPlano = await api.get("admin/planos");
  contaOptions.value = resPlano.data.planos.map((i: any) => ({
    title: i.name,
    id: i.id,
  }));
  contaOptions.value = [{ title: "Todos", id: null }, ...contaOptions.value];

  const resCliente = await api.get("admin/clientes");
  clienteOptions.value = resCliente.data.map((i: any) => ({
    title: i.name,
    id: i.id,
  }));
  clienteOptions.value = [
    { title: "Todos", id: null },
    ...clienteOptions.value,
  ];
});
</script>
