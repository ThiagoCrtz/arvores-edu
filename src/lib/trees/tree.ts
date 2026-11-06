import type { OperationResult, RotationType, TreeEvent, TreeNode, TreeType } from './types';

export const height = (n: TreeNode | null): number => (n ? n.height : 0);
export const balanceFactor = (n: TreeNode | null): number =>
  n ? height(n.left) - height(n.right) : 0;

const mk = (value: number, left: TreeNode | null, right: TreeNode | null): TreeNode => ({
  value,
  left,
  right,
  height: 1 + Math.max(height(left), height(right)),
});

export function rotateRight(y: TreeNode): TreeNode {
  const x = y.left!;
  return mk(x.value, x.left, mk(y.value, x.right, y.right));
}

export function rotateLeft(x: TreeNode): TreeNode {
  const y = x.right!;
  return mk(y.value, mk(x.value, x.left, y.left), y.right);
}

function rebalance(n: TreeNode, events: TreeEvent[]): TreeNode {
  const bf = balanceFactor(n);
  const emit = (type: RotationType, pivot: number) =>
    events.push({ kind: 'rotation', type, node: n.value, balance: bf, pivot });

  if (bf > 1) {
    if (balanceFactor(n.left) >= 0) {
      emit('LL', n.left!.value);
      return rotateRight(n);
    }
    emit('LR', n.left!.right!.value);
    return rotateRight(mk(n.value, rotateLeft(n.left!), n.right));
  }
  if (bf < -1) {
    if (balanceFactor(n.right) <= 0) {
      emit('RR', n.right!.value);
      return rotateLeft(n);
    }
    emit('RL', n.right!.left!.value);
    return rotateLeft(mk(n.value, n.left, rotateRight(n.right!)));
  }
  return n;
}

export function insert(root: TreeNode | null, value: number, type: TreeType): OperationResult {
  const events: TreeEvent[] = [];
  let changed = true;

  const go = (n: TreeNode | null): TreeNode => {
    if (!n) {
      events.push({ kind: 'inserted', value });
      return mk(value, null, null);
    }
    if (value === n.value) {
      events.push({ kind: 'duplicate', value });
      changed = false;
      return n;
    }
    const direction = value < n.value ? 'left' : 'right';
    events.push({ kind: 'compare', node: n.value, target: value, direction });
    const next =
      direction === 'left' ? mk(n.value, go(n.left), n.right) : mk(n.value, n.left, go(n.right));
    return changed && type === 'AVL' ? rebalance(next, events) : next;
  };

  const newRoot = go(root);
  return { root: changed ? newRoot : root, events, changed };
}

export function remove(root: TreeNode | null, value: number, type: TreeType): OperationResult {
  const events: TreeEvent[] = [];
  let changed = true;

  const minNode = (n: TreeNode): TreeNode => (n.left ? minNode(n.left) : n);

  const go = (n: TreeNode | null, v: number): TreeNode | null => {
    if (!n) {
      events.push({ kind: 'not-found', value });
      changed = false;
      return null;
    }
    let next: TreeNode | null;
    if (v < n.value) {
      events.push({ kind: 'compare', node: n.value, target: v, direction: 'left' });
      next = mk(n.value, go(n.left, v), n.right);
    } else if (v > n.value) {
      events.push({ kind: 'compare', node: n.value, target: v, direction: 'right' });
      next = mk(n.value, n.left, go(n.right, v));
    } else {
      if (v === value) events.push({ kind: 'removed', value });
      if (!n.left) return n.right;
      if (!n.right) return n.left;
      const succ = minNode(n.right); // sucessor em ordem
      events.push({ kind: 'successor', removed: n.value, successor: succ.value });
      next = mk(succ.value, n.left, go(n.right, succ.value));
    }
    if (!changed) return n;
    return type === 'AVL' && next ? rebalance(next, events) : next;
  };

  const newRoot = go(root, value);
  return { root: changed ? newRoot : root, events, changed };
}

export function size(n: TreeNode | null): number {
  return n ? 1 + size(n.left) + size(n.right) : 0;
}

export const preorder = (n: TreeNode | null): number[] =>
  n ? [n.value, ...preorder(n.left), ...preorder(n.right)] : [];
export const inorder = (n: TreeNode | null): number[] =>
  n ? [...inorder(n.left), n.value, ...inorder(n.right)] : [];
export const postorder = (n: TreeNode | null): number[] =>
  n ? [...postorder(n.left), ...postorder(n.right), n.value] : [];

/** Insere uma sequência na ordem dada (a ordem de inserção é independente dos percursos). */
export function buildFromSequence(values: number[], type: TreeType): TreeNode | null {
  return values.reduce<TreeNode | null>((r, v) => insert(r, v, type).root, null);
}
