<template>
  <div class="relative inline-block">
    <button @click="toggleDropdown" class="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-400 rounded-md">
      Exportar
      <v-icon>mdi-menu-down</v-icon>
    </button>
    <div v-if="showDropdown" class="absolute mt-2 bg-white border rounded shadow-lg w-52 z-20 -left-20">
      <div class="p-4">
        <div
          v-for="option in options"
          :key="option.id"
          class="flex items-center justify-between mb-2"
        >
          <input type="checkbox" :id="option.id" v-model="selectedOptions[option.id]" class="mr-2" />
          <label :for="option.id" class="text-sm flex-1 cursor-pointer hover:bg-gray-300">{{ option.name }}</label>
        </div>
        <v-alert v-if="loading" type="info" text="Gerando Excel" />
        <button v-else @click="$emit('exportSelected', selectedF)"
          class="w-full px-4 py-2 text-sm text-white bg-green-500 rounded hover:bg-green-600">
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { keys, pickBy } from "lodash";

const selectedOptions = ref({});
const showDropdown = ref(false);

const props = defineProps({
  loading: Boolean,
  headers: {
    type: Array,
    default: () => [],
  },
});

const options = computed(() =>
  (props.headers || [])
    .filter(
      (header) =>
        header?.value &&
        header.value !== "actions" &&
        header.value !== "data-table-expand"
    )
    .map((header) => ({
      id: header.value,
      name: header.title,
    }))
);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const selectedF = computed(() =>
  keys(pickBy(selectedOptions.value, (value) => value === true))
);
</script>
