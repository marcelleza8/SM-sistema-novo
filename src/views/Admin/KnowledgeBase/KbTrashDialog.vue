<template>
  <v-dialog :model-value="modelValue" max-width="640" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-delete-clock</v-icon>
        Lixeira
        <v-spacer></v-spacer>
        <v-btn icon variant="text" @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text style="min-height: 260px">
        <v-progress-linear v-if="loading" indeterminate class="mb-2"></v-progress-linear>

        <v-list v-if="items.length" density="compact">
          <v-list-item v-for="item in items" :key="item.id">
            <template #prepend>
              <v-icon size="small">
                {{ item.type === "folder" ? "mdi-folder" : item.type === "plan" ? "mdi-clipboard-text" : "mdi-note-text" }}
              </v-icon>
            </template>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
            <v-list-item-subtitle>
              Excluída em {{ formatDate(item.deleted_at) }}
              <span v-if="item.editor"> · por {{ item.editor.name }}</span>
            </v-list-item-subtitle>
            <template #append>
              <v-btn size="small" variant="text" color="primary" :loading="busy === item.id" @click="restore(item)">
                <v-icon start>mdi-restore</v-icon>Restaurar
              </v-btn>
              <v-btn size="small" variant="text" color="error" :loading="busy === item.id" @click="remove(item)">
                <v-icon start>mdi-delete-forever</v-icon>Excluir
              </v-btn>
            </template>
          </v-list-item>
        </v-list>

        <div v-else-if="!loading" class="text-disabled text-center pa-8">
          A lixeira está vazia.
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from "vue";
import kbApi from "../../../services/kbApi";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "changed"]);

const items = ref([]);
const loading = ref(false);
const busy = ref(null);

watch(
  () => props.modelValue,
  (open) => {
    if (open) load();
  }
);

async function load() {
  loading.value = true;
  try {
    const { data } = await kbApi.trash();
    items.value = data;
  } finally {
    loading.value = false;
  }
}

async function restore(item) {
  busy.value = item.id;
  try {
    await kbApi.restoreNote(item.id, null); // volta para a raiz
    await load();
    emit("changed");
  } finally {
    busy.value = null;
  }
}

async function remove(item) {
  if (!confirm(`Excluir "${item.title}" definitivamente? Isso apaga também o histórico e não pode ser desfeito.`)) {
    return;
  }
  busy.value = item.id;
  try {
    await kbApi.forceDeleteNote(item.id);
    await load();
    emit("changed");
  } finally {
    busy.value = null;
  }
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}
</script>
