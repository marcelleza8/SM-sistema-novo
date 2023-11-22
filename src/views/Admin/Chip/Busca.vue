<template>
  <DashboardLayout>
    <div class="grid grid-cols-2" v-if="!searchResult.length">
      <div>
        <button
          @click="search"
          :disabled="!formCompleted || searching"
          class="primary disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Verificar Linhas
        </button>
        <div>
          <SelectAjaxVue
            :disabled="searching"
            label="Selecione um cliente"
            v-model="verify.client"
            url="admin/clientes/buscar"
          />
          <div class="mt-16 text-center grid grid-cols-2">
            <BuscaChipverifier
              :disabled="searching"
              v-model="verify.items"
              class="inline-block"
              placeholder="Informe o ICC ou os numeros da linha"
            />
            <div v-if="verify?.items?.unFormatted.length">
              <p class="mb-4">Itens ignorados</p>
              <ul>
                <li v-for="item in verify.items.unFormatted">
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div>importação</div>
    </div>
    <div v-else>
      <div class="grid grid-cols-2 gap-4 result-control">
        <div class="border border-gray-500">
          <h1 class="block text-center text-xl font-extrabold mb-4">
            Consulta
          </h1>
          <div class="flex justify-evenly">
            <button
              :disabled="searching"
              class="bg-green-700 text-white"
              @click="reset"
            >
              Nova
            </button>
            <button
              :disabled="searching"
              class="bg-orange-700 text-white"
              @click="edit"
            >
              Editar
            </button>
            <button
              :disabled="searching"
              class="bg-yellow-700 text-white"
              @click="search"
            >
              Recarregar
            </button>
          </div>
        </div>
        <div class="border border-gray-500">
          <h1 class="block text-center text-xl font-extrabold mb-4">
            Selecionar
          </h1>
          <div class="flex justify-evenly">
            <button :disabled="searching" class="!bg-green-500">Todos</button>
            <button :disabled="searching" class="!bg-green-500">Nenhum</button>
            <button :disabled="searching" class="!bg-green-500">
              Inverter
            </button>
          </div>
        </div>
      </div>
      <div>
        <div class="mt-4">
          <p class="text-sm whitespace-pre" v-if="false">{{ filters }}</p>
          <ul>
            <li
              v-for="(group, groupName) in filters"
              class="inline-block bg-slate-600 p-2 pt-0 mx-1 space-x-2"
            >
              <h1 class="text-xl text-center text-white">
                {{ groupName }}
              </h1>
              <button
                class="px-3 py-2 bg-green-400 text-sm font-extrabold rounded-lg"
                :class="{ '!bg-orange-400': option.selected }"
                @click="changeFilter(option)"
                v-for="(option, optionsName) in group"
              >
                {{ optionsName }} ({{ option.total }})
              </button>
            </li>
          </ul>
        </div>
      </div>
      <table class="w-full" v-if="!searching">
        <thead>
          <tr>
            <th></th>
            <th>Linha</th>
            <th>ICCID</th>
            <th>Status</th>
            <th>Cliente</th>
            <th>Conta</th>
            <th>Empresa fatura</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in searchResult" v-show="item.visible == true">
            <td>{{ item.index }}<input type="checkbox" name="" id="" /></td>
            <td
              :title="item.linha.oldLine"
              :class="{ 'bg-orange-500': item.linha.oldLine }"
            >
              <a
                :href="`${linkUrl}admin/chip/editar/${item.linha.chipId}`"
                target="_blank"
                rel="noopener noreferrer"
                >{{ item.linha.text }}</a
              >
            </td>
            <td>
              <a
                :href="`${linkUrl}admin/chip/editar/${item.linha.chipId}`"
                target="_blank"
                rel="noopener noreferrer"
                >{{ item.iccid.text }}</a
              >
            </td>
            <td>{{ item.status }}</td>
            <td>{{ item.cliente }}</td>
            <td>{{ item.conta }}</td>
            <td>{{ item.empresaFatura }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </DashboardLayout>
</template>

<script setup>
import DashboardLayout from "../../../layouts/DashboardLayout.vue";
import SelectAjaxVue from "../../../components/SelectAjax.vue";
import BuscaChipverifier from "../../../components/BuscaChipVerifier.vue";
import { computed, ref } from "vue";
import Swal from "sweetalert2";
import api from "../../../api";

const verify = ref({
  client: null,
});

const filters = ref({});

const searching = ref(false);

const searchResult = ref([]);

const linkUrl = import.meta.env.VITE_MONOLITH_URL;

const search = async () => {
  searching.value = true;
  try {
    const res = await api.post("admin/chip/buscar", {
      ...verify.value,
    });
    searchResult.value = [];
    filters.value = {};

    let countRows = 0;

    if (typeof res.data.cancelado != "undefined") {
      for (var nd1 in res.data.cancelado) {
        let found = res.data.cancelado[nd1];
        for (var nd2 in found) {
          let val = found[nd2];
          let include = {};

          include.index = ++countRows;

          include.linha = {
            chipId: val.chipId,
            text: val.linha,
            oldLine: val?.oldLine || null,
          };

          include.iccid = {
            chipId: val.chipId,
            text: val.iccid,
          };

          include.status = val.status;
          include.cliente = val.cliente;
          include.conta = val.conta;
          include.empresaFatura = val.empresaFatura;

          include.visible = true;
          searchResult.value.push(include);

          /* FILTRO */
          filters.value["Clientes"] ??= {};
          filters.value["Clientes"][val.cliente ?? "Nenhum"] ??= {
            total: 0,
            selected: false,
          };
          filters.value["Clientes"][val.cliente ?? "Nenhum"].total += 1;

          filters.value["Status"] ??= {};
          filters.value["Status"][val.status] ??= {
            total: 0,
            selected: false,
          };
          filters.value["Status"][val.status].total += 1;

          filters.value["Conta"] ??= {};
          filters.value["Conta"][val.conta] ??= {
            total: 0,
            selected: false,
          };
          filters.value["Conta"][val.conta].total += 1;
          /* /FILTTRO */
        }
      }
    }

    if (typeof res.data.disponivel != "undefined") {
      for (var nd1 in res.data.disponivel) {
        let found = res.data.disponivel[nd1];
        console.log(found);
        for (var nd2 in found) {
          let val = found[nd2];

          let include = {};

          include.index = ++countRows;

          include.linha = {
            chipId: val.chipId,
            text: val.linha,
            oldLine: val?.oldLine || null,
          };

          include.iccid = {
            chipId: val.chipId,
            text: val.iccid,
          };

          include.status = val.status;
          include.cliente = val.cliente;
          include.conta = val.conta;
          include.empresaFatura = val.empresaFatura;

          include.visible = true;
          searchResult.value.push(include);

          /* FILTRO */
          filters.value["Clientes"] ??= {};
          filters.value["Clientes"][val.cliente ?? "Nenhum"] ??= {
            total: 0,
            selected: false,
          };
          filters.value["Clientes"][val.cliente ?? "Nenhum"].total += 1;

          filters.value["Status"] ??= {};
          filters.value["Status"][val.status] ??= {
            total: 0,
            selected: false,
          };
          filters.value["Status"][val.status].total += 1;

          filters.value["Conta"] ??= {};
          filters.value["Conta"][val.conta] ??= {
            total: 0,
            selected: false,
          };
          filters.value["Conta"][val.conta].total += 1;
          /* /FILTTRO */
        }
      }
    }

    if (
      typeof res.data.encontrado != "undefined" ||
      typeof res.data.antigo != "undefined"
    ) {
      let tst =
        typeof res.data.encontrado != "undefined"
          ? res.data.encontrado
          : res.data.antigo;
      for (var nd1 in tst) {
        let found = tst[nd1];
        for (var nd2 in found) {
          let val = found[nd2];
          let include = {};

          include.index = ++countRows;

          include.linha = {
            chipId: val.chipId,
            text: val.linha,
            oldLine: val?.oldLine || null,
          };

          include.iccid = {
            chipId: val.chipId,
            text: val.iccid,
          };

          include.status = val.status;
          include.cliente = val.cliente;
          include.conta = val.conta;
          include.empresaFatura = val.empresaFatura;

          include.visible = true;
          searchResult.value.push(include);

          /* FILTRO */
          filters.value["Clientes"] ??= {};
          filters.value["Clientes"][val.cliente ?? "Nenhum"] ??= {
            total: 0,
            selected: false,
          };
          filters.value["Clientes"][val.cliente ?? "Nenhum"].total += 1;

          filters.value["Status"] ??= {};
          filters.value["Status"][val.status] ??= {
            total: 0,
            selected: false,
          };
          filters.value["Status"][val.status].total += 1;

          filters.value["Conta"] ??= {};
          filters.value["Conta"][val.conta] ??= {
            total: 0,
            selected: false,
          };
          filters.value["Conta"][val.conta].total += 1;
          /* /FILTTRO */
        }
      }
    }
  } catch (error) {
    console.log(error);
    Swal.fire({
      toast: true,
      icon: "info",
      timer: 2500,
      position: "top-end",
      title: "Não encontrado",
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }

  searching.value = false;
};

const changeFilter = (option) => {
  option.selected = !option.selected;
};

const formCompleted = computed(
  () => !!verify.value.items?.formatted.length || verify.value.client
);

const edit = () => {
  searchResult.value = [];
};

const reset = () => {
  edit();
  verify.value.client = null;
  verify.value.items = null;
};
</script>

<style scoped>
table a {
  @apply underline text-blue-500;
}
tr:nth-child(even) {
  @apply bg-pink-400/50;
}
td {
  @apply border p-4;
}

.result-control button {
  @apply disabled:bg-gray-500 py-2 px-4 rounded-md font-extrabold;
}
</style>
