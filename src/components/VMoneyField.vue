<template>
  <v-text-field
    v-model="localValue"
    @blur="onBlur"
    @input="onInput"
    :label="label"
  />
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";

interface Props {
  modelValue: number;
  label?: string;
  prefix?: string;
  suffix?: string;
  thousands?: string;
  decimal?: string;
  precision?: number;
  allowNegative?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: "update:modelValue", value: number): void }>();

// Opções padrão (podem ser sobrescritas pelas props)
const options = {
  prefix: props.prefix || "",
  suffix: props.suffix || "",
  thousands: props.thousands || ",",
  decimal: props.decimal || ".",
  precision: props.precision ?? 2,
  allowNegative: props.allowNegative ?? false,
};

// Valor local formatado a partir do modelValue
const localValue = ref(format(props.modelValue));

/**
 * Formata o número de acordo com as opções definidas.
 * Ex: 0.04 => "0.04" (ou com prefixo/sufixo se configurado)
 */
function format(num: number): string {
  const negative = options.allowNegative && num < 0;
  num = Math.abs(num);
  const fixed = num.toFixed(options.precision);
  const [integer, decimals] = fixed.split(".");
  const integerFormatted = integer.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    options.thousands
  );
  return `${negative ? "-" : ""}${options.prefix}${integerFormatted}${
    options.decimal
  }${decimals}${options.suffix}`;
}

/**
 * Extrai somente os dígitos da string.
 */
function extractDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Manipulador de input:
 * - Extrai os dígitos digitados;
 * - Converte para número dividindo por 10^precision (para interpretar como centavos);
 * - Emite o modelValue e atualiza o valor formatado.
 */
function onInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const digits = extractDigits(target.value);
  let num = 0;
  if (digits !== "") {
    num = parseInt(digits, 10) / Math.pow(10, options.precision);
  }
  emit("update:modelValue", num);
  localValue.value = format(num);
}

/**
 * Ao perder o foco, garante a formatação do valor.
 */
function onBlur() {
  const digits = extractDigits(localValue.value);
  let num = 0;
  if (digits !== "") {
    num = parseInt(digits, 10) / Math.pow(10, options.precision);
  }
  localValue.value = format(num);
}

// Atualiza o campo se o valor externo mudar
watch(
  () => props.modelValue,
  (newVal) => {
    localValue.value = format(newVal);
  }
);
</script>
