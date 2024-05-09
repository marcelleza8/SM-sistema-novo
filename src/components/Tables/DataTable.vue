<template>
  <table>
    <thead>
      <tr>
        <th>Linha</th>
        <th>ICCD</th>
        <th>Status</th>
        <th>Ações</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="item in items" :key="item.id">
        <td>{{ item.line }}</td>
        <td>{{ item.iccid }}</td>
        <td>{{ item.status }}</td>
        <td>
          <button>Editar</button>
          <button>Excluir</button>
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
