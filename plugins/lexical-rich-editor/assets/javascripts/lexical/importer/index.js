import { parseAsync } from "discourse/lib/text";
import { Parser } from "./parser";
import { getLexicalTransformers } from "./transformers";

class MarkdownImporter {
  parser;
  constructor(tokens, parser = new Parser(getLexicalTransformers())) {
    this.tokens = tokens;
    this.parser = parser;
  }

  convert() {
    console.log("Converting tokens", this.tokens);
    this.parser.parseTokens(this.tokens);
  }
}

export function markdownItTokens(markdown) {
  return parseAsync(markdown);
}

export function $convertFromMarkdownItTokens(tokens) {
  new MarkdownImporter(tokens).convert();
}

export { registerLexicalImporter } from "./transformers";
