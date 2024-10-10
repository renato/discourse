import { $getRoot } from "lexical";
import { toMarkdown } from "mdast-util-to-markdown";
import { getMdastExtensions } from "./mdastExtensions";
import { TRANSFORMERS } from "./transformers";

export function serializeMdast(node) {
  const rootNode = Array.isArray(node)
    ? { type: "root", children: node }
    : node;

  return toMarkdown(rootNode, {
    bullet: "*",
    rule: "-",
    bulletOrdered: ".",
    extensions: getMdastExtensions(),
    // fences: siteSettings.code_formatting_style === "code-fences",
  });
}

export function convertToMarkdown(node) {
  return serializeMdast(exportToMdast(node));
}

export function exportToMdast(currentNode, transformers = getTransformers()) {
  const transformer = transformers[currentNode.getType()];

  const state = {
    serializeNodes: (nodes) =>
      serializeMdast(nodes.map((node) => exportToMdast(node, transformers))),
    exportNode: (node) => exportToMdast(node, transformers),
    exportChildren(node) {
      return node
        .getChildren() // TODO: seems like lexical-specific
        .map((child) => exportToMdast(child, transformers))
        .filter(Boolean);
    },
  };

  if (transformer) {
    return transformer(currentNode, state);
  }
  console.log("Unknown export node", currentNode);
}

function getTransformers() {
  return TRANSFORMERS;
}

export function registerExporter(transformer) {
  Object.assign(TRANSFORMERS, transformer);
}
