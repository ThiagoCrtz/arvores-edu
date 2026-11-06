import { insert } from './tree';
import { explainEvent } from './explain';
import type { Highlight, TreeNode, TreeType } from './types';

export interface Frame {
  root: TreeNode | null;
  highlights: Record<number, Highlight>;
  lines: string[];
  title: string;
}

/**
 * Quadros da inserção passo a passo. Na AVL, uma inserção com rotação gera
 * dois quadros: a árvore desbalanceada e a árvore já rebalanceada.
 */
export function buildInsertionFrames(values: number[], type: TreeType): Frame[] {
  const frames: Frame[] = [
    { root: null, highlights: {}, lines: ['Árvore vazia. Avance para inserir o primeiro valor.'], title: 'Início' },
  ];
  let root: TreeNode | null = null;
  values.forEach((v, i) => {
    const r = insert(root, v, type);
    const title = `Inserção ${i + 1} de ${values.length}: valor ${v}`;
    const hl: Record<number, Highlight> = {};
    const lines: string[] = [];
    for (const e of r.events) {
      if (e.kind === 'compare') hl[e.node] = 'visit';
      else if (e.kind === 'inserted') hl[v] = 'new';
      else if (e.kind === 'duplicate') hl[v] = 'rotate';
      if (e.kind !== 'rotation') lines.push(explainEvent(e));
    }
    const rots = r.events.filter((e) => e.kind === 'rotation');
    if (type === 'AVL' && rots.length) {
      lines.push('Algum nó ficou com fator de balanceamento fora de [-1, +1]: é preciso rebalancear.');
      frames.push({ root: insert(root, v, 'BST').root, highlights: hl, lines, title });
      const hl2: Record<number, Highlight> = {};
      for (const rot of rots) if (rot.kind === 'rotation') { hl2[rot.node] = 'rotate'; hl2[rot.pivot] = 'rotate'; }
      frames.push({ root: r.root, highlights: hl2, lines: rots.map(explainEvent), title: `${title} — rebalanceamento` });
    } else {
      frames.push({ root: r.root, highlights: hl, lines, title });
    }
    root = r.root;
  });
  return frames;
}
