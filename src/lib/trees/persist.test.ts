import { describe, expect, it } from 'vitest';
import { deserializeNodes, serializeNodes, restoreTree } from './persist';
import { buildFromSequence, preorder, remove } from './tree';

describe('persistência', () => {
  it('preserva a estrutura após remoções, inclusive a troca pelo sucessor', () => {
    for (const type of ['BST', 'AVL'] as const) {
      const sequence = [50, 30, 70, 20, 40, 60, 80];
      const root = remove(buildFromSequence(sequence, type), 50, type).root;
      const saved = JSON.parse(JSON.stringify(serializeNodes(sequence.filter((v) => v !== 50), root)));
      expect(restoreTree(saved, type)).toEqual(root);
    }
  });
  it('rejeita snapshots inconsistentes', () => {
    expect(() => restoreTree({ version: 2, insertionOrder: [1], preorder: [2] }, 'BST')).toThrow();
  });
  it('ida e volta reconstrói a mesma árvore (BST e AVL)', () => {
    const seq = [10, 20, 30, 40, 50, 25];
    for (const t of ['BST', 'AVL'] as const) {
      const back = deserializeNodes(JSON.parse(JSON.stringify(serializeNodes(seq))))!;
      expect(preorder(buildFromSequence(back, t))).toEqual(preorder(buildFromSequence(seq, t)));
    }
  });
  it('rejeita dados malformados', () => {
    for (const bad of [null, 'x', {}, { insertionOrder: 'a' }, { insertionOrder: [1, 'b'] }, { insertionOrder: [1.5] }])
      expect(deserializeNodes(bad)).toBeNull();
  });
});
