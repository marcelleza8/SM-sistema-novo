<template>
  <div class="kb-tree">
    <template v-for="(node, index) in nodes" :key="node.branch_id">
      <!-- Zona de soltar ANTES deste nó (reordenar/mover como irmão) -->
      <div
        class="kb-drop-line"
        :class="{ 'kb-drop-line--over': overLine === node.branch_id }"
        @dragover.prevent="overLine = node.branch_id"
        @dragleave="overLine = null"
        @drop.stop.prevent="onDropBefore(node, $event); overLine = null"
      ></div>

      <div class="kb-node">
        <div
          class="kb-row d-flex align-center"
          :class="{
            'kb-row--active': node.note_id === selectedNoteId,
            'kb-row--over': overBranchId === node.branch_id,
          }"
          draggable="true"
          @dragstart.stop="onDragStart(node, $event)"
          @dragover.prevent="overBranchId = node.branch_id"
          @dragleave="onDragLeave(node)"
          @drop.stop.prevent="onDropInside(node, $event)"
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
            class="kb-action"
            variant="text"
            size="x-small"
            icon
            title="Nova nota aqui dentro"
            @click.stop="$emit('add-child', node)"
          >
            <v-icon size="small">mdi-plus</v-icon>
          </v-btn>

          <v-menu>
            <template #activator="{ props }">
              <v-btn class="kb-action" variant="text" size="x-small" icon v-bind="props" @click.stop>
                <v-icon size="small">mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item @click="$emit('clone-request', node)">
                <template #prepend><v-icon size="small">mdi-content-duplicate</v-icon></template>
                <v-list-item-title>Clonar para...</v-list-item-title>
              </v-list-item>
              <v-list-item @click="$emit('delete-request', node)">
                <template #prepend><v-icon size="small" color="error">mdi-delete</v-icon></template>
                <v-list-item-title>Excluir esta posição</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <div v-if="node.children && node.children.length && expanded[node.branch_id]" class="kb-children">
          <KbTree
            :nodes="node.children"
            :parent-note-id="node.note_id"
            :selected-note-id="selectedNoteId"
            @select="$emit('select', $event)"
            @add-child="$emit('add-child', $event)"
            @clone-request="$emit('clone-request', $event)"
            @delete-request="$emit('delete-request', $event)"
            @move="$emit('move', $event)"
          />
        </div>
      </div>
    </template>

    <!-- Zona de soltar no FIM da lista deste nível -->
    <div
      class="kb-drop-line kb-drop-end"
      :class="{ 'kb-drop-line--over': overLine === 'end' }"
      @dragover.prevent="overLine = 'end'"
      @dragleave="overLine = null"
      @drop.stop.prevent="onDropBefore(null, $event); overLine = null"
    ></div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";

defineOptions({ name: "KbTree" });

const props = defineProps({
  nodes: { type: Array, default: () => [] },
  parentNoteId: { type: [Number, null], default: null },
  selectedNoteId: { type: [Number, null], default: null },
});

const emit = defineEmits(["select", "add-child", "clone-request", "delete-request", "move"]);

const expanded = reactive({});
props.nodes.forEach((n) => {
  expanded[n.branch_id] = n.is_expanded ?? true;
});

const overBranchId = ref(null);
const overLine = ref(null);

function toggle(node) {
  expanded[node.branch_id] = !expanded[node.branch_id];
}

function onDragStart(node, e) {
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData(
    "application/json",
    JSON.stringify({ branchId: node.branch_id, noteId: node.note_id })
  );
}

function onDragLeave(node) {
  if (overBranchId.value === node.branch_id) overBranchId.value = null;
}

function readPayload(e) {
  try {
    return JSON.parse(e.dataTransfer.getData("application/json"));
  } catch (err) {
    return null;
  }
}

// Soltar DENTRO de um nó => vira filho (no fim) daquele nó.
function onDropInside(node, e) {
  overBranchId.value = null;
  const p = readPayload(e);
  if (!p) return;
  emit("move", {
    branchId: p.branchId,
    noteId: p.noteId,
    targetParentId: node.note_id,
    beforeBranchId: null,
  });
}

// Soltar ANTES de um nó (ou no fim, beforeNode = null) => irmão neste nível.
function onDropBefore(beforeNode, e) {
  const p = readPayload(e);
  if (!p) return;
  emit("move", {
    branchId: p.branchId,
    noteId: p.noteId,
    targetParentId: props.parentNoteId,
    beforeBranchId: beforeNode ? beforeNode.branch_id : null,
  });
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
.kb-row--over {
  outline: 2px dashed rgba(25, 118, 210, 0.6);
  outline-offset: -2px;
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
  max-width: 170px;
}
.kb-action {
  opacity: 0;
}
.kb-row:hover .kb-action {
  opacity: 1;
}
.kb-drop-line {
  height: 6px;
  margin: -3px 0;
  border-radius: 3px;
}
.kb-drop-line.kb-drop-end {
  height: 12px;
}
.kb-drop-line--over {
  background: rgba(25, 118, 210, 0.6);
}
</style>
