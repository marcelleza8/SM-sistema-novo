<script setup lang="ts">
import DashboardLayout from "../../../layouts/DashboardLayout.vue";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "../../../api";
import ContractInfo from "../../../components/Admin/Contracts/ContractInfo.vue";
import AnexoLote from "../../../components/Admin/Contracts/AnexoLote.vue";

const route = useRoute();

const tab = ref(ref(route.params.tabId || "geral"));
const contract = ref<any>(null);

onMounted(async () => {
  const id = route.params.id;
  const response = await api.get(`/admin/contrato-chip/${id}`);
  contract.value = response.data;
});
</script>
<template>
  <DashboardLayout>
    <v-card v-if="contract">
      <v-tabs v-model="tab" bg-color="primary" dark>
        <v-tab value="geral">Geral</v-tab>
        <v-tab value="anexos">Anexos</v-tab>
        <v-tab value="timeline">Linha do Tempo</v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item value="geral">
          <v-card flat class="pa-4">
            <ContractInfo :contract="contract" />
            <AnexoLote :contract="contract" />
          </v-card>
        </v-window-item>

        <v-window-item value="anexos">
          <v-card flat class="pa-4">Conteúdo da aba Anexos</v-card>
        </v-window-item>

        <v-window-item value="timeline">
          <v-card flat class="pa-4">Conteúdo da aba Timeline</v-card>
        </v-window-item>
      </v-window>
    </v-card>
  </DashboardLayout>
</template>
