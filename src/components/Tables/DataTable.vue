<template>
  <v-container fluid>
    <v-text-field
      v-model="search"
      label="Buscar"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      class="mb-4"
    />

    <v-data-table
      :headers="headers"
      :items="items"
      :search="search"
      :sort-by="['status']"
      class="elevation-1"
    >
      <!-- Ações customizadas -->
      <template #item.actions="{ item }">
        <div class="d-flex justify-end ga-2">
          <v-btn
            size="small"
            color="green"
            :to="{ name: 'AdminChipEditFormPage', params: { id: item.id } }"
          >
            Editar
          </v-btn>
          <v-btn size="small" color="red" @click="$emit('delete', item.id)">
            Excluir
          </v-btn>
        </div>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
});

defineEmits(["delete"]);

const search = ref("");

const headers = [
  { title: "Linha", value: "line" },
  { title: "ICCID", value: "iccid" },
  { title: "Status", value: "status" },
  { title: "Ações", value: "actions", sortable: false },
];
</script>
