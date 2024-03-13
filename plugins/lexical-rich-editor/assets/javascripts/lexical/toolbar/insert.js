import { $createCodeNode } from "@lexical/code";
import { insertList } from "@lexical/list";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $createParagraphNode } from "lexical";
import { insertNode } from "../../lexical/lib/helpers";

export default {
  name: "insert",
  label: "Insert",
  icon: "plus",
  options: [
    {
      icon: "paragraph",
      label: "Paragraph",
      command(editor) {
        insertNode(editor, $createParagraphNode);
      },
    },
    {
      icon: "heading",
      label: "Heading 1",
      command(editor) {
        insertNode(editor, () => $createHeadingNode("h1"));
      },
    },
    {
      icon: "heading",
      label: "Heading 2",
      command(editor) {
        insertNode(editor, () => $createHeadingNode("h2"));
      },
    },
    {
      icon: "heading",
      label: "Heading 3",
      command(editor) {
        insertNode(editor, () => $createHeadingNode("h3"));
      },
    },
    {
      icon: "list-ul",
      label: "Bulleted list",
      command(editor) {
        insertNode(editor, $createParagraphNode);
        insertList(editor, "bullet");
      },
    },
    {
      icon: "list-ol",
      label: "Numbered list",
      command(editor) {
        insertList(editor, "number");
      },
    },
    {
      icon: "quote-right",
      label: "Block quote",
      command(editor) {
        editor.update(() => {
          insertNode(editor, $createQuoteNode);
        });
      },
    },
    {
      icon: "code",
      label: "Code block",
      command(editor) {
        insertNode(editor, $createCodeNode);
      },
    },
  ],
};
