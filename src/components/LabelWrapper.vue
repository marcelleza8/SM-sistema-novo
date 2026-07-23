<template>
  <div class="w-full">
    <div v-if="titleSummaries.length" class="title-summary-list">
      <div
        v-for="summary in titleSummaries"
        :key="summary.title"
        class="title-summary-item"
      >
        <span class="title-summary-name">{{ summary.title }}</span>
        <span class="title-summary-time">{{ summary.relativeTime }}</span>
      </div>
    </div>

    <div class="tag-scroll">
      <div
        v-for="tag in displayedTags"
        :key="tag.key"
        class="tag-scroll-item"
      >
        <LabelTag :redisKey="tag.key" :tag="tag" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import LabelTag from "./LabelTag.vue";
import api from "../api";

const tags = ref([]);
const timerId = ref(0);

// Status terminais: nada mais muda depois deles.
const TERMINAL = new Set(["finished", "completed", "error", "failed"]);
const hasActive = () =>
  tags.value.some((t) => !TERMINAL.has(String(t.status || "").toLowerCase()));
const displayedTags = computed(() => [...tags.value].reverse());

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  const normalizedDate = String(value)
    .trim()
    .replace(/\.(\d{3})\d+(?=Z|[+-]\d{2}:\d{2}$|$)/, ".$1");
  const hasTimeZone = /(?:Z|[+-]\d{2}:\d{2})$/.test(normalizedDate);
  const parsedDate = new Date(
    hasTimeZone ? normalizedDate : `${normalizedDate}Z`
  );

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const getTagReferenceDate = (tag) =>
  parseDate(tag.finished_at) ||
  parseDate(tag.updated_at) ||
  parseDate(tag.created_at);

const titleSummaries = computed(() => {
  const groupedTitles = new Map();

  for (const tag of tags.value) {
    const title = tag.title || "Sem titulo";
    const referenceDate = getTagReferenceDate(tag);
    const currentEntry = groupedTitles.get(title);

    if (!currentEntry) {
      groupedTitles.set(title, { title, referenceDate });
      continue;
    }

    if (referenceDate && (!currentEntry.referenceDate || referenceDate > currentEntry.referenceDate)) {
      groupedTitles.set(title, { title, referenceDate });
    }
  }

  return [...groupedTitles.values()]
    .sort((a, b) => (b.referenceDate?.getTime() || 0) - (a.referenceDate?.getTime() || 0))
    .map((entry) => ({
      title: entry.title,
      relativeTime: entry.referenceDate
        ? `ha ${formatDistanceToNow(entry.referenceDate, {
          addSuffix: false,
          locale: ptBR,
        })}`
        : "-",
    }));
});

const normalizeTag = (tag) => ({
  ...tag,
  description: tag.description || tag.activity || "",
});

const loadTags = async () => {
  // Migrado do deno-api (/v2/upload/upload-progress) para o Laravel
  // (admin/upload-progress), que le as mesmas chaves de progresso do Redis.
  try {
    const response = await api.get("admin/upload-progress");
    const responseTags = Array.isArray(response?.data?.tags)
      ? response.data.tags
      : [];
    tags.value = responseTags.map(normalizeTag);
  } catch (_e) {
    // silencioso: o proximo ciclo tenta de novo (progresso e auto-corretivo).
  }
};

// Polling adaptativo (Nivel 1): 1,5s enquanto ha import ativo; 20s ocioso.
// Antes era setInterval fixo de 1s SEMPRE (mesmo sem upload), o que gerava
// ~1 req/s por aba aberta indefinidamente. O backoff ocioso ainda detecta um
// novo import em ate 20s, sem martelar o backend.
const ACTIVE_MS = 1500;
const IDLE_MS = 20000;

const scheduleNext = () => {
  const delay = hasActive() ? ACTIVE_MS : IDLE_MS;
  timerId.value = setTimeout(tick, delay);
};

const tick = async () => {
  await loadTags();
  scheduleNext();
};

onMounted(() => {
  tick();
});

onUnmounted(() => {
  clearTimeout(timerId.value);
});
</script>
<style scoped>
.w-full {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.title-summary-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title-summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(var(--v-theme-surface-variant), 0.35);
}

.title-summary-name {
  font-weight: 600;
}

.title-summary-time {
  color: rgba(var(--v-theme-on-surface), 0.72);
  white-space: nowrap;
}

.tag-scroll {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  max-height: 500px;
  padding-right: 4px;
}

.tag-scroll-item {
  width: 100%;
}
</style>
