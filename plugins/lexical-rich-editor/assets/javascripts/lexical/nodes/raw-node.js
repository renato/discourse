import { $applyNodeReplacement, ElementNode } from "lexical";
import I18n from "I18n";

// TODO: This is work in progress. A RawNode should be a passthrough of raw content,
//       but some formatting is allowed and we need to handle it properly in the UI
//       Currently only used by `html_inline`
export class RawNode extends ElementNode {
  static getType() {
    return "raw";
  }

  static clone(node) {
    return new RawNode(node.__key);
  }

  static importJSON() {
    return $createRawNode();
  }

  createDOM() {
    const element = document.createElement("div");
    element.classList.add("editor-raw");

    return element;
  }

  updateDOM() {
    return false;
  }

  exportJSON() {
    return { ...super.exportJSON(), type: this.getType() };
  }
}

export function $createRawNode() {
  return $applyNodeReplacement(new RawNode());
}

export function $isRawNode(node) {
  return node instanceof RawNode;
}
