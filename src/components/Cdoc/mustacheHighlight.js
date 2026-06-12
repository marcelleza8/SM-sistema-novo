import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

/**
 * Realça visualmente os mustaches ({{tabela.coluna}}) dentro do editor,
 * como pílulas, sem alterar o conteúdo (continua texto literal no HTML).
 */
export const MustacheHighlight = Extension.create({
  name: "mustacheHighlight",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          decorations(state) {
            const decorations = [];

            state.doc.descendants((node, pos) => {
              if (!node.isText || !node.text) return;
              const regex = /\{\{[^{}]+\}\}/g;
              let match;
              while ((match = regex.exec(node.text)) !== null) {
                const from = pos + match.index;
                const to = from + match[0].length;
                decorations.push(
                  Decoration.inline(from, to, { class: "cdoc-var" })
                );
              }
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
