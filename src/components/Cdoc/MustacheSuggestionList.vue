<template>
  <div class="cdoc-suggestion">
    <template v-if="items.length">
      <button
        v-for="(item, index) in items"
        :key="item.value"
        class="cdoc-suggestion__item"
        :class="{ 'is-active': index === selectedIndex }"
        @mousedown.prevent="selectItem(index)"
        @mouseenter="selectedIndex = index"
      >
        <span class="cdoc-suggestion__token">{{ tokenOf(item) }}</span>
        <span class="cdoc-suggestion__meta">
          <span v-if="item.group" class="cdoc-suggestion__group">{{ item.group }}</span>
          <span class="cdoc-suggestion__col">{{ item.column }}</span>
        </span>
      </button>
    </template>
    <div v-else class="cdoc-suggestion__empty">Nenhuma variável encontrada</div>
  </div>
</template>

<script>
export default {
  name: "MustacheSuggestionList",
  props: {
    items: { type: Array, required: true },
    command: { type: Function, required: true },
  },
  data() {
    return { selectedIndex: 0 };
  },
  watch: {
    items() {
      this.selectedIndex = 0;
    },
  },
  methods: {
    tokenOf(item) {
      return "{{" + item.value + "}}";
    },
    onKeyDown({ event }) {
      if (event.key === "ArrowUp") {
        this.selectedIndex =
          (this.selectedIndex + this.items.length - 1) % this.items.length;
        return true;
      }
      if (event.key === "ArrowDown") {
        this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
        return true;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        this.selectItem(this.selectedIndex);
        return true;
      }
      return false;
    },
    selectItem(index) {
      const item = this.items[index];
      if (item) this.command(item);
    },
  },
};
</script>

<style scoped>
.cdoc-suggestion {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  max-height: 280px;
  overflow-y: auto;
  min-width: 280px;
  padding: 4px;
}
.cdoc-suggestion__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  text-align: left;
  padding: 6px 8px;
  border-radius: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
}
.cdoc-suggestion__item.is-active {
  background: rgba(25, 118, 210, 0.1);
}
.cdoc-suggestion__token {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: #1565c0;
}
.cdoc-suggestion__meta {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.6);
}
.cdoc-suggestion__group {
  margin-right: 6px;
}
.cdoc-suggestion__col {
  font-weight: 600;
}
.cdoc-suggestion__empty {
  padding: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
}
</style>
