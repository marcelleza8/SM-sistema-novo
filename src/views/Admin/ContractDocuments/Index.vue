<template>
  <DashboardLayout>
    <div class="cdoc-page">
      <!-- Cabeçalho -->
      <div class="cdoc-header">
        <v-avatar color="primary" rounded="lg" size="44" class="mr-3">
          <v-icon size="26">mdi-file-document-edit-outline</v-icon>
        </v-avatar>
        <div>
          <h1 class="cdoc-title">Documentos de Contrato</h1>
          <div class="cdoc-subtitle">
            Modelos reutilizáveis com variáveis
            <code>{{ sampleVar }}</code>
          </div>
        </div>
      </div>

      <div class="cdoc-grid">
        <!-- SIDEBAR -->
        <aside class="cdoc-sidebar">
          <v-card class="cdoc-card" elevation="0">
            <div class="cdoc-card-head">
              <span class="cdoc-card-title">
                Templates
                <v-chip size="x-small" variant="tonal" class="ml-1">{{ filteredTemplates.length }}</v-chip>
              </span>
              <v-btn color="primary" size="small" variant="flat" prepend-icon="mdi-plus" @click="newTemplate">
                Novo
              </v-btn>
            </div>

            <v-text-field
              v-model="searchTerm"
              density="compact"
              variant="solo-filled"
              flat
              hide-details
              clearable
              rounded="lg"
              class="mb-2"
              placeholder="Buscar template..."
              prepend-inner-icon="mdi-magnify"
            />

            <v-chip-group
              v-model="filterTypeId"
              selected-class="cdoc-chip--on"
              class="cdoc-types mb-1"
              @update:model-value="loadTemplates"
            >
              <v-chip :value="null" size="small" variant="outlined">Todos</v-chip>
              <v-chip
                v-for="t in types"
                :key="t.id"
                :value="t.id"
                size="small"
                variant="outlined"
              >
                {{ t.name }}
              </v-chip>
            </v-chip-group>

            <v-progress-linear v-if="loadingList" indeterminate color="primary" class="mb-1" />

            <div class="cdoc-list">
              <button
                v-for="tpl in filteredTemplates"
                :key="tpl.id"
                class="cdoc-item"
                :class="{ 'is-active': current && current.id === tpl.id }"
                @click="selectTemplate(tpl)"
              >
                <v-icon size="18" class="cdoc-item-ico">mdi-file-document-outline</v-icon>
                <span class="cdoc-item-body">
                  <span class="cdoc-item-name">{{ tpl.name }}</span>
                  <span class="cdoc-item-type">{{ tpl.type ? tpl.type.name : "—" }}</span>
                </span>
              </button>

              <div v-if="!loadingList && !filteredTemplates.length" class="cdoc-empty-list">
                <v-icon size="28" class="mb-1">mdi-file-search-outline</v-icon>
                <div>Nenhum template encontrado.</div>
              </div>
            </div>
          </v-card>
        </aside>

        <!-- EDITOR -->
        <section class="cdoc-main">
          <v-card v-if="current" class="cdoc-card cdoc-editor-card" elevation="0">
            <div class="cdoc-edit-head">
              <div class="cdoc-edit-fields">
                <v-text-field
                  v-model="form.name"
                  density="comfortable"
                  variant="plain"
                  hide-details
                  class="cdoc-name-field"
                  placeholder="Nome do template"
                />
                <v-select
                  v-model="form.type_id"
                  :items="typeItems"
                  density="compact"
                  variant="solo-filled"
                  flat
                  rounded="lg"
                  hide-details
                  prepend-inner-icon="mdi-tag-outline"
                  class="cdoc-type-select"
                />
              </div>
              <div class="cdoc-edit-actions">
                <v-btn v-if="current.id" color="error" size="small" variant="text" icon="mdi-delete-outline" title="Excluir" @click="removeTemplate" />
                <v-btn
                  color="primary"
                  variant="flat"
                  prepend-icon="mdi-content-save-outline"
                  :loading="saving"
                  :disabled="!canSave"
                  @click="save"
                >
                  Salvar
                </v-btn>
              </div>
            </div>

            <v-divider class="mb-3" />

            <CdocEditor v-model="form.content" />

            <div class="cdoc-hint">
              <v-icon size="15" class="mr-1">mdi-lightbulb-outline</v-icon>
              Digite <code>{{ braces }}</code> no texto (ou use “Inserir variável”) para adicionar campos.
              O preenchimento com dados reais acontece ao gerar o documento.
            </div>
          </v-card>

          <v-card v-else class="cdoc-card cdoc-empty" elevation="0">
            <v-icon size="64" color="primary" class="mb-3">mdi-file-document-plus-outline</v-icon>
            <h3 class="text-h6 mb-1">Nenhum template aberto</h3>
            <p class="text-medium-emphasis mb-4">Selecione um modelo à esquerda ou crie um novo.</p>
            <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" @click="newTemplate">
              Criar template
            </v-btn>
          </v-card>
        </section>
      </div>
    </div>
  </DashboardLayout>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import Swal from "sweetalert2";
import DashboardLayout from "../../../layouts/DashboardLayout.vue";
import CdocEditor from "../../../components/Cdoc/CdocEditor.vue";
import contractDocsApi from "../../../services/contractDocsApi";

export default {
  name: "ContractDocumentsIndex",
  components: { DashboardLayout, CdocEditor },
  setup() {
    const sampleVar = "{{tabela.coluna}}";
    const braces = "{{";
    const types = ref([]);
    const templates = ref([]);
    const current = ref(null);
    const loadingList = ref(false);
    const saving = ref(false);
    const filterTypeId = ref(null);
    const searchTerm = ref("");

    const form = reactive({ name: "", type_id: null, content: "" });

    const typeItems = computed(() =>
      types.value.map((t) => ({ title: t.name, value: t.id }))
    );

    const filteredTemplates = computed(() => {
      const q = (searchTerm.value || "").trim().toLowerCase();
      if (!q) return templates.value;
      return templates.value.filter((t) =>
        (t.name || "").toLowerCase().includes(q)
      );
    });

    const canSave = computed(() => !!form.name && !!form.type_id);

    async function loadTypes() {
      const res = await contractDocsApi.listTypes();
      types.value = (res && res.data) || [];
    }

    async function loadTemplates() {
      loadingList.value = true;
      try {
        const params = filterTypeId.value ? { type_id: filterTypeId.value } : {};
        const res = await contractDocsApi.listTemplates(params);
        templates.value = (res && res.data) || [];
      } finally {
        loadingList.value = false;
      }
    }

    function applyToForm(tpl) {
      form.name = tpl.name || "";
      form.type_id = tpl.type_id || (tpl.type && tpl.type.id) || null;
      form.content = tpl.content || "";
    }

    async function selectTemplate(tpl) {
      const res = await contractDocsApi.getTemplate(tpl.id);
      current.value = (res && res.data) || tpl;
      applyToForm(current.value);
    }

    function newTemplate() {
      current.value = { id: null };
      form.name = "";
      form.type_id = filterTypeId.value || (types.value[0] && types.value[0].id) || null;
      form.content = "";
    }

    async function save() {
      if (!canSave.value) return;
      saving.value = true;
      try {
        const payload = {
          type_id: form.type_id,
          name: form.name,
          content: form.content,
        };
        let res;
        if (current.value && current.value.id) {
          res = await contractDocsApi.updateTemplate(current.value.id, payload);
        } else {
          res = await contractDocsApi.createTemplate(payload);
        }
        if (res && res.data) {
          current.value = res.data;
          applyToForm(res.data);
          await loadTemplates();
          Swal.fire({ icon: "success", title: "Template salvo", timer: 1200, showConfirmButton: false });
        }
      } finally {
        saving.value = false;
      }
    }

    async function removeTemplate() {
      if (!current.value || !current.value.id) return;
      const r = await Swal.fire({
        icon: "warning",
        title: "Excluir template?",
        text: form.name,
        showCancelButton: true,
        confirmButtonText: "Excluir",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
      });
      if (!r.isConfirmed) return;
      await contractDocsApi.deleteTemplate(current.value.id);
      current.value = null;
      await loadTemplates();
    }

    onMounted(async () => {
      await loadTypes();
      await loadTemplates();
    });

    return {
      sampleVar,
      braces,
      types,
      templates,
      current,
      loadingList,
      saving,
      filterTypeId,
      searchTerm,
      form,
      typeItems,
      filteredTemplates,
      canSave,
      loadTemplates,
      selectTemplate,
      newTemplate,
      save,
      removeTemplate,
    };
  },
};
</script>

<style scoped>
.cdoc-page {
  max-width: 1320px;
  margin: 0 auto;
}
.cdoc-header {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}
.cdoc-title {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: #1f2329;
}
.cdoc-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
}
.cdoc-subtitle code,
.cdoc-hint code {
  background: rgba(206, 75, 108, 0.1);
  color: #b23457;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 0.85em;
}

.cdoc-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 18px;
  align-items: start;
}
@media (max-width: 960px) {
  .cdoc-grid {
    grid-template-columns: 1fr;
  }
}

.cdoc-card {
  border: 1px solid rgba(0, 0, 0, 0.07);
  border-radius: 14px;
  padding: 14px;
  background: #fff;
}

/* Sidebar */
.cdoc-sidebar {
  position: sticky;
  top: 12px;
}
.cdoc-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.cdoc-card-title {
  font-weight: 700;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
}
.cdoc-types {
  overflow-x: auto;
}
.cdoc-chip--on {
  background: #ce4b6c !important;
  color: #fff !important;
  border-color: #ce4b6c !important;
}
.cdoc-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 62vh;
  overflow-y: auto;
  margin-top: 6px;
}
.cdoc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 9px 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}
.cdoc-item:hover {
  background: #f5f6f8;
}
.cdoc-item.is-active {
  background: rgba(206, 75, 108, 0.08);
  border-color: rgba(206, 75, 108, 0.35);
}
.cdoc-item-ico {
  color: #9aa1ab;
  flex: 0 0 auto;
}
.cdoc-item.is-active .cdoc-item-ico {
  color: #ce4b6c;
}
.cdoc-item-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.cdoc-item-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: #1f2329;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cdoc-item-type {
  font-size: 0.75rem;
  color: #8b929c;
}
.cdoc-empty-list {
  text-align: center;
  color: #9aa1ab;
  font-size: 0.85rem;
  padding: 24px 8px;
}

/* Editor */
.cdoc-edit-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.cdoc-edit-fields {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 1 auto;
  min-width: 0;
}
.cdoc-name-field {
  font-size: 1.15rem;
  font-weight: 700;
  flex: 1 1 auto;
  min-width: 160px;
}
.cdoc-type-select {
  max-width: 240px;
}
.cdoc-edit-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}
.cdoc-hint {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 12px;
  font-size: 0.8rem;
  color: #6b7280;
}

/* Empty state do editor */
.cdoc-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 460px;
}
</style>
