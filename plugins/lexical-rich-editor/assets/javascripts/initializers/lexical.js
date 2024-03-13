import { withPluginApi } from "discourse/lib/plugin-api";
import LexicalEditor from "../components/lexical-editor";
import LexicalAutocomplete from "../lexical/autocomplete";
import { registerLexicalExporter } from "../lexical/exporter";
import { registerMdastExtension } from "../lexical/exporter/extensions";
import { registerLexicalImporter } from "../lexical/importer";
import { registerLexicalNode } from "../lexical/nodes";

const EXTENSION_MAP = {
  nodes: registerLexicalNode,
  node: registerLexicalNode,
  importer: registerLexicalImporter,
  exporter: registerLexicalExporter,
  mdastExtension: registerMdastExtension,
};

function initializeLexical(api) {
  api.registerComposer({
    key: "lexical-rich",
    name: "Rich Editor", // TODO i18n
    component: LexicalEditor,
    textManipulationImpl: LexicalAutocomplete,
    handleExtension(extension) {
      // TODO: it currently depends on initialization order
      for (const key of Object.keys(extension)) {
        const registerFn = EXTENSION_MAP[key];

        registerFn?.(extension[key]);
      }
    },
  });
}

export default {
  name: "lexical-rich-editor",

  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");

    if (siteSettings.experimental_lexical_rich_editor) {
      withPluginApi("1.15.0", initializeLexical);
    }
  },
};
