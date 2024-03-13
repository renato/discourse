import { ListItemNode } from "@lexical/list";
import { $setBlocksType } from "@lexical/selection";
import { $getNearestNodeOfType } from "@lexical/utils";
import { $createParagraphNode, $getSelection } from "lexical";

export default {
  name: "outdent",
  label: "Outdent",
  command(editor) {
    editor.update(() => {
      const selection = $getSelection();
      const node = selection.anchor.getNode();
      const listItem = $getNearestNodeOfType(node, ListItemNode);
      if (listItem.getIndent() === 0) {
        $setBlocksType(selection, () => {
          const paragraphNode = $createParagraphNode();
          paragraphNode.select();
          return paragraphNode;
        });

        return;
      }

      listItem.setIndent(listItem.getIndent() - 1);
    });
  },
  icon: "arrow-left",
  shouldRender: ({ blockType }) => ["ul", "ol"].includes(blockType),
};
