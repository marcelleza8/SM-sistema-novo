export default function useLocalStorage() {
  /**
   * Função para armazenar dados no localStorage com uma data de expiração customizável
   * @param {string} index - A chave para armazenar o dado.
   * @param {any} data - O dado a ser armazenado.
   * @param {number} expirationInMinutes - O tempo de expiração em minutos. Padrão: 1440 minutos (1 dia).
   */
  function set(index, data, expirationInMinutes = 1440) {
    // 1440 minutos = 1 dia
    const dataExpiracao = new Date().getTime() + expirationInMinutes * 60000; // Converte minutos para milissegundos

    localStorage.setItem(
      index,
      JSON.stringify({
        d: data, // Dados a serem armazenados
        e: dataExpiracao, // Timestamp de expiração
      })
    );
  }

  /**
   * Função para recuperar dados do localStorage, verificando a expiração.
   * @param {string} index - A chave para recuperar o dado.
   * @returns {any|false} - Retorna o dado se ainda não tiver expirado, ou false se estiver expirado ou não encontrado.
   */
  function get(index) {
    const item = localStorage.getItem(index);
    if (item) {
      try {
        const dadosObj = JSON.parse(item);
        const dataAtual = new Date().getTime();

        // Verifica se o dado expirou
        if (dataAtual > dadosObj.e) {
          remove(index); // Remove o dado se expirado
          throw new Error("Os dados expiraram.");
        }

        return dadosObj.d; // Retorna o dado se ainda estiver válido
      } catch (e) {
        console.error(e.message); // Loga a mensagem de erro
        remove(index); // Remove o dado se ocorrer erro de parsing ou expiração
      }
    }
    return false;
  }

  /**
   * Função para remover um item do localStorage.
   * @param {string} index - A chave do dado a ser removido.
   */
  function remove(index) {
    localStorage.removeItem(index);
  }

  /**
   * Função para limpar o dado no localStorage e definir um valor padrão.
   * @param {string} index - A chave do dado a ser redefinido.
   * @param {any} defaultValue - O valor padrão a ser definido.
   */
  function clear(index, defaultValue) {
    localStorage.setItem(index, JSON.stringify(defaultValue ?? ""));
  }

  return { set, get, remove, clear };
}
