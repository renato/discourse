import { $createEmojiNode, $isEmojiNode, EmojiNode } from "../nodes/emoji-node";

export default {
  // dependencies: [EmojiNode],
  // export: (node) => {
  //   if (!$isEmojiNode(node)) {
  //     return null;
  //   }
  //
  //   return `:${node.__emojiName}:`;
  // },
  // importRegExp: /:([a-z0-9_]+):/,
  // regExp: /:([a-z0-9_]+):/,
  // replace: (textNode, match) => {
  //   const [emojiMatch, emojiName] = match;
  //   const node = $createEmojiNode(emojiName);
  //   textNode.replace(node ?? emojiMatch);
  // },
  // trigger: ":",
  // type: "text-match",
};
