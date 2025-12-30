<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h3 class="text-center">
          Criar anexo {{ contract?.anexes?.length + 1 || 1 }}
        </h3>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-btn
          color="warning"
          @click="validarLote"
          :loading="validando"
          :disabled="inputState.formatted.length === 0"
        >
          VALIDAR
        </v-btn>
      </v-col>

      <v-col cols="12" md="4">
        <!-- <BuscadorSIM @item-encontrado="addItem" /> -->
      </v-col>

      <v-col cols="12" md="4">
        <v-row>
          <v-col cols="4">
            <v-text-field
              label="Data de inclusão"
              v-model="form.anexo_data"
              type="date"
            />
          </v-col>
          <v-col cols="4">
            <v-select
              label="Vendedor"
              v-model="form.vendedor_id"
              :items="sellers"
              item-title="name"
              item-value="id"
            />
          </v-col>
          <v-col cols="4">
            <v-text-field
              label="Data Comodato"
              v-model="form.comodato"
              type="date"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <ChipPlanGroupManager :data="groupedByOperator" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <LineInputField
          v-model="inputState"
          placeholder="Digite linhas ou ICCIDs, um por linha"
        />
        <!-- <v-textarea v-model="formatted" auto-grow></v-textarea> -->
      </v-col>
      <v-col cols="12" md="6">
        <OutputLines @remove-item="removeItem" :resultado="outputWarnings" />
      </v-col>
    </v-row>

    <v-row justify="end">
      <v-btn
        color="primary"
        v-if="false"
        @click="salvarLote"
        :loading="salvando"
        :disabled="inputState.formatted.length === 0"
      >
        Salvar
      </v-btn>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import api from "../../../api";
import Swal from "sweetalert2";
import LineInputField from "../../BuscaChipVerifier.vue";
import OutputLines from "./outputLines.vue";
import BuscadorSIM from "../../BuscadorSIM.vue";
import ChipPlanGroupManager from "../../ChipPlanGroupManager.vue";

const props = defineProps<{
  contract: {
    id: number;
    anexes: [];
  };
}>();

const validando = ref(false);
const salvando = ref(false);
const outputWarnings = ref<{ titulo: string; itens: string[] }[]>([]);

const sellers = ref([
  { id: 1, name: "João Silva" },
  { id: 2, name: "Maria" },
]);
const operadoras = ref([
  { id: 1, name: "Vivo" },
  { id: 2, name: "TIM" },
]);

const form = ref({
  anexo_data: new Date().toISOString().slice(0, 10),
  vendedor_id: null,
  comodato: "",
  precos: {},
});

const groupedByOperator = ref({});

const inputState = ref({
  formatted: [] as string[],
  unFormatted: [] as string[],
});

async function validarLote() {
  if (!inputState.value.formatted.length) return;
  const VITE_API_DENO_URL = import.meta.env.VITE_API_DENO_URL;
  validando.value = true;
  try {
    let deno_url = `${VITE_API_DENO_URL}/v2/client/sims`;
    const response = await api.post(deno_url, {
      values: inputState.value.formatted,
    });

    const result = response.data.details;

    outputWarnings.value = inputState.value.formatted.reduce(
      (acc, val) => {
        // Procura pelo valor em IMEI ou phone_number
        const encontrado = result.find(
          (d: any) => d.imei === val || d.phone_number == val.substring(2)
        );
        if (encontrado) {
          acc.encontrados.push({ buscado: val, encontrado });
        } else {
          acc.naoEncontrados.push(val);
        }
        return acc;
      },
      { encontrados: [], naoEncontrados: [] }
    );

    groupedByOperator.value = result.reduce((acc, item) => {
      const key = item.operators_name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  } catch (err) {
    console.error(err);
    Swal.fire("Erro", "Falha ao validar lote.", "error");
  } finally {
    validando.value = false;
  }
}

async function salvarLote() {
  if (!inputState.value.formatted.length) return;
  salvando.value = true;
  try {
    const payload = {
      ...form.value,
      contratoId: props.contract.id,
      linhas: inputState.value.formatted,
    };
    const response = await api.post("/admin/contrato-chip/anexo", payload);

    if (response.data.status) {
      Swal.fire(
        "Sucesso",
        response.data.msg || "Anexo salvo com sucesso.",
        "success"
      );
    } else {
      Swal.fire(
        "Erro",
        response.data.message || "Falha ao salvar anexo.",
        "warning"
      );
    }
  } catch (err) {
    console.error(err);
    Swal.fire("Erro", "Erro inesperado. Contate o suporte.", "error");
  } finally {
    salvando.value = false;
  }
}

function addItem(item: any) {
  console.log(item);

  inputState.value.formatted.push(item.imei);
  console.log(inputState.value);
}

function removeItem(item: any) {
  //
}

const formatted = computed(() =>
  Array.from(new Set(inputState.value.formatted)).join("\n")
);
</script>

<style scoped>
#output-lines {
  max-height: 400px;
  overflow-y: auto;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 4px;
}
</style>
