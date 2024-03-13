import { createHeadlessEditor as _createHeadlessEditor } from "@lexical/headless";
import { getLexicalNodes } from "../nodes";

function createHeadlessEditor(nodes = getLexicalNodes()) {
  return _createHeadlessEditor({ nodes });
}

export { createHeadlessEditor };
