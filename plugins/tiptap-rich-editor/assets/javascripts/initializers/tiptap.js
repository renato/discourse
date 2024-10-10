import { withPluginApi } from "discourse/lib/plugin-api";
import TiptapEditor from "../components/tiptap-editor";
import TiptapAutocomplete from "../tiptap/autocomplete";

export default {
  name: "tiptap-rich-editor",
  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");

    if (siteSettings.experimental_tiptap_rich_editor) {
      withPluginApi("1.15.0", (api) => {
        api.registerComposer({
          key: "tiptap-rich",
          name: "TipTap Rich", // TODO i18n
          component: TiptapEditor,
          textManipulationImpl: TiptapAutocomplete,
        });
      });
    }
  },
};
