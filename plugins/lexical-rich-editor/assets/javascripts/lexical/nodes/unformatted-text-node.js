import { $applyNodeReplacement, TextNode } from "lexical";

// TODO eg title in [details="title"] should be an unformatted text node

export class UnformattedTextNode extends TextNode {
  static getType() {
    return "unformatted-text";
  }

  static clone(node) {
    return new UnformattedTextNode(node.text, node.key);
  }

  static importJSON(serializedNode) {
    return $createUnformattedTextNode(serializedNode.text);
  }

  exportJSON() {
    return { ...super.exportJSON(), type: this.getType(), text: this.text };
  }

  canHaveFormat() {
    return false;
  }

  setFormat() {
    return this;
  }

  toggleFormat() {
    return this;
  }
}

export function $createUnformattedTextNode(text) {
  return $applyNodeReplacement(new UnformattedTextNode(text));
}
