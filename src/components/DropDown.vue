<template>
  <div class="relative inline-block">
    <button @click="toggleDropdown" class="px-2 py-1 bg-blue-100 text-blue-800 border border-blue-400 rounded-md">
      Exportar
      <v-icon>mdi-menu-down</v-icon>
    </button>
    <div v-if="showDropdown" class="absolute mt-2 bg-white border rounded shadow-lg w-52 z-20">
      <div class="p-4">
        <div v-for="option in options" :key="option.id" class="flex items-center justify-between mb-2">
          <input type="checkbox" :id="option.id" v-model="selectedOptions[option.id]" class="mr-2" />
          <label :for="option.id" class="text-sm flex-1 cursor-pointer hover:bg-gray-300">{{ option.name }}</label>
        </div>
        <v-alert v-if="!loading" type="info" text="Gerando Excel" />
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

// defineEmits(["exportSelected"]);

const options = ref([
  { id: "imei", name: "ICCID" },
  { id: "phone_number", name: "Linha" },
  { id: "status_name", name: "Status" },
  // { id: "data-status", name: "Data do status" },
  { id: "clients_name", name: "Cliente" },
  { id: "account_code", name: "Conta" },
  { id: "plan_name", name: "Plano" },
  { id: "apn", name: "APN" },
]);

const selectedOptions = ref({});
const showDropdown = ref(false);

const props = defineProps({
  loading: Boolean,
  headers: Object,
});

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const selectedF = computed(() =>
  keys(pickBy(selectedOptions.value, (value) => value === true))
);

const exportSelected = async (selected) => {
  if (!downLink.value || !selected?.length) return;

  // Monta query string com múltiplos parâmetros "coluna=1"
  const query = selected
    .map((field) => `colunas[]=${encodeURIComponent(field)}`)
    .join("&");
  const url = `${downLink.value}&${query}`;

  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "blob",
    });

    const contentDisposition = response.headers["content-disposition"];
    const filename = contentDisposition
      ? contentDisposition.replace(/.*filename="?(.+\..{3,4})"?/, "$1")
      : "resultado.xlsx";

    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Erro ao exportar arquivo:", error);
  }
};

// Função para exportar os dados como CSV
const exportCSV = () => {
  const filteredHeaders = headers.value.filter(
    (header) => header.value != "actions"
  );

  const csvContent = [
    filteredHeaders.map((header) => header.title).join(";"),
    checkedRows.value
      .map((item) =>
        filteredHeaders
          .map((header) => {
            let value = item[header.value] ?? "";

            if (["linha", "iccid", "imeiAparelho"].includes(header.value)) {
              return `="${value}"`;
            } else if (
              ["consumoTotal", "consumoDiario"].includes(header.value)
            ) {
              return useHumanReadableBytes().formatBytes(Number(value), "MB");
            }
            return value;
          })
          .join(";")
      )
      .join("\n"), // Linhas
  ].join("\n");

  // Adiciona o BOM ao início do conteúdo CSV
  const bom = "\uFEFF";
  const fullCsvContent = bom + csvContent;

  // Cria um blob com o conteúdo CSV
  const blob = new Blob([fullCsvContent], { type: "text/csv;charset=utf-8;" });

  // Cria um link temporário para fazer o download do arquivo
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", "data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>
