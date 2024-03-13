import Component from "@glimmer/component";
import { array, fn } from "@ember/helper";
import { action } from "@ember/object";
import i18n from "discourse-common/helpers/i18n";
import DButton from "discourse/components/d-button";
import concatClass from "discourse/helpers/concat-class";
import { getComposerImplementationCount } from "discourse/lib/composer/extensions";
import DMenu from "float-kit/components/d-menu";

export default class ComposerEditorSelector extends Component {
  @action
  onButtonClick(command, closeFn) {
    closeFn();
    this.args.onSelect?.(command);
  }

  hasMultipleEditorImpl = getComposerImplementationCount() > 1;

  <template>
    {{#if this.hasMultipleEditorImpl}}
      <DMenu
        class={{concatClass
        "composer-editor-selector"
        "btn-flat"
      }}
        @title={{i18n "composer.editor_selector.title"}}
        @icon={{"caret-down"}}
        @arrow={{true}}
        @placements={{array "top" "bottom"}}
        @identifier="composer-editor-selector"
        ...attributes
        as |menu|
      >
        <div class="composer-editor-selector-dropdown">
          {{@title}}

          <ul class="composer-editor-selector-dropdown__list">
            {{#each @buttons as |button|}}
              <li class={{concatClass "composer-editor-selector-dropdown__item" button.id}}>
                <DButton
                  @icon={{button.icon}}
                  @action={{fn this.onButtonClick button.command menu.close}}
                  @translatedLabel={{button.label}}
                  class={{concatClass
                  "btn-flat composer-editor-selector__action-btn"
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
