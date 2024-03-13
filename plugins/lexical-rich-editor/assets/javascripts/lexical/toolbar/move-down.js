import { $getSelection } from "lexical";
import { moveNode } from "../../lexical/lib/helpers";

export default {
  name: "move-down",
  label: "Move down",
  command(editor) {
    editor.update(() => {
      moveNode(editor, $getSelection(), "DOWN");
    });
  },
  icon: "arrow-down",
  // TODO shouldRender only if not last
};
