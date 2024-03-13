import { ListItemNode } from "@lexical/list";
import { $getNearestNodeOfType } from "@lexical/utils";
import { $getSelection } from "lexical";

export default {
  name: "indent",
  label: "Indent",
  command(editor) {
    editor.update(() => {
      const node = $getSelection().anchor.getNode();
      const listItem = $getNearestNodeOfType(node, ListItemNode);
      // TODO max 1 level from parent
      listItem.setIndent(listItem.getIndent() + 1);
    });
  },
  icon: "arrow-right",
  shouldRender: ({ blockType }) => ["ul", "ol"].includes(blockType),
};
