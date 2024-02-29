import { $isCodeNode } from "@lexical/code";
import { $getSelection } from "lexical";
import { allowedLettersRegex } from "discourse/lib/autocomplete";

function $getAnchor() {
  const selection = $getSelection();
  if (!selection) {
    return;
  }

  return selection.anchor;
}

/**
 * @implements {AutocompleteInterface}
 */
export default class LexicalAutocomplete {
  context;

  constructor(context) {
    this.context = context;
  }

  get #engine() {
    return this.context.__lexicalEditor;
  }

  putCursorAtEnd() {
    // this.#engine.update(() => {});
  }

  getValue() {
    return $getAnchor().getNode().getTextContent();
  }

  performAutocomplete({
    options,
    state,
    updateAutoComplete,
    dataSource,
    checkTriggerRule,
  }) {
    this.#engine.getEditorState().read(async () => {
      const anchor = $getAnchor();
      const node = anchor.getNode();
      const offset = anchor.offset;
      const text = node.getTextContent() ?? "";
      const key = text[text.length - 1];

      if (options.key) {
        if (options.onKeyUp && key !== options.key) {
          let match = options.onKeyUp(
            this.getValue(),
            offset,
            options.textManipulationImpl
          );

          if (match) {
            state.completeStart = offset;
            const term = match[0].substring(1, match[0].length);
            updateAutoComplete(dataSource(term, options));
          }
        }
      }

      if (state.completeStart === null) {
        if (key === options.key) {
          const prevChar = text[text.length - 2];
          if (
            checkTriggerRule() &&
            (!prevChar || allowedLettersRegex.test(prevChar))
          ) {
            state.completeStart = offset;
            updateAutoComplete(dataSource("", options));
          }
        } else {
          // TODO the logic when backspacing isn't great
        }
      } else {
        const matchAllowed = this.getValue()
          .substring(0, offset)
          .match(allowedLettersRegex);
        const lastIndex = matchAllowed
          ? this.getValue().lastIndexOf(matchAllowed[matchAllowed.length - 1])
          : -1;
        state.completeStart = lastIndex + (options.key ? 1 : 0) + 1;
        const term = this.getValue().substring(state.completeStart);
        updateAutoComplete(dataSource(term, options));
      }
    });
  }

  completeTerm({ me, term, options }) {
    this.#engine.update(() => {
      const selection = $getSelection();
      const anchor = selection.anchor;

      if (!anchor || anchor.type !== "text") {
        return;
      }

      const anchorNode = anchor.getNode();
      const text = anchorNode.getTextContent();
      const textBefore = text.substring(0, text.lastIndexOf(options.key));
      anchorNode
        .setTextContent(`${textBefore}${options.key}${term}`)
        .selectEnd();
    });
  }

  getCaretPosition() {
    return this.#engine.getEditorState().read(() => {
      const range = window.getSelection().getRangeAt(0);

      const rect = range.getBoundingClientRect();
      const rootRect = this.#engine.getRootElement().getBoundingClientRect();

      return {
        left: rect.left - rootRect.left,
        top: rect.top - rootRect.top,
      };
    });
  }

  inCodeBlock() {
    const anchorNode = $getAnchor().getNode();
    const parentNode = anchorNode.getParent();

    return anchorNode.hasFormat("code") || $isCodeNode(parentNode);
  }
}
