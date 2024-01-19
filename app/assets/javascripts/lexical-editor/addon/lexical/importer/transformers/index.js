import { $createCodeNode } from "@lexical/code";
import { $createLinkNode } from "@lexical/link";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
  TableCellHeaderStates,
} from "@lexical/table";
import { $createParagraphNode } from "lexical";
import { $createEmojiNode } from "../../nodes/emoji-node";
import { $createHorizontalRuleNode } from "../../nodes/horizontal-rule-node";
import { $createImageNode } from "../../nodes/image-node";
import { $createUnknownNode } from "../../nodes/unknown-node";

const customTransformers = { bbcode_open: [], bbcode_close: [] };

export function registerLexicalImporter(...transformers) {
  for (const transformer of transformers) {
    // eslint-disable-next-line no-unused-vars
    const { bbcode_open, bbcode_close, ...partialTransformer } = transformer;

    if (transformer.bbcode_open) {
      customTransformers.bbcode_open.push(transformer.bbcode_open);
    }
    if (transformer.bbcode_close) {
      customTransformers.bbcode_close.push(transformer.bbcode_close);
    }

    Object.assign(customTransformers, partialTransformer);
  }
}

export function getLexicalTransformers() {
  // eslint-disable-next-line no-unused-vars
  const { bbcode_open, bbcode_close, ...partialTransformers } =
    customTransformers;
  // we're not currently allowing the default transformers to be overridden, except for bbcode_open/bbcode_close
  return { ...partialTransformers, ...DEFAULT_TRANSFORMERS };
}

const DEFAULT_BBCODE_OPEN = {
  aside: (parser) => parser.openNode($createQuoteNode()),
};

const DEFAULT_BBCODE_CLOSE = {
  aside: closeNode,
};

const DEFAULT_TRANSFORMERS = {
  heading_open: (parser, token) =>
    parser.openNode($createHeadingNode(token.tag)),
  heading_close: closeNode,
  inline: (parser, token) => parser.parseTokens(token.children),
  text: (parser, token) => parser.addText(token.content),

  bullet_list_open: (parser) => parser.openNode($createListNode("bullet")),
  bullet_list_close: closeNode,
  ordered_list_open: (parser) => parser.openNode($createListNode("number")),
  ordered_list_close: closeNode,
  list_item_open: (parser, token) => {
    if (
      parser.top().__listType === "number" &&
      parser.top().getChildrenSize() === 0 &&
      token.info !== "1"
    ) {
      parser.pop().remove();
      parser.openNode($createListNode("number", token.info));
    }
    parser.openNode($createListItemNode());
  },
  list_item_close: closeNode,

  paragraph_open: (parser) => parser.openNode($createParagraphNode()),
  paragraph_close: closeNode,
  blockquote_open: (parser) => parser.openNode($createQuoteNode()),
  blockquote_close: closeNode,

  fence(parser, token) {
    parser.openNode($createCodeNode());
    parser.addText(token.content.replace(/\n$/g, ""));
    parser.closeTopNode();
  },
  code_block(parser, token) {
    parser.openNode($createCodeNode());
    parser.addText(token.content.replace(/\n$/g, ""));
    parser.closeTopNode();
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

  link_open: (parser, token) =>
    parser.openNode($createLinkNode(token.attrGet("href"))),
  link_close: (parser) => {
    // ignore empty links
    if (parser.top().getChildrenSize() === 0) {
      parser.pop().remove();
      return;
    }
    closeNode(parser);
  },
  softbreak: (parser) => parser.addText("\n"),

  bbcode_open: (parser, token) => {
    const top = parser.top();
    [...customTransformers.bbcode_open, DEFAULT_BBCODE_OPEN].forEach(
      (bbcodeTransformer) => bbcodeTransformer?.[token.tag]?.(parser, token)
    );

    // Fallback
    if (top === parser.top()) {
      // TODO there's no simple way to get the source
      console.log("unknown bbcode", token.tag, token);
      parser.openNode($createUnknownNode());
      parser.addText(`[${token.tag}]`);
    }
  },
  bbcode_close: (parser, token) => {
    const top = parser.top();
    [...customTransformers.bbcode_close, DEFAULT_BBCODE_CLOSE].forEach(
      (bbcodeTransformer) => bbcodeTransformer?.[token.tag]?.(parser, token)
    );

    // Fallback
    if (top === parser.top()) {
      parser.addText(`[/${token.tag}]`);
      parser.closeTopNode();
    }
  },
  wrap_open: (parser, token) => {
    parser.openNode($createUnknownNode());
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
    parser.closeTopNode();
  },

  quote_header_open: (parser) => parser.openNode($createParagraphNode()),
  quote_header_close: closeNode,
  quote_controls_open: noOp,
  quote_controls_close: noOp,

  hr: (parser) => parser.addNode($createHorizontalRuleNode()),
  emoji: (parser, token) =>
    parser.addNode($createEmojiNode(token.attrGet("title").replace(/:/g, ""))),

  // TODO maybe span_open/span_close should be handled like bbcode_open/bbcode_close? or we should allow multiple transformer for all tokens?
  span_open: (parser, token) => {
    parser.openNode($createParagraphNode());

    // TODO attrs for dates: data-date, data-time, data-timezone, data-range (=to/from)
    // date range has an unbalanced output: span_open, text, span_close, text, (span_close – shouldn't exist), span_open, text, span_close
    if (token.attrGet("data-range") === "from") {
      // TODO workaround for date range unbalance, needs further investigation
      parser.openNode($createParagraphNode());
    }
  },
  span_close: closeNode,

  table_open: (parser) => parser.openNode($createTableNode()),
  table_close: closeNode,
  thead_open: noOp,
  thead_close: noOp,
  tbody_open: noOp,
  tbody_close: noOp,
  tr_open: (parser) => parser.openNode($createTableRowNode()),
  tr_close: closeNode,
  th_open: (parser) => {
    parser.openNode($createTableCellNode(TableCellHeaderStates.ROW));
    parser.openNode($createParagraphNode());
  },
  th_close: (parser) => {
    closeNode(parser);
    closeNode(parser);
  },
  td_open: (parser) => {
    parser.openNode($createTableCellNode(TableCellHeaderStates.NO_STATUS));
    parser.openNode($createParagraphNode());
  },
  td_close: (parser) => {
    closeNode(parser);
    closeNode(parser);
  },

  // wrap_bbcode should also be one with multiple possible implementations
  wrap_bbcode: (parser, token) => {
    if (token.attrGet("class") === "spoiler") {
      // TODO we can't show the usual spoiler renderer, we need to be able to see the content
      // A surrounding box with a "spoiler" label may work
      parser.openNode($createParagraphNode());
    }
  },

  html_block: (parser, token) => {
    // TODO this should also support many implementations
    // Fallback for blocks we don't handle yet.
    parser.openNode($createUnknownNode());
    parser.addText(token.content);
    parser.closeTopNode();
  },

  // TODO
  // html_inline: (parser, token) => { },

  // TODO
  // poll_open: (parser, token) => console.log(token),
  // poll_close: (parser, token) => console.log(token),

  image: (parser, token) => {
    // this content doesn't seem to be tokenized, so we need to parse it ourselves
    const [altText, dimensionsWithPercent, thumbnail] =
      token.content.split("|");

    let width, height;
    if (dimensionsWithPercent) {
      const dimensions = dimensionsWithPercent.split(",")[0];
      [width, height] = dimensions.split("x");
    }

    parser.addNode(
      $createImageNode({
        src: token.attrGet("src"),
        title: token.attrGet("title"),
        altText,
        isThumbnail: thumbnail === "thumbnail",
        width,
        height,
      })
    );
  },
};

function noOp() {}

function closeNode(parser) {
  return parser.closeTopNode();
}

function closeFormatting(parser) {
  return parser.formatting.pop();
}
