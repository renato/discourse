import { Node as ProseMirrorNode } from "@tiptap/pm/model";

const MARKS_MAP = {
  bold: "bold",
  italic: "italic",
  code: "code",
  strikethrough: "strike",
};

class Node {
  // https://prosemirror.net/docs/ref/#model.Node
  pmNode;
  children = [];

  editor;

  constructor(editor, pmNodeOrAttrs, formatting) {
    if (new.target === Node) {
      throw new TypeError("Cannot instance a Node directly");
    }

    this.editor = editor;

    const marks =
      formatting?.map((mark) => this.editor.schema.mark(MARKS_MAP[mark])) ??
      null;

    if (pmNodeOrAttrs instanceof ProseMirrorNode) {
      this.pmNode = pmNodeOrAttrs.toJSON();
    } else {
      if (this.tipTapType === "text") {
        this.pmNode = this.editor.schema.text(pmNodeOrAttrs, marks).toJSON();
        return;
      }

      const pmNodeFactory = this.editor.schema.nodes[this.tipTapType];

      if (!pmNodeFactory) {
        throw new Error(`Node type "${this.tipTapType}" is not defined.`);
      }

      this.pmNode = pmNodeFactory.create(pmNodeOrAttrs, null, marks).toJSON();
    }
  }

  get tipTapType() {
    throw new Error("must be implemented by the subclass");
  }

  getType() {
    return this.type;
  }

  getChildren() {
    return this.children;
  }

  getChildrenSize() {
    return this.pmNode.childCount;
  }

  append(child) {
    if (!(child instanceof Node)) {
      throw new TypeError("Child must be an instance of Node");
    }

    this.children.push(child);

    if (!this.pmNode.content) {
      this.pmNode.content = [];
    }

    this.pmNode.content.push(child.pmNode);
    return this;
  }

  remove() {
    // TODO
  }

  hasFormat(format) {
    return this.pmNode.marks?.some(
      (mark) => mark.type.name === MARKS_MAP[format]
    );
  }

  getTextContent() {
    return this.pmNode.text;
  }
}

function createNodeClass(type, tipTapType = type) {
  return class extends Node {
    constructor(...args) {
      super(...args);
    }
    get type() {
      return type;
    }
    get tipTapType() {
      return tipTapType;
    }
  };
}

export function getNodeClasses() {
  return Object.values(NODES).map((node) => node.class);
}

export function getNodeClass(type) {
  const node = NODES[type];

  if (!node) {
    throw new Error(`Node type "${type}" is not defined.`);
  }

  return NODES[type].class;
}

export function getNodeFactoryFn(type) {
  const node = NODES[type];

  if (!node) {
    throw new Error(`Node type "${type}" is not defined.`);
  }

  return node.factory ?? ((...args) => new NODES[type].class(...args));
}

export function defineNodeClasses(nodes) {
  for (const [name, node] of Object.entries(nodes)) {
    const classDefinition = defineNodeClass(node);
    const factory = (...args) => new classDefinition(...args);

    // TODO re-enable this once we have a way to register custom nodes
    NODES[name] = { class: classDefinition, factory };
  }

  return getNodeClasses();
}

function defineNodeClass(nodeConfig) {
  // TODO
}

const NODES = {
  root: { class: createNodeClass("root", "doc") },
  paragraph: { class: createNodeClass("paragraph") },
  text: { class: createNodeClass("text") },

  heading: {
    class: class extends createNodeClass("heading") {
      constructor() {
        super(...arguments);
      }
      getTag() {
        // TODO remove this from here, workaround to support exporting a heading
        //   just reusing the way Lexical stores this info

        return `h${this.pmNode.attrs.level}`;
      }
    },
    factory: (editor, tag) =>
      new NODES.heading.class(editor, { level: Number(tag[1]) }),
  },

  link: {
    class: class extends createNodeClass("link", "text") {
      constructor() {
        super(...arguments);
      }

      getTitle() {
        return this.pmNode.marks[0].attrs.title;
      }

      getURL() {
        return this.pmNode.marks[0].attrs.href;
      }

      getChildren() {
        // workaround so exporting this node also exports a text child
        return [new NODES.text.class(this.editor, this.pmNode.text)];
      }
    },
  },

  quote: { class: createNodeClass("quote", "blockquote") },

  horizontalRule: { class: createNodeClass("horizontalRule") },
};
