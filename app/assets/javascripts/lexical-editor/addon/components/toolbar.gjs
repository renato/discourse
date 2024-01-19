import Component from "@glimmer/component";

import { fn } from "@ember/helper";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";

import { FORMAT_TEXT_COMMAND } from "lexical";
import and from "truth-helpers/helpers/and";
import not from "truth-helpers/helpers/not";

import ToolbarButton from "./toolbar-button";
import ToolbarDropdown from "./toolbar-dropdown";
import defaultToolbar from "../lexical/toolbar";

export default class Toolbar extends Component {
  @tracked canUndo = false;
  @tracked canRedo = false;
  @tracked selectedElementKey = null;
  @tracked items = defaultToolbar;

  editor = this.args.editor ?? this.args.data.editor;
  isFloating = !!this.args.data;
  classes = `d-editor-toolbar d-editor-toolbar${this.isFloating ? "--floating" : "--bottom"}`

  @action
  execute(command) {
    if (typeof command === "function") {
      command(this.editor.engine);
    } else if (typeof command === "string") {
      this.editor.engine.dispatchCommand(FORMAT_TEXT_COMMAND, command);
    }
  }

  @action
  getTitle(item) {
    if (typeof item.title !== "function") {
      return item.title;
    }

    return item.title(this.editor.currentState);
  }

  @action
  getIsActive(item) {
    return item.isActive?.(this.editor.currentState);
  }

  @action
  getShouldRender(item) {
    return item.shouldRender?.(this.editor.currentState) ?? true;
  }

  <template>
    <div role="toolbar" class={{this.classes}}>
      {{#each this.items as |item|}}
        {{#if (this.getShouldRender item)}}
          {{#if item.command}}
            <ToolbarButton
              @icon={{item.icon}}
              @onClick={{fn this.execute item.command}}
              @active={{this.getIsActive item}}
              @label={{item.label}}
            />
          {{else if (and item.options (not @data.isFloating))}}
            <ToolbarDropdown
              @title={{this.getTitle item}}
              @icon={{item.icon}}
              @label={{item.label}}
              @buttons={{item.options}}
              @onSelect={{this.execute}}
              @getIsActive={{this.getIsActive}}
            />
          {{/if}}{{/if}}
      {{/each}}
    </div>
  </template>
}
