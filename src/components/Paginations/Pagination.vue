<template>
  <nav aria-label="Page navigation example" v-if="totalPages > 0">
    <ul class="pagination">
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <a class="page-link" href="#" @click.prevent="selectPage(1)"
          >Primeira</a
        >
      </li>
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <a
          class="page-link"
          href="#"
          aria-label="Previous"
          @click.prevent="selectPage(currentPage - 1)"
        >
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
      <!-- Páginas Iniciais -->
      <li
        v-for="page in initialPages"
        :key="page"
        class="page-item"
        :title="
          (page === currentPage ? 'Está na' : 'Ir para a') + ` página ${page}`
        "
        :class="{ active: page === currentPage }"
      >
        <a class="page-link" href="#" @click.prevent="selectPage(page)">{{
          page
        }}</a>
      </li>
      <!-- Separador -->
      <li v-if="showSeparator" class="page-item separator !hidden">
        <a class="page-link hidden" href="#">...</a>
      </li>
      <!-- Páginas Finais -->
      <li
        v-for="page in finalPages"
        :key="page"
        class="page-item"
        :class="{ active: page === currentPage }"
      >
        <a
          class="page-link"
          href="#"
          :title="
            (page === currentPage ? 'Está na' : 'Ir para a') + ` página ${page}`
          "
          @click.prevent="selectPage(page)"
          >{{ page }}</a
        >
      </li>
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <a
          class="page-link"
          href="#"
          aria-label="Next"
          @click.prevent="selectPage(currentPage + 1)"
        >
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <a class="page-link" href="#" @click.prevent="selectPage(totalPages)"
          >Última</a
        >
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed, defineEmits } from "vue";

const props = defineProps({
  currentPage: Number,
  totalPages: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:currentPage"]);

const initialPages = computed(() => {
  return [1, 2, 3].filter((page) => page < props.totalPages - 1);
});

const finalPages = computed(() => {
  const pages = [props.totalPages - 1, props.totalPages];
  return props.totalPages > 3 ? pages.filter((page) => page > 3) : [];
});

const showSeparator = computed(() => {
  return props.totalPages > 5;
});

function selectPage(page) {
  if (page < 1 || page > props.totalPages || page === props.currentPage) return;
  emit("update:currentPage", page);
}
</script>

<style scoped>
ul {
  @apply mx-auto flex justify-between w-2/3;
}
li {
  @apply bg-orange-500 inline-block rounded-md text-center;
}

li a {
  @apply w-20 py-2 inline-block;
}
.disabled {
  @apply bg-gray-500 cursor-default;
}

.disabled a,
.active a {
  @apply cursor-default;
}

.active {
  @apply bg-red-500;
}
</style>
