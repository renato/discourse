import {
  $createParagraphNode,
  $isElementNode,
  ElementNode,
} from "lexical-editor/lexical";
import { $isCollapsibleContainerNode } from "./details-node";

export function convertSummaryElement() {
  const node = $createSummaryNode();
  return {
    node,
  };
}

export class SummaryNode extends ElementNode {
  static getType() {
    return "summary";
  }

  static clone(node) {
    return new SummaryNode(node.__key);
  }

  static importDOM() {
    return {
      summary: () => {
        return {
          conversion: convertSummaryElement,
          priority: 1,
        };
      },
    };
  }
  static importJSON() {
    return $createSummaryNode();
  }
  createDOM() {
    const dom = document.createElement("summary");
    dom.classList.add("details-summary");
    return dom;
  }

  updateDOM() {
    return false;
  }

  exportDOM() {
    const element = document.createElement("summary");
    return { element };
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "summary",
      version: 1,
    };
  }

  collapseAtStart() {
    this.getParentOrThrow().insertBefore(this);
    return true;
  }

  insertNewAfter(_, restoreSelection = true) {
    const containerNode = this.getParentOrThrow();

    if (!$isCollapsibleContainerNode(containerNode)) {
      throw new Error("SummaryNode expects to be child of DetailsNode");
    }

    if (containerNode.getOpen()) {
      const contentNode = this.getNextSibling();

      const firstChild = contentNode.getFirstChild();
      if ($isElementNode(firstChild)) {
        return firstChild;
      } else {
        const paragraph = $createParagraphNode();
        contentNode.append(paragraph);
        return paragraph;
      }
    } else {
      const paragraph = $createParagraphNode();
      containerNode.insertAfter(paragraph, restoreSelection);
      return paragraph;
    }
  }
}

export function $createSummaryNode() {
  return new SummaryNode();
}

export function $isSummaryNode(node) {
  return node instanceof SummaryNode;
}
