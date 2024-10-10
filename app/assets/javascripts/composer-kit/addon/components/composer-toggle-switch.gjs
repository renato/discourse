import Component from "@glimmer/component";
import icon from "discourse-common/helpers/d-icon";

export default class ComposerToggleSwitch extends Component {
  <template>
    <div class="composer-toggle-switch">
      <label class="composer-toggle-switch__label">
        {{! template-lint-disable no-redundant-role }}
        <button
          class="composer-toggle-switch__checkbox"
          type="button"
          role="switch"
          aria-checked={{this.checked}}
          ...attributes
        ></button>
        {{! template-lint-enable no-redundant-role }}

        <span class="composer-toggle-switch__checkbox-slider">
          {{#if @state}}
            {{icon "t" class="composer-toggle-switch__right-icon"}}
          {{else}}
            {{icon "fab-markdown" class="composer-toggle-switch__left-icon"}}
          {{/if}}
        </span>
      </label>
    </div>
  </template>

  get checked() {
    return this.args.state ? "true" : "false";
  }
}
