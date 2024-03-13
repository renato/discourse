import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import {
  $createNodeSelection,
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $setSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { $isImageNode } from "./image-node";

function isNodeSelected(editor, key) {
  return editor.getEditorState().read(() => $getNodeByKey(key)?.isSelected());
}

export default class ImageComponent extends Component {
  @tracked classes = "editor-image-node";

  constructor() {
    super(...arguments);

    this.teardownRegisters = this.args.editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      this.handleSelection,
      COMMAND_PRIORITY_LOW
    );
  }

  @action
  handleClick() {
    this.args.editor.update(() => {
      let selection = $getSelection();

      if (!$isNodeSelection(selection)) {
        selection = $createNodeSelection();
        $setSelection(selection);
      }

      // if (selected) {
      selection.add(this.args.data.__key);
      this.args.editor.dispatchCommand(SELECTION_CHANGE_COMMAND, undefined);
      // } else {
      //   selection.delete(key);
      // }
    });
  }

  @action
  handleKeyDown(event) {
    if (event.key === "Backspace" || event.key === "Delete") {
      this.args.editor.update(() => {
        // TODO all these event logics will be rewritten

        const nodeKey = this.args.data.__key;

        // console.log(
        //   isNodeSelected(this.args.editor, nodeKey),
        //   $isNodeSelection($getSelection())
        // );
        // if (
        //   isNodeSelected(this.args.editor, nodeKey) &&
        //   $isNodeSelection($getSelection())
        // ) {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.remove();
        }
        // }
      });
    }
  }

  @action
  handleSelection() {
    const selectedClass = isNodeSelected(this.args.editor, this.args.data.__key)
      ? "editor-image-node--selected"
      : "";
    this.classes = `editor-image-node ${selectedClass}`;
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.teardownRegisters();
  }

  <template>
    <img
      tabindex="-1"
      src={{@data.src}}
      data-orig-src={{@data.shortUrl}}
      alt={{@data.altText}}
      title={{@data.title}}
      width={{@data.width}}
      height={{@data.height}}
      onclick={{this.handleClick}}
      class={{this.classes}}
      onkeydown={{this.handleKeyDown}}
    />
  </template>
}
