import { getImporters } from "composer-kit/importer";
import { Parser } from "composer-kit/importer/parser";
import { parseAsync } from "discourse/lib/text";

export default class Editor {
  constructor(composer) {
    this.composer = composer;
  }

  createNode(...args) {
    return this.composer.createNode(...args);
  }
}

export async function getMarkdownitTokens(value) {
  return parseAsync(value);
}

export function convertFromMarkdown(composer, tokens) {
  console.log("Converting tokens", tokens);

  const parser = new Parser(composer, getImporters());

  parser.processTokens(tokens);

  console.log(composer.getRoot());
}
