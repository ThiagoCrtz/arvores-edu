export type AdvancedKind = 'rb' | 'b' | 'bplus';
export interface AdvancedNode {
  keys: number[];
  children: AdvancedNode[];
  red?: boolean;
}

// Árvore rubro-negra com ligações vermelhas à esquerda.
function isRed(n: AdvancedNode | undefined) { return !!n?.red; }
function rotateLeft(h: AdvancedNode): AdvancedNode {
  const x = h.children[1];
  h.children[1] = x.children[0];
  x.children[0] = h;
  x.red = h.red; h.red = true;
  return x;
}
function rotateRight(h: AdvancedNode): AdvancedNode {
  const x = h.children[0];
  h.children[0] = x.children[1];
  x.children[1] = h;
  x.red = h.red; h.red = true;
  return x;
}
function insertRB(h: AdvancedNode | undefined, value: number): AdvancedNode {
  if (!h) return { keys: [value], children: [], red: true };
  if (value < h.keys[0]) h.children[0] = insertRB(h.children[0], value);
  else if (value > h.keys[0]) h.children[1] = insertRB(h.children[1], value);
  if (isRed(h.children[1]) && !isRed(h.children[0])) h = rotateLeft(h);
  if (isRed(h.children[0]) && isRed(h.children[0]?.children[0])) h = rotateRight(h);
  if (isRed(h.children[0]) && isRed(h.children[1])) {
    h.red = !h.red;
    h.children[0].red = !h.children[0].red;
    h.children[1].red = !h.children[1].red;
  }
  return h;
}

// Nós comportam até três chaves. Na B+ os valores vivem apenas nas folhas.
function insertMulti(node: AdvancedNode, value: number, plus: boolean): { key: number; right: AdvancedNode } | null {
  if (node.children.length === 0) {
    node.keys.push(value); node.keys.sort((a, b) => a - b);
  } else {
    let i = 0;
    while (i < node.keys.length && (plus ? value >= node.keys[i] : value > node.keys[i])) i++;
    const split = insertMulti(node.children[i], value, plus);
    if (split) { node.keys.splice(i, 0, split.key); node.children.splice(i + 1, 0, split.right); }
  }
  if (node.keys.length <= 3) return null;
  if (plus && node.children.length === 0) {
    const right = { keys: node.keys.splice(2), children: [] };
    return { key: right.keys[0], right };
  }
  const key = node.keys[2];
  const right: AdvancedNode = { keys: node.keys.splice(3), children: node.children.splice(3) };
  node.keys.splice(2, 1);
  return { key, right };
}

export function buildAdvanced(values: number[], kind: AdvancedKind): AdvancedNode | null {
  let root: AdvancedNode | null = null;
  for (const value of [...new Set(values)]) {
    if (kind === 'rb') {
      root = insertRB(root ?? undefined, value);
      root.red = false;
    } else {
      if (!root) root = { keys: [], children: [] };
      const split = insertMulti(root, value, kind === 'bplus');
      if (split) root = { keys: [split.key], children: [root, split.right] };
    }
  }
  return root;
}
