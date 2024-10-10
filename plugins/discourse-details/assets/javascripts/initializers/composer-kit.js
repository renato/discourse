import { withPluginApi } from "discourse/lib/plugin-api";
// import { DetailsNode } from "../lexical/details-node";
// import { SummaryNode } from "../lexical/summary-node";

const DetailsNode = {
  type: "details",
  attributes: ["open"],
  createDOM(config, editor) {
    const dom = document.createElement("details");
    dom.classList.add("editor-details");
    dom.open = this.__open;
    dom.addEventListener("toggle", () => {
      const open = editor.getEditorState().read(() => this.getOpen());
      if (open !== dom.open) {
        editor.update(() => this.toggleOpen());
      }
    });
    return dom;
  },
  updateDOM(prevNode, dom) {
    if (prevNode.__open !== this.__open) {
      dom.open = this.__open;
    }
    return false;
  },
  exportDOM() {
    const element = document.createElement("details");
    element.setAttribute("open", this.__open.toString());
    return { element };
  },
  exportJSON() {
    return {
      ...super.exportJSON(),
      open: this.__open,
    };
  },
};

const SummaryNode = {
  type: "summary",
  attributes: [], // No specific attributes for this node
  createDOM() {
    const dom = document.createElement("summary");
    dom.classList.add("details-summary");
    return dom;
  },
  updateDOM() {
    return false; // No specific DOM update logic
  },
  exportDOM() {
    const element = document.createElement("summary");
    return { element };
  },
  exportJSON() {
    return {
      ...super.exportJSON(),
      type: "summary",
    };
  },
  methods: {
    collapseAtStart() {
      this.getParentOrThrow().insertBefore(this);
      return true;
    },

    insertNewAfter(_, restoreSelection = true) {
      const containerNode = this.getParentOrThrow();

      if (!$isCollapsibleContainerNode(containerNode)) {
        throw new Error("SummaryNode expects to be child of DetailsNode");
      }

      if (containerNode.getOpen()) {
        const contentNode = this.getNextSibling();

        const firstChild = contentNode.getFirstChild();
        if ($isElementNode(firstChild)) {
          return firstChild;
        } else {
          const paragraph = $createParagraphNode();
          contentNode.append(paragraph);
          return paragraph;
        }
      } else {
        const paragraph = $createParagraphNode();
        containerNode.insertAfter(paragraph, restoreSelection);
        return paragraph;
      }
    },
  },
};

function initializeDetails(api) {
  api.registerComposerExtension({
    nodes: [SummaryNode, DetailsNode],
    importer: {
      bbcode_open: {
        details: (parser) => parser.openNode("details"),
        summary: (parser) => parser.openNode("summary"),
      },
      bbcode_close: {
        details: (parser) => parser.closeTopNode(),
        summary: (parser) => parser.closeTopNode(),
      },
    },
    exporter: {
      details(node, { serializeNodes }) {
        const [summaryNode, ...detailsNodes] = node.getChildren();
        const title = summaryNode.getTextContent();
        const content = serializeNodes(detailsNodes);
        return {
          type: "html",
          value: `[details="${title}"]\n${content}[/details]`,
        };
      },
      summary() {},
    },
  });
}

export default {
  name: "composer-kit-details",

  initialize() {
    withPluginApi("1.14.0", initializeDetails);
  },
};
