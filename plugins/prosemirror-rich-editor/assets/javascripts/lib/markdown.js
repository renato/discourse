import {
  defaultMarkdownParser,
  defaultMarkdownSerializer,
  MarkdownParser,
  MarkdownSerializer,
} from "prosemirror-markdown";
import { parseAsync } from "discourse/lib/text";

// Importing
const parseTokens = {
  ...defaultMarkdownParser.tokens,
  // Custom
};

export async function convertFromMarkdown(schema, text) {
  const tokens = await parseAsync(text);
  console.log("Converting tokens", tokens);

  const dummyTokenizer = { parse: () => tokens };

  const parser = new MarkdownParser(schema, dummyTokenizer, parseTokens);

  // workaround for softbreaks
  parser.tokenHandlers.softbreak = (state) => state.addText("\n");

  return parser.parse(text);
}

// Exporting

const serializeNodes = {
  ...defaultMarkdownSerializer.nodes,
  // Custom
  hard_break: (state) => {
    state.write("\n");
  },
};

const serializeMarks = {
  ...defaultMarkdownSerializer.marks,
  // Custom
};

export function convertToMarkdown(doc) {
  return new MarkdownSerializer(serializeNodes, serializeMarks).serialize(doc);
}
