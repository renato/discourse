import { gfmStrikethroughToMarkdown } from "../../../vendor/mdast-util-gfm-strikethrough";
import { gfmTableToMarkdown } from "../../../vendor/mdast-util-gfm-table";

const extensions = [
  gfmTableToMarkdown(),
  gfmStrikethroughToMarkdown(),
];

export function registerMdastExtension(..._extensions) {
  extensions.push(_extensions);
}

export function getExtensions() {
  return extensions;
}
