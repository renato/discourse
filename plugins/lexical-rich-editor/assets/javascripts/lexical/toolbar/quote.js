import { $createQuoteNode, $isQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
} from "lexical";

export default {
  name: "quote",
  label: "Quote",
  icon: "quote-right",
  command(engine) {
    engine.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const hasAnyQuoteNode = selection.getNodes().some($isQuoteNode);
        if (hasAnyQuoteNode) {
          // TODO: it only works if the selection is exactly 1+ quote nodes, so
          // selecting the inner text of a single quote node sometimes don't trigger this flow
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      }
    });
  },
};
