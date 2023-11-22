<template>
  <label
    for="countries"
    class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
    >{{ label }}</label
  >
  <select
    @change="$emit('update:modelValue', $event.target.value)"
    id="countries"
    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
  >
    <option selected disabled>{{ mensagem }}</option>
    <option v-for="item in items" :value="item.id">{{ item.name }}</option>
  </select>
</template>

<script setup>
import { onMounted, ref } from "vue";
import api from "../api";

const mensagem = ref("Escolha");
const items = ref([]);
defineEmits(["update:modelValue"]);
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

onMounted(async () => {
  const request = await api.post(props.url);
  if (request.status == 200) {
    items.value = request.data;
  }
});
</script>

<style scoped></style>
