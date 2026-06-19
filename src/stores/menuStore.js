import { defineStore } from "pinia";

// Store do menu persistente do admin.
//
// Persiste em localStorage sob a chave `admin_menu` — SEM expiração (por isso
// não usa o composable useLocalStorage, que expira os dados). Sobrevive a reload
// e fechamento do navegador.
//
// A faixa de atalhos é montada a partir de DOIS arrays cuja própria ordem já é a
// ordem de exibição — não há índice de ordenação paralelo a desincronizar:
//   - favorites: itens fixados. Sempre vêm primeiro. Favoritar adiciona no INÍCIO.
//   - recents:   fila cíclica dos últimos acessos. Visitar move para a FRENTE;
//                ao estourar a capacidade, o mais antigo cai fora.
// Arrastar um chip reordena diretamente o array a que ele pertence.

const STORAGE_KEY = "admin_menu";
const CAP = 8; // limite total de cards visíveis na faixa de atalhos
const RECENTS_HISTORY = 20; // histórico de recentes guardado além do que é exibido

function asLeaf({ key, label, icon }) {
  return { key, label, icon };
}

function loadState() {
  let parsed = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }
  return {
    favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
    recents: Array.isArray(parsed.recents) ? parsed.recents : [],
    cap: CAP,
  };
}

export const useMenuStore = defineStore("menu", {
  state: () => loadState(),

  getters: {
    // Quantos slots de recentes sobram depois dos favoritos.
    recentSlots: (state) => Math.max(0, state.cap - state.favorites.length),

    // Itens visíveis na faixa: favoritos (sempre no início) seguidos dos
    // recentes que ainda cabem. A ordem é a dos próprios arrays.
    strip(state) {
      const favKeys = new Set(state.favorites.map((i) => i.key));
      const recents = state.recents
        .filter((i) => !favKeys.has(i.key))
        .slice(0, this.recentSlots);
      return [...state.favorites, ...recents];
    },

    isFavorite: (state) => (key) =>
      state.favorites.some((i) => i.key === key),
  },

  actions: {
    persist() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          favorites: this.favorites,
          recents: this.recents,
        })
      );
    },

    // Registra o acesso a uma folha: vai para a frente da fila de recentes.
    visit(item) {
      const leaf = asLeaf(item);
      this.recents = [
        leaf,
        ...this.recents.filter((i) => i.key !== leaf.key),
      ].slice(0, RECENTS_HISTORY);
      this.persist();
    },

    // Fixa/desafixa um item.
    // - Fixar: entra no INÍCIO dos favoritos (e some dos recentes).
    // - Desafixar: volta para a frente dos recentes (não desaparece da faixa).
    toggleFavorite(item) {
      const leaf = asLeaf(item);
      if (this.isFavorite(leaf.key)) {
        this.favorites = this.favorites.filter((i) => i.key !== leaf.key);
        this.recents = [
          leaf,
          ...this.recents.filter((i) => i.key !== leaf.key),
        ].slice(0, RECENTS_HISTORY);
      } else {
        if (this.favorites.length >= this.cap) return;
        this.favorites = [leaf, ...this.favorites];
        this.recents = this.recents.filter((i) => i.key !== leaf.key);
      }
      this.persist();
    },

    // Reordena a faixa via drag & drop. `keys` é a nova sequência das chaves
    // visíveis. Favoritos e recentes são reordenados cada um no seu array,
    // preservando o histórico de recentes que não está visível.
    reorder(keys) {
      const favSet = new Set(this.favorites.map((i) => i.key));
      const byKey = new Map(
        [...this.favorites, ...this.recents].map((i) => [i.key, i])
      );

      this.favorites = keys
        .filter((k) => favSet.has(k))
        .map((k) => byKey.get(k));

      const visibleRecentKeys = keys.filter((k) => !favSet.has(k));
      const visibleSet = new Set(visibleRecentKeys);
      this.recents = [
        ...visibleRecentKeys.map((k) => byKey.get(k)),
        ...this.recents.filter(
          (i) => !visibleSet.has(i.key) && !favSet.has(i.key)
        ),
      ];

      this.persist();
    },
  },
});
