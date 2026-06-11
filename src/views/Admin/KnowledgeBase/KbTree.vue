<template>
  <div class="kb-tree">
    <div
      v-for="node in nodes"
      :key="node.branch_id"
      class="kb-node"
    >
      <div
        class="kb-row d-flex align-center"
        :class="{ 'kb-row--active': node.note_id === selectedNoteId }"
        @click="$emit('select', node)"
      >
        <v-btn
          v-if="node.children && node.children.length"
          variant="text"
          size="x-small"
          icon
          @click.stop="toggle(node)"
        >
          <v-icon size="small">
            {{ expanded[node.branch_id] ? "mdi-menu-down" : "mdi-menu-right" }}
          </v-icon>
        </v-btn>
        <span v-else class="kb-spacer"></span>

        <v-icon size="small" class="mr-1">
          {{ node.type === "folder" ? "mdi-folder" : node.type === "plan" ? "mdi-clipboard-text" : "mdi-note-text" }}
        </v-icon>

        <span class="kb-title text-truncate">{{ node.title }}</span>

        <v-spacer></v-spacer>

        <v-btn
          class="kb-add"
          variant="text"
          size="x-small"
          icon
          title="Nova nota aqui dentro"
          @click.stop="$emit('add-child', node)"
        >
          <v-icon size="small">mdi-plus</v-icon>
        </v-btn>
      </div>

      <div v-if="node.children && node.children.length && expanded[node.branch_id]" class="kb-children">
        <KbTree
          :nodes="node.children"
          :selected-note-id="selectedNoteId"
          @select="$emit('select', $event)"
          @add-child="$emit('add-child', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";

defineOptions({ name: "KbTree" });

const props = defineProps({
  nodes: { type: Array, default: () => [] },
  selectedNoteId: { type: [Number, null], default: null },
});

defineEmits(["select", "add-child"]);

// Estado de expandido por ramo (começa aberto se vier is_expanded do back).
const expanded = reactive({});
props.nodes.forEach((n) => {
  expanded[n.branch_id] = n.is_expanded ?? true;
});

function toggle(node) {
  expanded[node.branch_id] = !expanded[node.branch_id];
}
</script>

<style scoped>
.kb-row {
  padding: 2px 4px;
  border-radius: 4px;
  cursor: pointer;
}
.kb-row:hover {
  background: rgba(0, 0, 0, 0.05);
}
.kb-row--active {
  background: rgba(25, 118, 210, 0.12);
}
.kb-children {
  margin-left: 16px;
  border-left: 1px solid rgba(0, 0, 0, 0.08);
}
.kb-spacer {
  display: inline-block;
  width: 28px;
}
.kb-title {
  max-width: 180px;
}
.kb-add {
  opacity: 0;
}
.kb-row:hover .kb-add {
  opacity: 1;
}
</style>
