<template>
  <v-dialog :model-value="modelValue" max-width="900" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-history</v-icon>
        Histórico de edições
        <v-spacer></v-spacer>
        <v-btn icon variant="text" @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-row no-gutters style="min-height: 420px">
        <!-- Lista de revisões -->
        <v-col cols="5" class="border-e">
          <v-list density="compact">
            <v-list-item
              v-for="rev in revisions"
              :key="rev.id"
              :active="selected && selected.id === rev.id"
              @click="preview(rev)"
            >
              <v-list-item-title>{{ rev.title }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ formatDate(rev.created_at) }}
                · {{ rev.author ? rev.author.name : "—" }}
              </v-list-item-subtitle>
            </v-list-item>
            <v-list-item v-if="!loading && !revisions.length">
              <v-list-item-title class="text-disabled">Sem histórico ainda.</v-list-item-title>
            </v-list-item>
          </v-list>
          <v-progress-linear v-if="loading" indeterminate></v-progress-linear>
        </v-col>

        <!-- Pré-visualização da versão -->
        <v-col cols="7" class="pa-4">
          <div v-if="selected">
            <div class="d-flex align-center mb-2">
              <div>
                <div class="text-subtitle-1 font-weight-medium">{{ selected.title }}</div>
                <div class="text-caption text-disabled">
                  Editado por {{ selected.author ? selected.author.name : "—" }}
                  em {{ formatDate(selected.created_at) }}
                </div>
              </div>
              <v-spacer></v-spacer>
              <v-btn color="primary" size="small" :loading="reverting" @click="restore">
                <v-icon start>mdi-restore</v-icon>
                Restaurar esta versão
              </v-btn>
            </div>
            <v-divider class="mb-3"></v-divider>
            <div class="kb-preview" v-html="renderedContent"></div>
          </div>
          <div v-else class="text-disabled d-flex align-center justify-center fill-height">
            Selecione uma versão para visualizar.
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";
import kbApi from "../../../services/kbApi";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  noteId: { type: [Number, null], default: null },
});

const emit = defineEmits(["update:modelValue", "restored"]);

const revisions = ref([]);
const selected = ref(null);
const loading = ref(false);
const reverting = ref(false);

const renderedContent = computed(() => {
  if (!selected.value || !selected.value.content) return "<em>(vazio)</em>";
  if (selected.value.content_format === "html") {
    return DOMPurify.sanitize(selected.value.content);
  }
  return DOMPurify.sanitize(marked.parse(selected.value.content));
});

watch(
  () => props.modelValue,
  (open) => {
    if (open && props.noteId) loadRevisions();
  }
);

async function loadRevisions() {
  loading.value = true;
  selected.value = null;
  try {
    const { data } = await kbApi.revisions(props.noteId);
    revisions.value = data;
  } finally {
    loading.value = false;
  }
}

async function preview(rev) {
  const { data } = await kbApi.getRevision(props.noteId, rev.id);
  selected.value = data;
}

async function restore() {
  reverting.value = true;
  try {
    await kbApi.revert(props.noteId, selected.value.id);
    emit("restored");
    emit("update:modelValue", false);
  } finally {
    reverting.value = false;
  }
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}
</script>

<style scoped>
.kb-preview {
  max-height: 340px;
  overflow: auto;
}
.kb-preview :deep(h1),
.kb-preview :deep(h2),
.kb-preview :deep(h3) {
  margin: 0.5em 0 0.3em;
}
.kb-preview :deep(p) {
  margin: 0.4em 0;
}
</style>
