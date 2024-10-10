export class Parser {
  stack = [];
  formatting = [];
  transformers;
  composer;

  constructor(composer, transformers = {}) {
    this.transformers = transformers;
    this.composer = composer;
    this.stack.push(composer.getRoot());
  }

  pop() {
    return this.stack.pop();
  }

  top() {
    return this.stack[this.stack.length - 1];
  }

  openNode(nodeType, ...args) {
    if (this.composer.shouldSkipNode(this.top(), nodeType, true)) {
      return;
    }

    const node = this.composer.createNode(nodeType, ...args);

    if (!node) {
      return;
    }

    this.stack.push(node);
  }

  addNode(node, ...args) {
    if (typeof node === "string") {
      node = this.composer.createNode(node, ...args);
    }

    if (!node) {
      return;
    }

    return this.top().append(node);
  }

  addText(content) {
    if (!content) {
      return;
    }

    const node = this.composer.createNode("text", content, this.formatting);

    this.addNode(node);
  }

  closeTopNode(nodeType, strict = true) {
    if (this.composer.shouldSkipNode(this.top(), nodeType, false)) {
      return;
    }

    if (nodeType !== this.top().getType()) {
      throw new Error(
        `Cannot close node of type ${this.top().getType()} – expected ${nodeType}`
      );
    }

    if (this.composer.isRootNode(this.top())) {
      if (strict) {
        throw new Error(
          "Cannot close the Root node – an open node may be missing."
        );
      }
    }

    return this.addNode(this.pop());
  }

  processTokens(tokens) {
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
      this.openNode("paragraph");
    } else if (token.type.endsWith("_close")) {
      this.closeTopNode("paragraph");
    }

    console.log("Unknown import token", token);
  }
}
