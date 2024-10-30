<template>
  <DashboardLayout>
    <div class="px-2 pt-0">
      <span>{{ timer || "&nbsp" }}</span>
    </div>
    <div class="grid grid-cols-2" v-if="!searchResult.length">
      <div>
        <div class="space-x-6">
          <button
            @click="search"
            :disabled="!formCompleted || searching"
            class="primary disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Verificar Linhas
          </button>
          <button @click="abortSearch" class="text-red-500" v-if="searching">
            Cancelar
          </button>
        </div>
        <div>
          <SelectAjaxVue
            :disabled="searching"
            label="Selecione um cliente"
            @enterPressed="search"
            v-model="verify.client"
            url="admin/clientes/buscar"
          />
          <div class="mt-16 text-center grid grid-cols-2">
            <BuscaChipverifier
              :disabled="searching"
              v-model="verify.items"
              class="inline-block"
              placeholder="Informe o ICC ou os numeros da linha"
            />
            <div v-if="verify?.items?.unFormatted.length">
              <p class="mb-4">Itens ignorados</p>
              <ul>
                <li v-for="item in verify.items.unFormatted">
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div>importação</div>
    </div>
    <div v-else>
      <div class="result-control">
        <div class="text-sm">
          <div class="flex justify-evenly border border-gray-500 py-2">
            <button
              :disabled="searching"
              class="bg-green-100 text-green-800 dark:bg-gray-700 dark:text-green-400 border border-green-400 disabled:bg-gray-500"
              @click="reset"
            >
              Nova consulta
            </button>
            <button
              :disabled="searching"
              class="bg-orange-100 text-orange-800 dark:bg-gray-700 dark:text-orange-400 border border-orange-400 disabled:bg-gray-500"
              @click="edit"
            >
              Editar dados da consulta atual
            </button>
            <button
              :disabled="searching"
              class="bg-yellow-100 text-yellow-800 dark:bg-gray-700 dark:text-yellow-400 border border-yellow-400 disabled:bg-gray-500"
              @click="search"
            >
              Recarregar consulta atual
            </button>
            <DropDown @exportSelected="exportSelected"></DropDown>
          </div>
        </div>
      </div>
      <ChipChangeStatus :items="checkedRows" @changed="handleChangedStatus" />
      <VdataTable :items="searchResult" v-model:selected="checkedRows" />
    </div>
  </DashboardLayout>
</template>

<script setup>
import { computed, ref } from "vue";
import Swal from "sweetalert2";
import api from "../../../api";
import DashboardLayout from "../../../layouts/DashboardLayout.vue";
import SelectAjaxVue from "../../../components/SelectAjax.vue";
import BuscaChipverifier from "../../../components/BuscaChipVerifier.vue";
import DropDown from "../../../components/DropDown.vue";
import VdataTable from "../../../components/Tables/VdataTable.vue";
import ChipChangeStatus from "../../../components/ChipChangeStatus.vue";
import { handler } from "@tailwindcss/aspect-ratio";
const verify = ref({
  client: null,
});

const filters = ref({});
const searching = ref(false);
const searchResult = ref([]);
const downLink = ref("");
const timerId = ref(-1);
const timer = ref(0);
let controller;

// const linkUrl = import.meta.env.VITE_MONOLITH_URL;

const search = async () => {
  searching.value = true;
  searchResult.value = [];
  filters.value = {};
  const now = new Date();
  timerId.value = setInterval(() => {
    // const formattedTime = formatarTempoDecorrido(new Date());
    timer.value = formatarTempoDecorrido(now);
  }, 1);

  // Cria um novo AbortController a cada requisição
  controller = new AbortController();

  try {
    const res = await api.post(
      "admin/chip/buscar",
      {
        ...verify.value,
      },
      {
        signal: controller.signal,
      }
    );
    downLink.value = res.data.downLink;
    searchResult.value = res.data.result;
  } catch (error) {
    Swal.fire({
      toast: true,
      icon: "info",
      timer: 2500,
      position: "top-end",
      title: "Não encontrado",
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }

  clearInterval(timerId.value);
  searching.value = false;
};

const abortSearch = () => {
  if (controller) {
    controller.abort();
  }
};

const checkedRows = ref();

const exportSelected = async (selected) => {
  const response = await api({
    url: downLink.value + "?" + selected.join("&"),
    method: "GET",
    responseType: "blob",
  });

  const contentDisposition = response.headers["content-disposition"];

  let filename = contentDisposition
    ? contentDisposition.replace(/.*filename="?(.+\..{3,4})"?/, "$1")
    : "resultado.csv";

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename); // Nome do arquivo para download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const formCompleted = computed(
  () => !!verify.value.items?.formatted.length || verify.value.client
);

function formatarTempoDecorrido(dataInicio) {
  const agora = new Date();
  let diferenca = agora - dataInicio; // Diferença em milissegundos

  // Convertendo de milissegundos para horas, minutos e segundos
  // const horas = Math.floor(diferenca / (1000 * 60 * 60));
  // diferenca -= horas * 1000 * 60 * 60;
  const minutos = Math.floor(diferenca / (1000 * 60));
  diferenca -= minutos * 1000 * 60;
  const segundos = Math.floor(diferenca / 1000);
  diferenca -= segundos * 1000; // Subtraindo os segundos em milissegundos
  const milissegundos = diferenca; // Restante são milissegundos

  // Formatando para string com dois dígitos para horas, minutos, segundos e três para milissegundos
  const formatado = [
    // horas.toString().padStart(2, "0") + "h",
    minutos.toString().padStart(2, "0") + "m",
    segundos.toString().padStart(2, "0") + "s",
    milissegundos.toString().padStart(3, "0") + "mm", // Garantindo três dígitos para milissegundos
  ].join(":");

  return formatado;
}

const edit = () => {
  searchResult.value = [];
  timerId.value = -1;
};

const reset = () => {
  edit();
  verify.value.client = null;
  verify.value.items = null;
};

function handleChangedStatus(data) {
  if (data?.status) {
    Swal.fire({
      icon: "success",
      timerProgressBar: true,
      showConfirmButton: false,
      timer: 3500,
      toast: true,
      position: "top-end",
      title: "Status de chip alterado com sucesso",
    });
    search();
  }
}
</script>

<style scoped>
tr:nth-child(even) {
  @apply bg-pink-400/50;
}

.checkedRow {
  @apply !bg-gray-300;
}

td {
  @apply border p-1 whitespace-nowrap;
}

th {
  @apply whitespace-nowrap;
}

tbody tr * {
  @apply cursor-default;
}

.result-control button {
  @apply py-1 px-2 rounded-md;
}
</style>
