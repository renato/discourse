import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isRootNode,
  FORMAT_TEXT_COMMAND,
} from "lexical";
import { getNodeFactoryFn } from "./nodes";

export default class LexicalComposer {
  editor;

  constructor(editor) {
    this.editor = editor;
  }

  insertNode(createNodeFn, ...args) {
    this.editor.update(() => {
      // TODO within a code block (+ others) it should insert the node to the parent
      $insertNodes([createNodeFn(...args)]);
    });
  }

  insertList(listType) {
    // TODO
  }

  createNode(nodeType, ...args) {
    return getNodeFactoryFn(nodeType)(...args);
  }

  replaceNodes(nodeType, ...args) {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $wrapNodes(selection, () => createNode(nodeType, ...args));
    }
  }

  indent() {
    const node = $getSelection().anchor.getNode();
    const listItem = $getNearestNodeOfType(node, ListItemNode);
    // TODO max 1 level from parent
    listItem.setIndent(listItem.getIndent() + 1);
  }

  outdent() {
    this.editor.update(() => {
      const selection = $getSelection();
      const node = selection.anchor.getNode();
      const listItem = $getNearestNodeOfType(node, ListItemNode);
      if (listItem.getIndent() === 0) {
        $setBlocksType(selection, () => {
          const paragraphNode = $createParagraphNode();
          paragraphNode.select();
          return paragraphNode;
        });

        return;
      }

      listItem.setIndent(listItem.getIndent() - 1);
    });
  }

  moveSelectedNode(direction) {
    const selection = $getSelection();

    let node;

    if ($isRangeSelection(selection)) {
      node = selection.anchor.getNode();
    } else if ($isNodeSelection(selection)) {
      const nodes = selection.getNodes();
      if (nodes && nodes.length > 0) {
        node = nodes[0];
      }
    } else {
      return false;
    }

    node = node.getParent();

    let currentBlockKey, siblingKey;

    if (node) {
      currentBlockKey = node.getKey();
    }

    if (!currentBlockKey) {
      return false;
    }

    let sameLevelKeys = node.getParent().getChildrenKeys();
    if (direction === "DOWN") {
      sameLevelKeys = sameLevelKeys.reverse();
    }

    let previousKey;
    for (const sameLevelKey of sameLevelKeys) {
      if (sameLevelKey === currentBlockKey) {
        siblingKey = previousKey;
        break;
      }

      previousKey = sameLevelKey;
    }

    if (currentBlockKey && siblingKey) {
      const currentNode = $getNodeByKey(currentBlockKey);
      const targetNode = $getNodeByKey(siblingKey);

      if (direction === "UP") {
        targetNode.insertBefore(currentNode);
      } else if (direction === "DOWN") {
        targetNode.insertAfter(currentNode);
      }
    }
  }

  quoteSelection() {
    this.engine.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const hasAnyQuoteNode = selection.getNodes().some($isQuoteNode);
        if (hasAnyQuoteNode) {
          // TODO: it only works if the selection is exactly 1+ quote nodes, so
          // selecting the inner text of a single quote node sometimes don't trigger this flow
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      }
    });
  }

  undo() {
    this.editor.dispatchCommand(UNDO_COMMAND);
  }

  redo() {
    this.engine.dispatchCommand(REDO_COMMAND);
  }

  updateNode(createNodeFn) {
    this.editor.update(() => {
      let selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => createNodeFn());
      } else {
        const textContent = selection.getTextContent();
        const node = createNodeFn();
        selection.insertNodes([node]);
        selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertRawText(textContent);
        }
      }
    });
  }

  format(formatType) {
    this.editor.dispatchCommand(FORMAT_TEXT_COMMAND, formatType);
  }

  /**
   * Below this part we're abstracting Lexical
   * TODO: rethink this entire file after a minimal implementation is working
   */

  getRoot() {
    return $getRoot();
  }

  isRootNode(node) {
    return $isRootNode(node);
  }

  // Used exclusively when parsing markdown-it tokens
  // Lexical quote doesn't work great with an inner paragraph
  shouldSkipNode(parentNode, nodeType) {
    return parentNode.getType() === "quote" && nodeType === "paragraph";
  }
}
