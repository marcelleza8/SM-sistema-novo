import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { VueRenderer } from "@tiptap/vue-3";
import tippy from "tippy.js";

import MustacheSuggestionList from "./MustacheSuggestionList.vue";

/**
 * Extensão TipTap que dispara um autocomplete ao digitar "{{",
 * sugerindo os caminhos do catálogo e inserindo {{caminho}} literal.
 *
 * @param {(query: string) => Array} filterFn  retorna os itens filtrados
 */
export function createMustacheExtension(filterFn) {
  return Extension.create({
    name: "mustacheVariable",

    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          char: "{{",
          allowSpaces: false,
          startOfLine: false,

          items: ({ query }) => filterFn(query),

          // Insere o mustache completo, substituindo o "{{" + texto digitado.
          command: ({ editor, range, props }) => {
            editor
              .chain()
              .focus()
              .insertContentAt(range, `{{${props.value}}} `)
              .run();
          },

          render: () => {
            let component;
            let popup;

            return {
              onStart: (props) => {
                component = new VueRenderer(MustacheSuggestionList, {
                  props,
                  editor: props.editor,
                });

                if (!props.clientRect) return;

                popup = tippy("body", {
                  getReferenceClientRect: props.clientRect,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  placement: "bottom-start",
                });
              },

              onUpdate(props) {
                component.updateProps(props);
                if (props.clientRect && popup) {
                  popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                  });
                }
              },

              onKeyDown(props) {
                if (props.event.key === "Escape") {
                  popup && popup[0].hide();
                  return true;
                }
                return component.ref ? component.ref.onKeyDown(props) : false;
              },

              onExit() {
                popup && popup[0].destroy();
                component && component.destroy();
              },
            };
          },
        }),
      ];
    },
  });
}
