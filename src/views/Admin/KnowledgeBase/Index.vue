<template>
  <DashboardLayout>
    <v-container fluid>
      <v-row>
        <!-- COLUNA ESQUERDA: árvore + busca -->
        <v-col cols="12" md="4" lg="3">
          <v-card class="pa-2" variant="outlined">
            <div class="d-flex align-center mb-2">
              <v-text-field
                v-model="searchTerm"
                density="compact"
                hide-details
                clearable
                placeholder="Buscar..."
                prepend-inner-icon="mdi-magnify"
                @keyup.enter="runSearch"
                @click:clear="clearSearch"
              />
              <v-btn class="ml-2" color="primary" size="small" icon title="Nova nota na raiz" @click="newNote(null)">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </div>

            <!-- Resultados de busca -->
            <div v-if="searchResults !== null">
              <div class="text-caption text-disabled mb-1">
                {{ searchResults.length }} resultado(s)
              </div>
              <v-list density="compact">
                <v-list-item
                  v-for="r in searchResults"
                  :key="r.note_id"
                  @click="selectNoteId(r.note_id)"
                >
                  <v-list-item-title>{{ r.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ r.path.map((p) => p.title).join(" / ") }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>

            <!-- Árvore -->
            <div v-else>
              <v-progress-linear v-if="loadingTree" indeterminate class="mb-2"></v-progress-linear>
              <KbTree
                :nodes="tree"
                :selected-note-id="note ? note.id : null"
                @select="(node) => selectNoteId(node.note_id)"
                @add-child="(node) => newNote(node.note_id)"
              />
              <div v-if="!loadingTree && !tree.length" class="text-disabled text-caption pa-2">
                Nenhuma nota. Crie a primeira no botão +.
              </div>
            </div>
          </v-card>
        </v-col>

        <!-- COLUNA DIREITA: editor -->
        <v-col cols="12" md="8" lg="9">
          <v-card v-if="note" class="pa-4" variant="outlined">
            <div class="d-flex align-center mb-3">
              <v-text-field
                v-model="form.title"
                density="compact"
                hide-details
                variant="plain"
                class="text-h6"
                placeholder="Título da nota"
              />
              <v-spacer></v-spacer>

              <v-btn-toggle v-model="mode" density="compact" mandatory class="mr-2">
                <v-btn value="edit" size="small"><v-icon start>mdi-pencil</v-icon>Editar</v-btn>
                <v-btn value="preview" size="small"><v-icon start>mdi-eye</v-icon>Ver</v-btn>
              </v-btn-toggle>

              <v-btn class="mr-1" size="small" variant="text" title="Histórico" @click="historyOpen = true">
                <v-icon>mdi-history</v-icon>
              </v-btn>
              <v-btn class="mr-1" size="small" color="error" variant="text" title="Excluir desta posição" @click="confirmDelete">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-btn color="primary" size="small" :loading="saving" :disabled="!dirty" @click="save">
                <v-icon start>mdi-content-save</v-icon>Salvar
              </v-btn>
            </div>

            <v-select
              v-model="form.type"
              :items="typeItems"
              density="compact"
              hide-details
              style="max-width: 200px"
              class="mb-3"
              label="Tipo"
            />

            <v-textarea
              v-if="mode === 'edit'"
              v-model="form.content"
              auto-grow
              rows="16"
              variant="outlined"
              placeholder="Escreva em Markdown..."
              hide-details
            />
            <div v-else class="kb-preview" v-html="renderedContent"></div>

            <div class="text-caption text-disabled mt-3">
              Atualizado em {{ formatDate(note.updated_at) }}
              <span v-if="note.editor"> por {{ note.editor.name }}</span>
            </div>
          </v-card>

          <v-card v-else class="pa-8 text-center text-disabled" variant="outlined">
            Selecione uma nota à esquerda ou crie uma nova.
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <KbHistoryDialog
      v-model="historyOpen"
      :note-id="note ? note.id : null"
      @restored="onRestored"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </DashboardLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { marked } from "marked";
import DOMPurify from "dompurify";
import DashboardLayout from "../../../layouts/DashboardLayout.vue";
import KbTree from "./KbTree.vue";
import KbHistoryDialog from "./KbHistoryDialog.vue";
import kbApi from "../../../services/kbApi";

const tree = ref([]);
const loadingTree = ref(false);
const note = ref(null);
const saving = ref(false);
const mode = ref("edit");
const historyOpen = ref(false);

const searchTerm = ref("");
const searchResults = ref(null);

const typeItems = [
  { title: "Nota", value: "note" },
  { title: "Planejamento", value: "plan" },
  { title: "Pasta", value: "folder" },
];

const form = reactive({ title: "", content: "", type: "note" });
const snackbar = reactive({ show: false, text: "", color: "success" });

const dirty = computed(() => {
  if (!note.value) return false;
  return (
    form.title !== (note.value.title || "") ||
    (form.content || "") !== (note.value.content || "") ||
    form.type !== (note.value.type || "note")
  );
});

const renderedContent = computed(() => {
  if (!form.content) return "<em>(vazio)</em>";
  if (form.type && note.value && note.value.content_format === "html") {
    return DOMPurify.sanitize(form.content);
  }
  return DOMPurify.sanitize(marked.parse(form.content));
});

onMounted(loadTree);

async function loadTree() {
  loadingTree.value = true;
  try {
    const { data } = await kbApi.tree();
    tree.value = data;
  } finally {
    loadingTree.value = false;
  }
}

async function selectNoteId(noteId) {
  const { data } = await kbApi.getNote(noteId);
  note.value = data;
  form.title = data.title || "";
  form.content = data.content || "";
  form.type = data.type || "note";
  mode.value = "edit";
}

async function newNote(parentId) {
  const { data } = await kbApi.createNote({
    title: "Nova nota",
    content: "",
    type: "note",
    parent_id: parentId,
  });
  await loadTree();
  await selectNoteId(data.id);
  toast("Nota criada");
}

async function save() {
  saving.value = true;
  try {
    await kbApi.updateNote(note.value.id, {
      title: form.title,
      content: form.content,
      type: form.type,
    });
    await selectNoteId(note.value.id);
    await loadTree();
    toast("Salvo");
  } catch (e) {
    toast("Erro ao salvar", "error");
  } finally {
    saving.value = false;
  }
}

async function confirmDelete() {
  if (!confirm("Remover esta nota desta posição?")) return;
  const branchId = findBranchId(tree.value, note.value.id);
  if (!branchId) {
    toast("Não encontrei a posição na árvore", "error");
    return;
  }
  await kbApi.deleteBranch(branchId);
  note.value = null;
  await loadTree();
  toast("Removido");
}

async function onRestored() {
  await selectNoteId(note.value.id);
  await loadTree();
  toast("Versão restaurada");
}

async function runSearch() {
  const q = (searchTerm.value || "").trim();
  if (q.length < 2) {
    searchResults.value = null;
    return;
  }
  const { data } = await kbApi.search(q);
  searchResults.value = data;
}

function clearSearch() {
  searchTerm.value = "";
  searchResults.value = null;
}

// Encontra o branch_id da primeira ocorrência de uma nota na árvore.
function findBranchId(nodes, noteId) {
  for (const n of nodes) {
    if (n.note_id === noteId) return n.branch_id;
    if (n.children && n.children.length) {
      const found = findBranchId(n.children, noteId);
      if (found) return found;
    }
  }
  return null;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

function toast(text, color = "success") {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
}
</script>

<style scoped>
.kb-preview {
  min-height: 360px;
  padding: 8px 4px;
}
.kb-preview :deep(pre) {
  background: rgba(0, 0, 0, 0.05);
  padding: 8px;
  border-radius: 4px;
  overflow: auto;
}
.kb-preview :deep(code) {
  background: rgba(0, 0, 0, 0.06);
  padding: 1px 4px;
  border-radius: 3px;
}
</style>
