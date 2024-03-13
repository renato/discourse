import $ from "jquery";
import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "discourse-i18n";
import { DetailsNode } from "../lexical/details-node";
import lexicalImporter from "../lexical/importer";
import { SummaryNode } from "../lexical/summary-node";

function initializeDetails(api) {
  api.decorateCooked(($elem) => $("details", $elem), {
    id: "discourse-details",
  });

  api.addComposerToolbarPopupMenuOption({
    action: function (toolbarEvent) {
      toolbarEvent.applySurround(
        "\n" + `[details="${I18n.t("composer.details_title")}"]` + "\n",
        "\n[/details]\n",
        "details_text",
        { multiline: false }
      );
    },
    icon: "caret-right",
    label: "details.title",
  });

  api.registerComposerExtension("lexical-rich", {
    node: [SummaryNode, DetailsNode],
    importer: lexicalImporter,
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
  name: "apply-details",

  initialize() {
    withPluginApi("1.14.0", initializeDetails);
  },
};
