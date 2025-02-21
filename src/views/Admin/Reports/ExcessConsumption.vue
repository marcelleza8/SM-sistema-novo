<template>
  <v-container>
    <!-- Tabela principal: cada linha representa um cliente -->
    <v-data-table
      :headers="clientHeaders"
      :items="groupedData"
      item-value="clientId"
      show-expand
      :expanded.sync
      v-model:expanded="expanded"
      class="elevation-1"
    >
      <template v-slot:item.clientId="{ item }">
        <strong>{{
          clients.filter((c: any) => c.id == item.clientId)[0].name
        }}</strong>
      </template>
      <template #expanded-row="{ columns, item }">
        <td colspan="100%">
          <v-simple-table dense>
            <tbody>
              <tr
                v-for="historyItem in item.history"
                :key="historyItem.rawDate"
              >
                <td>{{ historyItem.consumoTotal }}</td>
                <td>{{ historyItem.phone_number }}</td>
                <td>{{ historyItem.imei }}</td>
                <td>{{ historyItem.formattedDate }}</td>
                <td>{{ historyItem.imei_aparelho }}</td>
                <td>{{ historyItem.plan_name }}</td>
              </tr>
            </tbody>
          </v-simple-table>
        </td>
      </template>
      <!-- Exibe a quantidade de itens no histórico -->
      <template #item.history="{ item }">
        {{ item.history.length }}
      </template>
      <!-- Exibe a quantidade de itens no histórico -->
      <template #item.acoes="{ item }">
        <v-btn primary>Enviar e-mail</v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { ref, computed } from "vue";
import { VContainer, VDataTable } from "vuetify/components";
import api from "../../../api";

interface HistoryItem {
  phone_number: string;
  imei: string;
  plan_name: string;
  consumoTotal: string;
  imei_aparelho: string;
  formattedDate: string;
  rawDate: string;
}

interface ClientGroup {
  clientId: string;
  history: HistoryItem[];
}

// Simulação da resposta do backend
const apiResponse = ref();

const clients = ref();

// Array reativo que armazenará os IDs dos itens expandidos
const expanded = ref();

// Computed que agrupa os dados por cliente e simplifica o histórico
const groupedData = computed<ClientGroup[]>(() => {
  const groups: Record<string, ClientGroup> = {};

  for (const key in apiResponse.value) {
    if (Object.prototype.hasOwnProperty.call(apiResponse.value, key)) {
      // Exemplo de chave: "ClientExcedPerSIMCardConsumption_535_20250212204653"
      const parts = key.split("_");
      const clientId = parts[1];
      const rawDate = parts[2];
      const hour = rawDate.substring(8, 10);
      const minutes = rawDate.substring(10, 12);
      const seconds = rawDate.substring(12, 14);
      const day = rawDate.substring(6, 8);
      const month = rawDate.substring(4, 6);
      const year = rawDate.substring(0, 4);
      const formattedDate = `${day}/${month}/${year} ${hour}:${minutes}`;
      const records = apiResponse.value[key].d;

      if (!groups[clientId]) {
        groups[clientId] = { clientId, history: [] };
      }

      // Simplificando o histórico: usa apenas o primeiro registro e adiciona as datas formatadas
      groups[clientId].history.push({
        ...records[0],
        formattedDate,
        rawDate,
      });
    }
  }

  // Ordena o histórico de cada cliente (opcional, por data)
  Object.values(groups).forEach((group) => {
    group.history.sort((a, b) => a.rawDate.localeCompare(b.rawDate));
  });

  return Object.values(groups);
});

// Cabeçalhos da tabela principal (clientes)
const clientHeaders = [
  { title: "Cliente", value: "clientId", sortable: true },
  { title: "Total Datas", value: "history", sortable: true },
  { title: "Ações", value: "acoes" },
];

// Cabeçalhos da tabela interna (histórico)
const historyHeaders = [
  { text: "Data", value: "formattedDate" },
  { text: "Phone Number", value: "phone_number" },
  { text: "Plan Name", value: "plan_name" },
  { text: "Consumo Total", value: "consumoTotal" },
  { text: "IMEI", value: "imei" },
  { text: "IMEI Aparelho", value: "imei_aparelho" },
];

onMounted(async () => {
  const clientsApi = await api.get("admin/clientes");
  clients.value = clientsApi.data;

  const response = await api.get("admin/report/ultrapassou-limite");
  apiResponse.value = response.data;
});
</script>

<style scoped>
/* Adicione estilos conforme necessário */
</style>
