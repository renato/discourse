import { $createLinkNode, LinkNode } from "@lexical/link";
import {
  $createListItemNode,
  $createListNode,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
  HeadingNode,
  QuoteNode,
} from "@lexical/rich-text";
import {
  $createTableCellNode,
  $createTableNode,
  $createTableRowNode,
  TableCellNode,
  TableNode,
  TableRowNode,
} from "@lexical/table";
import {
  $createParagraphNode,
  $createTextNode,
  DecoratorNode,
  ElementNode,
  ParagraphNode,
  TextNode,
} from "lexical";
import {
  $createHorizontalRuleNode,
  HorizontalRuleNode,
} from "./nodes/horizontal-rule-node";
import { $createRawNode, RawNode } from "./nodes/raw-node";

/*
  We're not encapsulating the node classes in a Discourse-managed class like with TipTap's impl
  TODO: Encapsulate it for full control of the Discourse-exposed Node API
 */

const NODES = {
  paragraph: { class: ParagraphNode, factory: $createParagraphNode },
  text: {
    class: TextNode,
    factory: (content, formatting) => {
      const node = $createTextNode(content);
      formatting?.forEach((format) => node.toggleFormat(format));
      return node;
    },
  },
  heading: { class: HeadingNode, factory: $createHeadingNode },
  quote: { class: QuoteNode, factory: $createQuoteNode },
  list: { class: ListNode, factory: $createListNode },
  listItem: { class: ListItemNode, factory: $createListItemNode },
  table: { class: TableNode, factory: $createTableNode },
  tableRow: { class: TableRowNode, factory: $createTableRowNode },
  tableCell: { class: TableCellNode, factory: $createTableCellNode },
  link: { class: LinkNode, factory: $createLinkNode },
  raw: { class: RawNode, factory: $createRawNode },
  horizontalRule: {
    class: HorizontalRuleNode,
    factory: $createHorizontalRuleNode,
  },
};

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

  return node.factory;
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
  const {
    type,
    attributes = [],
    createDOM,
    updateDOM,
    exportDOM,
    component, // Only used if it's a DecoratorNode
    initialize,
  } = nodeConfig;

  // Choose the superclass based on whether a component is provided
  const BaseClass = component ? DecoratorNode : ElementNode;

  return class extends BaseClass {
    static getType() {
      return type;
    }

    static clone(node) {
      const clonedAttrs = {};
      attributes.forEach((attr) => {
        clonedAttrs[attr] = node[`__${attr}`];
      });
      return new this(clonedAttrs, node.__key);
    }

    static importJSON(serializedNode) {
      const attrs = {};
      attributes.forEach((attr) => {
        attrs[attr] = serializedNode[attr];
      });
      return new this(attrs);
    }

    constructor(attrs = {}, key) {
      super(key);
      attributes.forEach((attr) => {
        this[`__${attr}`] = attrs[attr] || null;
      });
      if (initialize) {
        initialize.call(this);
      }
    }

    get type() {
      return type;
    }

    createDOM(config) {
      return createDOM
        ? createDOM.call(this, config)
        : document.createElement(type);
    }

    updateDOM(prevNode, dom) {
      if (updateDOM) {
        return updateDOM.call(this, prevNode, dom);
      }
      return false;
    }

    exportDOM() {
      return exportDOM
        ? exportDOM.call(this)
        : { element: document.createElement(type) };
    }

    exportJSON() {
      const json = {
        ...super.exportJSON(),
        type,
        version: 1,
      };
      attributes.forEach((attr) => {
        json[attr] = this[`__${attr}`];
      });
      return json;
    }

    decorate() {
      if (component) {
        return { component, data: this };
      }
      return super.decorate ? super.decorate() : null;
    }
  };
}
