/** Formato salvo na coluna JSONB `nodes`. A árvore é reconstruída a partir da ordem de inserção. */
import { buildFromSequence, preorder } from './tree';
import type { TreeNode, TreeType } from './types';

export const serializeNodes = (insertionOrder: number[], root?: TreeNode | null) =>
  root === undefined ? { version: 1, insertionOrder } : { version: 2, insertionOrder, preorder: preorder(root) };

/** A pré-ordem preserva a estrutura exata, inclusive após remoções e rotações. */
export function restoreTree(raw: unknown, type: TreeType): TreeNode | null {
  const order = deserializeNodes(raw);
  if (!order) throw new Error('Dados da árvore inválidos.');
  const data = raw as { version?: number; preorder?: unknown };
  if (data.version !== 2) return buildFromSequence(order, type);
  const snapshot = data.preorder;
  if (!Array.isArray(snapshot) || snapshot.length !== order.length ||
      !snapshot.every(Number.isSafeInteger) || new Set(snapshot).size !== snapshot.length ||
      snapshot.some((v) => !order.includes(v))) throw new Error('Estrutura da árvore inválida.');
  const tree = buildFromSequence(snapshot, 'BST');
  if (preorder(tree).some((v, i) => v !== snapshot[i])) throw new Error('Pré-ordem inválida.');
  return tree;
}

/** Valida dados vindos do banco; retorna null se estiverem malformados. */
export function deserializeNodes(raw: unknown): number[] | null {
  if (!raw || typeof raw !== 'object') return null;
  const order = (raw as { insertionOrder?: unknown }).insertionOrder;
  if (!Array.isArray(order) || order.length > 5000) return null;
  return order.every((v) => Number.isSafeInteger(v)) ? (order as number[]) : null;
}
