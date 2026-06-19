<template>
  <v-menu v-model="open" :close-on-content-click="false" :location="menuLocation">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        icon="mdi-menu"
        variant="text"
        size="small"
        title="Menu"
      />
    </template>

    <v-list density="compact" min-width="220">
      <v-menu
        v-for="section in tree"
        :key="section.section"
        open-on-hover
        :location="submenuLocation"
        :close-on-content-click="false"
        submenu
      >
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            :title="section.section"
            :append-icon="chevronIcon"
          />
        </template>

        <v-list density="compact" min-width="220">
          <v-list-item
            v-for="item in section.items"
            :key="item.key"
            :prepend-icon="item.icon"
            :title="item.label"
            :active="item.key === activeKey"
            @click="go(item)"
          />
        </v-list>
      </v-menu>
    </v-list>
  </v-menu>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { menuTree } from "../utils/menuTree";

// `side` controla de que lado o painel e os submenus abrem, para que o menu da
// direita não vaze para fora da tela.
const props = defineProps({
  side: {
    type: String,
    default: "left", // "left" | "right"
    validator: (v) => ["left", "right"].includes(v),
  },
});

const router = useRouter();
const route = useRoute();
const tree = menuTree;
const activeKey = computed(() => route.name);
const open = ref(false);

const isRight = computed(() => props.side === "right");
const menuLocation = computed(() => (isRight.value ? "bottom end" : "bottom start"));
const submenuLocation = computed(() => (isRight.value ? "start" : "end"));
const chevronIcon = computed(() =>
  isRight.value ? "mdi-chevron-left" : "mdi-chevron-right"
);

function go(item) {
  open.value = false;
  if (route.name !== item.key) {
    router.push({ name: item.key });
  }
}
</script>
