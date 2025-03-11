<template>
  <div class="my-2 py-2 pl-4 bg-orange-200 space-x-4 inline-block">
    <!-- <label for="">Alterar plano dos chip selecionados para </label> -->
    <select
      v-model="planToChange"
      :disabled="!allowChange"
      @change="changeStatusDialog = true"
    >
      <option
        value="-1"
        disabled
        v-html="allowChange ? `Alterar plano` : `Selecione as linhas abaixo`"
      ></option>
      <option :value="plano.id" v-for="plano in contas">
        {{ plano.title }}
      </option>
    </select>
    <!-- <v-btn
      @click="changeStatusDialog = true"
      v-if="allowChange"
      color="yellow-darken-2"
      text="Alterar"
      elevation-24
    ></v-btn> -->
    <v-dialog
      v-model="changeStatusDialog"
      @update:model-value="onCloseDialog"
      max-width="900"
    >
      <v-card :title="`Alterar plano das linhas para ${newPlan?.title}`">
        <v-card-text>
          <h1>{{ items.length }} Selecionados</h1>
          <v-container>
            <v-row>
              <v-col cols="12" md="4">
                <VMoneyField decimal="," thousands="." v-model="anexPrice" />
              </v-col>
              <v-col cols="12" md="6">
                <v-date-input
                  label="Selecione a data de inserção do anexo"
                  prepend-icon="mdi-calendar"
                  @update:modelValue="closePicker"
                  v-model="anexDateInsert"
                ></v-date-input>
              </v-col>
            </v-row>
            <v-row v-if="false" v-for="item in items">
              <v-col cols="12" md="4">
                <v-text-field
                  label="Linha"
                  v-model="item.linha.text"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  label="Conta - Operadora"
                  v-model="item.conta"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  label="ICCID"
                  :min="20"
                  :max="20"
                  placeholder="ICCID"
                  v-model="item.iccid.text"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-select
            label="Troca de plano solicitado por"
            :items="users"
            item-value="id"
            item-title="nome"
          />
          <v-checkbox
            v-model="exportToCsv"
            color="red"
            :label="`${exportToCsv ? 'E' : 'Não e'}xportar lista`"
          ></v-checkbox>
          <v-spacer />

          <v-btn color="red darken-3" text="Cancelar" @click="onCloseDialog" />
          <v-btn
            text="Enviar"
            variant="elevated"
            color="green lighten-1"
            elevation-1
            @click="handleChangePlan"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { computed, onUnmounted, ref } from "vue";
import { format, parseISO } from "date-fns";
import api from "../api";
import { onMounted } from "vue";
import VMoneyField from "./VMoneyField.vue";

const props = defineProps({
  items: {
    type: Object,
    default: {},
  },
});

const emit = defineEmits(["changed"]);

const users = ref([
  {
    id: 4,
    nome: "Cesar De Carli",
  },
  {
    id: 13,
    nome: "Cesar Junior",
  },
  {
    id: 5,
    nome: "Fernanda Sostisso",
  },
  {
    id: 2,
    nome: "Gabriela Casa",
  },
  {
    id: 16,
    nome: "Igor Severo",
  },
  {
    id: 1,
    nome: "Marcelo H. Filho",
    selected: true,
  },
]);

const planToChange = ref(-1);

const anexPrice = ref(0);

const anexDateInsert = ref(null);

// Formata a data para exibição no campo
/* const formatDate = (dateString) => {
  if (!dateString) return '';
  return format(parseISO(dateString), 'dd/MM/yyyy'); // Converte string para Date e formata
}; */

// Cria um campo computado para exibir a data formatada
const formattedDate = computed(() => formatDate(date.value));

const changeStatusDialog = ref(false);

const exportToCsv = ref(false);
const contas = ref([]);

const newPlan = computed(
  () => contas.value.filter((i) => i.id === planToChange.value)[0]
);

const allowChange = computed(() => props.items?.length > 0);

const handleChangePlan = async () => {
  let data = {};

  data["data"] = props.items.map((i) => ({
    chipId: i.chipId,
  }));

  data["plano"] = planToChange.value;
  data["anexPrice"] = anexPrice.value;
  data["anexDateInsert"] = anexDateInsert.value;

  const res = await api.post("admin/chip/mudar-plano", data);
  emit("changed", res.data);
  changeStatusDialog.value = false;
};

const resetForm = () => {
  anexDateInsert.value = new Date();
  planToChange.value = -1;
  anexPrice.value = 0;
  exportToCsv.value = false;
};

const onCloseDialog = () => {
  changeStatusDialog.value = false;
  resetForm();
};

onMounted(async () => {
  const res = await api.get("admin/contas");
  contas.value = res.data.contas;
});
</script>
