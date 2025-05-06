<template>
  <v-card
    @click="openDelete"
    outlined
    :class="[statusClass, 'pa-4', 'mb-4']"
    shaped
  >
    <v-card-title class="text-h6">{{ tag.title }}</v-card-title>
    <v-card-text>
      <div class="mb-2">{{ tag.description }}</div>
      <v-progress-linear
        :value="tag.progress"
        height="8"
        class="mb-2"
      ></v-progress-linear>
      <div class="flex justify-between">
        <span class="text-subtitle mb-1">Progresso: {{ tag.progress }}%</span>
        <span v-if="tag.finished_at" class="text-subtitle">
          Finalizado:
          {{ formatDate(tag.finished_at, "dd/MM HH:mm") }}
        </span>
        <span v-else class="text-subtitle">
          Atualizado:
          {{ formatDate(tag.updated_at, "dd/MM HH:mm:ss") }}
        </span>
        <span v-if="tag.created_at" class="text-subtitle">
          Criado: {{ formatDate(tag.created_at, "dd/MM HH:mm") }}
        </span>
      </div>
    </v-card-text>
  </v-card>

  <!-- Dialog de confirmação -->
  <v-dialog v-model="confirmDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">Confirmação</v-card-title>
      <v-card-text>Tem certeza que deseja prosseguir?</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="confirmDialog = false">Cancelar</v-btn>
        <v-btn text color="primary" @click="onConfirm">Confirmar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Snackbar (toast) -->
  <v-snackbar
    v-model="snackbar"
    :timeout="3000"
    :color="snackbarColor"
    top
    right
  >
    {{ snackbarMessage }}
    <template #action>
      <v-btn text @click="snackbar = false">Fechar</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { computed, ref } from "vue";
import { formatInTimeZone } from "date-fns-tz";
import axios from "axios";

const timeZone = "America/Sao_Paulo";

const props = defineProps({
  tag: Object,
  redisKey: String,
});

const statusClass = computed(() => {
  if (props.tag?.finished_at) {
    return "border-success";
  } else {
    return "border-warning";
  }
});

const confirmDialog = ref(false);
let pendingAction = null;

const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("");

function openDelete() {
  pendingAction = deleteItem;
  confirmDialog.value = true;
}

// executa ao confirmar
function onConfirm() {
  confirmDialog.value = false;
  if (typeof pendingAction === "function") {
    pendingAction();
    pendingAction = null;
  }
}

// exemplo de ação: exibe toast de sucesso
async function deleteItem() {
  const response = await axios.delete(
    `${import.meta.env.VITE_API_FLASK_URL}upload-progress/${props.redisKey}`
  );

  showToast("Item deletado com sucesso", "success");
}

function formatDate(date, pattern = "dd/MM/yyyy HH:mm:ss") {
  const isoUtc = date.endsWith("Z") ? date : date + "Z";
  return formatInTimeZone(new Date(isoUtc), timeZone, pattern);
}

// função genérica para mostrar toast
function showToast(message, color = "info") {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}
</script>

<style scoped>
.border-success {
  border: 1px solid rgb(var(--v-theme-success)) !important;
}
.border-warning {
  border: 1px solid rgb(var(--v-theme-warning)) !important;
}
</style>
