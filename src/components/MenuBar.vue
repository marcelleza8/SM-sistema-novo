<template>
  <div class="flex items-center gap-3">
    <!-- Hambúrguer à esquerda (mesma árvore) -->
    <MenuTree side="left" />

    <!-- Faixa de atalhos: favoritos + recentes (ocupa o centro) -->
    <div class="flex items-center gap-2 flex-wrap flex-1">
      <v-chip
        v-for="(item, idx) in strip"
        :key="item.key"
        size="small"
        draggable="true"
        class="cursor-pointer"
        :class="{ 'opacity-50': idx === dragIndex }"
        :color="menu.isFavorite(item.key) ? 'primary' : undefined"
        :variant="menu.isFavorite(item.key) ? 'flat' : 'tonal'"
        :title="menu.isFavorite(item.key)
          ? 'Favorito — segure para desafixar, arraste para reordenar'
          : 'Segure para fixar como favorito, arraste para reordenar'"
        @click="go(item)"
        @pointerdown="startPress(item)"
        @pointerup="endPress"
        @pointerleave="endPress"
        @pointercancel="endPress"
        @dragstart="onDragStart(idx, $event)"
        @dragover="onDragOver($event)"
        @drop="onDrop(idx)"
        @dragend="onDragEnd"
      >
        <v-icon
          v-if="menu.isFavorite(item.key)"
          start
          size="x-small"
          icon="mdi-star"
        />
        {{ item.label }}
      </v-chip>
    </div>

    <!-- Hambúrguer à direita (mesma árvore) -->
    <MenuTree side="right" />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMenuStore } from "../stores/menuStore";
import MenuTree from "./MenuTree.vue";

const LONG_PRESS_MS = 500;

const router = useRouter();
const route = useRoute();
const menu = useMenuStore();

const strip = computed(() => menu.strip);

// Navegação a partir de um chip da faixa de atalhos.
function go(item) {
  // Se acabou de arrastar ou de fazer long-press, não navega.
  if (justDragged) {
    justDragged = false;
    return;
  }
  if (longPressed) {
    longPressed = false;
    return;
  }
  if (route.name !== item.key) {
    router.push({ name: item.key });
  }
}

// Drag & drop para reordenar a faixa (persiste no localStorage via store).
const dragIndex = ref(-1);
let justDragged = false;

function onDragStart(index, e) {
  dragIndex.value = index;
  endPress(); // arrastar não deve disparar o long-press de favoritar
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index)); // Firefox exige payload
  }
}

function onDragOver(e) {
  e.preventDefault(); // habilita o drop
  if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
}

function onDrop(index) {
  const from = dragIndex.value;
  dragIndex.value = -1;
  if (from === -1 || from === index) return;
  const keys = strip.value.map((i) => i.key);
  const [moved] = keys.splice(from, 1);
  keys.splice(index, 0, moved);
  menu.reorder(keys);
  justDragged = true; // suprime o click que pode seguir o drop
}

function onDragEnd() {
  dragIndex.value = -1;
}

// Long-press para (des)favoritar um chip.
let pressTimer = null;
let longPressed = false;

function startPress(item) {
  longPressed = false;
  pressTimer = setTimeout(() => {
    longPressed = true;
    menu.toggleFavorite(item);
  }, LONG_PRESS_MS);
}

function endPress() {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
}
</script>
