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
                v-model="formData.planoNome"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="Código"
                v-model="formData.codigo"
                outlined
                dense
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                label="consumo em Mb"
                v-model="formData.consumoMb"
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
                v-model="formData.operadora_id"
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
                v-model="formData.usuario"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                label="Senha"
                v-model="formData.senha"
                outlined
                dense
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="4">
              <v-money-field
                label="Preço por SIM excedente"
                prefix="R$"
                v-model="formData.plan_price"
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
  planoNome: null,
  codigo: null,
  consumoMb: null,
  operadora_id: null,
  apn: null,
  usuario: null,
  senha: null,
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
  operadoras.filter((i) => (i.id = formData.operadora_id))
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
    planoNome: conta.planoNome,
    codigo: conta.codigo,
    consumoMb: conta.consumoMb,
    operadora_id: conta.operadora_id,
    apn: conta.apn,
    usuario: conta.usuario,
    senha: conta.senha,
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
  console.log({ ...plano.value });
  const response = await api.put(
    `/admin/planos/${formId.value}`,
    formData.value
  );

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
