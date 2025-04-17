<template>
  <!-- <div v-for="(item, index) in SIMDetails" :key="index">
  </div> -->
  <!-- Tabela simples dentro do painel -->
  <v-simple-table class="text-sm">
    <template v-slot:default>
      <thead>
        <tr>
          <th>Nome do plano</th>
          <th>Quantidade de <span class="text-no-wrap">SIM Cards</span></th>
          <th>Plano total Mb</th>
          <th>Consumo total Mb</th>
          <th>Excedente Mb</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(detail, idx) in SIMDetails" :key="idx">
          <td>{{ detail.name }}</td>
          <td>{{ detail.qtdSIMCard }}</td>
          <td>
            {{
              useHumanReadableBytes().formatBytes(
                detail.planoTotalByte * detail.qtdSIMCard,
                "MB"
              )
            }}
          </td>
          <td>
            {{
              useHumanReadableBytes().formatBytes(detail.consumoTotalByte, "MB")
            }}
            ({{
              (
                (detail.consumoTotalByte /
                  (detail.planoTotalByte * detail.qtdSIMCard)) *
                100
              ).toFixed(2)
            }}
            %)
          </td>

          <td>
            {{
              Math.max(
                0,
                (detail.consumoTotalByte -
                  detail.planoTotalByte * detail.qtdSIMCard) /
                  1024 ** 2
              ).toFixed(2)
            }}
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script setup lang="ts">
import { useHumanReadableBytes } from "../composable/useHumanReadableBytes";

defineProps<{
  SIMDetails: {};
}>();
</script>

<style scoped>
/* Adicione quaisquer estilos personalizados aqui */
</style>
