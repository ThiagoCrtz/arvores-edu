'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import type { PositionedEdge, PositionedNode } from '@/lib/layout/layout';

import type { Highlight } from '@/lib/trees/types';
export type { Highlight };
const R = 22;
const COLORS: Record<Highlight | 'base', { fill: string; stroke: string }> = {
  base: { fill: '#171c17', stroke: '#5eead4' },
  visit: { fill: '#134e4a', stroke: '#ccfbf1' },
  new: { fill: '#115e59', stroke: '#99f6e4' },
  rotate: { fill: '#404040', stroke: '#ffffff' },
  done: { fill: '#123b38', stroke: '#5eead4' },
};

type Pos = Record<number, { x: number; y: number }>;

/** Interpola as posições (easing) para animar reorganizações da árvore. */
function useAnimatedPositions(nodes: PositionedNode[]) {
  const [pos, setPos] = useState<Pos>({});
  const current = useRef<Pos>({});
  const raf = useRef(0);

  useEffect(() => {
    const target: Pos = {};
    nodes.forEach((n) => (target[n.value] = { x: n.x, y: n.y }));
    for (const k of Object.keys(current.current)) if (!(k in target)) delete current.current[+k];
    for (const k of Object.keys(target)) if (!(k in current.current)) current.current[+k] = { ...target[+k] };

    const tick = () => {
      let moving = false;
      const next: Pos = {};
      for (const k of Object.keys(target)) {
        const c = current.current[+k], t = target[+k];
        const dx = t.x - c.x, dy = t.y - c.y;
        if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) { c.x += dx * 0.18; c.y += dy * 0.18; moving = true; }
        else { c.x = t.x; c.y = t.y; }
        next[+k] = { x: c.x, y: c.y };
      }
      setPos(next);
      if (moving) raf.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [nodes]);

  return pos;
}

interface Props {
  nodes: PositionedNode[];
  edges: PositionedEdge[];
  highlights: Record<number, Highlight>;
  showAvlInfo: boolean;
}

export default function TreeCanvas({ nodes, edges, highlights, showAvlInfo }: Props) {
  const pos = useAnimatedPositions(nodes);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 500 });
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [auto, setAuto] = useState(true);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fit = useCallback(() => {
    if (!nodes.length) return setView({ x: size.w / 2, y: 60, k: 1 });
    const maxX = Math.max(...nodes.map((n) => n.x)), maxY = Math.max(...nodes.map((n) => n.y));
    const w = maxX + R * 4, h = maxY + R * 4;
    const k = Math.min(1.2, size.w / w, size.h / h);
    setView({ k, x: size.w / 2 - (maxX / 2) * k, y: (size.h - maxY * k) / 2 });
  }, [nodes, size]);

  useEffect(() => { if (auto) fit(); }, [auto, fit]);

  const zoom = (f: number, cx = size.w / 2, cy = size.h / 2) => {
    setAuto(false);
    setView((v) => {
      const k = Math.min(3, Math.max(0.2, v.k * f));
      return { k, x: cx - ((cx - v.x) / v.k) * k, y: cy - ((cy - v.y) / v.k) * k };
    });
  };

  return (
    <div ref={box} className="relative h-full w-full touch-none select-none overflow-hidden rounded-xl border border-white/10 bg-[#0b0e0b]">
      <svg
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onWheel={(e) => { const r = e.currentTarget.getBoundingClientRect(); zoom(e.deltaY < 0 ? 1.1 : 0.9, e.clientX - r.left, e.clientY - r.top); }}
        onPointerDown={(e) => { drag.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
          drag.current = { x: e.clientX, y: e.clientY };
          setAuto(false);
          setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {edges.map((e) => {
            const a = pos[e.from], b = pos[e.to];
            if (!a || !b) return null;
            return <line key={`${e.from}-${e.to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#616b61" strokeWidth={2} />;
          })}
          {nodes.map((n) => {
            const p = pos[n.value];
            if (!p) return null;
            const c = COLORS[highlights[n.value] ?? 'base'];
            return (
              <g key={n.value} transform={`translate(${p.x} ${p.y})`}>
                <g className="node-pop">
                  <circle r={R} fill={c.fill} stroke={c.stroke} strokeWidth={2.5} style={{ transition: 'fill .25s, stroke .25s' }} />
                  <text textAnchor="middle" dy="0.35em" fontSize={14} fontWeight={600} fill="#f8fafc">{n.value}</text>
                  {showAvlInfo && (
                    <>
                      <text x={R + 4} y={-R + 6} fontSize={11} fill="#94a3b8">h={n.height}</text>
                      <text x={R + 4} y={R} fontSize={11} fill={Math.abs(n.balance) > 1 ? '#fb7185' : '#a5b4fc'}>fb={n.balance}</text>
                    </>
                  )}
                </g>
              </g>
            );
          })}
        </g>
      </svg>
      {!nodes.length && (
        <p className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-neutral-500">
          A árvore está vazia. Insira um valor para começar.
        </p>
      )}
      <div className="absolute right-3 top-3 flex flex-col gap-1">
        {[{ i: ZoomIn, f: () => zoom(1.2), l: 'Aproximar' }, { i: ZoomOut, f: () => zoom(1 / 1.2), l: 'Afastar' }, { i: Maximize2, f: () => setAuto(true), l: 'Ajustar à tela' }].map(({ i: I, f, l }) => (
          <button key={l} onClick={f} aria-label={l} title={l} className="rounded-md border border-white/10 bg-neutral-800/80 p-2 text-neutral-300 hover:bg-neutral-700">
            <I className="size-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
