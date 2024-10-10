// TODO Lexical uses Prism, not Highlight.js. Some more languages:
// import "prismjs/components/prism-yaml";

import Component from "@glimmer/component";
import { action } from "@ember/object";
import { next } from "@ember/runloop";
import { cached } from "@glimmer/tracking";
// import { registerCodeHighlighting } from "@lexical/code";
import { createEmptyHistoryState, registerHistory } from "@lexical/history";
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
import { getMarkdownitTokens, convertFromMarkdown } from "composer-kit/editor";
import { getNodes } from "composer-kit/nodes";
import { convertToMarkdown } from "composer-kit/exporter";
import LexicalComposer from "../lexical/composer";
import { defineNodeClasses } from "../lexical/nodes";
import plugins from "../lexical/plugins";
import { dispatchInsertCommand } from "../lexical/upload";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { ajax } from "discourse/lib/ajax";

import theme from "../lexical/theme";

const HISTORY_DELAY = 1_000;

export default class LexicalEditor extends Component {
  lexicalElementId = guidFor(this);

  @tracked editor = null;
  @tracked _decorators = [];
  _initializing = true;

  @service appEvents;
  @service menu;
  @service siteSettings;
  @service lexicalCurrentState;
  @service floatingToolbar;

  @action
  async setup() {
    this.editor = createEditor({
      namespace: "DiscourseComposer",
      // onError: console.error,
      theme,
      nodes: defineNodeClasses(getNodes()),
    });

    const contentEditableElement = document.getElementById(
      this.lexicalElementId
    );
    this.editor.setRootElement(contentEditableElement);

    this._decorators = this.editor.getDecorators();

    // TODO this should live somewhere else, probably in lexical/plugins
    // TODO listen to upload-started, upload-cancelled and upload-error to create a placeholder
    // we're skipping the original placeholder code, that should be reused
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
          const markdown = convertToMarkdown(this.composer.getRoot());

          this.args.onChange(markdown);
        });
      }),

      // TODO Extract it to another initialization phase?
      this.editor.registerDecoratorListener((nextDecorators) => {
        this._decorators = nextDecorators;
      }),

      registerRichText(this.editor),

      registerHistory(this.editor, createEmptyHistoryState(), HISTORY_DELAY),

      // TODO replace this
      // registerMarkdownShortcuts(this.editor, getTransformers()),

      // TODO re-enable this or use an alternative
      // registerCodeHighlighting(this.editor),

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

      this.editor.registerUpdateListener(({ editorState }) => {
        if (this.args.showFloatingToolbar) {
          editorState.read(() =>
            this.floatingToolbar.updatePosition(
              this.editor.getRootElement(),
              this.composer
            )
          );
        }
      }),

      ...plugins.map((plugin) =>
        plugin(this.editor, {
          siteSettings: this.siteSettings,
          menu: this.menu,
        })
      )
    );

    await this.convertFromValue();
    this._initializing = false;
  }

  @bind
  async convertFromValue() {
    const tokens = await getMarkdownitTokens(this.args.value);
    this.editor.update(() => {
      convertFromMarkdown(this.composer, tokens);

      next(() =>
        resolveAllShortUrls(
          ajax,
          this.siteSettings,
          this.editor.getRootElement()
        )
      );
    });
  }

  @cached
  get composer() {
    return new LexicalComposer(this.editor);
  }

  @action
  teardown() {
    this.teardownRegisters?.();
    this.args.onDestroy?.(this.element);
  }

  get decorators() {
    return Object.entries(this._decorators).map(([nodeKey, decorator]) => {
      const { component, data } = decorator;
      const destination = this.editor.getElementByKey(nodeKey);

      return { destination, component, data };
    });
  }

  <template>
    <div class="d-editor__container">
      <div
        id={{this.lexicalElementId}}
        class="d-editor-input d-editor__editable"
        contenteditable="true"
        {{didInsert this.setup}}
        {{willDestroy this.teardown}}
      ></div>
      {{!#if this.editor}}
      {{! <Toolbar @composer=this.composer/> }}
      {{!/if}}
    </div>
    {{#each this.decorators as |decorator|}}
      {{#in-element decorator.destination}}
        <decorator.component @data={{decorator.data}} @editor={{this.editor}} />
      {{/in-element}}
    {{/each}}
  </template>
}
