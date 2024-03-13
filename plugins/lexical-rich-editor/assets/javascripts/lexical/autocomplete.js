import { $isCodeNode } from "@lexical/code";
import { $getSelection, FORMAT_TEXT_COMMAND } from "lexical";
import { ALLOWED_LETTERS_REGEXP } from "discourse/lib/autocomplete";

const DEFAULT_SURROUND_MAP = {
  italic_text: (engine) =>
    engine.dispatchCommand(FORMAT_TEXT_COMMAND, "italic"),
  bold_text: (engine) => engine.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"),
  code_title: (engine) => engine.dispatchCommand(FORMAT_TEXT_COMMAND, "code"),
};

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
            (!prevChar || ALLOWED_LETTERS_REGEXP.test(prevChar))
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
          .match(ALLOWED_LETTERS_REGEXP);
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
      const anchor = $getAnchor();

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

  /*
   * The below methods are re-implementing the textarea-text-manipulation mixin
   *
   * This is best-effort and should be temporary, we need to deprecate it when we have a new API
   */

  init() {}

  focusTextArea() {}

  getSelected() {
    // TODO avoid this hack, the delegate hijacks the scope
    const engine = this._textarea.__lexicalEditor;

    return engine.getEditorState().read(() => {
      const selection = $getSelection();
      const anchor = selection.anchor;
      const focus = selection.focus;

      return {
        value: anchor
          .getNode()
          .getTextContent()
          .substring(anchor.offset, focus.offset),
        lineVal: anchor.getNode().getTextContent(),
      };
    });
  }

  applySurround(sel, head, tail, exampleKey, opts) {
    // TODO avoid this hack, the delegate hijacks the scope
    const engine = this._textarea.__lexicalEditor;

    const surroundFromMap = DEFAULT_SURROUND_MAP[exampleKey];
    if (surroundFromMap) {
      surroundFromMap?.(engine);
      return;
    }

    engine.update(() => {
      const selection = $getSelection();
      const anchor = selection.anchor;
      const focus = selection.focus;
      const node = anchor.getNode();
      const text = node.getTextContent();
      const textContent = text.substring(anchor.offset, focus.offset);
      const textBefore = text.substring(0, anchor.offset);
      const textAfter = text.substring(focus.offset);

      // TODO the text content should be converted from markdown to lexical nodes...
      node.setTextContent(
        `${textBefore}${head}${textContent}${tail}${textAfter}`
      );

      node.selectEnd();
    });
  }
}
