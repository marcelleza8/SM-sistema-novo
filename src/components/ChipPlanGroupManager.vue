<template>
  <v-row dense>
    <v-col v-for="(items, operator) in data" :key="operator" cols="12" md="6">
      <v-card>
        <v-card-title class="font-bold">{{ operator }}</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="12" md="1" class="grid place-items-center">
              <v-btn icon="mdi-close" color="red" variant="text" size="small" />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field placeholder="Qtd" density="compact" type="number" />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                placeholder="Preço"
                density="compact"
                type="number"
                prefix="R$"
              />
            </v-col>
            <v-col cols="12" md="5">
              <v-select
                :items="planOptions"
                item-title="label"
                item-value="value"
                label="Plano"
                density="compact"
                @update:modelValue="calculateNextPlan"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../api";

const props = defineProps({
  data: Object,
});

const calculateNextPlan = (data) => {
  console.log(data);
};

const planOptions = ref([]);

onMounted(async () => {
  const { data } = await api.get("admin/planos");
  planOptions.value = data.planos.map((p) => ({
    value: p.id || p.value,
    label: p.name || p.label,
  }));

  if (props?.data) {
    //
  }
});
</script>
