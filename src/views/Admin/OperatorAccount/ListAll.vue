<template>
  <DashboardLayout>
    <v-container>
      <v-row>
        <v-col>
          <v-text-field v-model="search" label="Buscar conta" />
        </v-col>
        <v-col class="d-flex justify-end">
          <v-btn v-if="false" @click="openDialog(null)" color="primary"
            >Adicionar Conta</v-btn
          >
        </v-col>
      </v-row>

      <v-data-table
        :headers="headers"
        :items="filteredPlanos"
        :search="search"
        class="elevation-1"
        :items-per-page="10"
        item-value="id"
      >
        <template v-slot:item.acao="{ item }">
          <v-btn icon @click="openDialog(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn v-if="false" icon @click="confirmDelete(item)">
            <v-icon color="red">mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
      <OperadoraContaDialog :toEdit="selectedToEdit" v-model="formDialog" />
    </v-container>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import DashboardLayout from "../../../layouts/DashboardLayout.vue";
import OperadoraContaDialog from "./OperadoraContaDialog.vue";
import api from "../../../api";

const search = ref("");
const selectedToEdit = ref(null);
const formDialog = ref(false);
const headers = [
  { title: "Plano Conta", value: "title", sortable: true },
  { title: "Total de SIM", value: "totalSIMs", sortable: true },
  { title: "Ação", value: "acao", sortable: false },
];

const contas = ref([]);

const filteredPlanos = computed(() => {
  if (!search.value) return contas.value;
  return contas.value.filter((operadora) =>
    operadora.name.toLowerCase().includes(search.value.toLowerCase())
  );
});

function openDialog(conta) {
  selectedToEdit.value = conta;
  formDialog.value = true;
}

function editOperadora(item) {
  // Ação de edição
}

function confirmDelete(item) {
  // Ação de confirmação para excluir
}

onMounted(async () => {
  const response = await api.get("admin/contas");

  contas.value = response.data.contas;
});
</script>
