<template>
  <div class="my-2 py-2 pl-4 bg-orange-200 space-x-4">
    <label for="">Alterar status dos chip selecionados para </label>
    <select v-model="statusToChange" class="bg-orange-400">
      <option value="-1" disabled>CLIQUE AQUI</option>
      <option :value="status.id" v-for="status in statuses">
        {{ status.nome.toUpperCase() }}
      </option>
    </select>
    <v-btn
      @click="changeStatusDialog = true"
      v-if="allowChange"
      color="yellow-darken-2"
      text="Alterar"
      elevation-24
    ></v-btn>
    <v-dialog v-model="changeStatusDialog" max-width="900">
      <v-card
        :title="`Alterar status das linhas para ${newStatus.nome.toUpperCase()}`"
      >
        <v-card-text>
          <h1>{{ items.length }} Selecionados</h1>
          <v-container v-if="false">
            <v-row v-for="item in items">
              <v-col cols="12" md="4">
                <v-text-field
                  label="Linha"
                  v-model="item.linha.text"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  label="Conta - Operadora"
                  v-model="item.conta"
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  label="ICCID"
                  :min="20"
                  :max="20"
                  placeholder="ICCID"
                  v-model="item.iccid.text"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-select
            label="Troca de status solicitado por"
            :items="users"
            item-value="id"
            item-title="nome"
          />
          <v-checkbox
            v-model="exportToCsv"
            color="red"
            :label="`${exportToCsv ? 'E' : 'Não e'}xportar lista`"
          ></v-checkbox>
          <v-spacer />

          <v-btn
            color="red darken-3"
            text="Cancelar"
            @click="changeStatusDialog = false"
          />
          <v-btn
            text="Enviar"
            variant="elevated"
            color="green lighten-1"
            elevation-1
            @click="handleChangeStatus"
          />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup>
import { computed, ref } from "vue";
import api from "../api";

const props = defineProps({
  items: {
    type: Object,
  },
});

const emit = defineEmits(["changed"]);

const statuses = ref([
  {
    id: 4,
    nome: "Disponível",
  },
  {
    id: 1,
    nome: "Ativo",
  },
  {
    id: 5,
    nome: "Bloqueio",
  },
  {
    id: 3,
    nome: "Cancelado",
  },
  {
    id: 6,
    nome: "Comodato",
  },
  {
    id: 2,
    nome: "Inativo",
  },
  {
    id: 7,
    nome: "Inativo Novo",
  },
  {
    id: 8,
    nome: "Suspenso",
  },
]);

const users = ref([
  {
    id: 4,
    nome: "Cesar De Carli",
  },
  {
    id: 13,
    nome: "Cesar Junior",
  },
  {
    id: 5,
    nome: "Fernanda Sostisso",
  },
  {
    id: 2,
    nome: "Gabriela Casa",
  },
  {
    id: 16,
    nome: "Igor Severo",
  },
  {
    id: 1,
    nome: "Marcelo H. Filho",
    selected: true,
  },
]);

const statusToChange = ref(-1);

const changeStatusDialog = ref(false);

const exportToCsv = ref(false);

const newStatus = computed(
  () => statuses.value.filter((i) => i.id === statusToChange.value)[0]
);

const allowChange = computed(
  () => true //props.items.length > 0 && statusToChange.value > -1
);

const handleChangeStatus = async () => {
  let data = {};

  data["data"] = props.items.map((i) => ({
    chipId: i.chipId,
    linha: i.linha,
    status: newStatus.value.id,
    iccid: null, //i.iccid.text,
  }));

  data["status"] = statusToChange.value;

  const res = await api.post("admin/chip/mudar-status", data);
  emit("changed", res.data);
  changeStatusDialog.value = false;
};
</script>
