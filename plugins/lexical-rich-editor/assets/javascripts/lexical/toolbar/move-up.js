import { $getSelection } from "lexical";
import { moveNode } from "lexical-editor/lib/helpers";

export default {
  name: "move-up",
  label: "Move up",
  command(editor) {
    editor.update(() => {
      // const node = $getSelection().anchor.getNode();
      // const keys = node.getParent().getParent().getChildrenKeys();
      moveNode(editor, $getSelection(), "UP");
    });
  },
  icon: "arrow-up",
  // TODO shouldRender only if not first
};
