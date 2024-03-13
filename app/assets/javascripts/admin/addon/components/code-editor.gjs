// TODO Lexical uses Prism, not Highlight.js. Some more languages:
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-scss";

import Component from "@glimmer/component";
import { action } from "@ember/object";
import {
  CodeNode,
  CodeHighlightNode,
  $isCodeNode,
  $createCodeNode,
  $createCodeHighlightNode,
  registerCodeHighlighting,
} from "@lexical/code";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import willDestroy from "@ember/render-modifiers/modifiers/will-destroy";
import didUpdate from "@ember/render-modifiers/modifiers/did-update";
import { guidFor } from "@ember/object/internals";
import { mergeRegister } from "@lexical/utils";
import { createEditor, $getRoot, RootNode } from "lexical";
import { createEmptyHistoryState, registerHistory } from "@lexical/history";
import { registerPlainText } from "@lexical/plain-text";

import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";

export const theme = {
  code: "editor-code hljs",
  codeHighlight: {
    atrule: "editor-tokenAttr hljs-attribute",
    attr: "editor-tokenAttr hljs-attribute",
    boolean: "editor-tokenProperty hljs-literal",
    builtin: "editor-tokenSelector hljs-built_in",
    cdata: "editor-tokenComment hljs-comment",
    char: "editor-tokenSelector hljs-selector-tag",
    class: "editor-tokenFunction hljs-title",
    "class-name": "editor-tokenFunction hljs-title",
    comment: "editor-tokenComment hljs-comment",
    constant: "editor-tokenProperty hljs-literal",
    deleted: "editor-tokenProperty hljs-deletion",
    doctype: "editor-tokenComment hljs-comment",
    entity: "editor-tokenOperator hljs-operator",
    function: "editor-tokenFunction hljs-title",
    important: "editor-tokenVariable hljs-variable",
    inserted: "editor-tokenSelector hljs-selector-tag",
    keyword: "editor-tokenAttr hljs-keyword",
    namespace: "editor-tokenVariable hljs-variable",
    number: "editor-tokenProperty hljs-number",
    operator: "editor-tokenOperator hljs-operator",
    prolog: "editor-tokenComment hljs-comment",
    property: "editor-tokenProperty hljs-attribute",
    punctuation: "editor-tokenPunctuation hljs-punctuation",
    regex: "editor-tokenVariable hljs-regexp",
    selector: "editor-tokenSelector hljs-selector-tag",
    string: "editor-tokenSelector hljs-selector-tag",
    symbol: "editor-tokenProperty hljs-symbol",
    tag: "editor-tokenProperty hljs-tag",
    url: "editor-tokenOperator hljs-link",
    variable: "editor-tokenVariable hljs-variable",

    // yaml
    key: "editor-tokenProperty hljs-keyword",
    scalar: "editor-tokenProperty hljs-string",
    directive: "editor-tokenComment hljs-comment",
    datetime: "editor-tokenProperty hljs-number",
    null: "editor-tokenProperty hljs-literal",
  },
};

const HISTORY_DELAY = 1_000;

export default class CodeEditor extends Component {
  @service lexicalCurrentState;

  @tracked editor;

  lexicalElementId = guidFor(this);

  get mode() {
    return this.args.mode || "javascript";
  }

  @action
  setup() {
    this.editor = createEditor({
      namespace: "DiscourseCodeEditor",
      // onError: console.error,
      theme,
      nodes: [CodeNode, CodeHighlightNode],
    });

    const contentEditableElement = document.getElementById(
      this.lexicalElementId
    );
    this.editor.setRootElement(contentEditableElement);

    this.teardownRegisters = mergeRegister(
      // This updates the markdown value on every change
      // TODO can be optimized/debounced
      this.editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          // TODO get the raw text content
          // this.args.onChange("TODO");
        });
      }),

      registerPlainText(this.editor),
      registerHistory(this.editor, createEmptyHistoryState(), HISTORY_DELAY),
      registerCodeHighlighting(this.editor),

      this.editor.registerNodeTransform(RootNode, (rootNode) => {
        if (!$isCodeNode(rootNode.getFirstChild())) {
          this.$recreateCodeNode("");
        }
      })
    );

    this.updateContent();
  }

  @action
  updateContent() {
    this.editor.update(() => this.$recreateCodeNode(this.args.content));
  }

  $recreateCodeNode(content) {
    const codeHighlight = $createCodeHighlightNode(content);

    $getRoot().clear().append($createCodeNode(this.mode).append(codeHighlight));

    codeHighlight.selectStart();
  }

  @action
  teardown() {
    this.teardownRegisters?.();
    this.args.onDestroy?.(this.element);
  }

  <template>
    <div class="d-editor-lexical__container">
      <div
        id={{this.lexicalElementId}}
        class="d-editor-input d-editor-lexical__editable"
        contenteditable="true"
        {{didInsert this.setup}}
        {{willDestroy this.teardown}}
        {{didUpdate this.updateContent this.args.content}}
      ></div>
    </div>
  </template>
}
