// TODO Lexical uses Prism, not Highlight.js. Some more languages:
// import "prismjs/components/prism-yaml";

import Component from "@glimmer/component";
import { action } from "@ember/object";
import { next } from "@ember/runloop";
import { registerCodeHighlighting } from "@lexical/code";

import { registerMarkdownShortcuts } from "@lexical/markdown";
import { registerRichText } from "@lexical/rich-text";
import { bind } from "discourse-common/utils/decorators";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import willDestroy from "@ember/render-modifiers/modifiers/will-destroy";
import { guidFor } from "@ember/object/internals";
import { mergeRegister } from "@lexical/utils";
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  createEditor,
} from "lexical";

import { resolveAllShortUrls } from "pretty-text/upload-short-url";
import { $convertToMarkdown } from "../lexical/exporter";
import {
  $convertFromMarkdownItTokens,
  markdownItTokens,
} from "../lexical/importer";
import plugins from "../lexical/plugins";
import { dispatchInsertCommand } from "../lib/upload";
import { inject as service } from "@ember/service";
import FloatingToolbar from "./floating-toolbar";
import { tracked } from "@glimmer/tracking";
import { ajax } from "discourse/lib/ajax";
import { getLexicalNodes } from "../lexical/nodes";
import getTransformers from "../lexical/transformers";

import theme from "../lexical/theme";

export default class LexicalEditor extends Component {
  lexicalElementId = guidFor(this);

  @tracked editor = null;
  @tracked _decorators = [];
  _initializing = true;

  @service appEvents;
  @service menu;
  @service siteSettings;
  @service lexicalCurrentState;

  @action
  setup() {
    this.editor = createEditor({
      namespace: "DiscourseComposer",
      // onError: console.error,
      theme,
      nodes: getLexicalNodes(),
    });

    const contentEditableElement = document.getElementById(
      this.lexicalElementId
    );
    this.editor.setRootElement(contentEditableElement);

    this._decorators = this.editor.getDecorators();

    // TODO this should live somewhere else, probably in lexical/plugins
    // TODO listen to upload-started, upload-cancelled and upload-error to create a placeholder
    // we're skipping the original placeholder code, that can be reused
    this.appEvents.on("composer:upload-success", (fileName, upload) => {
      dispatchInsertCommand(upload, this.editor);
    });

    this.teardownRegisters = mergeRegister(
      // This updates the markdown value on every change
      // TODO can be optimized/debounced
      this.editor.registerUpdateListener(({ editorState }) => {
        if (this._initializing) {
          return;
        }

        editorState.read(() => {
          const markdown = $convertToMarkdown();

          this.args.onChange(markdown);
        });
      }),

      // TODO Extract it to another initialization phase?
      this.editor.registerDecoratorListener((nextDecorators) => {
        this._decorators = nextDecorators;
      }),

      registerRichText(this.editor),

      registerMarkdownShortcuts(this.editor, getTransformers()),

      registerCodeHighlighting(this.editor),

      this.editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() =>
          this.lexicalCurrentState.updateState(this.editor)
        );
      }),

      this.editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          this.canUndo = payload;
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),

      this.editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          this.canRedo = payload;
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),

      ...plugins.map((plugin) =>
        plugin(this.editor, {
          siteSettings: this.siteSettings,
          menu: this.menu,
        })
      )
    );

    this.importFromValue().then(() => {
      this._initializing = false;
    });
  }

  @bind
  async importFromValue() {
    const tokens = await markdownItTokens(this.args.value);

    this.editor.update(() => {
      $convertFromMarkdownItTokens(tokens);

      next(() =>
        resolveAllShortUrls(
          ajax,
          this.siteSettings,
          this.editor.getRootElement()
        )
      );
    });
  }

  @action
  teardown() {
    this.teardownRegisters?.();
    this.args.onDestroy?.(this.element);
  }

  get decorators() {
    return Object.keys(this._decorators).map((nodeKey) => {
      const { component, data } = this._decorators[nodeKey];
      const destination = this.editor.getElementByKey(nodeKey);

      return { destination, component, data };
    });
  }

  <template>
    <div class="d-editor-lexical__container">
      <div
        id={{this.lexicalElementId}}
        class="d-editor-input d-editor-lexical__editable"
        contenteditable="true"
        {{didInsert this.setup}}
        {{willDestroy this.teardown}}
      ></div>
      {{#if this.editor}}
        <FloatingToolbar @editor={{this.editor}} />
        {{! <Toolbar @editor=this.editor/> }}
      {{/if}}
    </div>
    {{#each this.decorators as |decorator|}}
      {{#in-element decorator.destination}}
        <decorator.component @data={{decorator.data}} @editor={{this.editor}} />
      {{/in-element}}
    {{/each}}
  </template>
}
