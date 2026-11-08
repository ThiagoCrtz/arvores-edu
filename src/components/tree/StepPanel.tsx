'use client';
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, ListOrdered } from 'lucide-react';
import { buildInsertionFrames } from '@/lib/trees/steps';
import { parseNumbers } from '@/lib/trees/parse';
import type { TreeType, ViewOverride } from '@/lib/trees/types';

export default function StepPanel({ type, onOverride }: { type: TreeType; onOverride: (o: ViewOverride | null) => void }) {
  const [text, setText] = useState('50, 30, 70, 20, 40, 60, 80');
  const [values, setValues] = useState<number[] | null>(null);
  const [err, setErr] = useState('');
  const [i, setI] = useState(0);
  const frames = useMemo(() => (values ? buildInsertionFrames(values, type) : null), [values, type]);

  useEffect(() => setI(0), [frames]);
  useEffect(() => {
    if (!frames) return onOverride(null);
    const f = frames[Math.min(i, frames.length - 1)];
    onOverride({ root: f.root, hl: f.highlights });
  }, [frames, i, onOverride]);
  useEffect(() => () => onOverride(null), [onOverride]);

  const prepare = () => {
    const { values: v, bad } = parseNumbers(text);
    if (bad.length) return setErr(`Valores inválidos: ${bad.join(', ')}. Use apenas números inteiros.`);
    if (!v.length) return setErr('Informe ao menos um número.');
    if (v.length > 60) return setErr('Use no máximo 60 valores no passo a passo.');
    setErr(''); setValues(v);
  };

  const f = frames?.[Math.min(i, frames.length - 1)];
  const btn = 'inline-flex items-center gap-1 rounded-lg bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700 disabled:opacity-40';

  return (
    <div className="space-y-3">
      <label className="text-xs text-neutral-400">Sequência de inserção (a árvore respeitará esta ordem exata)</label>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} className="w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-teal-300" />
      <button onClick={prepare} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-400 px-3 py-2 text-sm font-medium text-neutral-950 hover:bg-teal-300">
        <ListOrdered className="size-4" /> Inserção passo a passo
      </button>
      {err && <p className="text-sm text-teal-300">{err}</p>}

      {frames && f && (
        <>
          <div className="flex items-center gap-2">
            <button className={btn} disabled={i === 0} onClick={() => setI(i - 1)}><ChevronLeft className="size-4" />Voltar</button>
            <button className={btn} disabled={i >= frames.length - 1} onClick={() => setI(i + 1)}>Avançar<ChevronRight className="size-4" /></button>
            <span className="ml-auto text-xs text-neutral-400">passo {i} / {frames.length - 1}</span>
          </div>
          <input type="range" min={0} max={frames.length - 1} value={i} onChange={(e) => setI(+e.target.value)} className="w-full" />
          <div className="rounded-lg border border-white/10 bg-neutral-900/60 p-3 text-sm">
            <p className="mb-1.5 font-medium text-white">{f.title}</p>
            <ul className="space-y-1 text-neutral-300">{f.lines.map((l, k) => <li key={k} className={l.includes('rotação') || l.includes('rebalancear') ? 'text-rose-300' : ''}>{l}</li>)}</ul>
            {i === frames.length - 1 && <p className="mt-2 text-emerald-300">Sequência concluída.</p>}
          </div>
        </>
      )}
    </div>
  );
}
