<template>
  <div class="relative">
    <input
      type="text"
      v-model="inputValue"
      @input="updateValue"
      class="px-4 py-0 bg-orange-400"
    />
    <button
      v-if="inputValue"
      @click="clearInput"
      class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
    >
      &times;
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
const props = defineProps({
  modelValue: String,
});
const emits = defineEmits(["update:modelValue"]);

const inputValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue;
  }
);

const updateValue = () => {
  emits("update:modelValue", inputValue.value);
};

const clearInput = () => {
  inputValue.value = "";
  emits("update:modelValue", "");
};
</script>

<style scoped>
/* Estilize o botão "X" se necessário */
button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
}
</style>
