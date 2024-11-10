<template>
  <DashboardLayout>
    <v-container>
      <v-row>
        <v-col>
          <v-text-field v-model="search" label="Buscar por operadora" />
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn v-if="false" @click="openDialog(null)" color="primary"
            >Adicionar Operadora</v-btn
          >
        </v-col>
      </v-row>

      <v-data-table
        :headers="headers"
        :items="filteredOperadoras"
        :search="search"
        class="elevation-1"
        :items-per-page="10"
        item-value="id"
      >
        <template v-slot:item.acao="{ item }">
          <v-btn v-if="false" icon @click="openDialog(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn v-if="false" icon @click="confirmDelete(item)">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
      <OperadoraDialog :toEdit="selectedToEdit" v-model="formDialog" />
    </v-container>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import DashboardLayout from "../../../layouts/DashboardLayout.vue";
import OperadoraDialog from "./OperadoraDialog.vue";
import api from "../../../api";

const search = ref("");
const selectedToEdit = ref(null);
const formDialog = ref(false);
const headers = [
  { title: "Nome da Operadora", value: "name", sortable: true },
  { title: "Ação", value: "acao", sortable: false },
];

const operadoras = ref([]);

const filteredOperadoras = computed(() => {
  if (!search.value) return operadoras.value;
  return operadoras.value.filter((operadora) =>
    operadora.name.toLowerCase().includes(search.value.toLowerCase())
  );
});

function openDialog(id = null) {
  selectedToEdit.value = id;
  formDialog.value = true;
}

function editOperadora(item) {
  // Ação de edição
}

function confirmDelete(item) {
  // Ação de confirmação para excluir
}

onMounted(async () => {
  const response = await api.get("admin/operadoras", {
    params: {
      api: true,
    },
  });

  operadoras.value = response.data.operadoras;
});
</script>
