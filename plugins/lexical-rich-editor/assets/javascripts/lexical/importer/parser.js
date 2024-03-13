import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isRootNode,
} from "lexical";

export class Parser {
  stack = [];
  formatting = [];
  transformers;

  constructor(transformers = {}) {
    this.transformers = transformers;
    this.stack.push($getRoot());
  }

  pop() {
    return this.stack.pop();
  }

  top() {
    return this.stack[this.stack.length - 1];
  }

  openNode(node) {
    this.addNode(node);
    this.stack.push(node);
  }

  addNode(node) {
    // console.log("Adding node", node);
    this.top().append(node);
  }

  addText(content) {
    if (!content) {
      return;
    }

    const node = $createTextNode(content);
    this.formatting.forEach((format) => node.toggleFormat(format));

    this.addNode(node);
  }

  closeTopNode(strict = true) {
    // console.log("Closing top node", this.top());
    if ($isRootNode(this.top())) {
      if (strict) {
        throw new Error(
          "Cannot close the Root node – an open node may be missing."
        );
      }
    }

    const node = this.pop();
    return this.top().append(node);
  }

  parseTokens(tokens) {
    tokens.forEach((token) => this.parse(token));
  }

  parse(token) {
    const transformer = this.transformers[token.type];
    if (transformer) {
      transformer(this, token);
      return;
    }

    // Fallback for blocks we don't handle yet.
    if (token.type.endsWith("_open")) {
      this.openNode($createParagraphNode());
    } else if (token.type.endsWith("_close")) {
      this.closeTopNode();
    }

    console.log("Unknown import token", token);
  }
}
