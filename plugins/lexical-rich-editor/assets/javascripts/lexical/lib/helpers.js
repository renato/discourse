import { $isAtNodeEnd, $setBlocksType } from "@lexical/selection";
import {
  $getNodeByKey,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRangeSelection,
} from "lexical";

export function getSelectedNode(selection) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
  }
}

export function insertNode(editor, createNodeFn) {
  editor.update(() => {
    // TODO within a code block (+ others) it should insert the node to the parent
    $insertNodes([createNodeFn()]);
  });
}

export function updateNode(editor, createNodeFn) {
  editor.update(() => {
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

export function moveNode(editor, selection, direction) {
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

export function getDOMRange(nativeSelection, rootElement) {
  const domRange = nativeSelection.getRangeAt(0);

  let range;

  if (nativeSelection.anchorNode === rootElement) {
    let inner = rootElement;
    while (inner.firstElementChild != null) {
      inner = inner.firstElementChild;
    }
    range = inner;
  } else {
    range = domRange;
  }

  return range;
}
