<template>
  <v-card title="Contratos" flat>
    <!-- Campo de busca dentro do slot "text" -->
    <template #text>
      <v-text-field
        v-model="search"
        label="Buscar por Razão Social"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        single-line
        clearable
      />
    </template>

    <!-- Tabela com dados -->
    <v-data-table
      :headers="headers"
      :items="filteredContracts"
      item-value="id"
      class="elevation-1"
    >
      <!-- Renderização da razão social aninhada -->
      <template #item.razao_social="{ item }">
        {{ item.client.name }}
      </template>

      <!-- Coluna de ações com botões responsivos -->
      <template #item.actions="{ item }">
        <div
          class="d-flex flex-wrap ga-2"
          :class="$vuetify.display.smAndDown ? 'flex-column' : 'flex-row'"
        >
          <router-link
            :to="{
              name: 'AdminContractEditPage',
              params: { id: item.id, tabId: 'anexos' },
            }"
            class="tag-button"
          >
            Incluir anexo
          </router-link>

          <router-link
            :to="{ name: 'AdminContractEditPage', params: { id: item.id } }"
            class="tag-button"
          >
            Editar contrato
          </router-link>

          <router-link
            :to="{ name: 'AdminContractEditPage', params: { id: item.id } }"
            class="tag-button"
          >
            Detalhes
          </router-link>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import api from "../../../api";

const headers = [
  { title: "Razão Social", value: "razao_social", sortable: false },
  { title: "Ações", value: "actions", sortable: false },
];

const contracts = ref([]);
const search = ref("");

// Filtro com suporte a curinga %
const filteredContracts = computed(() => {
  if (!search.value) return contracts.value;

  const pattern = search.value
    .replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&")
    .replace(/%/g, ".*");

  const regex = new RegExp(pattern, "i");

  return contracts.value.filter((c) => regex.test(c.client?.name || ""));
});

onMounted(async () => {
  const responseContracts = await api.get("admin/contrato-chip/");
  contracts.value = responseContracts.data.contracts;
});
</script>

<style scoped>
.tag-button {
  padding: 4px 12px;
  border-radius: 12px;
  background-color: #e0e0e0;
  color: #000;
  text-decoration: none;
  font-weight: 500;
  display: inline-block;
  text-align: center;
  white-space: nowrap;
}
.tag-button:hover {
  background-color: #bdbdbd;
}
</style>
