<template>
  <DashboardLayout :showOnlyContent="showOnlyContent">
    <v-container>
      <v-form @submit.prevent="submitForm">
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              label="ICCID"
              v-model="form.imei"
              disabled
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              label="Número"
              v-model="form.phone_number"
              :rules="[(v) => !!v || 'Número é obrigatório']"
              required
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              label="Conta"
              v-model="form.account_id"
              :items="chipAccounts"
              item-title="code"
              item-value="id"
              required
            ></v-select>
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              label="Plano"
              v-model="form.chip_plan_id"
              :items="chipAccountPlans"
              item-title="name"
              item-value="id"
              required
            ></v-select>
          </v-col>

          <v-col cols="12" md="4">
            <v-select
              label="Status"
              v-model="form.status_id"
              :items="chipStatuses"
              item-title="name"
              item-value="id"
              required
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="d-flex">
            <v-btn
              type="button"
              color="error"
              variant="outlined"
              @click="
                () => {
                  emit('close', true);
                }
              "
              >Cancelar</v-btn
            >
            <v-spacer />
            <v-btn type="submit" color="primary">Salvar</v-btn>
          </v-col>
        </v-row>
      </v-form>
      <ChipHistory class="pt-4" :logs="chipLogs" />
    </v-container>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from "../../../../layouts/DashboardLayout.vue";
import { reactive, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../../../../api";
import ChipHistory from "./ChipHistory.vue";

const route = useRoute();
const router = useRouter();

const props = defineProps({
  id: {
    type: Number,
    default: null,
  },
  showOnlyContent: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const form = reactive({
  imei: "",
  phone_number: "",
  account_id: "",
  chip_plan_id: "",
  status_id: "",
});

const chipLogs = ref([]);
const chipStatuses = ref([]);
const chipAccounts = ref([]);
const chipAccountPlans = ref([]);

async function submitForm() {
  const id = route.params.id ?? props.id;
  try {
    if (id) {
      await api.put(`/admin/chip/${id}`, form);
    } else {
      await api.post("/admin/chip", form);
    }
    if (!props.showOnlyContent) {
      router.push({ name: "chipsList" });
    }
  } catch (error) {
    console.error("Erro ao salvar:", error);
  }

  if (props.showOnlyContent) {
    emit("close", true);
  }
}

onMounted(async () => {
  const id = route.params.id ?? props.id;

  api.get("admin/chip-status").then(({ data }) => {
    chipStatuses.value = data;
  });
  api.get("admin/chip-planos").then(({ data }) => {
    chipAccountPlans.value = data;
  });
  api.get("admin/chip-contas").then(({ data }) => {
    chipAccounts.value = data;
  });

  if (id) {
    try {
      const { data } = await api.get(`/admin/chip/show/${id}`);

      form.imei = data.imei;
      form.phone_number = data.phone_number;
      form.account_id = data.account_id;
      form.chip_plan_id = data.chip_plan_id;
      form.status_id = data.status_id;
      chipLogs.value = data.logs;
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }
});
</script>
