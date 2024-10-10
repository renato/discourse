export function registerNode(node) {
  NODES[node.type] = node;
}

export function getNodes() {
  return NODES;
}

const NODES = {};
