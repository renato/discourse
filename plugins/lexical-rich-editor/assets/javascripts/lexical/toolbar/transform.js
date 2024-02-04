import { $createCodeNode } from "@lexical/code";
import { insertList } from "@lexical/list";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import { updateNode } from "../../lexical/lib/helpers";

export default {
  name: "transform",
  label: "Transform",
  icon: "arrows-alt-h",
  options: [
    {
      icon: "paragraph",
      label: "Paragraph",
      isActive: ({ blockType }) => blockType === "paragraph",
      command(editor) {
        updateNode(editor, $createParagraphNode);
      },
    },
    {
      icon: "heading",
      label: "Heading 1",
      isActive: ({ blockType }) => blockType === "h1",
      command(editor) {
        updateNode(editor, () => $createHeadingNode("h1"));
      },
    },
    {
      icon: "heading",
      label: "Heading 2",
      isActive: ({ blockType }) => blockType === "h2",
      command(editor) {
        updateNode(editor, () => $createHeadingNode("h2"));
      },
    },
    {
      icon: "heading",
      label: "Heading 3",
      isActive: ({ blockType }) => blockType === "h3",
      command(editor) {
        updateNode(editor, () => $createHeadingNode("h3"));
      },
    },
    {
      icon: "list-ul",
      label: "Bulleted list",
      isActive: ({ blockType }) => blockType === "ul",
      command(editor) {
        insertList(editor, "bullet");
      },
    },
    {
      icon: "list-ol",
      label: "Numbered list",
      isActive: ({ blockType }) => blockType === "ol",
      command(editor) {
        insertList(editor, "number");
      },
    },
    {
      icon: "quote-right",
      label: "Block quote",
      isActive: ({ blockType }) => blockType === "quote",
      command(editor) {
        editor.update(() => {
          const selection = $getSelection();
          $setBlocksType(selection, () => $createQuoteNode());
        });
      },
    },
    {
      icon: "code",
      label: "Code block",
      isActive: ({ blockType }) => blockType === "code",
      command(editor) {
        editor.update(() => {
          let selection = $getSelection();

          if (selection !== null) {
            if (selection.isCollapsed()) {
              $setBlocksType(selection, () => $createCodeNode());
            } else {
              const textContent = selection.getTextContent();
              const codeNode = $createCodeNode();
              selection.insertNodes([codeNode]);
              selection = $getSelection();
              if ($isRangeSelection(selection)) {
                selection.insertRawText(textContent);
              }
            }
          }
        });
      },
    },
  ],
};
