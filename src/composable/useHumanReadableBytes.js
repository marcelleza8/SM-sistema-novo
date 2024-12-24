export function useHumanReadableBytes() {
  // Função para conversão
  const formatBytes = (bytes, unit = null) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024; // Constante para a base de conversão (1024 bytes = 1 KB)
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]; // Unidades possíveis
    let i = 0; // Inicialmente será usado o índice para Bytes

    // Verifica se o parâmetro unit foi passado
    if (unit) {
      i = sizes.indexOf(unit); // Encontra o índice da unidade fornecida
      if (i === -1) return "Unidade inválida"; // Se não encontrar, retorna erro
    } else {
      // Calcula a menor unidade possível automaticamente
      i = Math.floor(Math.log(bytes) / Math.log(k));
    }

    // Calcula o valor humanizado
    const humanReadableValue = parseFloat((bytes / Math.pow(k, i)).toFixed(3));
    return `${humanReadableValue} ${sizes[i]}`;
  };

  return { formatBytes };
}
