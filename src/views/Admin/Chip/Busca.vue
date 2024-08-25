<template>
  <DashboardLayout>
    <div v-if="timerId > -1" class="p-4 px-2 pt-0">
      <span>{{ timer }}</span>
    </div>
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
            <DropDown @exportSelected="exportSelected"></DropDown>
          </div>
        </div>
        <div class="border border-gray-500">
          <h1 class="block text-center text-xl font-extrabold mb-4">
            Selecionar
          </h1>
          <div class="flex justify-evenly">
            <button
              :disabled="searching"
              @click="selectResults(true)"
              class="!bg-green-500"
            >
              Todos
            </button>
            <button
              :disabled="searching"
              @click="selectResults(false)"
              class="!bg-green-500"
            >
              Nenhum
            </button>
            <button
              :disabled="searching"
              @click="selectResults"
              class="!bg-green-500"
            >
              Inverter
            </button>
          </div>
        </div>
      </div>
      <div>
        <div class="mt-4">
          <ul>
            <li
              v-for="(group, groupName) in sortedFiltersByTotal"
              class="bg-slate-200 p-2 pt-0 mx-1 space-x-2 space-y-2 flex items-center my-1 flex-wrap"
            >
              <h1 class="text-center" @click="massSelection(groupName)">
                {{ groupName }}
              </h1>
              <button
                class="font-extrabold p-1 px-2 rounded-lg whitespace-nowrap"
                :class="{
                  'bg-blue-500 hover:bg-blue-700 text-white': option.selected,
                  'bg-gray-200 hover:bg-gray-400/30 text-black/50':
                    !option.selected,
                }"
                @click="selectSubFilter(groupName, optionsName)"
                v-for="(option, optionsName) in group"
              >
                {{ optionsName || "Nenhum" }} ({{ option.total }} -
                {{ ((option.total / searchResult.length) * 100).toFixed(2) }} %)
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div
        class="bg-gray-200 font-extrabold p-4 mt-4 flex justify-between"
        v-if="!searching"
      >
        <div>
          Mostrando
          <span class="text-orange-800">{{ filteredResults.length }}</span> de
          <span class="text-green-800">{{ searchResult.length }}</span>
          resultados
        </div>
        <div v-if="checkedRows.length">
          <span>{{ checkedRows.length }}</span> Selecionados
        </div>
      </div>

      <table class="w-full" v-if="!searching">
        <thead class="text-sm">
          <tr>
            <th></th>
            <th>Linha</th>
            <th>ICCID</th>
            <th>Status</th>
            <th>Cliente</th>
            <th>Conta</th>
            <th>Último Acesso</th>
            <th>Conexão</th>
            <th>Cons. Total</th>
            <th>Cons. Diário</th>
            <th>IMEI Op.</th>
            <th>APN Op.</th>
            <th>Status Op.</th>
          </tr>
        </thead>
        <tbody class="text-xs">
          <tr v-for="item in filteredResults" v-show="item.visible == true">
            <td>
              {{ item.index }}<input type="checkbox" v-model="item.checked" />
            </td>
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
            <td>{{ item.details?.ultimo_acesso }}</td>
            <td>{{ item.details?.conexao }}</td>
            <td>{{ item.details?.consumo_total }}</td>
            <td>{{ item.details?.consumo_diario }}</td>
            <td>{{ item.details?.imei_aparelho }}</td>
            <td>{{ item.details?.apn }}</td>
            <td>{{ item.details?.status_operadora }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { computed, ref } from "vue";
import Swal from "sweetalert2";
import api from "../../../api";
import DashboardLayout from "../../../layouts/DashboardLayout.vue";
import SelectAjaxVue from "../../../components/SelectAjax.vue";
import BuscaChipverifier from "../../../components/BuscaChipVerifier.vue";
import DropDown from "../../../components/DropDown.vue";

const verify = ref({
  client: null,
});

const filters = ref({});
const searching = ref(false);
const searchResult = ref([]);
const downLink = ref("");
const timerId = ref(-1);
const timer = ref(0);

const linkUrl = import.meta.env.VITE_MONOLITH_URL;

const search = async () => {
  searching.value = true;
  filters.value = {};
  const now = new Date();
  timerId.value = setInterval(() => {
    // const formattedTime = formatarTempoDecorrido(new Date());
    timer.value = formatarTempoDecorrido(now);
  }, 1);
  try {
    const res = await api.post("admin/chip/buscar", {
      ...verify.value,
    });
    downLink.value = res.data.downLink;
    searchResult.value = [];

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
          include.details = val?.details;
          // include.empresaFatura = val.empresaFatura;

          include.visible = true;
          searchResult.value.push(include);

          /* FILTRO */
          filters.value["Cliente"] ??= {};
          filters.value["Cliente"][val.cliente ?? ""] ??= {
            total: 0,
            selected: true,
          };
          filters.value["Cliente"][val.cliente ?? ""].total += 1;

          filters.value["Status"] ??= {};
          filters.value["Status"][val.status] ??= {
            total: 0,
            selected: true,
          };
          filters.value["Status"][val.status].total += 1;

          filters.value["Conta"] ??= {};
          filters.value["Conta"][val.conta ?? ""] ??= {
            total: 0,
            selected: true,
          };
          filters.value["Conta"][val.conta ?? ""].total += 1;
          /* /FILTTRO */
        }
      }
    }

    if (typeof res.data.disponivel != "undefined") {
      for (var nd1 in res.data.disponivel) {
        let found = res.data.disponivel[nd1];
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
          include.details = val?.details;
          // include.empresaFatura = val.empresaFatura;

          include.visible = true;
          searchResult.value.push(include);

          /* FILTRO */
          filters.value["Cliente"] ??= {};
          filters.value["Cliente"][val.cliente ?? ""] ??= {
            total: 0,
            selected: true,
          };
          filters.value["Cliente"][val.cliente ?? ""].total += 1;

          filters.value["Status"] ??= {};
          filters.value["Status"][val.status] ??= {
            total: 0,
            selected: true,
          };
          filters.value["Status"][val.status].total += 1;

          filters.value["Conta"] ??= {};
          filters.value["Conta"][val.conta ?? ""] ??= {
            total: 0,
            selected: true,
          };
          filters.value["Conta"][val.conta ?? ""].total += 1;
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
          include.details = val?.details;
          // include.empresaFatura = val.empresaFatura;

          include.visible = true;
          searchResult.value.push(include);

          /* FILTRO */
          filters.value["Cliente"] ??= {};
          filters.value["Cliente"][val.cliente ?? ""] ??= {
            total: 0,
            selected: true,
          };
          filters.value["Cliente"][val.cliente ?? ""].total += 1;

          filters.value["Status"] ??= {};
          filters.value["Status"][val.status] ??= {
            total: 0,
            selected: true,
          };
          filters.value["Status"][val.status].total += 1;

          filters.value["Conta"] ??= {};
          filters.value["Conta"][val.conta ?? ""] ??= {
            total: 0,
            selected: true,
          };
          filters.value["Conta"][val.conta ?? ""].total += 1;
          /* /FILTTRO */
        }
      }
    }
  } catch (error) {
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

  clearInterval(timerId.value);
  searching.value = false;
};

const checkedRows = computed(() =>
  searchResult.value.filter((item) => item.checked === true)
);

const exportSelected = (selected) => {
  window.open(downLink.value + "?" + selected.join("&"), "_blank");
};

const selectResults = (value) => {
  searchResult.value.forEach((i) => {
    if (value === true) {
      // Define 'i.checked' como true para todos os itens
      i.checked = true;
    } else if (value === false) {
      // Define 'i.checked' como false para todos os itens
      i.checked = false;
    } else if (typeof value !== "boolean") {
      // Inverte 'i.checked' para cada item
      // Se 'i.checked' for undefined, considera como false e inverte para true
      i.checked = i.checked === undefined ? true : !i.checked;
    }
  });
};

const massSelection = (categoria) => {
  Object.values(filters.value[categoria]).forEach(
    (item) => (item.selected = !item.selected)
  );
};

const formCompleted = computed(
  () => !!verify.value.items?.formatted.length || verify.value.client
);

const filteredResults = computed(() => {
  return searchResult.value.filter((item) => {
    return Object.entries(filters.value).every(([categoria, opcoes]) => {
      let valorItem = item[categoria.toLowerCase()];

      // Tratando explicitamente valores undefined, null e strings vazias
      if (valorItem === undefined || valorItem === null || valorItem === "") {
        valorItem = ""; // Usar uma string vazia para a comparação
      }

      return opcoes[valorItem]?.selected !== false;
    });
  });
});

function selectSubFilter(categoria, opcao) {
  // console.log(categoria, opcao); //DEBUG
  filters.value[categoria][opcao].selected =
    !filters.value[categoria][opcao].selected;
}

function formatarTempoDecorrido(dataInicio) {
  const agora = new Date();
  let diferenca = agora - dataInicio; // Diferença em milissegundos

  // Convertendo de milissegundos para horas, minutos e segundos
  // const horas = Math.floor(diferenca / (1000 * 60 * 60));
  // diferenca -= horas * 1000 * 60 * 60;
  const minutos = Math.floor(diferenca / (1000 * 60));
  diferenca -= minutos * 1000 * 60;
  const segundos = Math.floor(diferenca / 1000);
  diferenca -= segundos * 1000; // Subtraindo os segundos em milissegundos
  const milissegundos = diferenca; // Restante são milissegundos

  // Formatando para string com dois dígitos para horas, minutos, segundos e três para milissegundos
  const formatado = [
    // horas.toString().padStart(2, "0") + "h",
    minutos.toString().padStart(2, "0") + "m",
    segundos.toString().padStart(2, "0") + "s",
    milissegundos.toString().padStart(3, "0") + "mm", // Garantindo três dígitos para milissegundos
  ].join(":");

  return formatado;
}

/**
 * Propriedade computada que ordena os filtros pelos totais em ordem ascendente.
 * @returns {Object} Objeto de filtros com cada subcategoria ordenada por total.
 */
const sortedFiltersByTotal = computed(() => {
  // Objeto para armazenar os filtros ordenados.
  const sortedFilters = {};

  // Iterando sobre cada categoria de filtro.
  Object.keys(filters.value).forEach((categoria) => {
    // Obtendo as subcategorias e seus respectivos dados da categoria atual.
    const subcategorias = filters.value[categoria];

    // Ordenando as subcategorias com base no valor 'total'.
    // Usamos a função 'sort' para ordenar os pares chave-valor.
    const orderedSubcategorias = Object.entries(subcategorias)
      .sort((a, b) => {
        // a[1] e b[1] representam os objetos de cada subcategoria.
        // Convertemos o 'total' de cada subcategoria em número para a comparação.
        return Number(a[1].total) - Number(b[1].total);
      })
      .reduce((accumulator, [key, value]) => {
        // Reconstruímos o objeto com subcategorias ordenadas.
        return { ...accumulator, [key]: value };
      }, {});

    // Atribuindo as subcategorias ordenadas à categoria correspondente.
    sortedFilters[categoria] = orderedSubcategorias;
  });

  // Retornando o objeto de filtros com as subcategorias ordenadas.
  return sortedFilters;
});

const edit = () => {
  searchResult.value = [];
  timerId.value = -1;
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
  @apply border p-1;
}

.result-control button {
  @apply disabled:bg-gray-500 py-2 px-4 rounded-md font-extrabold;
}
</style>
