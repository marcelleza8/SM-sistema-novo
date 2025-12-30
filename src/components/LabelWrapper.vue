<template>
  <div class="w-full">
    <LabelTag v-for="(tag, redisKey) in tags" :redisKey="tag.key" :tag="tag" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import LabelTag from "./LabelTag.vue";
import api from "../api";

const tags = ref([]);
const timerId = ref(0);
const loadTags = async () => {
  const response = await api.get(
    `${import.meta.env.VITE_API_FLASK_URL}upload/upload-progress`
  );

  if (response) {
    tags.value = response.data.tags;
  }
};

onMounted(() => {
  if (!import.meta.env?.VITE_PROD)
    return false;
  timerId.value = setInterval(() => {
    loadTags();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timerId.value);
});
</script>
<style scoped>
/* Wrapper styling */
div {
  display: flex;
  flex-direction: column;
}
</style>
