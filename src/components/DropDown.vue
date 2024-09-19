<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-gray-700 dark:text-blue-400 border border-blue-400 rounded-md"
    >
      Exportar
    </button>
    <div
      v-if="showDropdown"
      class="absolute mt-2 bg-white border rounded shadow-lg w-52 z-20"
    >
      <div class="p-4">
        <div
          v-for="option in options"
          :key="option.id"
          class="flex items-center justify-between mb-2"
        >
          <input
            type="checkbox"
            :id="option.id"
            v-model="selectedOptions[option.id]"
            class="mr-2"
          />
          <label
            :for="option.id"
            class="text-sm flex-1 cursor-pointer hover:bg-gray-300"
            >{{ option.name }}</label
          >
        </div>
        <button
          @click="$emit('exportSelected', selectedF)"
          class="w-full px-4 py-2 text-sm text-white bg-green-500 rounded hover:bg-green-600"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { keys, pickBy } from "lodash";

defineEmits(["exportSelected"]);

const options = ref([
  { id: "formato-kite", name: "Formato Kite" },
  { id: "agrupar-20-por-linha", name: "Agrupar 20 por linha" },
  { id: "add-cabecalho", name: "Add cabeçalho" },
  { id: "iccid", name: "ICCID" },
  { id: "linha", name: "Linha" },
  { id: "status", name: "Status" },
  { id: "data-status", name: "Data do status" },
  { id: "cliente", name: "Cliente" },
  { id: "conta", name: "Conta" },
]);

const selectedOptions = ref({});
const showDropdown = ref(false);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const selectedF = computed(() =>
  keys(pickBy(selectedOptions.value, (value) => value === true))
);
</script>
