import Component from "@glimmer/component";
import { action } from "@ember/object";
import { next } from "@ember/runloop";
import { cached } from "@glimmer/tracking";
import { bind } from "discourse-common/utils/decorators";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import willDestroy from "@ember/render-modifiers/modifiers/will-destroy";
import { guidFor } from "@ember/object/internals";

import { resolveAllShortUrls } from "pretty-text/upload-short-url";
import { buildInputRules } from "../plugins/inputrules";
import { buildKeymap } from "../plugins/keymap";
import { dispatchInsertCommand } from "../prosemirror/upload";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { ajax } from "discourse/lib/ajax";

import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import { keymap } from "prosemirror-keymap";
import { history } from "prosemirror-history";
import { baseKeymap } from "prosemirror-commands";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";

import { convertFromMarkdown, convertToMarkdown } from "../lib/markdown";
import { createSchema } from "../lib/schema";

export default class ProsemirrorEditor extends Component {
  editorContainerId = guidFor(this);
  schema = createSchema();
  view;
  state;

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
    this.rootElement = document.getElementById(this.editorContainerId);

    this.plugins = [
      buildInputRules(this.schema),
      keymap(buildKeymap(this.schema, this.args.mapKeys)),
      keymap(baseKeymap),
      dropCursor(),
      gapCursor(),
      history(),
    ];

    this.state = EditorState.create({
      schema: this.schema,
      plugins: this.plugins,
    });

    this.view = new EditorView(this.rootElement, {
      state: this.state,
      attributes: { class: "d-editor-input d-editor__editable" },
      dispatchTransaction: (tr) => {
        this.view.updateState(this.view.state.apply(tr));

        if (tr.docChanged) {
          this.args.onChange(convertToMarkdown(this.view.state.doc));
        }
      },
    });

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
    const doc = await convertFromMarkdown(this.schema, this.args.value);

    console.log(doc);

    // const tr = this.editor.tr;
    // tr.replace(0, this.editor.doc.content.size, new Slice(doc.content, 0, 0));
    // this.editor.apply(tr);

    this.state = EditorState.create({
      schema: this.schema,
      doc,
      plugins: this.plugins,
    });
    this.view.updateState(this.state);

    next(() => resolveAllShortUrls(ajax, this.siteSettings, this.rootElement));
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
      id={{this.editorContainerId}}
      class="d-editor__container"
      {{didInsert this.setup}}
      {{willDestroy this.teardown}}
    >
    </div>
    {{#each this.decorators as |decorator|}}
      {{#in-element decorator.destination}}
        <decorator.component @data={{decorator.data}} @editor={{this.state}} />
      {{/in-element}}
    {{/each}}
  </template>
}
