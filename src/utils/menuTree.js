// Definição estática da árvore de navegação do admin.
//
// Cada folha (`item`) referencia uma rota nomeada do Vue Router (`key` === route
// name). O menu é estático — não há filtro por permissão fina (ver doc).
//
// `key`   -> nome da rota (usado em :to="{ name: key }")
// `label` -> texto exibido no menu / faixa de atalhos
// `icon`  -> ícone MDI (Material Design Icons)

export const menuTree = [
  {
    section: "Painel",
    items: [
      { key: "Admin/Dashboard", label: "Dashboard", icon: "mdi-view-dashboard" },
    ],
  },
  {
    section: "Chips",
    items: [
      { key: "Admin/Chip/Busca", label: "Busca de Chip", icon: "mdi-card-search" },
      { key: "AdminChipListPage", label: "SIM card", icon: "mdi-sim" },
    ],
  },
  {
    section: "Relatórios",
    items: [
      { key: "ReportConsumption", label: "Relatório de consumo", icon: "mdi-chart-line" },
      { key: "ExcessConsumption", label: "Excesso de consumo", icon: "mdi-chart-areaspline" },
    ],
  },
  {
    section: "Contratos",
    items: [
      { key: "AdminContractListPage", label: "Contratos", icon: "mdi-file-document-multiple" },
      { key: "AdminContractDocuments", label: "Documentos de Contrato", icon: "mdi-file-document" },
    ],
  },
  {
    section: "Operadoras",
    items: [
      { key: "AdminOperadoraListPage", label: "Operadoras", icon: "mdi-domain" },
      { key: "AdminOperadoraAccountListPage", label: "Contas de operadora", icon: "mdi-account-multiple" },
      { key: "AdminOperadoraPlanosListPage", label: "Planos", icon: "mdi-format-list-bulleted" },
    ],
  },
  {
    section: "Conhecimento",
    items: [
      { key: "AdminKnowledgeBase", label: "Base de Conhecimento", icon: "mdi-book-open-variant" },
    ],
  },
  {
    section: "Sistema",
    items: [
      { key: "AdminSystemJobsList", label: "Jobs", icon: "mdi-cog" },
    ],
  },
];

// Lista achatada de todas as folhas, para lookup por nome de rota.
const allLeaves = menuTree.flatMap((section) => section.items);

/**
 * Encontra a folha correspondente a um nome de rota.
 * @param {string} routeName - `route.name` atual.
 * @returns {{key:string,label:string,icon:string}|null}
 */
export function findLeaf(routeName) {
  return allLeaves.find((item) => item.key === routeName) ?? null;
}
