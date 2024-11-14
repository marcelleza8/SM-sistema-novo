<template>
  <v-dialog v-model="isOpen" max-width="500px" @click:outside="closeDialog">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ dialogTitle }}</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form">
          <v-text-field
            v-model="operadora.title"
            label="Nome da Operadora"
            :loading="loading"
            :disabled="loading"
            required
          ></v-text-field>
          <v-text-field
            v-model="operadora.codigo"
            label="Código"
            :loading="loading"
            :disabled="loading"
            required
          ></v-text-field>
          <v-money-field
            v-model="operadora.sim_price"
            label="Preço do SIM card"
            :loading="loading"
            :disabled="loading"
            required
          ></v-money-field>
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
import { ref, watch, computed } from "vue";
import VMoneyField from "../../../components/VMoneyField.vue";

const isOpen = ref(false);
const loading = ref(false);
const operadora = ref({
  id: null,
  title: "",
  sim_price: 0,
});

const props = defineProps({
  modelValue: Boolean,
  toEdit: Object,
});
const emit = defineEmits(["update:modelValue", "save"]);

watch(
  () => props.modelValue,
  (newVal) => {
    isOpen.value = newVal;
    if (newVal && props.toEdit) {
      loadOperadora(props.toEdit);
    } else {
      resetForm();
    }
  }
);

const dialogTitle = computed(() =>
  props.toEdit ? "Editar Operadora" : "Nova Operadora"
);

function loadOperadora(toEdit) {
  // Aqui é onde buscaríamos os dados, mas neste exemplo, faremos um mock
  loading.value = true;
  setTimeout(() => {
    const mockOperadora = {
      id: toEdit.id,
      title: "Operadora Mock",
      codigo: "OMK",
      region: "Sudeste",
      active: true,
    };
    operadora.value = { ...mockOperadora };
    loading.value = false;
  }, 3000);
}

function resetForm() {
  operadora.value = {
    id: null,
    title: "",
    codigo: "",
    region: "",
    active: true,
  };
}

function closeDialog() {
  emit("update:modelValue", false);
}

function save() {
  //   closeDialog();
}
</script>
