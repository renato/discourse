import Component from "@glimmer/component";
import { action } from "@ember/object";
import { service } from "@ember/service";
import { mergeRegister } from "@lexical/utils";
import { $getSelection } from "lexical";
import { getDOMRange } from "lexical-editor/lib/helpers";
import Toolbar from "./toolbar";

export default class FloatingToolbar extends Component {
  @service menu;

  constructor() {
    super(...arguments);
    this.setup();
  }

  @action
  setup() {
    this.teardownRegisters = mergeRegister(
      this.args.editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => this.updateFloating());
      })
    );
  }

  @action
  async updateFloating() {
    const selection = $getSelection();

    const nativeSelection = window.getSelection();

    const rootElement = this.args.editor.getRootElement();

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
