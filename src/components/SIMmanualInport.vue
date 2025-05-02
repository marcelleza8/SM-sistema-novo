<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-select
          v-model="selectedOperadoraOption"
          :items="operadoraOptions"
          item-title="name"
          item-value="id"
          label="Selecione a operadora"
          :loading="loadingOptions"
          :disabled="loadingOptions"
          outlined
        ></v-select>
      </v-col>

      <v-col cols="12">
        <v-file-input
          v-model="file"
          label="Selecione o arquivo"
          outlined
          :loading="uploading"
          :disabled="uploading"
          show-size
        >
        </v-file-input>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-btn
          :disabled="!file || !selectedOperadoraOption || uploading"
          @click="uploadFile"
          color="primary"
        >
          Upload
        </v-btn>
      </v-col>
    </v-row>

    <v-row v-if="uploadMessage">
      <v-col cols="12">
        <v-alert type="success" v-if="uploadSuccess">
          {{ uploadMessage }}
        </v-alert>
        <v-alert type="error" v-else>
          {{ uploadMessage }}
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../api";

const selectedOperadoraOption = ref(null);
const operadoraOptions = ref([]);
const loadingOptions = ref(true);
const file = ref(null);
const uploading = ref(false);
const uploadMessage = ref("");
const uploadSuccess = ref(false);

const loadOptions = async () => {
  loadingOptions.value = true;
  try {
    const response = await api.get("admin/operadoras");
    // console.log(response.data.operadoras);

    operadoraOptions.value = response.data.operadoras;
  } catch (error) {
    console.error("Erro ao carregar opções:", error);
  } finally {
    loadingOptions.value = false;
  }
};

const uploadFile = async () => {
  if (!file.value) return;

  uploading.value = true;
  uploadMessage.value = "";

  try {
    const formData = new FormData();
    formData.append("file", file.value);
    formData.append("operadora", selectedOperadoraOption.value);

    const response = await api.post("/upload-endpoint", formData);

    uploadSuccess.value = true;
    uploadMessage.value = "Arquivo enviado com sucesso!";
    console.log("Resposta:", response.data);
  } catch (error) {
    uploadSuccess.value = false;
    uploadMessage.value = "Falha no envio do arquivo.";
    console.error("Erro no upload:", error);
  } finally {
    uploading.value = false;
  }
};

onMounted(() => {
  loadOptions();
});
</script>
