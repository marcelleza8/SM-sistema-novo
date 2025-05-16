<template>
  <v-container fluid>
    <v-row>
      <!-- Cliente -->
      <v-col cols="12" md="6">
        <v-select
          v-model="form.client_id"
          :items="clientes"
          item-title="fullName"
          item-value="id"
          label="* Cliente"
          :disabled="isReadonly"
          required
        />
      </v-col>

      <!-- Empresa para faturamento -->
      <v-col cols="12" md="3">
        <v-select
          v-model="form.bill_company_id"
          :items="billCompanies"
          item-title="fullName"
          item-value="id"
          label="Empresa para faturamento"
          :disabled="isReadonly"
          required
        />
      </v-col>

      <!-- Fatura com 60 dias -->
      <v-col cols="12" md="3" class="d-flex align-center">
        <v-checkbox
          v-model="form.days_to_bill"
          :disabled="isReadonly"
          label="Faturar com 60 dias"
        />
      </v-col>
    </v-row>

    <!-- Ciclo de faturamento -->
    <v-row>
      <v-col cols="12" md="4">
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="form.start_date"
              label="Data de início"
              type="date"
              :disabled="isReadonly"
              required
            />
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="form.end_date"
              label="Data de fim"
              type="date"
              :disabled="isReadonly"
              required
            />
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" md="2">
        <v-text-field
          v-model="form.due_date"
          label="Dia vencimento"
          type="date"
          :disabled="isReadonly"
          required
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import api from "../../../api";
import { useAuthStore } from "../../../stores/authStore";

const props = defineProps<{
  contract: {
    client_id: number;
    bill_company_id: number;
    days_to_bill?: boolean;
    date_cycle_init?: string;
    date_cycle_finish?: string;
    due_date?: string;
  };
}>();

const authStore = useAuthStore();

//!authStore.hasPermission("editar-contrato-de-chip")
const isReadonly = computed(() => false);

const clientes = ref<any[]>([]);
const billCompanies = ref<any[]>([]);

const form = ref({
  client_id: props.contract.client_id,
  bill_company_id: props.contract.bill_company_id,
  days_to_bill: props.contract.days_to_bill ?? false,
  start_date: props.contract.date_cycle_init?.slice(0, 10) ?? "",
  end_date: props.contract.date_cycle_finish?.slice(0, 10) ?? "",
  due_date: props.contract.due_date?.slice(0, 10) ?? "",
});

onMounted(async () => {
  const [clientesResponse, billCompaniesResponse] = await Promise.all([
    api.get("/admin/clientes"),
    api.get("/admin/bill-companies"),
  ]);

  clientes.value = clientesResponse.data.map((c: any) => ({
    ...c,
    fullName: `${c.name}`,
  }));

  billCompanies.value = billCompaniesResponse.data.map((b: any) => ({
    ...b,
    fullName: `${b.name}`,
  }));
});
</script>
