import { describe, expect, it } from 'vitest';
import { balanceFactor, buildFromSequence, height, inorder, insert, postorder, preorder, remove, size } from './tree';
import type { TreeNode } from './types';

const rotationOf = (seq: number[]) => {
  let root: TreeNode | null = null;
  const rots: string[] = [];
  for (const v of seq) {
    const r = insert(root, v, 'AVL');
    root = r.root;
    r.events.forEach((e) => e.kind === 'rotation' && rots.push(e.type));
  }
  return { root, rots };
};

function assertValid(n: TreeNode | null, avl: boolean, lo = -Infinity, hi = Infinity) {
  if (!n) return;
  const fail = (m: string) => { throw new Error(`${m} no nó ${n.value}`); };
  if (!(n.value > lo && n.value < hi)) fail('ordem BST violada');
  if (n.height !== 1 + Math.max(height(n.left), height(n.right))) fail('altura incorreta');
  if (avl && Math.abs(balanceFactor(n)) > 1) fail('desbalanceado');
  assertValid(n.left, avl, lo, n.value);
  assertValid(n.right, avl, n.value, hi);
}

describe('rotações AVL', () => {
  it.each([
    ['LL', [30, 20, 10]],
    ['RR', [10, 20, 30]],
    ['LR', [30, 10, 20]],
    ['RL', [10, 30, 20]],
  ])('%s', (type, seq) => {
    const { root, rots } = rotationOf(seq as number[]);
    expect(rots).toEqual([type]);
    expect(root!.value).toBe(20);
    expect(root!.left!.value).toBe(10);
    expect(root!.right!.value).toBe(30);
  });
});

describe('BST', () => {
  it('não rebalanceia e rejeita duplicatas', () => {
    const root = buildFromSequence([10, 20, 30], 'BST');
    expect(root!.value).toBe(10);
    expect(height(root)).toBe(3);
    const dup = insert(root, 20, 'BST');
    expect(dup.changed).toBe(false);
    expect(dup.events.at(-1)).toEqual({ kind: 'duplicate', value: 20 });
  });
  it('remove folha, nó com um filho e nó com dois filhos', () => {
    let root = buildFromSequence([50, 30, 70, 20, 40, 60, 80], 'BST');
    root = remove(root, 20, 'BST').root;
    root = remove(root, 30, 'BST').root; // um filho (40)
    expect(inorder(root)).toEqual([40, 50, 60, 70, 80]);
    root = remove(root, 50, 'BST').root; // dois filhos -> sucessor 60
    expect(root!.value).toBe(60);
    expect(remove(root, 999, 'BST').changed).toBe(false);
  });
});

describe('percursos', () => {
  const root = buildFromSequence([50, 30, 70, 20, 40, 60, 80], 'AVL');
  it('pré, em e pós-ordem', () => {
    expect(preorder(root)).toEqual([50, 30, 20, 40, 70, 60, 80]);
    expect(inorder(root)).toEqual([20, 30, 40, 50, 60, 70, 80]);
    expect(postorder(root)).toEqual([20, 40, 30, 60, 80, 70, 50]);
  });
});

describe('AVL aleatória (propriedade)', () => {
  it('mantém ordem, alturas e balanceamento após inserir e remover', () => {
    for (let t = 0; t < 30; t++) {
      let root: TreeNode | null = null;
      const set = new Set<number>();
      for (let i = 0; i < 200; i++) {
        const v = Math.floor(Math.random() * 300);
        root = insert(root, v, 'AVL').root;
        set.add(v);
      }
      assertValid(root, true);
      for (const v of [...set].filter(() => Math.random() < 0.6)) {
        root = remove(root, v, 'AVL').root;
        set.delete(v);
        assertValid(root, true);
      }
      expect(inorder(root)).toEqual([...set].sort((a, b) => a - b));
      expect(size(root)).toBe(set.size);
    }
  });
  it('altura logarítmica com entrada ordenada', () => {
    const root = buildFromSequence(Array.from({ length: 1023 }, (_, i) => i), 'AVL');
    expect(height(root)).toBe(10);
  });
});
