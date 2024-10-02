<template>
  <v-container fluid>
    <v-data-table
      v-model="selectedItems"
      :headers="headers"
      :items="filteredItems"
      :search="search"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      return-object
      show-select
      class="elevation-1"
      :mobile="null"
      :mobile-breakpoint="'sm'"
      :loading-text="'Buscando linhas da sua conta'"
      @update:model-value="onSelectionChange"
    >
      <template v-slot:top>
        <div class="flex justify-between px-2">
          <div
            class="font-bold text-blue-800 dark:text-blue-400"
            v-if="selectedItems.length"
          >
            <span>{{ selectedItems.length }}</span>
            Selecionados
          </div>
          <div>
            Mostrando
            <span class="text-orange-800">{{ filteredItems.length }}</span> de
            <span class="text-green-800">{{ items.length }}</span>
            resultados
          </div>
        </div>
        <v-text-field
          v-model="search"
          label="Pesquise por linha ou ICCID"
          clearable
        ></v-text-field>
      </template>

      <!-- Customização do campo de consumo total -->
      <template v-slot:item.consumoTotal="{ item }">
        {{
          item.consumoTotal
            ? useHumanReadableBytes().formatBytes(item.consumoTotal, "MB")
            : ""
        }}
      </template>

      <!-- Customização do campo de último acesso -->
      <template v-slot:item.ultimoAcesso="{ item }">
        <span :title="dateUtils.timeAgo(item?.ultimoAcesso || '')">{{
          dateUtils.formatDate(item?.ultimoAcesso || "", "dd/MM/yyyy HH:mm")
        }}</span>
        <!-- <span>{{ item.ultimoAcesso }}</span> -->
      </template>

      <!-- <template v-slot:item.actions="{ item }">
          <v-btn @click="editItem(item)">Editar</v-btn>
          <v-btn @click="deleteItem(item)">Excluir</v-btn>
        </template> -->
    </v-data-table>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useHumanReadableBytes } from "../../composable/useHumanReadableBytes";
import { useDateUtils } from "../../composable/useDateUtils";

// Define o método emit para comunicar com o componente pai
const emit = defineEmits(["update:selected"]);

const props = defineProps({
  items: Object,
});

const headers = ref([
  { title: "Cliente", value: "cliente", sortable: true, nowrap: true },
  { title: "Linha", value: "linha", sortable: true, nowrap: true },
  { title: "ICCID", value: "iccid", sortable: true, nowrap: true },
  { title: "Status", value: "status", sortable: true, nowrap: true },
  { title: "Operadora", value: "operadora", sortable: true, nowrap: true },
  {
    title: "Último Acesso",
    value: "ultimoAcesso",
    sortable: true,
    nowrap: true,
  },
  { title: "Conexão", value: "conexao", sortable: true, nowrap: true },
  {
    title: "Consumo Total",
    value: "consumoTotal",
    sortable: true,
    nowrap: true,
  },
  {
    title: "Consumo Diário",
    value: "consumoDiario",
    sortable: true,
    nowrap: true,
  },
  {
    title: "SMS",
    value: "sms",
    sortable: true,
    nowrap: true,
  },
  {
    title: "IMEI Dispositivo",
    value: "imeiAparelho",
    sortable: true,
    nowrap: true,
  },
  { title: "Rede", value: "rede", sortable: true, nowrap: true },
  { title: "Tecnologia", value: "tecnologia", sortable: true, nowrap: true },
  { title: "APN", value: "apn", sortable: true, nowrap: true },
  {
    title: "Status",
    value: "statusOperadora",
    sortable: true,
    nowrap: true,
  },
  { title: "Ações", value: "actions", sortable: false, nowrap: true },
]);

const dateUtils = useDateUtils();
const search = ref("");
const sortBy = ref([{ key: "linha", order: "asc" }]);
const sortDesc = ref(false);

const selectedItems = ref([]);

// Atualiza a lista de selecionados e emite o evento para o pai
const onSelectionChange = (newSelection) => {
  emit("update:selected", selectedItems.value);
};

// Filtrar e ordenar os itens
const filteredItems = computed(() => {
  let filtered = [...props.items];

  if (search.value) {
    filtered = filtered.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(search.value.toLowerCase())
      )
    );
  }

  // Aplicar a ordenação
  if (sortBy.value.length > 0) {
    const { key } = sortBy.value[0];
    filtered.sort((a, b) => {
      const result = a[key] < b[key] ? -1 : 1;
      return sortDesc.value ? -result : result;
    });
  }

  return filtered;
});
</script>

<style>
.v-data-table__td {
  padding: 0 4px !important;
  height: 36px !important;
}

div.light-theme tbody .v-data-table__tr:nth-of-type(odd) {
  /* 'teal lighten-5' basides on material design color */
  background-color: #e0f2f1;
}

div.light-theme tbody .v-data-table__tr:nth-of-type(even) {
  /* 'deep-orange lighten-5' basides on material design color */
  background-color: #fbe9e7;
}
</style>
