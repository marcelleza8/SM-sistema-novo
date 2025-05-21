<template>
  <tr>
    <td colspan="7" class="pa-0">
      <v-data-table
        dense
        select-all
        hide-actions
        item-key="data"
        class="elevation-1"
        :loading="loadingData"
        :items="filteredConsumptionItems"
        pagination.sync="pagination"
        :headers="[
          { title: 'Consumo em MB', value: 'consumo_total_MB' },
          { title: 'Data de criação', value: 'created_at' },
          { title: 'Último acesso', value: 'ultimo_acesso' },
          { title: 'SMS Mensal', value: 'consumo_sms_mensal' },
          { title: 'IMEI Dispositivo', value: 'imei_aparelho' },
        ]"
      >
        <template v-slot:top>
          <div class="text-blue-800 font-bold text-center">
            Tabela de Consumos
          </div>
          <v-text-field
            :color="isRegexValid ? 'green' : 'red'"
            v-model="search"
            label="Pesquise por consumo ou data de criação"
            clearable
          ></v-text-field>
        </template>
        <template v-slot:item.consumo_total_MB="{ item }">
          <span :title="item.rerun">{{ item?.consumo_total_MB }}</span>
        </template>
        <template v-slot:item.created_at="{ item }">
          <span
            :title="
              dateUtils.formatDate(item?.updated_at, 'dd/MM/yyyy HH:mm:ss')
            "
            >{{
              dateUtils.formatDate(
                item?.created_at || "",
                "dd/MM/yyyy HH:mm:ss"
              )
            }}</span
          >
        </template>
        <template v-slot:item.ultimo_acesso="{ item }">
          <span :title="dateUtils.timeAgo(item?.ultimo_acesso || '')">{{
            dateUtils.formatDate(
              item?.ultimo_acesso || "",
              "dd/MM/yyyy HH:mm:ss"
            )
          }}</span>
        </template>
      </v-data-table>
    </td>
  </tr>
</template>
<script setup>
import { computed, onMounted, ref } from "vue";
import api from "../api";
import { useDateUtils } from "../composable/useDateUtils";

const props = defineProps({ columns: Array, item: Array });

const search = ref("");
const isRegexValid = ref(true); // Indica se o Regex é válido
const loadingData = ref(false);
const consumptionItems = ref([]);

const dateUtils = useDateUtils();

const filteredConsumptionItems = computed(() => {
  isRegexValid.value = true; // Regex é válido porque não foi aplicado
  const searchTerm = search.value?.trim();

  if (!searchTerm) {
    return consumptionItems.value; // Retorna todos os itens se não houver busca
  }

  try {
    // Criar uma expressão regular a partir do termo de busca
    const regex = new RegExp(
      searchTerm, // Substituir `*` por `.*` para wildcard
      "i" // Case-insensitive
    );

    // Filtrar itens que atendam ao regex em ambas as colunas
    return consumptionItems.value.filter((item) => {
      const consumo = item.consumo_total_MB.toString(); // Garantir que é string
      const data = item.created_at; // Garantir que data é string
      return regex.test(consumo) || regex.test(data);
    });
  } catch (e) {
    isRegexValid.value = false;
    console.error("Erro ao construir o RegEx:");
    // console.error(e); // ERROR

    return consumptionItems.value; // Retorna todos os itens no caso de erro
  }
});

const fetchConsumption = async () => {
  loadingData.value = true;
  try {
    const response = await api.get(
      "admin/chip/consumption/" + props.item.chip_id
    );
    consumptionItems.value = response.data;
  } catch (err) {}
  loadingData.value = false;
};

onMounted(() => {
  fetchConsumption();
});
</script>
