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
          <div class="mt-4 text-center grid grid-cols-2">
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
      <SIMmanualInport />
    </div>
    <div v-else>
      <div class="result-control">
        <div class="text-sm">
          <div class="flex justify-between py-2">
            <fieldset class="border border-gray-700 px-4 py-1 pb-4 space-x-4">
              <legend class="font-semibold">CONSULTA</legend>
              <v-btn
                color="green-lighten-2"
                :disabled="searching"
                class="bg-green-100 text-green-800 dark:bg-gray-700 dark:text-green-400 border border-green-400 disabled:bg-gray-500"
                @click="reset"
                title="Faça uma nova consulta"
              >
                Nova
              </v-btn>
              <v-btn
                color="orange"
                title="Altere alguma informação da consulta atual"
                :disabled="searching"
                @click="edit"
              >
                Editar
              </v-btn>
              <v-btn
                color="green"
                :disabled="searching"
                title="Refaz a consulta atual"
                @click="search"
              >
                Atualizar
              </v-btn>
            </fieldset>
            <fieldset class="border border-gray-700 px-4 py-1 pb-4 space-x-4">
              <legend class="font-semibold">EXPORTAR</legend>
              <DropDown @exportSelected="exportSelected"></DropDown>
              <v-btn
                @click="exportCSV"
                :disabled="!checkedRows?.length"
                color="blue"
                :title="
                  !checkedRows?.length
                    ? `Selecione as linhas que quer exportar`
                    : `Exporta as ${checkedRows?.length} linhas selecionadas abaixo`
                "
                >Exportar selecionados</v-btn
              >
            </fieldset>
          </div>
          <div class="flex justify-between py-2">
            <fieldset
              class="border border-gray-700 px-4 py-1 pb-4 space-x-4 w-full"
            >
              <legend class="font-semibold">Alterar SIM cards</legend>

              <ChipChangeStatus
                :items="checkedRows"
                @changed="handleChangedStatus"
              />
              <ChipChangePlan
                :items="checkedRows"
                @changed="handleChangedPlan"
              />
            </fieldset>
          </div>
        </div>
      </div>
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
import ChipChangePlan from "../../../components/ChipChangePlan.vue";
import { useHumanReadableBytes } from "../../../composable/useHumanReadableBytes";
import SIMmanualInport from "../../../components/SIMmanualInport.vue";
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

const headers = ref([
  { title: "Cliente", value: "cliente", sortable: true, nowrap: true },
  { title: "Linha", value: "linha", sortable: true, nowrap: true },
  { title: "ICCID", value: "iccid", sortable: true, nowrap: true },
  { title: "Status", value: "status", sortable: true, nowrap: true },
  {
    title: "Plano",
    value: "plano",
    sortable: true,
    nowrap: true,
  },
  { title: "Operadora", value: "operadora", sortable: true, nowrap: true },
  {
    title: "Último Acesso",
    value: "ultimoAcesso",
    sortable: true,
    nowrap: true,
  },
  { title: "Conexão", value: "conexao", sortable: true, nowrap: true },
  {
    title: "Consumo Total",
    value: "consumoTotal",
    sortable: true,
    nowrap: true,
  },
  {
    title: "SMS",
    value: "consumoSMS",
    sortable: true,
    nowrap: true,
  },
  {
    title: "IMEI Dispositivo",
    value: "imeiAparelho",
    sortable: true,
    nowrap: true,
  },
  { title: "Rede", value: "rede", sortable: true, nowrap: true },
  { title: "Tecnologia", value: "tecnologia", sortable: true, nowrap: true },
  { title: "APN", value: "apn", sortable: true, nowrap: true },
  {
    title: "Status na operadora",
    value: "statusOperadora",
    sortable: true,
    nowrap: true,
  },
  { title: "Ações", value: "actions", sortable: false, nowrap: true },
]);

const search = async () => {
  const VITE_API_DENO_URL = import.meta.env.VITE_API_DENO_URL;
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
    /* const res = await api.post(
      "admin/chip/buscar",
      {
        ...verify.value,
      },
      {
        signal: controller.signal,
      }
    ); */
    // downLink.value = res.data.downLink;
    let deno_url = `${VITE_API_DENO_URL}/v2/client/sims`;
    let response;
    if (verify.value?.client) {
      deno_url = `${VITE_API_DENO_URL}/v2/client/${verify.value.client}/simcards`;
      response = await api.get(deno_url);
    } else {
      response = await api.post(deno_url, {
        values: verify.value.items.formatted,
      });
    }

    if (response) {
      searchResult.value = response.data.details;
      // tags.value = response.data.tags;
    }
  } catch (error) {
    console.log(error);

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

function handleChangedPlan(data) {
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
