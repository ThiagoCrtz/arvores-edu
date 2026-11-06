import type { TreeNode } from '../trees/types';
import { balanceFactor } from '../trees/tree';

export interface PositionedNode { value: number; x: number; y: number; height: number; balance: number }
export interface PositionedEdge { from: number; to: number }

export const X_GAP = 58;
export const Y_GAP = 84;

/**
 * Layout por ordem: x = posição em-ordem, y = profundidade.
 * Garante que nenhum nó se sobreponha, qualquer que seja o formato da árvore.
 */
export function layoutTree(root: TreeNode | null) {
  const nodes: PositionedNode[] = [];
  const edges: PositionedEdge[] = [];
  let index = 0;
  const walk = (n: TreeNode | null, depth: number) => {
    if (!n) return;
    walk(n.left, depth + 1);
    nodes.push({ value: n.value, x: index++ * X_GAP, y: depth * Y_GAP, height: n.height, balance: balanceFactor(n) });
    walk(n.right, depth + 1);
    if (n.left) edges.push({ from: n.value, to: n.left.value });
    if (n.right) edges.push({ from: n.value, to: n.right.value });
  };
  walk(root, 0);
  return { nodes, edges };
}
