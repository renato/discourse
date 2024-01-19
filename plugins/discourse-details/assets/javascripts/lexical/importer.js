// import { $createUnformattedTextNode } from "lexical-editor/lexical/nodes/unformatted-text-node";
import { $createDetailsNode } from "./details-node";
import { $createSummaryNode } from "./summary-node";

export default {
  bbcode_open: {
    details: (parser) => parser.openNode($createDetailsNode()),
    summary: (parser) => parser.openNode($createSummaryNode()),
  },
  bbcode_close: {
    details: (parser) => parser.closeTopNode(),
    summary: (parser) => parser.closeTopNode(),
  },
};
