// TODO Extract transformers to separate files

const customImporters = { bbcode_open: [], bbcode_close: [] };

export function registerImporter(...importers) {
  for (const importer of importers) {
    // eslint-disable-next-line no-unused-vars
    const { bbcode_open, bbcode_close, ...partialImporter } = importer;

    if (importer.bbcode_open) {
      customImporters.bbcode_open.push(importer.bbcode_open);
    }
    if (importer.bbcode_close) {
      customImporters.bbcode_close.push(importer.bbcode_close);
    }

    Object.assign(customImporters, partialImporter);
  }
}

export function getImporters() {
  // eslint-disable-next-line no-unused-vars
  const { bbcode_open, bbcode_close, ...partialImporters } = customImporters;
  // we're not currently allowing the default transformers to be overridden, except for bbcode_open/bbcode_close
  return { ...partialImporters, ...DEFAULT_IMPORTERS };
}

const DEFAULT_BBCODE_OPEN = {
  aside: (parser) => parser.openNode("quote"),
};

const DEFAULT_BBCODE_CLOSE = {
  aside: (parser) => parser.closeTopNode("quote"),
};

const DEFAULT_IMPORTERS = {
  heading_open: (parser, token) => parser.openNode("heading", token.tag),
  heading_close: (parser) => parser.closeTopNode("heading"),
  inline: (parser, token) => parser.processTokens(token.children),
  text: (parser, token) => parser.addText(token.content),

  bullet_list_open: (parser) => parser.openNode("list", "bullet"),
  bullet_list_close: noOp,
  ordered_list_open: (parser) => parser.openNode("list", "number"),
  ordered_list_close: (parser) => parser.closeTopNode("list"),
  list_item_open: (parser, token) => {
    parser.top().is;
    if (
      parser.top().__listType === "number" &&
      parser.top().getChildrenSize() === 0 &&
      token.info !== "1"
    ) {
      // popping and removing the list node without a start number
      parser.pop().remove();
      parser.openNode("list", "number", token.info);
    }
    parser.openNode("listItem");
  },
  list_item_close: (parser) => parser.closeTopNode("listItem"),

  paragraph_open: (parser) => parser.openNode("paragraph"),
  paragraph_close: (parser) => parser.closeTopNode("paragraph"),

  blockquote_open: (parser) => parser.openNode("quote"),
  blockquote_close: (parser) => parser.closeTopNode("quote"),

  fence(parser, token) {
    parser.openNode("code");
    parser.addText(token.content.replace(/\n$/g, ""));
    parser.closeTopNode("code");
  },
  code_block(parser, token) {
    parser.openNode("code");
    parser.addText(token.content.replace(/\n$/g, ""));
    parser.closeTopNode("code");
  },

  code_inline(parser, token) {
    parser.formatting.push("code");
    parser.addText(token.content);
    parser.formatting.pop();
  },

  // Formatting
  strong_open: (parser) => parser.formatting.push("bold"),
  bbcode_b_open: (parser) => parser.formatting.push("bold"),
  bbcode_b_close: closeFormatting,
  bbcode_i_open: (parser) => parser.formatting.push("italic"),
  bbcode_i_close: closeFormatting,
  bbcode_u_open: (parser) => parser.formatting.push("underline"),
  bbcode_u_close: closeFormatting,
  bbcode_s_open: (parser) => parser.formatting.push("strikethrough"),
  bbcode_s_close: closeFormatting,
  strong_close: closeFormatting,
  em_open: (parser) => parser.formatting.push("italic"),
  em_close: closeFormatting,
  s_open: (parser) => parser.formatting.push("strikethrough"),
  s_close: closeFormatting,

  link_open: (parser, token) => parser.openNode("link", token.attrGet("href")),
  link_close: (parser) => {
    // tiptap impl is using a different strategy: link isn't a node, so it just skips the text node if there's no content
    // ignore empty links
    // TODO This is being used to avoid creating links for heading anchors, but as
    //   [](url) is also valid markdown and we keep it when cooking, we need a different solution
    if (parser.top().getChildrenSize() === 0) {
      parser.pop().remove();
      return;
    }

    parser.closeTopNode("link");
  },
  softbreak: (parser) => parser.addText("\n"),
  hardbreak: (parser) => parser.addText("\n"),

  bbcode_open: (parser, token) => {
    const top = parser.top();
    [...customImporters.bbcode_open, DEFAULT_BBCODE_OPEN].forEach(
      (bbcodeTransformer) => bbcodeTransformer?.[token.tag]?.(parser, token)
    );

    // Fallback
    // TODO this /may/ be lexical specific...
    if (top === parser.top()) {
      // TODO there's no simple way to get the source
      console.log("unknown bbcode", token.tag, token);
      parser.openNode("unknown");
      parser.addText(`[${token.tag}]`);
    }
  },
  bbcode_close: (parser, token) => {
    const top = parser.top();
    [...customImporters.bbcode_close, DEFAULT_BBCODE_CLOSE].forEach(
      (bbcodeTransformer) => bbcodeTransformer?.[token.tag]?.(parser, token)
    );

    // Fallback
    if (top === parser.top()) {
      parser.addText(`[/${token.tag}]`);
      parser.closeTopNode("unknown");
    }
  },
  wrap_open: (parser, token) => {
    parser.openNode("unknown");
    const wrap = token.attrGet("data-wrap");
    let attrs = wrap ? `=${wrap}` : "";
    token.attrs.forEach(([name]) => {
      if (name.startsWith("data-") && name !== "data-wrap") {
        attrs += ` ${name}="${token.attrGet(name)}"`;
      }
    });
    parser.addText(`[wrap${attrs}]`);
  },
  wrap_close: (parser) => {
    parser.addText("[/wrap]");
    parser.closeTopNode("unknown");
  },

  quote_header_open: (parser) => parser.openNode("paragraph"),
  quote_header_close: (parser) => parser.closeTopNode("paragraph"),
  quote_controls_open: noOp,
  quote_controls_close: noOp,

  hr: (parser) => parser.addNode("horizontalRule"),
  // TODO maybe span_open/span_close should be handled like bbcode_open/bbcode_close? or we should allow multiple transformer for all tokens?
  span_open: (parser, token) => {
    parser.openNode("paragraph");

    // TODO attrs for dates: data-date, data-time, data-timezone, data-range (=to/from)
    // date range has an unbalanced output: span_open, text, span_close, text, (span_close – shouldn't exist), span_open, text, span_close
    if (token.attrGet("data-range") === "from") {
      // TODO workaround for date range unbalance, needs further investigation
      // parser.openNode("paragraph");
    }
  },
  span_close: (parser) => parser.closeTopNode("paragraph"),

  table_open: (parser) => parser.openNode("table"),
  table_close: (parser) => parser.closeTopNode("table"),
  thead_open: noOp,
  thead_close: noOp,
  tbody_open: noOp,
  tbody_close: noOp,
  tr_open: (parser) => parser.openNode("tableRow"),
  tr_close: (parser) => parser.closeTopNode("tableRow"),
  th_open: (parser) => {
    parser.openNode("tableCell", "row");
    parser.openNode("paragraph");
  },
  th_close: (parser) => {
    parser.closeTopNode("paragraph");
    parser.closeTopNode("tableCell");
  },
  td_open: (parser) => {
    parser.openNode("tableCell");
    parser.openNode("paragraph");
  },
  td_close: (parser) => {
    parser.closeTopNode("paragraph");
    parser.closeTopNode("tableCell");
  },

  // wrap_bbcode should also be one with multiple possible implementations
  wrap_bbcode: (parser, token) => {
    if (token.attrGet("class") === "spoiler") {
      // TODO we can't show the usual spoiler renderer, we need to be able to see the content
      // A surrounding box with a "spoiler" label may work
      parser.openNode("paragraph");
    }
  },

  html_block: (parser, token) => {
    // TODO this should also support many implementations
    // Fallback for blocks we don't handle yet.
    parser.openNode("unknown");
    parser.addText(token.content);
    parser.closeTopNode("unknown");
  },

  html_inline: (parser, token) => {
    if (token.content.startsWith("</")) {
      parser.addText(token.content);
      parser.closeTopNode(parser.top().getType());
      return;
    }

    parser.openNode("raw");
    parser.addText(token.content);
  },

  // TODO
  // poll_open: (parser, token) => console.log(token),
  // poll_close: (parser, token) => console.log(token),

  image: (parser, token) => {
    // this content doesn't seem to be tokenized, so parsing it ourselves
    let [altText, dimensionsWithPercent, thumbnail] = token.content.split("|");

    if (dimensionsWithPercent === "thumbnail" && !thumbnail) {
      thumbnail = dimensionsWithPercent;
      dimensionsWithPercent = null;
    }

    let width, height;
    if (dimensionsWithPercent) {
      const [dimensions] = dimensionsWithPercent.split(",");
      [width, height] = dimensions.split("x");
    }

    parser.addNode("image", {
      src: token.attrGet("data-orig-src") ? undefined : token.attrGet("src"),
      shortUrl: token.attrGet("data-orig-src"),
      title: token.attrGet("title"),
      altText,
      isThumbnail: thumbnail === "thumbnail",
      width,
      height,
    });
  },
};

function noOp() {}

function closeFormatting(parser) {
  return parser.formatting.pop();
}
