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
      <v-col cols="12" md="6">
        <v-btn
          color="warning"
          @click="validarLote"
          :loading="validando"
          :disabled="inputState.formatted.length === 0"
        >
          VALIDAR
        </v-btn>
      </v-col>

      <v-col cols="12" md="6">
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

    <v-row v-if="false">
      <v-col
        v-for="operadora in operadoras"
        :key="operadora.id"
        cols="12"
        md="3"
      >
        <v-text-field
          :label="`Preço - ${operadora.name}`"
          v-model="form.precos[operadora.id]"
          prefix="R$"
          type="text"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <LineInputField
          v-model="inputState"
          placeholder="Digite linhas ou ICCIDs, um por linha"
        />
      </v-col>
      <v-col cols="12" md="6">
        <div id="output-lines">
          <span v-if="outputWarnings.length === 0">Nenhum alerta ainda.</span>
          <div v-for="(grupo, idx) in outputWarnings" :key="idx">
            <h4>{{ grupo.titulo }}</h4>
            <div
              class="text-caption grid grid-cols-2"
              v-for="item in grupo.itens"
            >
              <span> {{ item[0].linha }}</span>
              <span>{{ item[0].status }}</span>
            </div>
          </div>
        </div>
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
import { ref } from "vue";
import api from "../../../api";
import Swal from "sweetalert2";
import LineInputField from "../../BuscaChipVerifier.vue";

const props = defineProps<{
  contract: {
    id: number;
    anexes: [];
  };
}>();

const modoValidacao = ref<"misto">("misto");
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

const inputState = ref({
  formatted: [] as string[],
  unFormatted: [] as string[],
});

async function validarLote() {
  if (!inputState.value.formatted.length) return;
  validando.value = true;
  try {
    const response = await api.post("/admin/chip/busca", {
      type: "misto",
      data: inputState.value.formatted,
      contratoId: props.contract.id,
    });

    outputWarnings.value = [
      { titulo: "Já inseridas no contrato", itens: response.data.antigo || [] },
      { titulo: "Em outro contrato", itens: response.data.encontrado || [] },
      { titulo: "Canceladas", itens: response.data.cancelado || [] },
      { titulo: "Não encontradas", itens: response.data.nEncontrado || [] },
    ].filter((g) => g.itens.length);
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
