import Component from "@glimmer/component";
import { fn } from "@ember/helper";
import avatar from "discourse/helpers/avatar";
import formatUsername from "discourse/helpers/format-username";
import icon from "discourse-common/helpers/d-icon";

// TODO renderUserStatusHtml
// TODO keyboard navigation
export default class MentionMenu extends Component {
  <template>
    <div class="autocomplete ac-user d-editor-mention-menu">
      <ul>
        {{#each @data.items as |item|}}
          {{#if item.isUser}}
            <li data-index={{item.index}}>
              <a title="{{item.name}}" class="{{item.cssClasses}}" onclick={{fn @data.onSelect item}}>
                {{avatar item imageSize="tiny"}}
                <span class="username">{{formatUsername item.username}}</span>
                {{#if item.name}}
                  <span class="name">{{item.name}}</span>
                {{/if}}
                {{#if item.status}}
                  <span class="user-status"></span>
                {{/if}}
              </a>
            </li>
          {{/if}}

          {{#if item.isEmail}}
            <li>
              <a title="{{item.username}}" onclick={{fn @data.onSelect item}}>
                {{icon "envelope"}}
                <span class="username">{{formatUsername item.username}}</span>
              </a>
            </li>
          {{/if}}

          {{#if item.isGroup}}
            <li>
              <a title="{{item.full_name}}" onclick={{fn @data.onSelect item}}>
                {{icon "users"}}
                <span class="username">{{item.name}}</span>
                <span class="name">{{item.full_name}}</span>
              </a>
            </li>
          {{/if}}
        {{/each}}
      </ul>
    </div>
  </template>
}
