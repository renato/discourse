export default {
  nodeSpec: {
    html_block: {
      attrs: {
        content: { default: "" },
      },
      group: "block",
      content: "block*",
      // it's too broad to be automatically parsed
      parseDOM: [],
      toDOM: (node) => {
        const dom = document.createElement("template");
        dom.innerHTML = node.attrs.content;
        return dom.content.firstChild;
      },
    },
  },
  parse: {
    // TODO(renato): should html_block be like a passthrough code block?
    html_block: (state, token) => {
      const openMatch = token.content.match(
        /^<([a-zA-Z][a-zA-Z0-9-]*)(?:\s[^>]*)?>.*/
      );
      const closeMatch = token.content.match(
        /^<\/([a-zA-Z][a-zA-Z0-9-]*)>\s*$/
      );

      if (openMatch) {
        state.openNode(state.schema.nodes.html_block, {
          content: openMatch[0],
        });

        return;
      }

      if (closeMatch) {
        state.closeNode();
      }
    },
  },
  serializeNode: {
    html_block: (state, node) => {
      state.write(node.attrs.content);
      state.renderContent(node);
    },
  },
};
