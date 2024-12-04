<template>
  <v-dialog v-model="isOpen" max-width="500px" persistent>
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ dialogTitle }}</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="plano.name"
                label="Título do plano"
                :loading="loading"
                :disabled="loading"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                label="Operadora"
                :disabled="loading || !operadoras?.length"
                v-model="plano.operator_id"
                :items="operadoras"
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                label="Consumo em MB"
                :loading="loading"
                :disabled="loading"
                v-model="plano.consumo_em_mb"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="closeDialog">Cancelar</v-btn>
        <v-btn color="blue darken-1" text @click="save">Salvar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import api from "../../../api";

const isOpen = ref(false);
const loading = ref(false);
const operadoras = ref([]);
const planoId = ref(null);

const plano = ref({
  name: "",
  consumo_em_mb: null,
  operator_id: null,
  day_cycle_start: null,
  day_cycle_end: null,
  plan_price: 0,
});

const props = defineProps({
  modelValue: Boolean,
  toEdit: Object,
});
const emit = defineEmits(["update:modelValue"]);

watch(
  () => props.modelValue,
  (newVal) => {
    isOpen.value = newVal;
    if (newVal && props.toEdit) {
      loadPlano(props.toEdit);
    } else {
      resetForm();
    }
  }
);

const dialogTitle = computed(() =>
  props.toEdit ? "Editar Plano" : "Novo Plano"
);

async function loadPlano(toEdit) {
  loading.value = true;
  const response = await api.get(`admin/planos/${toEdit.id}`);
  console.log(response.data.plano);

  plano.value = {
    name: response.data.plano.title,
    operator_id: response.data.plano.operadora.id,
    consumo_em_mb: response.data.plano.consumo_em_mb,
    day_cycle_start: response.data.plano.day_cycle_start,
    day_cycle_end: response.data.plano.day_cycle_end,
    excess_price: response.data.plano.excess_price,
  };
  planoId.value = response.data.plano.id;
  loading.value = false;
}

function resetForm() {
  planoId.value = null;
  plano.value = {
    name: "",
    consumo_em_mb: null,
    day_cycle_start: null,
    day_cycle_end: null,
    excess_price: 0,
  };
}

function closeDialog() {
  emit("update:modelValue", false);
}

async function save() {
  loading.value = true;
  console.log({ ...plano.value });
  const response = await api.put(`/admin/planos/${planoId.value}`, plano.value);

  // console.log(response);

  if (response.data.status) {
    closeDialog();
  }
  loading.value = false;
}

onMounted(async () => {
  const response = await api.get("admin/operadoras");

  operadoras.value = response.data.operadoras.map((p) => ({
    title: p.name,
    value: p.id,
  }));
});
</script>
