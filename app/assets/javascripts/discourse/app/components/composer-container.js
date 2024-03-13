import Component from "@glimmer/component";
import { service } from "@ember/service";
import {
  getComposerImplementationCount,
  getComposerImplementationList,
} from "discourse/lib/composer/extensions";
import I18n from "I18n";

export default class ComposerContainer extends Component {
  @service composer;
  @service site;

  showComposerImplMenu = getComposerImplementationCount() > 2;
  showComposerImplSwitcher = getComposerImplementationCount() === 2;

  get toggleComposerImplLabel() {
    return I18n.t("composer.toggle_composer_impl", {
      name: getComposerImplementationList().find(
        (impl) => impl.key !== this.composer.composerImpl.key
      ).name,
    });
  }
}
