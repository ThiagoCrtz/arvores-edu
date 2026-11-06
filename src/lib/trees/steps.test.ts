import { describe, expect, it } from 'vitest';
import { buildInsertionFrames } from './steps';
import { buildFromSequence, inorder, preorder } from './tree';

describe('quadros da inserção passo a passo', () => {
  it('AVL: inserção com rotação gera quadro pré e pós-rotação', () => {
    const f = buildInsertionFrames([30, 20, 10], 'AVL');
    expect(f).toHaveLength(5); // início + 1 + 1 + 2
    expect(f[3].root!.value).toBe(30); // desbalanceada
    expect(f[4].root!.value).toBe(20); // rebalanceada
    expect(f[4].lines[0]).toContain('LL');
  });
  it('BST: um quadro por inserção e resultado final correto', () => {
    const seq = [50, 30, 70, 20, 40, 60, 80];
    const f = buildInsertionFrames(seq, 'BST');
    expect(f).toHaveLength(seq.length + 1);
    expect(preorder(f.at(-1)!.root)).toEqual(preorder(buildFromSequence(seq, 'BST')));
  });
  it('duplicata mantém a árvore', () => {
    const f = buildInsertionFrames([5, 5], 'AVL');
    expect(inorder(f[2].root)).toEqual([5]);
    expect(f[2].lines.at(-1)).toContain('já existe');
  });
});
