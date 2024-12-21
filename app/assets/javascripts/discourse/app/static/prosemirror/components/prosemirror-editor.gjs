import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { guidFor } from "@ember/object/internals";
import { getOwner } from "@ember/owner";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import willDestroy from "@ember/render-modifiers/modifiers/will-destroy";
import { service } from "@ember/service";
import "../extensions";
import {
  getNodeViews,
  getPlugins,
} from "discourse/lib/composer/rich-editor-extensions";
import * as ProsemirrorModel from "prosemirror-model";
import * as ProsemirrorView from "prosemirror-view";
import * as ProsemirrorState from "prosemirror-state";
import * as ProsemirrorHistory from "prosemirror-history";
import * as ProsemirrorTransform from "prosemirror-transform";
import { createHighlight } from "../plugins/code-highlight";
import { baseKeymap } from "prosemirror-commands";
import { dropCursor } from "prosemirror-dropcursor";
import { history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { EditorState, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { bind } from "discourse-common/utils/decorators";
import { convertFromMarkdown } from "../lib/parser";
import TextManipulation from "../lib/text-manipulation";
import { createSchema } from "../lib/schema";
import { convertToMarkdown } from "../lib/serializer";
import { buildInputRules } from "../plugins/inputrules";
import { buildKeymap } from "../plugins/keymap";
import placeholder from "../plugins/placeholder";
import { gapCursor } from "prosemirror-gapcursor";

export default class ProsemirrorEditor extends Component {
  @service appEvents;
  @service menu;
  @service siteSettings;
  @service dialog;

  @tracked rootElement;

  editorContainerId = guidFor(this);
  schema = createSchema();
  view;
  state;
  plugins = this.args.plugins;

  @action
  async setup() {
    this.rootElement = document.getElementById(this.editorContainerId);

    const keymapFromArgs = Object.entries(this.args.keymap).reduce(
      (acc, [key, value]) => {
        // original keymap uses itsatrap format
        acc[key.replaceAll("+", "-")] = value;
        return acc;
      },
      {}
    );

    this.plugins ??= [
      buildInputRules(this.schema),
      keymap(buildKeymap(this.schema, keymapFromArgs)),
      keymap(baseKeymap),
      dropCursor({ color: "var(--primary)" }),
      gapCursor(),
      history(),
      placeholder(this.args.placeholder),
      createHighlight(),
      ...getPlugins().flatMap(processPlugin),
    ];

    this.state = EditorState.create({
      schema: this.schema,
      plugins: this.plugins,
    });

    this.view = new EditorView(this.rootElement, {
      discourse: {
        topicId: this.args.topicId,
        categoryId: this.args.categoryId,
      },
      nodeViews: this.args.nodeViews ?? getNodeViews(),
      state: this.state,
      attributes: { class: "d-editor-input d-editor__editable" },
      dispatchTransaction: (tr) => {
        this.view.updateState(this.view.state.apply(tr));

        if (tr.docChanged && tr.getMeta("addToHistory") !== false) {
          // TODO(renato): avoid calling this on every change
          const value = convertToMarkdown(this.view.state.doc);
          this.args.change?.({ target: { value } });
        }
      },
      handleDOMEvents: {
        focus: () => {
          this.args.focusIn?.();
          return false;
        },
        blur: () => {
          this.args.focusOut?.();
          return false;
        },
      },
      handleKeyDown: (view, event) => {
        // skip the event if it's an Enter keypress and the autocomplete is open
        return (
          event.key === "Enter" && !!document.querySelector(".autocomplete")
        );
      },
    });

    this.textManipulation = new TextManipulation(getOwner(this), {
      markdownOptions: this.args.markdownOptions,
      schema: this.schema,
      view: this.view,
    });

    this.destructor = this.args.onSetup(this.textManipulation);

    this.convertFromValue();
  }

  @bind
  convertFromValue() {
    let doc;
    try {
      doc = convertFromMarkdown(this.schema, this.args.value);
    } catch (e) {
      console.error(e);
      this.dialog.alert(e.message);
      return;
    }

    const tr = this.state.tr
      .replaceWith(0, this.state.doc.content.size, doc.content)
      .setMeta("addToHistory", false);
    this.view.updateState(this.view.state.apply(tr));
  }

  @action
  teardown() {
    this.destructor?.();
  }

  <template>
    <div
      id={{this.editorContainerId}}
      class="d-editor__container"
      {{didInsert this.setup}}
      {{willDestroy this.teardown}}
    >
    </div>
  </template>
}

function processPlugin(plugin) {
  if (typeof plugin === "function") {
    return plugin({
      ...ProsemirrorState,
      ...ProsemirrorModel,
      ...ProsemirrorView,
      ...ProsemirrorHistory,
      ...ProsemirrorTransform,
    });
  }
  if (plugin instanceof Array) {
    return plugin.map(processPlugin);
  }
  return new Plugin(plugin);
}
