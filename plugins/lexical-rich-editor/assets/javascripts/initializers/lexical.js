import { $getSelection } from "lexical";
import { withPluginApi } from "discourse/lib/plugin-api";
import LexicalEditor from "../components/lexical-editor";
import Editor from "../lexical/editor";
import { registerLexicalExporter } from "../lexical/exporter";
import { registerMdastExtension } from "../lexical/exporter/extensions";
import { registerLexicalImporter } from "../lexical/importer";
import { getDOMRange, getSelectedNode } from "../lexical/lib/helpers";
import { registerLexicalNode } from "../lexical/nodes";
import {
  $createMentionNode,
  $isMentionNode,
} from "../lexical/nodes/mention-node";

// TODO remove this singleton
let engine;

function getWord(selection) {
  const anchor = selection.anchor;

  if (!anchor || anchor.type !== "text") {
    return null;
  }

  const anchorNode = anchor.getNode();
  if (!$isMentionNode(anchorNode)) {
    return null;
  }

  const anchorOffset = anchor.offset;
  const lastSpace =
    anchorNode.getTextContent().lastIndexOf(" ", anchorOffset) + 1;
  return anchorNode.getTextContent().slice(lastSpace, anchorOffset);
}

const EXTENSION_MAP = {
  nodes: registerLexicalNode,
  node: registerLexicalNode,
  importer: registerLexicalImporter,
  exporter: registerLexicalExporter,
  mdastExtension: registerMdastExtension,
};

const textManipulationImpl = {
  putCursorAtEnd() {
    // TODO
  },
  getValue(me) {
    // TODO
  },
  performAutocomplete({
    event,
    options,
    state,
    updateAutoComplete,
    dataSource,
  }) {
    engine.getEditorState().read(async () => {
      const selection = $getSelection();
      if (!selection) {
        return;
      }

      state.completeStart = 0;

      const term = getWord(selection) ?? "";
      updateAutoComplete(dataSource(term, options));

      event.preventDefault();
    });
  },
  completeTerm({ term }) {
    engine.update(() => {
      const mentionNode = $createMentionNode(`@${term}`);
      const selection = $getSelection();
      const node = getSelectedNode(selection);
      node.replace(mentionNode);
      mentionNode.selectEnd();
    });
  },
  getCaretPosition() {
    return engine.getEditorState().read(() => {
      const range = window.getSelection().getRangeAt(0);

      const rect = range.getBoundingClientRect();
      const rootRect = engine.getRootElement().getBoundingClientRect();

      return {
        left: rect.left - rootRect.left,
        top: rect.top - rootRect.top,
      };
    });
  }
};

function initializeLexical(api) {
  api.registerComposer({
    key: "lexical-rich",
    name: "Rich Editor",
    component: LexicalEditor,
    componentInit() {
      const editor = new Editor();
      engine = editor.engine;
      return { editor };
    },
    textManipulationImpl,
    handleExtension(extension) {
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
