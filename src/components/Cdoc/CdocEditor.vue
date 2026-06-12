<template>
  <div class="cdoc-editor">
    <div v-if="editor" class="cdoc-toolbar">
      <v-btn-group density="compact" variant="text" divided>
        <v-btn size="small" icon :color="editor.isActive('bold') ? 'primary' : undefined" title="Negrito" @click="editor.chain().focus().toggleBold().run()">
          <v-icon>mdi-format-bold</v-icon>
        </v-btn>
        <v-btn size="small" icon :color="editor.isActive('italic') ? 'primary' : undefined" title="Itálico" @click="editor.chain().focus().toggleItalic().run()">
          <v-icon>mdi-format-italic</v-icon>
        </v-btn>
        <v-btn size="small" icon :color="editor.isActive('underline') ? 'primary' : undefined" title="Sublinhado" @click="editor.chain().focus().toggleUnderline().run()">
          <v-icon>mdi-format-underline</v-icon>
        </v-btn>
        <v-btn size="small" icon :color="editor.isActive('strike') ? 'primary' : undefined" title="Tachado" @click="editor.chain().focus().toggleStrike().run()">
          <v-icon>mdi-format-strikethrough</v-icon>
        </v-btn>
      </v-btn-group>

      <v-divider vertical class="mx-1" />

      <v-btn-group density="compact" variant="text" divided>
        <v-btn size="small" icon :color="editor.isActive('heading', { level: 1 }) ? 'primary' : undefined" title="Título 1" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">
          <v-icon>mdi-format-header-1</v-icon>
        </v-btn>
        <v-btn size="small" icon :color="editor.isActive('heading', { level: 2 }) ? 'primary' : undefined" title="Título 2" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">
          <v-icon>mdi-format-header-2</v-icon>
        </v-btn>
        <v-btn size="small" icon :color="editor.isActive('paragraph') ? 'primary' : undefined" title="Parágrafo" @click="editor.chain().focus().setParagraph().run()">
          <v-icon>mdi-format-paragraph</v-icon>
        </v-btn>
      </v-btn-group>

      <v-divider vertical class="mx-1" />

      <v-btn-group density="compact" variant="text" divided>
        <v-btn size="small" icon :color="editor.isActive('bulletList') ? 'primary' : undefined" title="Lista" @click="editor.chain().focus().toggleBulletList().run()">
          <v-icon>mdi-format-list-bulleted</v-icon>
        </v-btn>
        <v-btn size="small" icon :color="editor.isActive('orderedList') ? 'primary' : undefined" title="Lista numerada" @click="editor.chain().focus().toggleOrderedList().run()">
          <v-icon>mdi-format-list-numbered</v-icon>
        </v-btn>
        <v-btn size="small" icon :color="editor.isActive('blockquote') ? 'primary' : undefined" title="Citação" @click="editor.chain().focus().toggleBlockquote().run()">
          <v-icon>mdi-format-quote-close</v-icon>
        </v-btn>
      </v-btn-group>

      <v-divider vertical class="mx-1" />

      <v-btn-group density="compact" variant="text" divided>
        <v-btn size="small" icon :color="editor.isActive({ textAlign: 'left' }) ? 'primary' : undefined" title="Esquerda" @click="editor.chain().focus().setTextAlign('left').run()">
          <v-icon>mdi-format-align-left</v-icon>
        </v-btn>
        <v-btn size="small" icon :color="editor.isActive({ textAlign: 'center' }) ? 'primary' : undefined" title="Centro" @click="editor.chain().focus().setTextAlign('center').run()">
          <v-icon>mdi-format-align-center</v-icon>
        </v-btn>
        <v-btn size="small" icon :color="editor.isActive({ textAlign: 'right' }) ? 'primary' : undefined" title="Direita" @click="editor.chain().focus().setTextAlign('right').run()">
          <v-icon>mdi-format-align-right</v-icon>
        </v-btn>
        <v-btn size="small" icon :color="editor.isActive({ textAlign: 'justify' }) ? 'primary' : undefined" title="Justificar" @click="editor.chain().focus().setTextAlign('justify').run()">
          <v-icon>mdi-format-align-justify</v-icon>
        </v-btn>
      </v-btn-group>

      <v-divider vertical class="mx-1" />

      <v-btn-group density="compact" variant="text" divided>
        <v-btn size="small" icon :color="editor.isActive('link') ? 'primary' : undefined" title="Link" @click="setLink">
          <v-icon>mdi-link-variant</v-icon>
        </v-btn>
        <v-btn size="small" icon title="Inserir tabela" @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()">
          <v-icon>mdi-table</v-icon>
        </v-btn>
        <v-btn size="small" icon title="Limpar formatação" @click="editor.chain().focus().unsetAllMarks().clearNodes().run()">
          <v-icon>mdi-format-clear</v-icon>
        </v-btn>
      </v-btn-group>

      <v-spacer />

      <!-- Inserir variável (autocomplete explícito, além do gatilho "{{") -->
      <v-menu v-model="varMenu" :close-on-content-click="false" location="bottom end">
        <template #activator="{ props }">
          <v-btn size="small" color="primary" variant="tonal" v-bind="props" prepend-icon="mdi-code-braces">
            Inserir variável
          </v-btn>
        </template>
        <v-card min-width="340" class="pa-2">
          <v-autocomplete
            v-model="varToInsert"
            :items="catalog.paths.value"
            :item-title="(i) => `{{${i.value}}}`"
            :item-value="(i) => i.value"
            :loading="catalog.loading.value"
            return-object
            density="compact"
            variant="outlined"
            autofocus
            hide-details
            placeholder="Buscar tabela.coluna..."
            @update:model-value="insertVariable"
          >
            <template #item="{ props: itemProps, item }">
              <v-list-item v-bind="itemProps" :title="`{{${item.raw.value}}}`" :subtitle="`${item.raw.group} · ${item.raw.column}`" />
            </template>
          </v-autocomplete>
          <div class="text-caption text-disabled mt-1 px-1">
            Dica: digite <code>{{ '{{' }}</code> dentro do texto para o autocomplete.
          </div>
        </v-card>
      </v-menu>
    </div>

    <editor-content :editor="editor" class="cdoc-content" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, watch } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import { ref } from "vue";

import { useCdocCatalog } from "../../composables/useCdocCatalog";
import { createMustacheExtension } from "./mustacheSuggestion";
import { MustacheHighlight } from "./mustacheHighlight";
import "tippy.js/dist/tippy.css";

const props = defineProps({
  modelValue: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue"]);

const catalog = useCdocCatalog();
const varMenu = ref(false);
const varToInsert = ref(null);

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Underline,
    Link.configure({ openOnClick: false, autolink: true }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    MustacheHighlight,
    createMustacheExtension((query) => catalog.filter(query)),
  ],
  onUpdate: ({ editor }) => {
    emit("update:modelValue", editor.getHTML());
  },
});

// Sincroniza quando o conteúdo muda por fora (ex.: troca de template).
watch(
  () => props.modelValue,
  (val) => {
    if (editor.value && val !== editor.value.getHTML()) {
      editor.value.commands.setContent(val || "", false);
    }
  }
);

function setLink() {
  const previous = editor.value.getAttributes("link").href;
  const url = window.prompt("URL do link:", previous || "https://");
  if (url === null) return;
  if (url === "") {
    editor.value.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  editor.value
    .chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
}

function insertVariable(item) {
  if (!item) return;
  editor.value.chain().focus().insertContent(`{{${item.value}}} `).run();
  varToInsert.value = null;
  varMenu.value = false;
}

onMounted(() => catalog.load());
onBeforeUnmount(() => editor.value && editor.value.destroy());
</script>

<style scoped>
.cdoc-editor {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
  background: #eceef1;
}
.cdoc-toolbar {
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 6px 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

/* Canvas cinza onde a "folha" flutua */
.cdoc-content {
  min-height: 420px;
  max-height: 64vh;
  overflow-y: auto;
  padding: 28px 16px;
  background: #eceef1;
}

/* Folha de documento (estilo Word) */
:deep(.ProseMirror) {
  outline: none;
  min-height: 560px;
  max-width: 820px;
  margin: 0 auto;
  padding: 56px 64px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.12);
  color: #1f2329;
  font-size: 15px;
  line-height: 1.7;
}
:deep(.ProseMirror h1) {
  font-size: 1.7rem;
  font-weight: 700;
  margin: 0.6em 0 0.4em;
}
:deep(.ProseMirror h2) {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0.6em 0 0.4em;
}
:deep(.ProseMirror p) {
  margin: 0 0 0.7em;
}
:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 1.4em;
  margin: 0 0 0.7em;
}
:deep(.ProseMirror table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.5em 0;
}
:deep(.ProseMirror td),
:deep(.ProseMirror th) {
  border: 1px solid #cdd2d8;
  padding: 6px 10px;
}
:deep(.ProseMirror th) {
  background: #f4f5f7;
  font-weight: 600;
}
:deep(.ProseMirror blockquote) {
  border-left: 3px solid #ce4b6c;
  padding-left: 14px;
  color: #555;
  margin: 0.6em 0;
}
:deep(.ProseMirror a) {
  color: #ce4b6c;
  text-decoration: underline;
}

/* Pílula das variáveis {{ }} */
:deep(.ProseMirror .cdoc-var) {
  background: rgba(206, 75, 108, 0.12);
  color: #b23457;
  border: 1px solid rgba(206, 75, 108, 0.28);
  border-radius: 5px;
  padding: 1px 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85em;
  white-space: nowrap;
}
</style>
