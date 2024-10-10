import { ALLOWED_LETTERS_REGEXP } from "discourse/lib/autocomplete";

const DEFAULT_SURROUND_MAP = {
  // TODO
  italic_text: (engine) =>
    engine.dispatchCommand(FORMAT_TEXT_COMMAND, "italic"),
  bold_text: (engine) => engine.dispatchCommand(FORMAT_TEXT_COMMAND, "bold"),
  code_title: (engine) => engine.dispatchCommand(FORMAT_TEXT_COMMAND, "code"),
};

/**
 * @implements {AutocompleteInterface}
 */
export default class ProsemirrorAutocomplete {
  context;

  constructor(context) {
    this.context = context;
  }

  putCursorAtEnd() {
    // this.#engine.update(() => {});
  }

  getValue() {
    // TODO
  }

  performAutocomplete({
    options,
    state,
    updateAutoComplete,
    dataSource,
    checkTriggerRule,
  }) {}

  completeTerm({ me, term, options }) {}

  getCaretPosition() {
    // TODO
    return {
      left: 0,
      top: 0,
    };
  }

  inCodeBlock() {
    // TODO
    return false;
  }

  /*
   * The below methods are re-implementing the textarea-text-manipulation mixin
   *
   * This is best-effort and should be temporary, we need to deprecate it when we have a new API
   */

  init() {}

  focusTextArea() {}

  getSelected() {}

  applySurround(sel, head, tail, exampleKey, opts) {}
}
