<template>
  <v-card>
    <v-card-title>Histórico do Chip</v-card-title>
    <v-card-text>
      <v-list>
        <v-list-item v-for="(log, index) in logs" :key="index">
          <v-list-item-content>
            {{ formatDate(log.created_at) }} - {{ log.description }}
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { format } from "date-fns";

const props = defineProps<{
  logs: Array<{ description: string; created_at: string }>;
}>();

function formatDate(dateString: string) {
  return format(new Date(dateString), "dd/MM/yyyy HH:mm");
}
</script>
