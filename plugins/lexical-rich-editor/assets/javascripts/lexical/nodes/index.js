import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { UnknownNode } from "./unknown-node";
import { EmojiNode } from "./emoji-node";
import { HorizontalRuleNode } from "./horizontal-rule-node";
import { ImageNode } from "./image-node";
import { MentionNode } from "./mention-node";
import { UnformattedTextNode } from "./unformatted-text-node";

const customNodes = [];
export function registerLexicalNode(...typeClass) {
  customNodes.push(...typeClass);
}

export function getLexicalNodes() {
  return [...DEFAULT_NODES, ...customNodes];
}

export const DEFAULT_NODES = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  CodeHighlightNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  AutoLinkNode,
  LinkNode,
  HashtagNode,
  EmojiNode,
  ImageNode,
  MentionNode,
  UnformattedTextNode,
  HorizontalRuleNode,
  UnknownNode
];
