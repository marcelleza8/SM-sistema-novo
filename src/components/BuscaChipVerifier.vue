<template>
  <div class="flex flex-col">
    <p>
      Total de linhas:
      {{ totalRows }}
    </p>
    <textarea
      ref="textareaRef"
      class="disabled:bg-gray-400 disabled:text-white"
      :disabled="verifying"
      v-model="toSearch"
      cols="25"
      rows="20"
      :placeholder="placeholder"
      @input="validate"
    ></textarea>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import usePhoneNumbe from "../composable/usePhoneNumber";

defineProps({
  placeholder: {
    type: String,
  },
});

const emits = defineEmits(["update:modelValue"]);

const { valid: validPhone } = usePhoneNumbe();

const textareaRef = ref(null);
const toSearch = ref(null);
const verifying = ref(false);

const totalRows = computed(
  () => toSearch.value?.split("\n").filter((l) => !!l.trim()).length
);

const validate = async () => {
  verifying.value = true;
  validade();
  verifying.value = false;
};

function validade() {
  let formatted = [];
  let unFormatted = [];
  let iter = [];

  if (toSearch.value.indexOf("\n")) {
    iter = toSearch.value.split("\n");
  } else {
    iter = [toSearch.value];
  }

  for (let line of iter) {
    if (line) {
      if (line.length == 20) {
        formatted.push(line);
      } else if (validPhone(line)) {
        formatted.push(validPhone(line));
      } else {
        unFormatted.push(line);
      }
    }
  }

  emits("update:modelValue", {
    formatted,
    unFormatted,
  });
}
</script>

<style scoped></style>
