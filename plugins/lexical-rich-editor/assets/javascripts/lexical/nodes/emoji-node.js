import { $applyNodeReplacement, DecoratorNode } from "lexical";
import { emojiExists } from "pretty-text/emoji";
import EmojiComponent from "./emoji-component";

export class EmojiNode extends DecoratorNode {
  static getType() {
    return "emoji";
  }

  static clone(node) {
    return new EmojiNode(node.emojiName, node.key);
  }

  static importJSON(serializedNode) {
    return $createEmojiNode(serializedNode.emojiName);
  }

  __emojiName;

  constructor(emojiName, key) {
    super(key);
    this.__emojiName = emojiName;
  }

  get emojiName() {
    return this.__emojiName;
  }

  isKeyboardSelectable() {
    return true;
  }

  createDOM({ theme }) {
    const span = document.createElement("span");
    span.className = theme.emoji;

    return span;
  }

  decorate() {
    return { component: EmojiComponent, data: this };
  }

  exportJSON() {
    return { type: this.getType(), emojiName: this.__emojiName };
  }

  updateDOM() {
    return false;
  }
}

export function $isEmojiNode(node) {
  return node instanceof EmojiNode;
}

export function $createEmojiNode(emojiName) {
  if (!emojiExists(emojiName)) {
    // TODO we can't just return here, safer to have an "invalid emoji" state
    return;
  }

  return $applyNodeReplacement(new EmojiNode(emojiName));
}
