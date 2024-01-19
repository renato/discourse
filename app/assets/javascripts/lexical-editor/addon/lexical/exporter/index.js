import { $getRoot } from "lexical";
import { toMarkdown } from "mdast-util-to-markdown";
import { getExtensions } from "./extensions";
import { exportLexicalToMdast } from "./transformers";

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
  });
}

export function $convertToMarkdown(node = $getRoot()) {
  return serializeMdast(exportLexicalToMdast(node));
}

export { registerLexicalExporter } from "./transformers";
