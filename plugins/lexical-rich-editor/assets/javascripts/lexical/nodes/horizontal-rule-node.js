import { $applyNodeReplacement, DecoratorNode } from "lexical";
import HorizontalRuleComponent from "./horizontal-rule-component";

export class HorizontalRuleNode extends DecoratorNode {
  static getType() {
    return "horizontal-rule";
  }

  static clone(node) {
    return new HorizontalRuleNode(node.__key);
  }

  static importJSON() {
    return $createHorizontalRuleNode();
  }

  static importDOM() {
    return {
      hr: () => ({
        conversion: convertHorizontalRuleElement,
        priority: 0,
      }),
    };
  }

  exportJSON() {
    return { type: "horizontal-rule" };
  }

  exportDOM() {
    return { element: this.createDOM() };
  }

  createDOM() {
    return document.createElement("hr");
  }

  getTextContent() {
    return "\n";
  }

  isInline() {
    return false;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return { component: HorizontalRuleComponent, data: this };
  }
}

function convertHorizontalRuleElement() {
  return { node: $createHorizontalRuleNode() };
}

export function $createHorizontalRuleNode() {
  return $applyNodeReplacement(new HorizontalRuleNode());
}

export function $isHorizontalRuleNode(node) {
  return node instanceof HorizontalRuleNode;
}
