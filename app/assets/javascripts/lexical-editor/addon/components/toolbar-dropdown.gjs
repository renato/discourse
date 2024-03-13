import Component from "@glimmer/component";
import { array, fn } from "@ember/helper";
import { action } from "@ember/object";
import DButton from "discourse/components/d-button";
import concatClass from "discourse/helpers/concat-class";
import DMenu from "float-kit/components/d-menu";

export default class ToolbarDropdown extends Component {
  @action
  onButtonClick(command, closeFn) {
    closeFn();
    this.args.onSelect?.(command);
  }

  <template>
    {{#if @buttons.length}}
      <DMenu
        class={{concatClass
          "d-editor-toolbar-dropdown__trigger-btn"
          "btn-flat"
          (if @active "--active")
        }}
        @title={{@label}}
        @icon={{@icon}}
        @arrow={{true}}
        @placements={{array "top" "bottom"}}
        @identifier="d-editor-toolbar-dropdown__menu"
        ...attributes
        as |menu|
      >
        <div class="d-editor-toolbar-dropdown">
          {{@title}}

          <ul class="d-editor-toolbar-dropdown__list">
            {{#each @buttons as |button|}}
              <li
                class={{concatClass
                  "d-editor-toolbar-dropdown__item"
                  button.id
                }}
              >
                <DButton
                  @icon={{button.icon}}
                  @action={{fn this.onButtonClick button.command menu.close}}
                  @translatedLabel={{button.label}}
                  class={{concatClass
                    "btn-flat d-editor-toolbar-dropdown__action-btn"
                    (if (@getIsActive button) "--active")
                    button.id
                  }}
                />
              </li>
            {{/each}}
          </ul>
        </div>
      </DMenu>
    {{/if}}
  </template>
}
