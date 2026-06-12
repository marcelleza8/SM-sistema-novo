import { ref } from "vue";
import contractDocsApi from "../services/contractDocsApi";

/**
 * Carrega o registro manual de schema e o achata numa lista de caminhos
 * para o autocomplete dos mustaches ({{entidade.relacao.coluna}}).
 *
 * Cada item:
 *   { value: "contract.user.name", column: "Nome", group: "Contrato › Usuário" }
 */
const MAX_DEPTH = 4; // protege contra relações cíclicas / profundidade exagerada

function flatten(entities) {
  const items = [];

  const walk = (entityKey, pathTokens, pathLabels, visited) => {
    const entity = entities[entityKey];
    if (!entity || pathTokens.length > MAX_DEPTH) return;

    const groupLabel = pathLabels.join(" › ");

    // Colunas desta entidade.
    const columns = entity.columns || {};
    Object.keys(columns).forEach((col) => {
      items.push({
        value: [...pathTokens, col].join("."),
        column: columns[col],
        group: groupLabel,
      });
    });

    // Relações -> aprofunda (evitando ciclo na mesma cadeia).
    const relations = entity.relations || {};
    Object.keys(relations).forEach((rel) => {
      const targetKey = relations[rel];
      if (visited.includes(targetKey)) return;
      const target = entities[targetKey];
      if (!target) return;
      walk(
        targetKey,
        [...pathTokens, rel],
        [...pathLabels, target.label || targetKey],
        [...visited, targetKey]
      );
    });
  };

  Object.keys(entities).forEach((rootKey) => {
    const root = entities[rootKey];
    walk(rootKey, [rootKey], [root.label || rootKey], [rootKey]);
  });

  return items;
}

export function useCdocCatalog() {
  const paths = ref([]);
  const loaded = ref(false);
  const loading = ref(false);

  async function load(force = false) {
    if ((loaded.value || loading.value) && !force) return paths.value;
    loading.value = true;
    try {
      const res = await contractDocsApi.schema();
      const entities = (res && res.data && res.data.entities) || {};
      paths.value = flatten(entities);
      loaded.value = true;
    } finally {
      loading.value = false;
    }
    return paths.value;
  }

  /**
   * Filtra os caminhos pelo que o usuário digitou após "{{".
   */
  function filter(query) {
    const q = (query || "").trim().toLowerCase();
    if (!q) return paths.value.slice(0, 50);
    return paths.value
      .filter(
        (item) =>
          item.value.toLowerCase().includes(q) ||
          (item.column && item.column.toLowerCase().includes(q)) ||
          (item.group && item.group.toLowerCase().includes(q))
      )
      .slice(0, 50);
  }

  return { paths, loaded, loading, load, filter };
}
