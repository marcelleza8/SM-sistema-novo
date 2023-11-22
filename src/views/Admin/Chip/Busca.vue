<template>
  <DashboardLayout>
    <div class="grid grid-cols-2">
      <div>
        <button class="primary">Verificar Linhas</button>
        <div>
          <SelectAjaxVue
            label="Selecione um cliente"
            v-model="verify.client"
            url="admin/clientes/buscar"
          />
          <div class="mt-16 text-center">
            <BuscaChipverifier
              class="inline-block"
              placeholder="Informe o ICC ou os numeros da linha"
            />
          </div>
        </div>
      </div>
      <div>importação</div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from "../../../layouts/DashboardLayout.vue";
import SelectAjaxVue from "../../../components/SelectAjax.vue";
import BuscaChipverifier from "../../../components/BuscaChipVerifier.vue";
import { ref } from "vue";

const verify = ref({
  client: null,
});
</script>

<style scoped></style>
