<template>
  <DashboardLayout>
    <v-container fluid>
      <v-row>
        <!-- COLUNA ESQUERDA: tipos + lista de templates -->
        <v-col cols="12" md="4" lg="3">
          <v-card class="pa-2" variant="outlined">
            <div class="d-flex align-center mb-2">
              <v-select
                v-model="filterTypeId"
                :items="typeFilterItems"
                density="compact"
                hide-details
                label="Tipo"
                @update:model-value="loadTemplates"
              />
              <v-btn class="ml-2" color="primary" size="small" icon title="Novo template" @click="newTemplate">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </div>

            <v-progress-linear v-if="loadingList" indeterminate class="mb-2" />

            <v-list density="compact" nav>
              <v-list-item
                v-for="tpl in templates"
                :key="tpl.id"
                :active="current && current.id === tpl.id"
                @click="selectTemplate(tpl)"
              >
                <v-list-item-title>{{ tpl.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ tpl.type ? tpl.type.name : "—" }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>

            <div v-if="!loadingList && !templates.length" class="text-disabled text-caption pa-2">
              Nenhum template. Crie o primeiro no botão +.
            </div>
          </v-card>
        </v-col>

        <!-- COLUNA DIREITA: editor -->
        <v-col cols="12" md="8" lg="9">
          <v-card v-if="current" class="pa-4" variant="outlined">
            <div class="d-flex align-center mb-3 flex-wrap" style="gap: 8px">
              <v-text-field
                v-model="form.name"
                density="compact"
                hide-details
                variant="outlined"
                placeholder="Nome do template"
                style="max-width: 320px"
              />
              <v-select
                v-model="form.type_id"
                :items="typeItems"
                density="compact"
                hide-details
                variant="outlined"
                label="Tipo"
                style="max-width: 240px"
              />
              <v-spacer />
              <v-btn v-if="current.id" size="small" color="error" variant="text" title="Excluir" @click="removeTemplate">
                <v-icon start>mdi-delete</v-icon>Excluir
              </v-btn>
              <v-btn color="primary" size="small" :loading="saving" :disabled="!canSave" @click="save">
                <v-icon start>mdi-content-save</v-icon>Salvar
              </v-btn>
            </div>

            <CdocEditor v-model="form.content" />

            <div class="text-caption text-disabled mt-3">
              Use <code>{{ sampleVar }}</code> para variáveis. O preenchimento com dados
              reais é feito ao gerar o documento (etapa seguinte).
            </div>
          </v-card>

          <v-card v-else class="pa-8 text-center text-disabled" variant="outlined">
            Selecione um template à esquerda ou crie um novo.
          </v-card>
        </v-col>
      </v-row>
    </v-container>
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
    const types = ref([]);
    const templates = ref([]);
    const current = ref(null);
    const loadingList = ref(false);
    const saving = ref(false);
    const filterTypeId = ref(null);

    const form = reactive({ name: "", type_id: null, content: "" });

    const typeItems = computed(() =>
      types.value.map((t) => ({ title: t.name, value: t.id }))
    );
    const typeFilterItems = computed(() => [
      { title: "Todos os tipos", value: null },
      ...typeItems.value,
    ]);

    const canSave = computed(
      () => !!form.name && !!form.type_id
    );

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
      types,
      templates,
      current,
      loadingList,
      saving,
      filterTypeId,
      form,
      typeItems,
      typeFilterItems,
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
