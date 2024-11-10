<template>
  <v-text-field
    v-model="formattedValue"
    :prepend-inner-icon="prependIcon"
    v-bind="$attrs"
    @blur="updateInternalValue"
  />
</template>

<script setup>
import { ref, watch, computed } from "vue";

// Props para passar e receber o valor
const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  prependIcon: {
    type: String,
    default: "R$",
  },
});

const emit = defineEmits(["update:modelValue"]);

// Valor formatado para exibição com máscara
const formattedValue = ref(0);

// Atualiza o valor formatado quando `modelValue` muda
watch(
  () => props.modelValue,
  (newVal) => {
    formattedValue.value = formatDisplayValue(newVal);
  },
  { immediate: true }
);

// Computed para formatar o valor para exibição com vírgula
function formatDisplayValue(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Atualiza o valor interno ao desfocar o campo, enviando com separador `.`.
function updateInternalValue() {
  const numericValue = parseFloat(
    formattedValue.value.replace(/\./g, "").replace(",", ".")
  );
  emit("update:modelValue", numericValue);
}
</script>

<style scoped>
.v-text-field__prepend-inner-icon {
  font-weight: bold;
}
</style>
