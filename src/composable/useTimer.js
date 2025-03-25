import { ref, onUnmounted } from "vue";

/**
 * Composable para controle de timer com milissegundos.
 * Fornece funções para iniciar, pausar, resetar e parar o cronômetro.
 *
 * @returns {{
 *   timer: import('vue').Ref<string>,
 *   running: import('vue').Ref<boolean>,
 *   start: () => void,
 *   pause: () => void,
 *   reset: () => void,
 *   stop: () => void
 * }}
 */
export default function useTimer() {
  const timer = ref("00:00.000");
  const running = ref(false);

  let startTime = 0;
  let pausedTime = 0;
  let frameId;

  /**
   * Formata tempo em milissegundos para mm:ss.SSS
   * @param {number} ms
   * @returns {string}
   */
  const format = (ms) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    const milli = ms % 1000;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(
      2,
      "0"
    )}.${String(milli).padStart(3, "0")}`;
  };

  const update = () => {
    const now = Date.now();
    const elapsed = now - startTime + pausedTime;
    timer.value = format(elapsed);
    frameId = requestAnimationFrame(update);
  };

  /**
   * Inicia ou continua o timer
   */
  const start = () => {
    if (running.value) return;
    startTime = Date.now();
    running.value = true;
    update();
  };

  /**
   * Pausa o timer sem zerar
   */
  const pause = () => {
    if (!running.value) return;
    pausedTime += Date.now() - startTime;
    running.value = false;
    cancelAnimationFrame(frameId);
  };

  /**
   * Reseta o timer para 00:00.000
   */
  const reset = () => {
    cancelAnimationFrame(frameId);
    timer.value = "00:00.000";
    running.value = false;
    startTime = 0;
    pausedTime = 0;
  };

  /**
   * Para o timer, mas mantém o tempo atual
   */
  const stop = () => {
    cancelAnimationFrame(frameId);
    running.value = false;
  };

  onUnmounted(stop);

  return {
    timer,
    running,
    start,
    pause,
    reset,
    stop,
  };
}

/**
 * 📘 Tutorial de uso:
 *
 * // 1. Importe o composable
 * import { useTimer } from './composables/useTimer'
 *
 * // 2. Use dentro do <script setup> do Vue
 * const { timer, start, pause, reset } = useTimer()
 *
 * // 3. No template:
 * <template>
 *   <div>{{ timer }}</div>
 *   <button @click="start">Iniciar</button>
 *   <button @click="pause">Pausar</button>
 *   <button @click="reset">Resetar</button>
 * </template>
 */
