import { $getRoot } from "lexical";
import { toMarkdown } from "mdast-util-to-markdown";
import { getExtensions } from "./extensions";
import { DEFAULT_TRANSFORMERS } from "./transformers";

export function serializeMdast(node) {
  const rootNode = Array.isArray(node)
    ? { type: "root", children: node }
    : node;

  // console.log({rootNode});

  return toMarkdown(rootNode, {
    bullet: "*",
    rule: "-",
    bulletOrdered: ".",
    extensions: getExtensions(),
    // fences: siteSettings.code_formatting_style === "code-fences",
  });
}

export function $convertToMarkdown(node = $getRoot()) {
  return serializeMdast(exportLexicalToMdast(node));
}

const customTransformers = {};

export function registerLexicalExporter(transformer) {
  Object.assign(customTransformers, transformer);
}

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
