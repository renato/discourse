export default {
  // TODO
  footnote_block_open() {},
  footnote_block_close() {},
  footnote_ref: (parser, token) => {
    // here's the actual position of the footnote
    // token.meta.id, token.meta.label; token.meta.subId is the count when reused
  },
  footnote_open(parser, token) {
    // token.meta.id, token.meta.label
    // parser.addNode($createFootnoteNode(token.meta.id, token.meta.label));
  },
  footnote_close(parser) {
    // parser.closeTopNode();
  },
  footnote_anchor() {
    // token.meta.id, token.meta.label; token.meta.subId is the count when reused
  },
};
