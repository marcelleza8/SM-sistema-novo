<template>
  <DashboardLayout>
    <div class="grid grid-cols-2" v-if="!searchResult.length">
      <div>
        <button
          @click="search"
          :disabled="!formCompleted"
          class="primary disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Verificar Linhas
        </button>
        <div>
          <SelectAjaxVue
            label="Selecione um cliente"
            v-model="verify.client"
            url="admin/clientes/buscar"
          />
          <div class="mt-16 text-center grid grid-cols-2">
            <BuscaChipverifier
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
      <table class="w-full">
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
          <tr v-for="item in searchResult">
            <td>{{ item.index }}<input type="checkbox" name="" id="" /></td>
            <td
              :title="item.linha.oldLine"
              :class="{ 'bg-orange-500': item.linha.oldLine }"
            >
              {{ item.linha.text }}
            </td>
            <td>{{ item.iccid.text }}</td>
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
import api from "../../../api";

const verify = ref({
  client: null,
});

const searchResult = ref([]);

const search = async () => {
  const res = await api.post("admin/chip/buscar", {
    ...verify.value,
  });

  let countRows = 0;

  /* if (typeof data.cancelado != "undefined") {
    for (var nd1 in data.cancelado) {
      let found = data.cancelado[nd1];
      for (var nd2 in found) {
        let val = found[nd2];

        $tr = $("<tr>").data("val", JSON.stringify(val));

        $tr.append(
          $("<td>").append([
            $("<span>").html(++countRows),
            $("<input>").attr("type", "checkbox").addClass("selectLine"),
          ])
        );

        if (val.oldLine) {
          $oldLine = $("<span>")
            .data("phone", val.linha)
            .data("msg", val.oldLine)
            .addClass("oldPhone")
            .append($("<i>").addClass("fa fa-warning"));
        } else {
          $oldLine = false;
        }

        $tr.append(
          $("<td>").append([
            $("<a>")
              .attr("href", $linhasTable.data("url-chip") + "/" + val.chipId)
              .html(val.linha)
              .attr("target", "_blank"),
            $oldLine,
          ])
        );

        let status = val.etiqueta
          ? '<span title="Etiquetado" class="label label-success">' +
            val.status +
            "</span>"
          : val.status;

        $tr.append($("<td>").html(val.iccid));
        $tr.append($("<td>").html(status));
        $tr.append($("<td>").html(val.cliente));
        $tr.append($("<td>").html(val.conta));
        $tr.append($("<td>").html(val.empresaFatura));

        $tbody.append($tr);
      }
    }
  } */

  /* if (typeof data.disponivel != "undefined") {
    for (var nd1 in data.disponivel) {
      let found = data.disponivel[nd1];
      for (var nd2 in found) {
        let val = found[nd2];

        $tr = $("<tr>").data("val", JSON.stringify(val));

        $tr.append(
          $("<td>").append([
            $("<span>").html(++countRows),
            $("<input>").attr("type", "checkbox").addClass("selectLine"),
          ])
        );

        if (val.oldLine) {
          $oldLine = $("<span>")
            .data("phone", val.linha)
            .data("msg", val.oldLine)
            .addClass("oldPhone")
            .append($("<i>").addClass("fa fa-warning"));
        } else {
          $oldLine = false;
        }

        $tr.append(
          $("<td>").append([
            $("<a>")
              .attr("href", $linhasTable.data("url-chip") + "/" + val.chipId)
              .html(val.linha)
              .attr("target", "_blank"),
            $oldLine,
          ])
        );

        let status = val.etiqueta
          ? '<span title="Etiquetado" class="label label-success">' +
            val.status +
            "</span>"
          : val.status;

        $tr.append(
          $("<td>").append([
            $("<a>")
              .attr("href", $linhasTable.data("url-chip") + "/" + val.chipId)
              .html(val.chipId)
              .attr("target", "_blank")
              .html(val.iccid),
          ])
        );
        $tr.append($("<td>").html(status));
        $tr.append($("<td>").html(val.cliente));
        $tr.append($("<td>").html(val.conta));
        $tr.append($("<td>").html(val.empresaFatura));

        $tbody.append($tr);
      }
    }
  } */

  if (
    typeof res.data.encontrado != "undefined" ||
    typeof res.data.antigo != "undefined"
  ) {
    let tst =
      typeof res.data.encontrado != "undefined"
        ? res.data.encontrado
        : data.antigo;
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

        searchResult.value.push(include);
      }
    }
  }
};

const formCompleted = computed(() => {
  // verify.value.client || verify.value?.items.unFormatted.length > 0
  return !!verify.value.items?.formatted.length || verify.value.client;
});
</script>

<style scoped>
tr:nth-child(even) {
  @apply bg-pink-400/50;
}
td {
  @apply border p-4;
}
</style>
