<template>
  <v-dialog :model-value="modelValue" max-width="560" @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-magnify-scan</v-icon>
        Preencher variáveis
      </v-card-title>
      <v-card-subtitle>
        {{ fields.length }} variável(is) encontrada(s) no documento. Preencha os
        valores; em branco mantém o <code>{{ braces }}</code> no texto.
      </v-card-subtitle>

      <v-card-text style="max-height: 56vh; overflow-y: auto">
        <div v-if="!fields.length" class="text-medium-emphasis text-center py-6">
          <v-icon size="32" class="mb-1">mdi-check-circle-outline</v-icon>
          <div>Nenhum mustache pendente no documento.</div>
        </div>

        <v-text-field
          v-for="field in fields"
          :key="field.key"
          v-model="field.value"
          density="compact"
          variant="outlined"
          class="mb-1"
          :label="field.key"
          :prefix="'{{'"
          hide-details
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancelar</v-btn>
        <v-btn color="primary" variant="flat" :disabled="!fields.length" @click="apply">
          Aplicar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "MustacheScanDialog",
  props: {
    modelValue: { type: Boolean, default: false },
    content: { type: String, default: "" },
  },
  emits: ["update:modelValue", "apply"],
  data() {
    return { braces: "{{", fields: [] };
  },
  watch: {
    modelValue(open) {
      if (open) this.scan();
    },
  },
  methods: {
    scan() {
      const regex = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
      const seen = new Set();
      const fields = [];
      let m;
      while ((m = regex.exec(this.content)) !== null) {
        if (!seen.has(m[1])) {
          seen.add(m[1]);
          fields.push({ key: m[1], value: "" });
        }
      }
      this.fields = fields;
    },
    escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    },
    escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    },
    apply() {
      let out = this.content;
      this.fields.forEach((f) => {
        const val = (f.value || "").trim();
        if (!val) return; // em branco: mantém o mustache
        const re = new RegExp("\\{\\{\\s*" + this.escapeRegex(f.key) + "\\s*\\}\\}", "g");
        out = out.replace(re, this.escapeHtml(val));
      });
      this.$emit("apply", out);
      this.$emit("update:modelValue", false);
    },
  },
};
</script>
