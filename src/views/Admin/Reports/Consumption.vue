<template>
  <DashboardLayout>
    <v-container class="py-4">
      <v-card class="pa-4" max-width="100%">
        <v-form v-model="formValido" @submit.prevent="buscarRelatorio">
          <v-row>
            <v-col>
              <v-select
                v-model="selectedContract"
                :items="contracts"
                item-title="name"
                item-value="id"
                :disabled="carregando"
                label="Contrato de chip"
                :rules="[(v) => !!v || 'Selecione um contrato']"
                required
              />
            </v-col>
            <v-col>
              <v-text-field
                v-model="mesAno"
                label="Mês/Ano (MM-YY)"
                :rules="[validaMesAno]"
                placeholder="03-25"
                :disabled="carregando"
                required
              />
            </v-col>
          </v-row>

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
        <h1>{{ timer }}</h1>
      </v-card>
      <v-card class="mt-5" v-if="relatorio.length">
        <v-data-table :headers="headers" :items="relatorio" class="elevation-1">
          <template #item.consumo_total="{ item }">
            {{ formatarBytes(item.consumo_total) }}
          </template>
        </v-data-table>
      </v-card>
    </v-container>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "../../../api";
import DashboardLayout from "../../../layouts/DashboardLayout.vue";
import useTimer from "../../../composable/useTimer";

const contracts = ref([]);

const selectedContract = ref<number | null>(null);
const mesAno = ref("");
const relatorio = ref<any[]>([]);
const carregando = ref(false);
const formValido = ref(false);

const { timer, start, pause, reset } = useTimer();

const headers = [
  { title: "Telefone", key: "phone_number" },
  { title: "ICC", key: "icc" },
  { title: "Status", key: "status" },
  { title: "Plano", key: "plan" },
  { title: "Serial", key: "imei" },
  { title: "Consumo Total", key: "consumo_total" },
  { title: "SMS", key: "consumo_sms_mensal" },
  { title: "Adicionado em", key: "created_at" },
  { title: "Cancelado em", key: "deleted_at" },
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
  const formatoAPI = `${anoCompleto}-${mes}`;

  relatorio.value = [];
  reset();
  start();
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
    pause();
  }
}

async function fetchContracts() {
  const contractResponse = await api.get("admin/contrato-chip/clientes-ativos");

  contracts.value = contractResponse.data;
}

onMounted(async () => {
  await fetchContracts();
});
</script>
