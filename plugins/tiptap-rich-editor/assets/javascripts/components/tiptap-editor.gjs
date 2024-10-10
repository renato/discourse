import Component from "@glimmer/component";
import { action } from "@ember/object";
import { next } from "@ember/runloop";
import { cached } from "@glimmer/tracking";
import { bind } from "discourse-common/utils/decorators";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import willDestroy from "@ember/render-modifiers/modifiers/will-destroy";
import { guidFor } from "@ember/object/internals";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { resolveAllShortUrls } from "pretty-text/upload-short-url";
import { getMarkdownitTokens, convertFromMarkdown } from "composer-kit/editor";
import { convertToMarkdown } from "composer-kit/exporter";
import TiptapComposer from "../tiptap/composer";
import { dispatchInsertCommand } from "../tiptap/upload";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { ajax } from "discourse/lib/ajax";
import Link from "@tiptap/extension-link";

export default class TiptapEditor extends Component {
  tiptapContainerId = guidFor(this);

  @tracked editor = null;
  @tracked _decorators = [];
  @tracked rootElement;
  _initializing = true;

  @service appEvents;
  @service menu;
  @service siteSettings;
  @service lexicalCurrentState;
  @service floatingToolbar;

  @action
  async setup() {
    this.rootElement = document.getElementById(this.tiptapContainerId);

    this.editor = new Editor({
      element: this.rootElement,
      // TODO Extensions should be selectable per use (eg for bio)
      extensions: [StarterKit, Link],
      editorProps: {
        attributes: {
          class: "d-editor-input d-editor__editable",
        },
      },
      onUpdate: ({ editor }) => {
        // TODO it's using the originally created "Discourse Node" tree
        //   That obviously doesn't work for edited nodes/exporting :clown:
        const markdown = convertToMarkdown(this.composer.getRoot());

        this.args.onChange(markdown);
      },
      // nodes: defineNodeClasses(getNodes()),
    });

    // TODO
    // this._decorators = this.editor.getDecorators();

    // TODO this should live somewhere else, probably in lexical/plugins
    // TODO listen to upload-started, upload-cancelled and upload-error to create a placeholder
    // we're skipping the original placeholder code, that should be reused
    this.appEvents.on("composer:upload-success", (fileName, upload) => {
      dispatchInsertCommand(upload, this.editor);
    });

    await this.convertFromValue();
    this._initializing = false;
  }

  @bind
  async convertFromValue() {
    const tokens = await getMarkdownitTokens(this.args.value);

    convertFromMarkdown(this.composer, tokens);

    const doc = this.composer.getRoot().pmNode;

    this.editor.commands.setContent(doc);

    next(() => resolveAllShortUrls(ajax, this.siteSettings, this.rootElement));
  }

  @cached
  get composer() {
    return new TiptapComposer(this.editor);
  }

  @action
  teardown() {
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
    <div
      id={{this.tiptapContainerId}}
      class="d-editor__container"
      {{didInsert this.setup}}
      {{willDestroy this.teardown}}
    >
    </div>
    {{#each this.decorators as |decorator|}}
      {{#in-element decorator.destination}}
        <decorator.component @data={{decorator.data}} @editor={{this.editor}} />
      {{/in-element}}
    {{/each}}
  </template>
}
