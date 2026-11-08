import { describe, expect, it } from 'vitest';
import { buildAdvanced, type AdvancedNode } from './advanced';

describe('estruturas avançadas', () => {
  const values = [40, 20, 60, 10, 30, 50, 70, 25, 35, 5, 15, 45, 55, 65, 80, 1, 90];
  it('mantém as propriedades de uma árvore rubro-negra', () => {
    const root = buildAdvanced(values, 'rb')!;
    expect(root.red).toBe(false);
    function check(n: AdvancedNode | undefined, min: number, max: number): number {
      if (!n) return 1;
      expect(n.keys[0]).toBeGreaterThan(min); expect(n.keys[0]).toBeLessThan(max);
      if (n.red) { expect(!!n.children[0]?.red).toBe(false); expect(!!n.children[1]?.red).toBe(false); }
      const left = check(n.children[0], min, n.keys[0]);
      const right = check(n.children[1], n.keys[0], max);
      expect(left).toBe(right);
      return left + (n.red ? 0 : 1);
    }
    check(root, -Infinity, Infinity);
  });
  for (const kind of ['b', 'bplus'] as const) it(`mantém nós ordenados e folhas na mesma profundidade: ${kind}`, () => {
    const root = buildAdvanced(values, kind)!;
    const depths: number[] = [];
    const seen: number[] = [];
    function walk(node: AdvancedNode, depth: number) {
      expect(node.keys.length).toBeGreaterThan(0); expect(node.keys.length).toBeLessThanOrEqual(3);
      expect(node.keys).toEqual([...node.keys].sort((a,b)=>a-b));
      if (!node.children.length) { depths.push(depth); seen.push(...node.keys); }
      else { expect(node.children.length).toBe(node.keys.length + 1); if (kind === 'b') seen.push(...node.keys); node.children.forEach(c=>walk(c, depth+1)); }
    }
    walk(root, 0);
    expect(new Set(depths).size).toBe(1);
    expect(seen.sort((a,b)=>a-b)).toEqual([...values].sort((a,b)=>a-b));
  });
});
