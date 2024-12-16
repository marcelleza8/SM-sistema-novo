<template>
  <v-dialog v-model="isOpen" max-width="800px" persistent>
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ dialogTitle }}</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                label="Plano"
                v-model="formData.plan_name"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="Código"
                v-model="formData.code"
                outlined
                dense
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                label="consumo em Mb"
                v-model="formData.consumo_em_mb"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                label="Operadora"
                :items="operadoras"
                item-value="value"
                item-text="name"
                v-model="formData.operator_id"
                outlined
                dense
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                label="APN"
                v-model="formData.apn"
                outlined
                dense
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                label="Usuário"
                v-model="formData.user"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="Senha"
                v-model="formData.password"
                outlined
                dense
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="4">
              <v-money-field
                label="Excedentes na conta"
                prefix="R$"
                v-model="formData.excess_price"
                :loading="loading"
                :disabled="loading"
                required
              ></v-money-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                label="Dia início do ciclo"
                v-model="formData.day_cycle_start"
                :loading="loading"
                :disabled="loading"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="formData.day_cycle_end"
                label="Dia de fim do ciclo"
                :loading="loading"
                :disabled="loading"
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
import VMoneyField from "../../../components/VMoneyField.vue";

const isOpen = ref(false);
const loading = ref(false);
const operadoras = ref([]);
const formId = ref(null);

const formData = ref({
  plan_name: null,
  code: null,
  consumo_em_mb: null,
  operator_id: null,
  apn: null,
  user: null,
  password: null,
  excess_price: 0,
  day_cycle_start: null,
  day_cycle_end: null,
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
      loadConta(props.toEdit);
    } else {
      resetForm();
    }
  }
);

/* const operas = computed(() =>
  operadoras.filter((i) => (i.id = formData.operator_id))
); */

const dialogTitle = computed(() =>
  props.toEdit ? "Editar Conta" : "Nova Conta"
);

async function loadConta(toEdit) {
  loading.value = true;
  const response = await api.get(`admin/contas/${toEdit.id}`);
  // console.log("Contas:", response.data.contas);

  const conta = response.data.contas;

  formData.value = {
    plan_name: conta.plan_name,
    code: conta.code,
    consumo_em_mb: conta.consumo_em_mb,
    operator_id: conta.operator_id,
    apn: conta.apn,
    user: conta.user,
    password: conta.password,
    excess_price: conta.excess_price,
    day_cycle_start: conta.day_cycle_start,
    day_cycle_end: conta.day_cycle_end,
  };
  formId.value = conta.id;
  loading.value = false;
}

function resetForm() {
  formId.value = null;
  // formData.value = formData.map();
}

function closeDialog() {
  emit("update:modelValue", false);
}

async function save() {
  loading.value = true;
  formData.value.day_cycle_start = formData.value.day_cycle_start
    ? +formData.value.day_cycle_start
    : null;
  formData.value.day_cycle_end = formData.value.day_cycle_end
    ? +formData.value.day_cycle_end
    : null;

  const response = await api.put(
    `/admin/contas/${props.toEdit.id}`,
    formData.value
  );

  if (response.data.status) {
    fetch();
    closeDialog();
  }
  loading.value = false;
}

const fetch = async () => {
  loading.value = true;
  const response = await api.get("admin/operadoras");
  operadoras.value = response.data.operadoras.map((p) => ({
    title: p.name,
    value: p.id,
  }));
  loading.value = false;
};

onMounted(async () => {
  await fetch();
});
</script>
