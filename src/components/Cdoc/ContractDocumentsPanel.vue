<template>
  <div class="cdocp">
    <div class="cdocp-grid">
      <!-- LISTA DE DOCUMENTOS DO REGISTRO -->
      <aside class="cdocp-side">
        <div class="cdocp-side-head">
          <span class="cdocp-side-title">
            Documentos
            <v-chip size="x-small" variant="tonal" class="ml-1">{{ documents.length }}</v-chip>
          </span>
          <v-btn color="primary" size="small" variant="flat" prepend-icon="mdi-file-plus-outline" @click="openPicker">
            Gerar
          </v-btn>
        </div>

        <v-progress-linear v-if="loadingDocs" indeterminate color="primary" class="mb-1" />

        <div class="cdocp-list">
          <button
            v-for="doc in documents"
            :key="doc.id"
            class="cdocp-item"
            :class="{ 'is-active': current && current.id === doc.id }"
            @click="openDocument(doc)"
          >
            <v-icon size="18" class="cdocp-item-ico">mdi-file-document-outline</v-icon>
            <span class="cdocp-item-body">
              <span class="cdocp-item-name">{{ doc.name }}</span>
              <span class="cdocp-item-sub">
                {{ doc.type ? doc.type.name : "—" }}
                <template v-if="doc.descript"> · {{ doc.descript }}</template>
              </span>
            </span>
          </button>

          <div v-if="!loadingDocs && !documents.length" class="cdocp-empty">
            <v-icon size="26" class="mb-1">mdi-file-outline</v-icon>
            <div>Nenhum documento gerado para este registro.</div>
          </div>
        </div>
      </aside>

      <!-- EDITOR -->
      <section class="cdocp-main">
        <template v-if="current">
          <div class="cdocp-edit-head">
            <v-text-field
              v-model="form.name"
              density="comfortable"
              variant="plain"
              hide-details
              class="cdocp-name"
              placeholder="Nome do documento"
            />
            <div class="cdocp-actions">
              <v-btn size="small" variant="tonal" prepend-icon="mdi-magnify-scan" @click="scanOpen = true">
                Varrer mustaches
                <v-chip v-if="missingCount" size="x-small" color="warning" class="ml-2">{{ missingCount }}</v-chip>
              </v-btn>
              <v-btn v-if="current.id" color="error" size="small" variant="text" icon="mdi-delete-outline" title="Excluir" @click="removeDoc" />
              <v-btn color="primary" variant="flat" prepend-icon="mdi-content-save-outline" :loading="saving" :disabled="!form.name" @click="save">
                Salvar
              </v-btn>
            </div>
          </div>

          <v-text-field
            v-model="form.descript"
            density="compact"
            variant="outlined"
            class="mb-3"
            label="Descrição do registro (descript)"
            prepend-inner-icon="mdi-text-short"
            hide-details
          />

          <CdocEditor v-model="form.content" />

          <div class="cdocp-hint">
            <v-icon size="15" class="mr-1">mdi-information-outline</v-icon>
            Os campos do contrato já vêm preenchidos. Use <strong>Varrer mustaches</strong>
            para completar os que faltam, ou digite <code>{{ braces }}</code> para inserir novos.
          </div>
        </template>

        <div v-else class="cdocp-blank">
          <v-icon size="56" color="primary" class="mb-3">mdi-file-document-plus-outline</v-icon>
          <h3 class="text-h6 mb-1">Gere um documento deste contrato</h3>
          <p class="text-medium-emphasis mb-4">
            Escolha um template; os dados do contrato são preenchidos automaticamente.
          </p>
          <v-btn color="primary" variant="flat" prepend-icon="mdi-file-plus-outline" @click="openPicker">
            Gerar a partir de template
          </v-btn>
        </div>
      </section>
    </div>

    <!-- DIALOG: escolher template -->
    <v-dialog v-model="pickerOpen" max-width="520">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-file-document-multiple-outline</v-icon>
          Escolher template
        </v-card-title>
        <v-card-text style="max-height: 56vh; overflow-y: auto">
          <v-text-field
            v-model="pickerSearch"
            density="compact"
            variant="solo-filled"
            flat
            hide-details
            clearable
            class="mb-2"
            placeholder="Buscar template..."
            prepend-inner-icon="mdi-magnify"
          />
          <v-list density="compact" nav>
            <v-list-item
              v-for="tpl in filteredTemplates"
              :key="tpl.id"
              :title="tpl.name"
              :subtitle="tpl.type ? tpl.type.name : '—'"
              :disabled="generating"
              @click="generateFrom(tpl)"
            >
              <template #prepend><v-icon>mdi-file-document-outline</v-icon></template>
            </v-list-item>
            <div v-if="!filteredTemplates.length" class="text-medium-emphasis text-center py-4">
              Nenhum template disponível.
            </div>
          </v-list>
          <v-progress-linear v-if="generating" indeterminate color="primary" class="mt-2" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="pickerOpen = false">Fechar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG: varrer mustaches -->
    <MustacheScanDialog v-model="scanOpen" :content="form.content" @apply="onScanApply" />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import Swal from "sweetalert2";
import CdocEditor from "./CdocEditor.vue";
import MustacheScanDialog from "./MustacheScanDialog.vue";
import contractDocsApi from "../../services/contractDocsApi";

export default {
  name: "ContractDocumentsPanel",
  components: { CdocEditor, MustacheScanDialog },
  props: {
    entity: { type: String, default: "contract" },
    recordId: { type: [Number, String], required: true },
  },
  setup(props) {
    const braces = "{{";
    const documents = ref([]);
    const templates = ref([]);
    const current = ref(null);
    const loadingDocs = ref(false);
    const saving = ref(false);
    const generating = ref(false);
    const pickerOpen = ref(false);
    const scanOpen = ref(false);
    const pickerSearch = ref("");
    const missingCount = ref(0);

    const form = reactive({
      name: "",
      descript: "",
      content: "",
      template_id: null,
      type_id: null,
    });

    const filteredTemplates = computed(() => {
      const q = (pickerSearch.value || "").trim().toLowerCase();
      if (!q) return templates.value;
      return templates.value.filter((t) => (t.name || "").toLowerCase().includes(q));
    });

    async function loadDocuments() {
      loadingDocs.value = true;
      try {
        const res = await contractDocsApi.listDocuments(props.entity, props.recordId);
        documents.value = (res && res.data) || [];
      } finally {
        loadingDocs.value = false;
      }
    }

    async function loadTemplates() {
      const res = await contractDocsApi.listTemplates();
      templates.value = (res && res.data) || [];
    }

    function openPicker() {
      pickerSearch.value = "";
      pickerOpen.value = true;
      if (!templates.value.length) loadTemplates();
    }

    async function generateFrom(tpl) {
      generating.value = true;
      try {
        const res = await contractDocsApi.resolveTemplate(tpl.id, props.entity, props.recordId);
        const data = (res && res.data) || {};
        form.name = data.name || tpl.name;
        form.descript = "";
        form.content = data.content || "";
        form.template_id = tpl.id;
        form.type_id = data.type_id || (tpl.type && tpl.type.id) || null;
        missingCount.value = (data.missing || []).length;
        current.value = { id: null };
        pickerOpen.value = false;
        if (missingCount.value) {
          Swal.fire({
            icon: "info",
            title: "Documento gerado",
            text: `${missingCount.value} variável(is) ainda sem dados. Use "Varrer mustaches" para completar.`,
            timer: 2600,
            showConfirmButton: false,
          });
        }
      } finally {
        generating.value = false;
      }
    }

    async function openDocument(doc) {
      const res = await contractDocsApi.getDocument(doc.id);
      const d = (res && res.data) || doc;
      current.value = d;
      form.name = d.name || "";
      form.descript = d.descript || "";
      form.content = d.content || "";
      form.template_id = d.template_id || null;
      form.type_id = d.type_id || null;
      missingCount.value = countMustaches(form.content);
    }

    function countMustaches(html) {
      const m = (html || "").match(/\{\{\s*[a-zA-Z0-9_.]+\s*\}\}/g);
      return m ? new Set(m).size : 0;
    }

    function onScanApply(newContent) {
      form.content = newContent;
      missingCount.value = countMustaches(newContent);
    }

    async function save() {
      if (!form.name) return;
      saving.value = true;
      try {
        let res;
        if (current.value && current.value.id) {
          res = await contractDocsApi.updateDocument(current.value.id, {
            name: form.name,
            descript: form.descript,
            content: form.content,
          });
        } else {
          res = await contractDocsApi.createDocument({
            entity: props.entity,
            id: props.recordId,
            template_id: form.template_id,
            type_id: form.type_id,
            name: form.name,
            descript: form.descript,
            content: form.content,
          });
        }
        if (res && res.data) {
          current.value = res.data;
          await loadDocuments();
          Swal.fire({ icon: "success", title: "Documento salvo", timer: 1200, showConfirmButton: false });
        }
      } finally {
        saving.value = false;
      }
    }

    async function removeDoc() {
      if (!current.value || !current.value.id) return;
      const r = await Swal.fire({
        icon: "warning",
        title: "Excluir documento?",
        text: form.name,
        showCancelButton: true,
        confirmButtonText: "Excluir",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d33",
      });
      if (!r.isConfirmed) return;
      await contractDocsApi.deleteDocument(current.value.id);
      current.value = null;
      await loadDocuments();
    }

    onMounted(loadDocuments);

    return {
      braces,
      documents,
      templates,
      current,
      loadingDocs,
      saving,
      generating,
      pickerOpen,
      scanOpen,
      pickerSearch,
      missingCount,
      form,
      filteredTemplates,
      openPicker,
      generateFrom,
      openDocument,
      onScanApply,
      save,
      removeDoc,
    };
  },
};
</script>

<style scoped>
.cdocp-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 16px;
  align-items: start;
}
@media (max-width: 900px) {
  .cdocp-grid {
    grid-template-columns: 1fr;
  }
}
.cdocp-side {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 12px;
  background: #fff;
  position: sticky;
  top: 8px;
}
.cdocp-side-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.cdocp-side-title {
  font-weight: 700;
  font-size: 0.92rem;
  display: inline-flex;
  align-items: center;
}
.cdocp-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 60vh;
  overflow-y: auto;
}
.cdocp-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  border-radius: 9px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
}
.cdocp-item:hover {
  background: #f5f6f8;
}
.cdocp-item.is-active {
  background: rgba(206, 75, 108, 0.08);
  border-color: rgba(206, 75, 108, 0.35);
}
.cdocp-item-ico {
  color: #9aa1ab;
  flex: 0 0 auto;
}
.cdocp-item.is-active .cdocp-item-ico {
  color: #ce4b6c;
}
.cdocp-item-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.cdocp-item-name {
  font-weight: 600;
  font-size: 0.88rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cdocp-item-sub {
  font-size: 0.74rem;
  color: #8b929c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cdocp-empty {
  text-align: center;
  color: #9aa1ab;
  font-size: 0.85rem;
  padding: 22px 8px;
}
.cdocp-edit-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.cdocp-name {
  font-size: 1.1rem;
  font-weight: 700;
  flex: 1 1 auto;
}
.cdocp-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
}
.cdocp-hint {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 10px;
  font-size: 0.8rem;
  color: #6b7280;
}
.cdocp-hint code,
.cdocp-hint strong {
  margin: 0 3px;
}
.cdocp-blank {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 380px;
  border: 1px dashed rgba(0, 0, 0, 0.12);
  border-radius: 12px;
}
</style>
