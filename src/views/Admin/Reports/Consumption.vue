<template>
  <DashboardLayout>
    <v-container class="py-4">
      <v-card class="pa-4" max-width="100%">
        <v-form v-model="formValido" @submit.prevent="buscarRelatorio">
          <v-row>
            <v-col>
              <v-select
                v-model="selectedContract"
                :items="contracts"
                item-title="name"
                item-value="id"
                :disabled="carregando"
                label="Contrato de chip"
                :rules="[(v) => !!v || 'Selecione um contrato']"
                required
              />
            </v-col>
            <v-col>
              <v-text-field
                v-model="mesAno"
                label="Mês/Ano (MM-YY)"
                :rules="[validaMesAno]"
                placeholder="03-25"
                :disabled="carregando"
                required
              />
            </v-col>
          </v-row>

          <v-btn
            type="submit"
            :disabled="!formValido || carregando"
            class="mt-3"
            color="primary"
            block
          >
            Buscar Relatório
          </v-btn>
        </v-form>
        <h1>{{ timer }}</h1>
      </v-card>
      <v-card class="mt-5" v-if="relatorio.length">
        <v-data-table :headers="headers" :items="relatorio" class="elevation-1">
          <!-- Customização do campo de consumo total -->
          <template v-slot:item.consumo_total="{ item }">
            {{
              item.consumo_total
                ? useHumanReadableBytes().formatBytes(item.consumo_total, "MB")
                : ""
            }}
          </template>
          <template #item.created_at="{ item }">
            {{ dateUtils.formatDate(item?.created_at || "", "dd/MM/yyyy") }}
          </template>
          <template #item.deleted_at="{ item }">
            {{ dateUtils.formatDate(item?.deleted_at || "", "dd/MM/yyyy") }}
          </template>

          <template #[`item.phone_number`]="{ item }">
            <div class="d-flex ga-2">
              <v-btn
                density="compact"
                icon
                @click="copiarTexto(item.phone_number)"
              >
                <v-icon>mdi-clipboard-outline</v-icon>
              </v-btn>
              <v-btn
                @click="openEditDialog(item.chipId)"
                elevation="0"
                class="pa-0"
                variant="text"
              >
                {{ item.phone_number }}
              </v-btn>
            </div>
          </template>
          <template #[`item.icc`]="{ item }">
            <div class="d-flex ga-2">
              <v-btn
                class="pa-0"
                density="compact"
                icon
                @click="copiarTexto(item.icc)"
              >
                <v-icon>mdi-clipboard-outline</v-icon>
              </v-btn>
              <v-btn
                @click="openEditDialog(item.chipId)"
                class="pa-0"
                density="compact"
                elevation="0"
                variant="text"
              >
                {{ item.icc }}
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>
    </v-container>
    <v-dialog v-model="editChipDialog" max-width="90%">
      <v-card>
        <v-card-title>Edição de Chip</v-card-title>
        <v-card-text>
          <AdminChipFormPage
            :id="selectedChipIdToEdit"
            showOnlyContent="true"
            @close="
              () => {
                editChipDialog = false;
              }
            "
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useDateUtils } from "../../../composable/useDateUtils";
import { useHumanReadableBytes } from "../../../composable/useHumanReadableBytes";
import api from "../../../api";
import Swal from "sweetalert2";
import DashboardLayout from "../../../layouts/DashboardLayout.vue";
import AdminChipFormPage from "../Chip/Manage/Form.vue";
import useTimer from "../../../composable/useTimer";

const contracts = ref([]);

const selectedContract = ref<number | null>(null);
const mesAno = ref("");
const relatorio = ref<any[]>([]);
const carregando = ref(false);
const formValido = ref(false);

const editChipDialog = ref(false);
const selectedChipIdToEdit = ref(0);

const { timer, start, pause, reset } = useTimer();
const dateUtils = useDateUtils();

const headers = [
  { title: "Telefone", key: "phone_number" },
  { title: "ICC", key: "icc" },
  { title: "Status", key: "status" },
  { title: "Plano", key: "plan" },
  { title: "Serial", key: "imei" },
  { title: "Consumo Total", key: "consumo_total" },
  { title: "SMS", key: "consumo_sms_mensal" },
  { title: "Adicionado em", key: "created_at" },
  { title: "Cancelado em", key: "deleted_at" },
];

function validaMesAno(v: string) {
  const regex = /^(0[1-9]|1[0-2])-(\d{2})$/;
  return regex.test(v) || "Formato deve ser MM-YY";
}

async function buscarRelatorio() {
  if (!selectedContract.value || !validaMesAno(mesAno.value) === true) return;

  const [mes, ano] = mesAno.value.split("-");
  const anoCompleto = `20${ano}`;
  const formatoAPI = `${anoCompleto}-${mes}`;

  relatorio.value = [];
  reset();
  start();
  try {
    carregando.value = true;

    const response = await api.post("admin/report/relatorio-consumo", {
      contract: selectedContract.value,
      mes_ano: formatoAPI,
    });

    relatorio.value = response.data;
  } catch (err) {
    console.error("Erro ao buscar relatório:", err);
    relatorio.value = [];
  } finally {
    carregando.value = false;
    pause();
  }
}

const copiarTexto = (texto: string) => {
  const textarea = document.createElement("textarea");
  textarea.value = texto;

  // evita que o textarea influencie no layout visual da página
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);

  textarea.select();

  try {
    const sucesso = document.execCommand("copy");
    Swal.fire({
      icon: sucesso ? "success" : "error",
      text: sucesso ? "Texto copiado!" : "Falha ao copiar!",
      toast: true,
      showConfirmButton: false,
      position: "top-end",
      timer: 3000,
      timerProgressBar: true,
    });
  } catch (err) {
    console.error("Erro ao copiar:", err);
    alert("Erro ao copiar.");
  } finally {
    // Garante destruição mesmo se houver erro
    document.body.removeChild(textarea);
  }
};

const openEditDialog = (chipId: string) => {
  selectedChipIdToEdit.value = chipId;
  editChipDialog.value = true;
};

async function fetchContracts() {
  const contractResponse = await api.get("admin/contrato-chip/clientes-ativos");

  contracts.value = contractResponse.data;
}

onMounted(async () => {
  await fetchContracts();
});
</script>
