import Component from "@glimmer/component";
import { action } from "@ember/object";
import { service } from "@ember/service";
import {
  getComposerImplementationCount,
  getComposerImplementationList,
} from "composer-kit/extensions";
import I18n from "I18n";

export default class ComposerContainer extends Component {
  @service composer;
  @service site;

  showComposerImplMenu = getComposerImplementationCount() > 2;
  showComposerImplSwitcher = getComposerImplementationCount() === 2;

  @action
  toggleComposerImpl() {
    this.composer.set(
      "composerImpl",
      getComposerImplementationList().find(
        (impl) => impl.key !== this.composer.get("composerImpl").key
      )
    );

    if (!this.composer.get("composerImpl").allowPreview) {
      this.composer.set("showPreview", false);
    }
  }

  @action
  setComposerImpl(impl) {
    this.composer.set("composerImpl", impl);

    if (!impl.allowPreview) {
      this.composer.set("showPreview", false);
    }
  }

  get composerList() {
    return getComposerImplementationList();
  }
}
