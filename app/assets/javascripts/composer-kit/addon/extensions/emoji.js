import EmojiNode from "../components/nodes/emoji-node";

export default {
  node: {
    type: "emoji",
    attributes: ["emojiName"],
    createDOM({ theme }) {
      const span = document.createElement("span");
      span.className = theme.emoji;
      return span;
    },
    updateDOM(prevNode, dom) {
      // Example update logic
      return false;
    },
    exportDOM() {
      const element = document.createElement("span");
      // Apply any specific export logic here
      return { element };
    },

    component: EmojiNode,
  },
  importer: {
    emoji(parser, token) {
      parser.addNode("emoji", token.attrGet("title").replace(/:/g, ""));
    },
  },
  exporter: {
    emoji: (node) => ({ type: "text", value: `:${node.emojiName}:` }),
  },
};
