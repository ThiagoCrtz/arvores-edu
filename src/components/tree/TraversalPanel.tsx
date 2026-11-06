'use client';
import { useEffect, useMemo, useState } from 'react';
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { inorder, postorder, preorder } from '@/lib/trees/tree';
import type { Highlight, TreeNode, ViewOverride } from '@/lib/trees/types';

const KINDS = {
  pre: { label: 'Pré-ordem', rule: 'Raiz → Esquerda → Direita', fn: preorder },
  in: { label: 'Em ordem', rule: 'Esquerda → Raiz → Direita', fn: inorder },
  post: { label: 'Pós-ordem', rule: 'Esquerda → Direita → Raiz', fn: postorder },
} as const;
type Kind = keyof typeof KINDS;

export default function TraversalPanel({ root, onOverride }: { root: TreeNode | null; onOverride: (o: ViewOverride | null) => void }) {
  const [kind, setKind] = useState<Kind>('pre');
  const [idx, setIdx] = useState(0); // quantos nós já foram visitados
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const seq = useMemo(() => KINDS[kind].fn(root), [kind, root]);

  useEffect(() => { setIdx(0); setPlaying(false); }, [kind, root]);

  useEffect(() => {
    if (!playing) return;
    if (idx >= seq.length) { setPlaying(false); return; }
    const t = setTimeout(() => setIdx((i) => i + 1), 900 / rate);
    return () => clearTimeout(t);
  }, [playing, idx, rate, seq.length]);

  useEffect(() => {
    const hl: Record<number, Highlight> = {};
    seq.forEach((v, i) => { if (i < idx - 1) hl[v] = 'done'; else if (i === idx - 1) hl[v] = 'visit'; });
    onOverride({ hl });
  }, [idx, seq, onOverride]);
  useEffect(() => () => onOverride(null), [onOverride]);

  const btn = 'rounded-lg bg-slate-800 p-2 text-slate-200 hover:bg-slate-700 disabled:opacity-40';
  const play = () => { if (idx >= seq.length) setIdx(0); setPlaying((p) => !p); };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-900 p-1">
        {(Object.keys(KINDS) as Kind[]).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={`rounded-md px-2 py-1.5 text-xs font-medium ${kind === k ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}>
            {KINDS[k].label}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-300"><b>{KINDS[kind].label}:</b> {KINDS[kind].rule}</p>

      <div className="flex items-center gap-2">
        <button className={btn} onClick={() => { setPlaying(false); setIdx(0); }} aria-label="Reiniciar" title="Reiniciar"><RotateCcw className="size-4" /></button>
        <button className={btn} disabled={idx === 0} onClick={() => { setPlaying(false); setIdx((i) => Math.max(0, i - 1)); }} aria-label="Passo anterior" title="Passo anterior"><SkipBack className="size-4" /></button>
        <button className={`${btn} !bg-sky-500 text-white hover:!bg-sky-400`} disabled={!seq.length} onClick={play} aria-label={playing ? 'Pausar' : 'Iniciar'} title={playing ? 'Pausar' : 'Iniciar'}>
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
        <button className={btn} disabled={idx >= seq.length} onClick={() => { setPlaying(false); setIdx((i) => Math.min(seq.length, i + 1)); }} aria-label="Próximo passo" title="Próximo passo"><SkipForward className="size-4" /></button>
        <span className="ml-auto text-xs text-slate-400">{idx} / {seq.length}</span>
      </div>

      <label className="flex items-center gap-3 text-xs text-slate-400">
        Velocidade
        <input type="range" min={0.5} max={4} step={0.5} value={rate} onChange={(e) => setRate(+e.target.value)} className="flex-1" />
        {rate}×
      </label>

      <div className="min-h-20 rounded-lg border border-white/10 bg-slate-900/60 p-3 text-sm">
        {!seq.length ? <span className="text-slate-500">Insira valores na aba Construir para ver os percursos.</span> : idx === 0 ? (
          <span className="text-slate-500">Pressione Iniciar ou avance passo a passo.</span>
        ) : (
          <>
            <p className="mb-1 text-slate-400">Visitando o nó <b className="text-amber-300">{seq[idx - 1]}</b></p>
            <p className="break-words font-mono text-slate-100">
              {seq.slice(0, idx).map((v, i) => (
                <span key={i}><span className={i === idx - 1 ? 'text-amber-300' : 'text-sky-300'}>{v}</span>{i < idx - 1 && ' → '}</span>
              ))}
            </p>
            {idx === seq.length && <p className="mt-2 text-emerald-300">Percurso completo.</p>}
          </>
        )}
      </div>
      <p className="text-xs text-slate-500">Cores na árvore: <span className="text-amber-300">amarelo</span> = nó atual · <span className="text-sky-300">azul</span> = já visitados.</p>
    </div>
  );
}
