import { getNodeFactoryFn } from "./nodes";

export default class TiptapComposer {
  #editor;
  #root;

  // This is specific to creating nodes through the parser, could be moved elsewhere
  #linkMark;

  constructor(editor) {
    this.#editor = editor;

    this.#root = this.createNode("root");
  }

  getRoot() {
    return this.#root;
  }

  isRootNode(node) {
    return node === this.getRoot();
  }

  createNode(nodeType, ...args) {
    // Link is a mark, not a node; we delay the link info to the next text node
    if (nodeType === "link") {
      const [href] = args;
      this.#linkMark = this.#editor.schema.marks.link.create({ href });
      return;
    }

    if (nodeType === "text" && this.#linkMark) {
      const linkMark = this.#linkMark;

      // we're ignoring any passed formatting in this case
      const [content] = args;
      const pmNode = this.#editor.schema.text(content, [linkMark]);
      return getNodeFactoryFn("link")(this.#editor, pmNode);
    }

    return getNodeFactoryFn(nodeType)(this.#editor, ...args);
  }

  shouldSkipNode(parentNode, nodeType, isOpening) {
    // Hacky, I know
    if (!isOpening && nodeType === "link" && this.#linkMark) {
      this.#linkMark = null;

      return true;
    }

    return false;
  }
}
