<template>
  <v-sheet :class="[statusClass, 'pa-1']" shaped>
    <v-card-text class="tag-card-content">
      <div class="card-header">
        <div class="card-title">{{ tag.title }}</div>
        <v-btn icon="mdi-close" color="red" variant="text" size="small" @click.stop="openDelete" />
      </div>

      <div v-if="primaryMessage" class="message-block">
        <div class="message-row">
          <div class="message-main">
            <span class="field-label">Atividade</span>
            <div class="message-text">{{ primaryMessage }}</div>
          </div>
          <div v-if="progressValue" class="message-progress">
            <span class="field-label">Progresso</span>
            <span class="field-value">{{ progressValue }}</span>
          </div>
        </div>
        <div v-if="showDescriptionField" class="message-text text-medium-emphasis">
          {{ tag.description }}
        </div>
      </div>

      <div v-if="dateFields.length" class="field-section">
        <div class="date-list">
          <div v-for="field in dateFields" :key="field.label" class="date-item">
            <span class="field-label">{{ field.label }}</span>
            <span class="field-value">{{ field.value }}</span>
          </div>
        </div>
      </div>

      <div v-if="showCounters" class="field-section">
        <table class="counter-table">
          <thead>
            <tr>
              <th v-for="field in countFields" :key="field.label">{{ field.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td v-for="field in countFields" :key="field.label">{{ field.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </v-card-text>
  </v-sheet>

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
  <v-snackbar v-model="snackbar" :timeout="3000" :color="snackbarColor" top right>
    {{ snackbarMessage }}
    <template #action>
      <v-btn text @click="snackbar = false">Fechar</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { computed, ref } from "vue";
import { formatInTimeZone } from "date-fns-tz";
import denoApi from "../denoApi";
import { useRoute } from "vue-router";

const timeZone = "America/Sao_Paulo";
const route = useRoute();

const props = defineProps({
  tag: Object,
  redisKey: String,
});

const hasValue = (value) => value !== undefined && value !== null && value !== "";

const buildField = (label, value, options = {}) => {
  if (!hasValue(value)) {
    return null;
  }

  return {
    label,
    value,
    monospace: Boolean(options.monospace),
    error: Boolean(options.error),
  };
};

const statusClass = computed(() =>
  props.tag?.finished_at ? "tag-finished" : "tag-processing"
);

const primaryMessage = computed(() => props.tag?.activity || props.tag?.description || "");

const showDescriptionField = computed(
  () =>
    hasValue(props.tag?.description) &&
    props.tag.description !== props.tag.activity
);

const progressValue = computed(() =>
  hasValue(props.tag?.progress) ? `${props.tag.progress}%` : ""
);

const showCounters = computed(() => "mostrarContadores" in route.query);

const countFields = computed(() => [
  {
    label: "Total",
    value: props.tag?.total || "-",
  },
  {
    label: "Processados",
    value: props.tag?.processed || "-",
  },
  {
    label: "Restantes",
    value: props.tag?.remaining || "-",
  },
  {
    label: "Itens/seg",
    value: props.tag?.rate_per_sec || "-",
  },
]);

const dateFields = computed(() =>
  [
    buildField(
      "Criado",
      hasValue(props.tag?.created_at)
        ? formatDate(props.tag.created_at, "HH:mm:ss")
        : null
    ),
    buildField(
      props.tag?.finished_at ? "Finalizado" : "Atualizado",
      hasValue(props.tag?.finished_at || props.tag?.updated_at)
        ? formatDate(props.tag?.finished_at || props.tag?.updated_at, "HH:mm:ss")
        : null
    ),
  ].filter(Boolean)
);

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

async function deleteItem() {
  const response = await denoApi.delete(`/v2/upload/upload-progress/${props.redisKey}`);

  showToast("Item deletado com sucesso", "success");
}

function formatDate(date, pattern = "dd/MM/yyyy HH:mm:ss") {
  if (!date) {
    return "-";
  }

  const normalizedDate = String(date)
    .trim()
    .replace(/\.(\d{3})\d+(?=Z|[+-]\d{2}:\d{2}$|$)/, ".$1");
  const hasTimeZone = /(?:Z|[+-]\d{2}:\d{2})$/.test(normalizedDate);
  const parsedDate = new Date(
    hasTimeZone ? normalizedDate : `${normalizedDate}Z`
  );

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return formatInTimeZone(parsedDate, timeZone, pattern);
}

// função genérica para mostrar toast
function showToast(message, color = "info") {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}
</script>

<style scoped>
.tag-finished {
  background: #e8f7e8;
}

.tag-processing {
  background: #fff8db;
}

.tag-card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 0.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.card-title {
  flex: 1;
  min-width: 0;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
}

.message-block {
  padding: 8px 0;
}

.message-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.message-main {
  flex: 1;
  min-width: 0;
}

.message-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  white-space: nowrap;
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.field-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px 16px;
}

.date-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.counter-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.counter-table td {
  padding: 8px 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  text-align: left;
}

.counter-table th {
  padding: 8px 10px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  text-transform: uppercase;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  text-transform: uppercase;
}

.field-value {
  word-break: break-word;
}

.field-value-mono {
  font-family: "Roboto Mono", monospace;
  font-size: 0.9rem;
}
</style>
