import { layoutTree } from '@/lib/layout/layout';
import type { TreeNode } from '@/lib/trees/types';

/** Miniatura estática de uma árvore (para os cartões de "Minhas Árvores"). */
export default function MiniTree({ root }: { root: TreeNode | null }) {
  const { nodes, edges } = layoutTree(root);
  if (!nodes.length) return <div className="grid h-28 place-items-center text-xs text-neutral-500">Árvore vazia</div>;
  const pos = new Map(nodes.map((n) => [n.value, n]));
  const pad = 30;
  const w = Math.max(...nodes.map((n) => n.x)) + pad * 2;
  const h = Math.max(...nodes.map((n) => n.y)) + pad * 2;
  return (
    <svg viewBox={`${-pad} ${-pad} ${w} ${h}`} className="h-28 w-full" role="img" aria-label="Pré-visualização da árvore">
      {edges.map((e) => {
        const a = pos.get(e.from)!, b = pos.get(e.to)!;
        return <line key={`${e.from}-${e.to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#475569" strokeWidth={3} />;
      })}
      {nodes.map((n) => <circle key={n.value} cx={n.x} cy={n.y} r={11} fill="#1e293b" stroke="#6366f1" strokeWidth={3} />)}
    </svg>
  );
}
