import { schema as defaultMarkdownSchema } from "prosemirror-markdown";
import { Schema } from "prosemirror-model";

const CUSTOM_NODES = {};

const CUSTOM_MARKS = {};

export function createSchema() {
  let nodes = defaultMarkdownSchema.spec.nodes;
  let marks = defaultMarkdownSchema.spec.marks;

  for (const [type, spec] of Object.entries(CUSTOM_NODES)) {
    nodes = nodes.addToEnd(type, spec);
  }

  for (const [type, spec] of Object.entries(CUSTOM_MARKS)) {
    marks = marks.addToEnd(type, spec);
  }

  return new Schema({ nodes, marks });
}

export function addNode(type, spec) {
  CUSTOM_NODES[type] = spec;
}

export function addMark(type, spec) {
  CUSTOM_MARKS[type] = spec;
}
