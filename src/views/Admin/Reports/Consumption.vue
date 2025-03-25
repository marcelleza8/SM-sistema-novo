<template>
  <v-container class="py-4">
    <v-card class="pa-4" max-width="600">
      <v-form v-model="formValido" @submit.prevent="buscarRelatorio">
        <v-select
          v-model="selectedContract"
          :items="contracts"
          item-title="label"
          item-value="id"
          label="Contrato"
          :rules="[(v) => !!v || 'Selecione um contrato']"
          required
        />

        <v-text-field
          v-model="mesAno"
          label="Mês/Ano (MM-YY)"
          :rules="[validaMesAno]"
          placeholder="03-25"
          required
        />

        <v-btn
          type="submit"
          :disabled="!formValido || carregando"
          class="mt-3"
          color="primary"
          block
        >
          Buscar Relatório
        </v-btn>
      </v-form>
    </v-card>
    <v-card class="mt-5" v-if="relatorio.length">
      <v-data-table :headers="headers" :items="relatorio" class="elevation-1">
        <template #item.consumo_total="{ item }">
          {{ formatarBytes(item.consumo_total) }}
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import api from "../../../api";

// Contratos simulados (ou pode carregar via API)
const contracts = [
  { id: 257, label: "Contrato A" },
  { id: 214, label: "Contrato B" },
];

const selectedContract = ref<number | null>(null);
const mesAno = ref("");
const relatorio = ref<any[]>([]);
const carregando = ref(false);
const formValido = ref(false);

const headers = [
  { title: "Telefone", key: "phone_number" },
  { title: "ICC", key: "icc" },
  { title: "Status", key: "status" },
  { title: "Plano", key: "plan" },
  { title: "Consumo Total", key: "consumo_total" },
  { title: "SMS", key: "consumo_sms_mensal" },
  { title: "Criado em", key: "created_at" },
  { title: "Deletado em", key: "deleted_at" },
];

function validaMesAno(v: string) {
  const regex = /^(0[1-9]|1[0-2])-(\d{2})$/;
  return regex.test(v) || "Formato deve ser MM-YY";
}

function formatarBytes(bytes: number = null) {
  if (!bytes) return null;
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(1)} ${units[i]}`;
}

async function buscarRelatorio() {
  if (!selectedContract.value || !validaMesAno(mesAno.value) === true) return;

  const [mes, ano] = mesAno.value.split("-");
  const anoCompleto = `20${ano}`;
  const formatoAPI = `${anoCompleto}-${mes}`; // ex: 2025-03

  try {
    carregando.value = true;

    const response = await api.post("admin/report/relatorio-consumo", {
      contract: selectedContract.value,
      mes_ano: formatoAPI,
    });

    relatorio.value = response.data;
  } catch (err) {
    console.error("Erro ao buscar relatório:", err);
    relatorio.value = [];
  } finally {
    carregando.value = false;
  }
}
</script>
