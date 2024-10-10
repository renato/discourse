import { mentionRegex } from "pretty-text/mentions";
import {
  $createMentionNode,
  $isMentionNode,
  MentionNode,
} from "../nodes/mention-node";

export default {
  // TODO ignore if !siteSettings.enable_mentions
  dependencies: [MentionNode],
  export: (node) => {
    if (!$isMentionNode(node)) {
      return null;
    }

    return node.text;
  },
  // TODO use siteSettings.unicode_usernames on mentionRegex
  importRegExp: mentionRegex(),
  regExp: mentionRegex(),
  replace: (textNode, match) => {
    const [, mention, altMention] = match;
    // TODO validate it's a valid mention here or on $createMentionNode ?
    const node = $createMentionNode(`@${mention ?? altMention}`);
    textNode.replace(node);
  },
  trigger: "@",
  type: "text-match",
};
