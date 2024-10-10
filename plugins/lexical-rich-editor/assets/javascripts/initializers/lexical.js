import { withPluginApi } from "discourse/lib/plugin-api";
import LexicalEditor from "../components/lexical-editor";
import LexicalAutocomplete from "../lexical/autocomplete";

export default {
  name: "lexical-rich-editor",
  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");

    if (siteSettings.experimental_lexical_rich_editor) {
      withPluginApi("1.15.0", (api) => {
        api.registerComposer({
          key: "lexical-rich",
          name: "Lexical Rich", // TODO i18n
          component: LexicalEditor,
          textManipulationImpl: LexicalAutocomplete,
        });
      });
    }
  },
};
