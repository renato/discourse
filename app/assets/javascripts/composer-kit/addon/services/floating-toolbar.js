import { action } from "@ember/object";
import Service, { service } from "@ember/service";
import Toolbar from "composer-kit/components/toolbar";
import { getDOMRange } from "composer-kit/lib/helpers";

export default class FloatingToolbar extends Service {
  @service menu;

  @action
  async updatePosition(rootElement, composer) {
    const nativeSelection = window.getSelection();

    if (
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const range = getDOMRange(nativeSelection, rootElement);

      const options = {
        identifier: "d-editor-floating-toolbar",
        component: Toolbar,
        inline: true,
        placement: "top-start",
        trapTab: false,
        data: { composer, isFloating: true },
      };
      this.menuInstance = await this.menu.show(range, options);
    } else {
      this.menuInstance?.destroy();
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);

    this.menuInstance?.destroy();

    this.teardown?.();
  }
}
