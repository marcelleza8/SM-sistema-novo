<template>
  <tr>
    <td colspan="5" class="pa-0">
      <v-data-table
        dense
        select-all
        hide-actions
        item-key="data"
        class="elevation-1"
        hide-default-footer
        :loading="loadingData"
        :items="consumptionItems"
        pagination.sync="pagination"
        :headers="[
          { title: 'Consumo', value: 'consumo_total_MB' },
          { title: 'Data de criação', value: 'created_at' },
        ]"
      >
        <template v-slot:top>
          <div class="text-blue-800 font-bold text-center">
            Tabela de Consumos
          </div>
        </template>
      </v-data-table>
    </td>
  </tr>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import api from "../api";

const props = defineProps({ columns: Array, item: Array });

const consumptionItems = ref([]);
const loadingData = ref(false);

const fetchConsumption = async () => {
  loadingData.value = true;
  try {
    const response = await api.get(
      "admin/chip/consumption/" + props.item.chipId
    );
    consumptionItems.value = response.data;
  } catch (err) {}
  loadingData.value = false;
  console.log(response);
};

onMounted(() => {
  console.log("montado");
  fetchConsumption();
  //
});
</script>
