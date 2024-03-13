import { $createHeadingNode } from "@lexical/rich-text";
import { $wrapNodes } from "@lexical/selection";
import { $getSelection, $isRangeSelection } from "lexical";
export default {
  items: [
    {
      label: "H1",
      value: "h1",
    },
    {
      label: "H2",
      value: "h2",
    },
    {
      label: "H3",
      value: "h3",
    },
    {
      label: "H4",
      value: "h4",
    },
    {
      label: "H5",
      value: "h5",
    },
    {
      label: "H6",
      value: "h6",
    },
  ],

  name: "heading",
  label: "Heading",

  execute(engine, value) {
    engine.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createHeadingNode(value));
      }
    });
  },
};
