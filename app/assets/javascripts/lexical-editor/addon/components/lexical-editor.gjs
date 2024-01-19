import Component from "@glimmer/component";
import { action } from "@ember/object";
import { bind } from "discourse-common/utils/decorators";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import willDestroy from "@ember/render-modifiers/modifiers/will-destroy";
import { guidFor } from "@ember/object/internals";
import { mergeRegister } from "@lexical/utils";
import * as tests from "lexical-editor/components/test-markdown";
import { $convertToMarkdown } from "../lexical/exporter";
import {
  $convertFromMarkdownItTokens,
  markdownItTokens,
} from "../lexical/importer";
import plugins from "../lexical/plugins";
import { dispatchInsertCommand } from "../lib/upload";
import getTransformers from "../lexical/transformers";
import { inject as service } from "@ember/service";
import { $setSelection, $createRangeSelection } from "lexical";
import Editor from "../lexical/editor";
import Toolbar from "./toolbar";
import FloatingToolbar from "./floating-toolbar";
import { tracked } from "@glimmer/tracking";

export default class LexicalEditor extends Component {
  transformers;
  lexicalElementId = guidFor(this);

  @tracked editor = null;
  @tracked _decorators = [];

  @service appEvents;
  @service menu;
  @service siteSettings;

  @action
  setup() {
    // TODO this should live somewhere else, probably in lexical/plugins
    // TODO listen to upload-started, upload-cancelled and upload-error to create a placeholder
    this.appEvents.on("composer:upload-success", (fileName, upload) => {
      dispatchInsertCommand(upload, this.editor.engine);
    });

    this.transformers = getTransformers();

    const initialConfig = {
      namespace: "DiscourseComposer",
      onError: console.error,
    };

    const contentEditableElement = document.getElementById(
      this.lexicalElementId
    );

    this.editor = Editor.create(
      contentEditableElement,
      this.transformers,
      initialConfig
    );

    const { engine } = this.editor;
    this._decorators = engine.getDecorators();

    this.teardownRegisters = mergeRegister(
      engine.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const markdown = $convertToMarkdown();

          console.log({ markdown });

          this.args.onChange(markdown);
        });
      }),

      // Extract it to another initialization phase?
      engine.registerDecoratorListener((nextDecorators) => {
        this._decorators = nextDecorators;
      }),

      ...plugins.map((plugin) =>
        plugin(this.editor.engine, {
          siteSettings: this.siteSettings,
          menu: this.menu,
          composer: this.args.composer,
        })
      )
    );

    this.importFromValue();
  }

  @bind
  async importFromValue() {
    const value = tests.test2;//this.args.value;

    const tokens = await markdownItTokens(value);

    this.editor.engine.update(() => {
      $convertFromMarkdownItTokens(tokens);
    });
  }

  @action
  teardown() {
    this.teardownRegisters?.();
    this.editor.teardown?.();
  }

  get decorators() {
    return Object.keys(this._decorators).map((nodeKey) => {
      const { component, data } = this._decorators[nodeKey];
      const destination = this.editor.engine.getElementByKey(nodeKey);

      return { destination, component, data };
    });
  }

  <template>
    <div class="d-editor-lexical__container">
      <div
        id={{this.lexicalElementId}}
        class="d-editor-lexical__editable"
        contenteditable="true"
        {{didInsert this.setup}}
        {{willDestroy this.teardown}}
      ></div>
      {{#if this.editor}}
        <FloatingToolbar @editor={{this.editor}} />
        <Toolbar @editor={{this.editor}} />
      {{/if}}
    </div>
    {{#each this.decorators as |decorator|}}
      {{#in-element decorator.destination}}
        <decorator.component
          @data={{decorator.data}}
          @editor={{this.editor.engine}}
        />
      {{/in-element}}
    {{/each}}
  </template>
}
