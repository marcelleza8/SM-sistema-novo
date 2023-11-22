<template>
  <textarea
    class="disabled:bg-gray-400 disabled:text-white"
    :disabled="verifying"
    cols="25"
    rows="20"
    :placeholder="placeholder"
  ></textarea>
  <button @click="validate">Validar</button>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  placeholder: {
    type: String,
  },
});

const verifying = ref(false);

const validate = () => {
  verifying.value = true;
};
</script>

<style scoped></style>
