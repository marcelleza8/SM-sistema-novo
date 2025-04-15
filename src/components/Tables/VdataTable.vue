<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-select
          v-model="selectedOperadora"
          :items="uniqueOperadoras"
          label="Filtrar por Operadora"
          multiple
          chips
        ></v-select>

        <v-select
          v-model="selectedPlano"
          :items="uniquePlanos"
          label="Filtrar por Plano"
          multiple
          chips
        ></v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-data-table
          v-model="selectedItems"
          :headers="headers"
          :items="filteredItems"
          :search="search"
          dense
          :sort-by.sync="sortBy"
          :sort-desc.sync="sortDesc"
          return-object
          show-select
          show-expand
          class="elevation-1"
          :mobile="null"
          :mobile-breakpoint="'sm'"
          :loading-text="'Buscando linhas da sua conta'"
          @update:model-value="onSelectionChange"
        >
          <template v-slot:top>
            <div class="flex justify-between px-2">
              <div
                class="font-bold text-blue-800 dark:text-blue-400"
                v-if="selectedItems.length"
                @click="clearSelected"
              >
                <span>{{ selectedItems.length }}</span>
                Selecionados
              </div>
              <div>
                Mostrando
                <span class="text-orange-800">{{ filteredItems.length }}</span>
                de
                <span class="text-green-800">{{ items.length }}</span>
                resultados
              </div>
            </div>
            <v-text-field
              v-model="search"
              label="Pesquise por linha ou ICCID"
              clearable
            ></v-text-field>
          </template>

          <template #[`item.linha`]="{ item }">
            <div class="d-flex ga-2">
              <v-btn density="compact" icon @click="copiarTexto(item.linha)">
                <v-icon>mdi-clipboard-outline</v-icon>
              </v-btn>
              <v-btn
                @click="openEditDialog(item.chipId)"
                elevation="0"
                class="pa-0"
                variant="text"
              >
                {{ item.linha }}
              </v-btn>
            </div>
          </template>
          <template #[`item.iccid`]="{ item }">
            <div class="d-flex ga-2">
              <v-btn
                class="pa-0"
                density="compact"
                icon
                @click="copiarTexto(item.iccid)"
              >
                <v-icon>mdi-clipboard-outline</v-icon>
              </v-btn>
              <v-btn
                @click="openEditDialog(item.chipId)"
                class="pa-0"
                density="compact"
                elevation="0"
                variant="text"
              >
                {{ item.iccid }}
              </v-btn>
            </div>
          </template>

          <!-- Customização do campo de consumo total -->
          <template v-slot:item.consumoTotal="{ item }">
            {{
              item.consumoTotal
                ? useHumanReadableBytes().formatBytes(item.consumoTotal, "MB")
                : ""
            }}
          </template>

          <!-- Customização do campo de último acesso -->
          <template v-slot:item.ultimoAcesso="{ item }">
            <span :title="dateUtils.timeAgo(item?.ultimoAcesso || '')">{{
              dateUtils.formatDate(item?.ultimoAcesso || "", "dd/MM/yyyy HH:mm")
            }}</span>
            <!-- <span>{{ item.ultimoAcesso }}</span> -->
          </template>

          <!-- Customização do campo de conexao -->
          <template v-slot:item.conexao="{ item }">
            <span>{{
              String(item.conexao).charAt(0) +
              String(item.conexao).slice(1).toLowerCase()
            }}</span>
          </template>

          <template v-slot:expanded-row="{ columns, item }">
            <ConsumosTable :item="item" :columns="columns" />
          </template>

          <!-- <template v-slot:item.actions="{ item }">
              <v-btn @click="editItem(item)">Editar</v-btn>
              <v-btn @click="deleteItem(item)">Excluir</v-btn>
            </template> -->
        </v-data-table>
      </v-col>
    </v-row>
    <v-dialog v-model="editChipDialog" max-width="90%">
      <v-card>
        <v-card-title>Edição de Chip #{{ selectedChipIdToEdit }}</v-card-title>
        <v-card-text>
          <AdminChipFormPage
            :id="selectedChipIdToEdit"
            showOnlyContent="true"
            @close="
              () => {
                editChipDialog = false;
              }
            "
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import { useHumanReadableBytes } from "../../composable/useHumanReadableBytes";
import { useDateUtils } from "../../composable/useDateUtils";
import ConsumosTable from "../ConsumosTable.vue";
import AdminChipFormPage from "../../views/Admin/Chip/Manage/Form.vue";
import Swal from "sweetalert2";

// Define o método emit para comunicar com o componente pai
const emit = defineEmits(["update:selected"]);

const props = defineProps({
  items: Object,
});

const headers = ref([
  { title: "", value: "data-table-expand", width: "1%" }, // Coluna para expandir
  { title: "Cliente", value: "cliente", sortable: true, nowrap: true },
  { title: "Linha", value: "linha", sortable: true, nowrap: true },
  { title: "ICCID", value: "iccid", sortable: true, nowrap: true },
  { title: "Status", value: "status", sortable: true, nowrap: true },
  {
    title: "Plano",
    value: "plano",
    sortable: true,
    nowrap: true,
  },
  { title: "Operadora", value: "operadora", sortable: true, nowrap: true },
  {
    title: "Último Acesso",
    value: "ultimoAcesso",
    sortable: true,
    nowrap: true,
  },
  { title: "Conexão", value: "conexao", sortable: true, nowrap: true },
  {
    title: "Consumo Total",
    value: "consumoTotal",
    sortable: true,
    nowrap: true,
  },
  {
    title: "SMS",
    value: "consumoSMS",
    sortable: true,
    nowrap: true,
  },
  {
    title: "IMEI Dispositivo",
    value: "imeiAparelho",
    sortable: true,
    nowrap: true,
  },
  { title: "Rede", value: "rede", sortable: true, nowrap: true },
  { title: "Tecnologia", value: "tecnologia", sortable: true, nowrap: true },
  { title: "APN", value: "apn", sortable: true, nowrap: true },
  {
    title: "Status na operadora",
    value: "statusOperadora",
    sortable: true,
    nowrap: true,
  },
  { title: "Ações", value: "actions", sortable: false, nowrap: true },
]);

const dateUtils = useDateUtils();
const search = ref("");
const sortBy = ref([{ key: "linha", order: "asc" }]);
const sortDesc = ref(false);

const editChipDialog = ref(false);
const selectedChipIdToEdit = ref(0);

const selectedItems = ref([]);

const selectedOperadora = ref([]);
const selectedPlano = ref([]);

// Valores únicos para cada filtro (para exibir nos selects)
const uniqueOperadoras = computed(() =>
  Array.from(new Set([...props.items].map((item) => item.operadora)))
);
const uniquePlanos = computed(() =>
  Array.from(new Set([...props.items].map((item) => item.plano)))
);

// Atualiza a lista de selecionados e emite o evento para o pai
const onSelectionChange = (newSelection) => {
  emit("update:selected", selectedItems.value);
};

// Filtrar e ordenar os itens
const filteredItems = computed(() => {
  console.time("FILTRO"); // debug

  let filtered = [...props.items];

  filtered = filtered.filter((item) => {
    return (
      (selectedOperadora.value.length === 0 ||
        selectedOperadora.value.includes(item.operadora)) &&
      (selectedPlano.value.length === 0 ||
        selectedPlano.value.includes(item.plano))
    );
  });

  if (search.value) {
    filtered = filtered.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(search.value.toLowerCase())
      )
    );
  }

  // Aplicar a ordenação
  if (sortBy.value.length > 0) {
    const { key } = sortBy.value[0];
    filtered.sort((a, b) => {
      const result = a[key] < b[key] ? -1 : 1;
      return sortDesc.value ? -result : result;
    });
  }
  console.timeEnd("FILTRO"); // debug

  return filtered;
});

const openEditDialog = (chipId) => {
  selectedChipIdToEdit.value = chipId;
  editChipDialog.value = true;
};

const copiarTexto = (texto) => {
  const textarea = document.createElement("textarea");
  textarea.value = texto;

  // evita que o textarea influencie no layout visual da página
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);

  textarea.select();

  try {
    const sucesso = document.execCommand("copy");
    Swal.fire({
      icon: sucesso ? "success" : "error",
      text: sucesso ? "Texto copiado!" : "Falha ao copiar!",
      toast: true,
      showConfirmButton: false,
      position: "top-end",
      timer: 3000,
      timerProgressBar: true,
    });
  } catch (err) {
    console.error("Erro ao copiar:", err);
    alert("Erro ao copiar.");
  } finally {
    // Garante destruição mesmo se houver erro
    document.body.removeChild(textarea);
  }
};

const clearSelected = () => {
  Swal.fire({
    icon: "warning",
    text: "Isso vai DESSELECIONAR todas as linhas selecionadas",
    showCancelButton: true,
    reverseButtons: true,
    confirmButtonText: "Desselecionar",
    confirmButtonColor: "#F44336",
    cancelButtonText: "Cancelar",
    cancelButtonColor: "#BDBDBD",
  }).then(({ isConfirmed }) => {
    if (isConfirmed) {
      selectedItems.value = [];
    }
  });
};
</script>

<style>
.v-data-table__td {
  padding: 0 4px !important;
  height: 36px !important;
}

div.light-theme tbody .v-data-table__tr:nth-of-type(odd) {
  /* 'teal lighten-5' basides on material design color */
  background-color: #e0f2f1;
}

div.light-theme tbody .v-data-table__tr:nth-of-type(even) {
  /* 'deep-orange lighten-5' basides on material design color */
  background-color: #fbe9e7;
}
</style>
