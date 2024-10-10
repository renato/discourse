import { withPluginApi } from "discourse/lib/plugin-api";
import ProsemirrorEditor from "../components/prosemirror-editor";
import ProsemirrorAutocomplete from "../prosemirror/autocomplete";

export default {
  name: "prosemirror-rich-editor",
  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");

    if (siteSettings.experimental_prosemirror_rich_editor) {
      withPluginApi("1.15.0", (api) => {
        api.registerComposer({
          key: "prosemirror-rich",
          name: "ProseMirror Rich", // TODO i18n
          component: ProsemirrorEditor,
          textManipulationImpl: ProsemirrorAutocomplete,
        });
      });
    }
  },
};
