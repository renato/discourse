import { action } from "@ember/object";
import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import { mergeRegister } from "@lexical/utils";
import { getDOMRange } from "../lexical/lib/helpers";
import Toolbar from "./toolbar";
import { $getSelection } from "lexical";

export default class FloatingToolbar extends Component {
  @service menu;

  constructor() {
    super(...arguments);
    this.setup();
  }

  @action
  setup() {
    this.teardownRegisters = mergeRegister(
      this.args.editor.engine.registerUpdateListener(({ editorState }) => {
        editorState.read(() => this.updateFloating());
      })
    );
  }

  @action
  async updateFloating() {
    const selection = $getSelection();

    const nativeSelection = window.getSelection();

    const rootElement = this.args.editor.engine.getRootElement();

    if (
      selection !== null &&
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
        data: { editor: this.args.editor, isFloating: true },
      };
      this.menuInstance = await this.menu.show(range, options);
    } else {
      this.menuInstance?.destroy();
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);

    this.menuInstance?.destroy();

    this.teardownRegisters?.();
  }
}
