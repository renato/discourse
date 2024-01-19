import { ElementNode } from "lexical-editor/lexical";

export function convertDetailsElement(domNode) {
  const isOpen = domNode.open !== undefined ? domNode.open : true;
  const node = $createDetailsNode(isOpen);
  return {
    node,
  };
}

export class DetailsNode extends ElementNode {
  static getType() {
    return "details";
  }
  static clone(node) {
    return new DetailsNode(node.__open, node.__key);
  }
  static importDOM() {
    return {
      details: () => {
        return {
          conversion: convertDetailsElement,
          priority: 1,
        };
      },
    };
  }
  static importJSON(serializedNode) {
    const node = $createDetailsNode(serializedNode.open);
    return node;
  }
  constructor(open, key) {
    super(key);
    this.__open = open;
  }

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
  }

  updateDOM(prevNode, dom) {
    if (prevNode.__open !== this.__open) {
      dom.open = this.__open;
    }

    return false;
  }

  exportDOM() {
    const element = document.createElement("details");
    element.setAttribute("open", this.__open.toString());
    return { element };
  }

  exportJSON() {
    return {
      ...super.exportJSON(),
      open: this.__open,
      type: "details",
      version: 1,
    };
  }

  setOpen(open) {
    const writable = this.getWritable();
    writable.__open = open;
  }

  getOpen() {
    return this.getLatest().__open;
  }

  toggleOpen() {
    this.setOpen(!this.getOpen());
  }
}

export function $createDetailsNode(isOpen = true) {
  return new DetailsNode(isOpen);
}

export function $isDetailsNode(node) {
  return node instanceof DetailsNode;
}
