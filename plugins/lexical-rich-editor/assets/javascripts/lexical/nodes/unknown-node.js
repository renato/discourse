import { CodeNode } from "@lexical/code";
import { $applyNodeReplacement } from "lexical";
import I18n from "I18n";

export class UnknownNode extends CodeNode {
  static getType() {
    return "unknown";
  }

  static clone(node) {
    return new UnknownNode(node.__language, node.__key);
  }

  static importJSON(serializedNode) {
    return $createUnknownNode(serializedNode.language);
  }

  createDOM() {
    const element = super.createDOM(...arguments);
    element.classList.add("editor-unknown");

    const label = document.createElement("span");
    label.append(I18n.t("composer.lexical.nodes.unknown_label"));
    label.classList.add("editor-unknown__label");
    element.appendChild(label);

    return element;
  }

  exportJSON() {
    return { ...super.exportJSON(), type: this.getType() };
  }
}

export function $createUnknownNode(language = "markdown") {
  return $applyNodeReplacement(new UnknownNode(language));
}

export function $isUnknownNode(node) {
  return node instanceof UnknownNode;
}
