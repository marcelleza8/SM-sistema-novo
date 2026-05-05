<script setup>
import Swal from "sweetalert2";
import denoApi from "../denoApi";
import { defineEmits } from "vue";

const emit = defineEmits(["item-encontrado"]);
// Busca usando POST com um array no body
async function buscarNoBackend(valor) {
  const res = await denoApi.post("/v2/client/sims", { values: [valor] });
  return res.data;
}

async function abrirBuscador() {
  let success = null;
  while (true) {
    const { value: busca, isDismissed } = await Swal.fire({
      title: "Buscador de SIM card",
      html: `${success} Digite o ICC ou linha e pressione Enter`,
      input: "text",
      inputPlaceholder: "ICCID ou linha",
      showCancelButton: true,
      allowEscapeKey: true,
      confirmButtonText: "Buscar",
      cancelButtonText: "Cancelar",
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off",
      },
      preConfirm: (valor) => {
        if (!valor) {
          Swal.showValidationMessage("Campo obrigatório");
          return false;
        }
        return valor;
      },
    });

    if (isDismissed) break;

    try {
      Swal.showLoading();
      success = null;
      const result = await buscarNoBackend(busca);
      Swal.close();

      if (result && result?.details) {
        if (result?.details[0].status_id != 4) {
          let html = `SIM card com o status <strong>${result?.details[0].status_name}</strong>`;
          if (result?.details[0].clients_name) {
            html += `<br>Em contrato <strong>${result?.details[0].clients_name}</strong>`;
          }
          await Swal.fire({
            title: "Alerta",
            html,
            icon: "warning",
            confirmButtonText: "OK",
          });
        } else {
          success = `<strong>SIM ${result?.details[0].imei} encontrado com sucesso e disponível</strong><br><br>`;
          emit("item-encontrado", result?.details[0]);
        }
      } else {
        await Swal.fire({
          title: "Alerta",
          text: result?.mensagem || "SIM card não encontrado!",
          icon: "warning",
          confirmButtonText: "OK",
        });
      }
    } catch (e) {
      Swal.close();
      await Swal.fire({
        title: "Erro",
        text: "Falha ao consultar. Tente novamente.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }
}
</script>

<template>
  <v-btn color="primary" @click="abrirBuscador"> Buscar SIM card </v-btn>
</template>
