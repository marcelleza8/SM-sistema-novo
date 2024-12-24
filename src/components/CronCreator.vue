<script setup>
import { ref, onMounted } from "vue";
// import { useSnackbar } from "vuetify/lib/framework"; // Ou use outro método para exibir mensagens
import api from "../api";

const jobForm = ref({
  name: "",
  description: "",
  cron: "",
  job_class: "",
  active: true,
});

const jobs = ref([]);
const jobClasses = ref([]);
const loading = ref(false);

// Função para buscar classes de job disponíveis
const fetchJobClasses = async () => {
  loading.value = true;
  try {
    const response = await api.get("admin/rpas");
    jobClasses.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar classes de job.");
  } finally {
    loading.value = false;
  }
};

const fetchJobs = async () => {
  loading.value = true;
  try {
    const response = await api.get("admin/jobs");

    jobs.value = response.data;
  } catch (error) {
    console.error("Erro ao listar jobs.");
  } finally {
    loading.value = false;
  }
};

const fetchJobDetails = async (item) => {
  loading.value = true;
  try {
    const response = await api.get(`/admin/jobs/${item._id}`);
    jobForm.value = response.data; // Preenche o formulário com os dados
    // snackbar.info("Dados do job carregados.");
  } catch (error) {
    console.error("Erro ao carregar os detalhes do job.");
  } finally {
    loading.value = false;
  }
};

const createJob = async () => {
  loading.value = true;
  try {
    await api.post("admin/jobs", jobForm.value);
    console.log("Job criado com sucesso!");
    resetForm();
    await fetchJobs(); // Atualiza a lista de jobs
  } catch (error) {
    console.error("Erro ao criar job.");
  } finally {
    loading.value = false;
  }
};

const updateJob = async () => {
  loading.value = true;
  try {
    console.log("Atualizando");
    await api.put(`/admin/jobs/${jobForm.value._id}`, jobForm.value);
    console.log("Atualizado");
    await fetchJobs(); // Atualiza a lista de jobs
    alert("Job atualizado com sucesso!");
  } catch (error) {
    console.log("Erro ao atualizar job.", error);
  } finally {
    loading.value = false;
  }
};

const deleteJob = async (item) => {
  if (confirm("Apagar esse job?")) {
    loading.value = true;
    try {
      await api.delete(`/admin/jobs/${item._id}`);
      console.log("Job excluído com sucesso!");
      await fetchJobs(); // Atualiza a lista de jobs
    } catch (error) {
      console.error("Erro ao excluir job.");
    } finally {
      loading.value = false;
    }
  }
};

const resetForm = () => {
  jobForm.value = {
    _id: undefined,
    name: "",
    description: "",
    cron: "",
    job_class: "",
    active: true,
  };
};

onMounted(() => {
  fetchJobClasses();
  fetchJobs();
});
</script>

<template>
  <v-container fluid>
    <v-card>
      <v-card-title> Agendar RPAs </v-card-title>

      <v-card-text>
        <!-- Formulário de Criação/Edição -->
        <v-form>
          <!-- Nome -->
          <v-text-field
            label="Nome"
            v-model="jobForm.name"
            :rules="[(value) => !!value || 'O nome é obrigatório']"
            required
          ></v-text-field>

          <!-- Descrição -->
          <v-text-field
            label="Descrição"
            v-model="jobForm.description"
            :rules="[(value) => !!value || 'A descrição é obrigatória']"
            required
          ></v-text-field>

          <!-- CRON -->
          <v-text-field
            label="Expressão CRON"
            v-model="jobForm.cron"
            :rules="[(value) => !!value || 'A expressão CRON é obrigatória']"
            required
          ></v-text-field>

          <!-- Classe do Job -->
          <v-select
            label="Classe do Job"
            v-model="jobForm.job_class"
            :items="jobClasses"
            :rules="[(value) => !!value || 'Selecione uma classe de job']"
            required
          ></v-select>

          <!-- Ativo -->
          <v-switch
            label="Ativo"
            v-model="jobForm.active"
            class="mt-4"
          ></v-switch>

          <!-- Botão de Enviar -->
          <v-btn
            v-if="jobForm._id"
            :loading="loading"
            color="primary"
            @click="updateJob"
          >
            Atualizar Agenda
          </v-btn>
          <v-btn
            v-if="jobForm._id"
            :loading="loading"
            color="alert"
            @click="resetForm"
          >
            Atualizar Agenda
          </v-btn>
          <v-btn v-else :loading="loading" color="primary" @click="createJob">
            Salvar agenda
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Lista de Jobs -->
    <v-card class="mt-4">
      <v-card-title>Lista de Jobs</v-card-title>

      <v-card-text>
        <v-data-table
          :items="jobs"
          :headers="[
            { title: 'Nome', value: 'name' },
            { title: 'Descrição', value: 'description' },
            { title: 'Ações', value: 'actions', sortable: false },
          ]"
        >
          <template v-slot:body="{ items }">
            <tr v-for="item in items" :key="item._id">
              <td>{{ item.name }}</td>
              <td>{{ item.description }}</td>
              <td class="whitespace-nowrap space-x-4">
                <v-btn
                  size="small"
                  icon
                  color="blue"
                  @click="fetchJobDetails(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn size="small" icon color="red" @click="deleteJob(item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.v-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>
