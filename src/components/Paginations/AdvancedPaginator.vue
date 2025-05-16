<template>
  <v-row align="center" justify="center" class="my-4 flex-wrap ga-2">
    <!-- Primeira -->
    <v-btn
      icon="mdi-chevron-double-left"
      @click="goTo(1)"
      :disabled="page === 1"
    />

    <!-- Anterior -->
    <v-btn
      icon="mdi-chevron-left"
      @click="goTo(page - 1)"
      :disabled="page === 1"
    />

    <!-- Intervalo de páginas -->
    <v-btn v-if="pagesToShow[0] > 1" icon variant="text" disabled> ... </v-btn>

    <v-btn
      v-for="p in pagesToShow"
      :key="p"
      @click="goTo(p)"
      :color="p === page ? 'primary' : 'default'"
      variant="tonal"
    >
      {{ p }}
    </v-btn>

    <v-btn v-if="pagesToShow.at(-1) < totalPages" icon variant="text" disabled>
      ...
    </v-btn>

    <!-- Próxima -->
    <v-btn
      icon="mdi-chevron-right"
      @click="goTo(page + 1)"
      :disabled="page === totalPages"
    />

    <!-- Última -->
    <v-btn
      icon="mdi-chevron-double-right"
      @click="goTo(totalPages)"
      :disabled="page === totalPages"
    />
  </v-row>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  page: number;
  totalPages: number;
  maxVisible?: number; // default: 7
}>();

const emit = defineEmits(["update:page"]);

const maxVisible = computed(() => props.maxVisible ?? 7);

const pagesToShow = computed(() => {
  const half = Math.floor(maxVisible.value / 2);
  let start = Math.max(1, props.page - half);
  let end = start + maxVisible.value - 1;

  if (end > props.totalPages) {
    end = props.totalPages;
    start = Math.max(1, end - maxVisible.value + 1);
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

function goTo(p: number) {
  if (p < 1 || p > props.totalPages || p === props.page) return;
  emit("update:page", p);
}
</script>
