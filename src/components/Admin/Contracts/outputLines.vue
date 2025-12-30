<script setup>
import Swal from "sweetalert2";

const emit = defineEmits(["removeItem"]);
defineProps({
  resultado: {
    type: Object,
    required: true,
  },
});

async function removeItem(item) {
  return false;
  const { isConfirmed } = await Swal.fire({
    title: "Remover?",
    text: "Deseja realmente remover este item?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sim, remover",
    cancelButtonText: "Cancelar",
  });

  if (isConfirmed) {
    emit("removeItem", item);
  }
}
</script>

<template>
  <div id="output-lines">
    <span v-if="Object.values(resultado).every((arr) => arr.length === 0)">
      Nenhum alerta ainda.
    </span>
    <div v-for="(items, grupo) in resultado" :key="grupo" class="mb-4">
      <h4 class="font-bold mb-2">{{ grupo }}</h4>
      <v-table>
        <tbody>
          <tr
            @dblclick="removeItem(item.buscado)"
            v-for="item in items"
            :key="item.buscado || item"
          >
            <template v-if="item.encontrado">
              <td :title="'Cliente'" v-if="item.encontrado.clients_name">
                <span>
                  {{ item.encontrado.clients_name }}
                </span>
              </td>
              <td :title="'Status'" v-else>
                <span>
                  {{ item.encontrado.status_name }}
                </span>
              </td>
              <td :title="'IMEI'">
                {{ item.encontrado.imei }}
              </td>
              <td :title="'Telefone'">
                {{ item.encontrado.phone_number }}
              </td>
              <td :title="'Operadora'">
                <span>
                  {{ item.encontrado.operators_name }}
                </span>
              </td>
            </template>
            <template v-else>
              <td :title="'Não encontrado'" colspan="3">
                <b>Não encontrado:</b> {{ item.buscado || item }}
              </td>
            </template>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>
