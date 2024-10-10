import { $applyNodeReplacement, TextNode } from "lexical";

function convertMentionElement(domNode) {
  const textContent = domNode.textContent;
  if (textContent !== null) {
    const node = $createMentionNode(textContent);
    return {
      node,
    };
  }
  return null;
}

export class MentionNode extends TextNode {
  static getType() {
    return "mention";
  }

  static clone(node) {
    return new MentionNode(node.__text, node.__key);
  }

  static importJSON(serializedNode) {
    const node = $createMentionNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  static importDOM() {
    return {
      span: (domNode) => {
        if (!domNode.hasAttribute("data-lexical-mention")) {
          return null;
        }
        return {
          conversion: convertMentionElement,
          priority: 1,
        };
      },
    };
  }
  constructor(text, key) {
    super(text, key);
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "mention",
    };
  }

  createDOM(config) {
    const dom = super.createDOM(config);
    dom.className = config.theme.mention;
    return dom;
  }
  exportDOM() {
    const element = document.createElement("span");
    element.setAttribute("data-lexical-mention", "true");
    element.textContent = this.__text;
    return { element };
  }

  isTextEntity() {
    return true;
  }

  canInsertTextBefore() {
    return false;
  }
}

export function $createMentionNode(mentionName) {
  const mentionNode = new MentionNode(mentionName);
  // mentionNode.setMode("segmented").toggleDirectionless();
  return $applyNodeReplacement(mentionNode);
}
export function $isMentionNode(node) {
  return node instanceof MentionNode;
}
