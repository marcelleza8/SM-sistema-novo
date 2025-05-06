<template>
  <div class="w-full">
    <LabelTag v-for="(tag, redisKey) in tags" :redisKey="redisKey" :tag="tag" />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import LabelTag from "./LabelTag.vue";
import api from "../api";

const tags = ref([]);
const loadTags = async () => {
  const response = await api.get(
    `${import.meta.env.VITE_API_FLASK_URL}upload-progress`
  );

  if (response) {
    tags.value = response.data.tags;
  }
};

onMounted(() => {
  setInterval(() => {
    loadTags();
  }, 1000);
});
</script>
<style scoped>
/* Wrapper styling */
div {
  display: flex;
  flex-direction: column;
}
</style>
