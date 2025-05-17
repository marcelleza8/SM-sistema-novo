<template>
  <v-card>
    <v-card-title
      >Histórico do Chip
      <strong class="text-sm">(order decrescente)</strong></v-card-title
    >
    <v-card-text>
      <v-list>
        <v-list-item v-for="(log, index) in logs" :key="index">
          <v-list-item-title>
            <span class="text-sm">{{ formatDate(log.created_at) }}</span>
            -
            <span>{{ log.description }}</span>
          </v-list-item-title>
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
