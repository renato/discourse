import { $isLineBreakNode, $isTextNode } from "lexical";
import { serializeMdast } from "../";
const customTransformers = {};

export function registerLexicalExporter(transformer) {
  Object.assign(customTransformers, transformer);
}

const DEFAULT_TRANSFORMERS = {
  paragraph: (node, { exportChildren }) => ({
    children: exportChildren(node),
    type: "paragraph",
  }),
  root: (node, { exportChildren }) => ({
    children: exportChildren(node),
    type: "root",
  }),
  quote: (node, { exportChildren }) => ({
    children: exportChildren(node),
    type: "blockquote",
  }),
  heading: (node, { exportChildren }) => ({
    children: exportChildren(node),
    depth: parseInt(node.getTag()[1], 10),
    type: "heading",
  }),
  text: (node) => {
    let mdastNode = {
      type: node.hasFormat("code") ? "inlineCode" : "text",
      value: node.getTextContent(),
    };

    if (node.hasFormat("bold")) {
      mdastNode = { children: [mdastNode], type: "strong" };
    }

    if (node.hasFormat("italic")) {
      mdastNode = { children: [mdastNode], type: "emphasis" };
    }

    if (node.hasFormat("strikethrough")) {
      mdastNode = { children: [mdastNode], type: "delete" };
    }

    return mdastNode;
  },
  list: (node, { exportChildren }) => ({
    children: exportChildren(node),
    ordered: node.getListType() === "number",
    start: parseInt(node.getStart(), 10),
    spread: false,
    type: "list",
  }),
  listitem: (node, { exportChildren }) => ({
    // children: [{ children: exportChildren(node), type: "paragraph" }],
    children: exportChildren(node),
    type: "listItem",
  }),
  link: (node, { exportChildren }) => ({
    children: exportChildren(node),
    title: node.getTitle(),
    type: "link",
    url: node.getURL(),
  }),
  "horizontal-rule": () => ({ type: "thematicBreak" }),
  image: (node) => ({
    alt: `${node.altText}|${node.width}x${node.height}${
      node.isThumbnail ? "|thumbnail" : ""
    }`,
    title: node.title,
    url: node.shortUrl ?? node.src,
    type: "image",
  }),

  unknown: (node) => ({
    // output as-is
    type: "html",
    value: node.getTextContent(),
  }),

  linebreak: () => ({ type: "break" }),

  emoji: (node) => ({ type: "text", value: `:${node.emojiName}:` }),

  code: (node) => ({
    type: "code",
    value: node
      .getChildren()
      .map((child) => {
        if ($isTextNode(child)) {
          return child.getTextContent();
        } else if ($isLineBreakNode(child)) {
          return "\n";
        } else {
          return "";
        }
      })
      .join(""),
  }),

  "code-highlight": noOp,

  table: (node, { exportChildren }) => ({
    children: exportChildren(node),
    type: "table",
  }),
  tablerow: (node, { exportChildren }) => ({
    children: exportChildren(node),
    type: "tableRow",
  }),
  tablecell: (node, { exportChildren }) => ({
    children: exportChildren(node),
    type: "tableCell",
  }),
};

export function exportLexicalToMdast(
  currentNode,
  transformers = getTransformers()
) {
  const transformer = transformers[currentNode.getType()];

  const state = {
    serializeNodes: (nodes) =>
      serializeMdast(
        nodes.map((node) => exportLexicalToMdast(node, transformers))
      ),
    exportNode: (node) => exportLexicalToMdast(node, transformers),
    exportChildren(node) {
      return node
        .getChildren()
        .map((child) => exportLexicalToMdast(child, transformers))
        .filter(Boolean);
    },
  };

  if (transformer) {
    return transformer(currentNode, state);
  }
  console.log("Unknown export node", currentNode);
}

function getTransformers() {
  return { ...customTransformers, ...DEFAULT_TRANSFORMERS };
}

function noOp() {}
