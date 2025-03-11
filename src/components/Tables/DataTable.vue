<template>
  <table>
    <thead>
      <tr>
        <th>Linha</th>
        <th>ICCD</th>
        <th>Status</th>
        <th class="w-1 text-center">Ações</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.id">
        <td>{{ item.line }}</td>
        <td>{{ item.iccid }}</td>
        <td>{{ item.status }}</td>
        <td class="space-x-4 flex">
          <v-spacer />
          <v-btn
            size="small"
            :to="{ name: 'AdminChipEditFormPage', params: { id: item.id } }"
            color="green"
            >Editar</v-btn
          >
          <v-btn size="small" color="red">Excluir</v-btn>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
const props = defineProps({
  items: Array,
});
</script>

<style>
/* Estilização básica */
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>
