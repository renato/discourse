import { gfmStrikethroughToMarkdown } from "../vendor/mdast-util-gfm-strikethrough";
import { gfmTableToMarkdown } from "../vendor/mdast-util-gfm-table";

const EXTENSIONS = [gfmTableToMarkdown(), gfmStrikethroughToMarkdown()];

export function registerMdastExtension(...extensions) {
  EXTENSIONS.push(extensions);
}

export function getMdastExtensions() {
  return EXTENSIONS;
}
