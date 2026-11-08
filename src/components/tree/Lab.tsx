'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eraser, Hammer, ListOrdered, Plus, RotateCcw, Route, Save, Shuffle, Trash2 } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/supabase/useUser';
import { deserializeNodes, serializeNodes, restoreTree } from '@/lib/trees/persist';
import StepPanel from './StepPanel';
import TraversalPanel from './TraversalPanel';
import { parseNumbers } from '@/lib/trees/parse';
import TreeCanvas, { type Highlight } from './TreeCanvas';
import { layoutTree } from '@/lib/layout/layout';
import { buildFromSequence, height, insert, remove, size } from '@/lib/trees/tree';
import { explainEvent } from '@/lib/trees/explain';
import type { OperationResult, TreeNode, TreeType, ViewOverride } from '@/lib/trees/types';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const STEP_MS = 650;
interface LogItem { text: string; tone: 'info' | 'ok' | 'warn' | 'rotate' }

export default function Lab() {
  const [type, setType] = useState<TreeType>('AVL');
  const [root, setRoot] = useState<TreeNode | null>(null);
  const [seq, setSeq] = useState<number[]>([]);
  const [hl, setHl] = useState<Record<number, Highlight>>({});
  const [log, setLog] = useState<LogItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const [rem, setRem] = useState('');
  const [showInfo, setShowInfo] = useState(true);
  const [tab, setTab] = useState<'build' | 'steps' | 'trav'>('build');
  const [override, setOverride] = useState<ViewOverride | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useUser();
  const loadId = useSearchParams().get('id');

  const rootRef = useRef<TreeNode | null>(null);
  const seqRef = useRef<number[]>([]);
  const commit = (r: TreeNode | null, s = seqRef.current) => { rootRef.current = r; seqRef.current = s; setRoot(r); setSeq(s); };
  const say = (text: string, tone: LogItem['tone'] = 'info') => setLog((l) => [{ text, tone }, ...l].slice(0, 60));

  const shownRoot = override && override.root !== undefined ? override.root : root;
  // Carrega uma árvore salva (?id=...). O RLS garante que só árvores do próprio usuário são retornadas.
  useEffect(() => {
    const sb = getBrowserClient();
    if (!loadId || !sb) return;
    sb.from('trees').select('id,name,tree_type,nodes').eq('id', loadId).maybeSingle().then(({ data, error }) => {
      const order = data ? deserializeNodes(data.nodes) : null;
      if (error || !data) return say('Não foi possível carregar a árvore: ela não existe ou não pertence à sua conta.', 'warn');
      if (!order) return say('Os dados salvos desta árvore estão inválidos.', 'warn');
      setType(data.tree_type); setSavedId(data.id); setName(data.name);
      try { commit(restoreTree(data.nodes, data.tree_type), order); }
      catch { return say('Os dados salvos desta árvore estão inválidos.', 'warn'); }
      say(`Árvore "${data.name}" carregada (${data.tree_type}).`, 'ok');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadId]);

  async function save(asNew: boolean) {
    if (busy || saving) return;
    const sb = getBrowserClient();
    const finalName = name.trim();
    if (!sb || !user) return say('Entre na sua conta para salvar árvores.', 'warn');
    if (!finalName) return say('Dê um nome à árvore antes de salvar.', 'warn');
    setSaving(true);
    const payload = { name: finalName, tree_type: type, nodes: serializeNodes(seqRef.current, rootRef.current) };
    if (savedId && !asNew) {
      const { error } = await sb.from('trees').update(payload).eq('id', savedId).select('id').single();
      say(error ? 'Erro ao salvar. Tente novamente.' : `"${finalName}" atualizada.`, error ? 'warn' : 'ok');
    } else {
      const { data, error } = await sb.from('trees').insert(payload).select('id').single();
      if (error || !data) say('Erro ao salvar. Tente novamente.', 'warn');
      else {
        setSavedId(data.id);
        window.history.replaceState(null, '', `/laboratorio?id=${data.id}`);
        say(`"${finalName}" salva em Minhas Árvores.`, 'ok');
      }
    }
    setSaving(false);
  }

  const { nodes, edges } = useMemo(() => layoutTree(shownRoot), [shownRoot]);

  /** Anima as comparações, mostra a árvore pré-rotação e então a árvore final. */
  async function play(result: OperationResult, preRotation: TreeNode | null, t: TreeType) {
    for (const e of result.events) {
      if (e.kind === 'compare') {
        setHl({ [e.node]: 'visit' });
        say(explainEvent(e));
        await sleep(STEP_MS);
      } else if (e.kind === 'duplicate') {
        setHl({ [e.value]: 'rotate' });
        say(explainEvent(e), 'warn');
        await sleep(STEP_MS);
      } else if (e.kind === 'not-found') {
        say(explainEvent(e), 'warn');
      } else if (e.kind === 'successor') {
        say(explainEvent(e));
        setHl({ [e.removed]: 'visit', [e.successor]: 'new' });
        await sleep(STEP_MS);
      }
    }
    const rotations = result.events.filter((e) => e.kind === 'rotation');
    if (t === 'AVL' && rotations.length) {
      commit(preRotation); // mostra o desbalanceamento antes de corrigir
      await sleep(STEP_MS);
      for (const r of rotations) {
        if (r.kind !== 'rotation') continue;
        setHl({ [r.node]: 'rotate', [r.pivot]: 'rotate' });
        say(explainEvent(r), 'rotate');
        await sleep(STEP_MS * 1.6);
      }
    }
    commit(result.root);
    const ins = result.events.find((e) => e.kind === 'inserted' || e.kind === 'removed');
    if (ins && ins.kind === 'inserted') { setHl({ [ins.value]: 'new' }); say(explainEvent(ins), 'ok'); }
    if (ins && ins.kind === 'removed') { setHl({}); say(explainEvent(ins), 'ok'); }
    await sleep(STEP_MS);
    setHl({});
  }

  async function insertMany(values: number[]) {
    setBusy(true);
    for (const v of values) {
      const r = insert(rootRef.current, v, type);
      const pre = insert(rootRef.current, v, 'BST').root;
      await play(r, pre, type);
      if (r.changed) seqRef.current = [...seqRef.current, v], setSeq(seqRef.current);
    }
    setBusy(false);
  }

  const onInsert = () => {
    const { values, bad } = parseNumbers(input);
    if (bad.length) say(`Valores ignorados (não são inteiros): ${bad.join(', ')}.`, 'warn');
    if (!values.length || busy) return;
    setInput('');
    insertMany(values);
  };

  async function onRemove() {
    const { values } = parseNumbers(rem);
    if (!values.length || busy) return;
    setRem(''); setBusy(true);
    for (const v of values) {
      const r = remove(rootRef.current, v, type);
      const pre = remove(rootRef.current, v, 'BST').root;
      await play(r, pre, type);
      if (r.changed) { seqRef.current = seqRef.current.filter((x) => x !== v); setSeq(seqRef.current); }
    }
    setBusy(false);
  }

  const changeType = (t: TreeType) => {
    if (busy) return;
    setType(t);
    commit(buildFromSequence(seqRef.current, t));
    say(`Tipo alterado para ${t}. A mesma sequência de inserção foi reconstruída.`);
  };

  const sample = () => {
    if (busy) return;
    const s = type === 'AVL' ? [10, 20, 30, 40, 50, 25] : [50, 30, 70, 20, 40, 60, 80];
    commit(buildFromSequence(s, type), s);
    setLog([{ text: `Exemplo carregado: ${s.join(', ')}.`, tone: 'info' }]);
  };

  const clear = () => { if (!busy) { commit(null, []); setLog([]); setHl({}); } };
  const restart = async () => {
    if (busy) return;
    const s = seqRef.current;
    commit(null, []); setLog([]);
    await insertMany(s);
  };

  const btn = 'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-40';
  const tone = { info: 'text-neutral-300', ok: 'text-emerald-300', warn: 'text-teal-300', rotate: 'text-rose-300' };

  return (
    <div className="mx-auto flex w-full max-w-[1480px] flex-1 flex-col gap-5 p-4 lg:flex-row lg:p-7">
      <div className="relative h-[55vh] min-h-[390px] overflow-hidden rounded-2xl border border-white/[.09] bg-[#101310] shadow-[0_18px_50px_rgba(0,0,0,.18)] lg:h-auto lg:min-h-[calc(100vh-124px)] lg:flex-1">
        <div className="pointer-events-none absolute left-5 top-5 z-10"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-neutral-500">canvas de exploração</p><p className="mt-1 text-sm text-neutral-300">{type} <span className="text-neutral-600">/</span> {size(shownRoot)} nós</p></div>
        <TreeCanvas nodes={nodes} edges={edges} highlights={override ? override.hl : hl} showAvlInfo={showInfo} />
      </div>

      <aside className="flex w-full flex-col gap-3 lg:w-[390px]">
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/[.08] bg-[#111411] p-1">
          {(['BST', 'AVL'] as TreeType[]).map((t) => (
            <button key={t} onClick={() => changeType(t)} className={`${btn} ${type === t ? 'bg-teal-300 text-neutral-950 shadow-[0_4px_14px_rgba(94,234,212,.18)]' : 'text-neutral-400 hover:text-white'}`}>
              {t === 'BST' ? 'Árvore BST' : 'Árvore AVL'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/[.08] bg-[#111411] p-1">
          {([['build', 'Construir', Hammer], ['steps', 'Passo a passo', ListOrdered], ['trav', 'Percursos', Route]] as const).map(([k, label, I]) => (
            <button key={k} disabled={busy} onClick={() => setTab(k)} className={`inline-flex items-center justify-center gap-1 rounded-md px-1 py-1.5 text-xs font-medium disabled:opacity-50 ${tab === k ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'}`}>
              <I className="size-3.5" />{label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-lg bg-neutral-900 px-3 py-2 text-sm">
          <span>Nós: <b className="text-white">{size(shownRoot)}</b></span>
          <span>Altura: <b className="text-white">{height(shownRoot)}</b></span>
          <label className="flex items-center gap-1.5 text-xs text-neutral-400">
            <input type="checkbox" checked={showInfo} onChange={(e) => setShowInfo(e.target.checked)} /> h / fb
          </label>
        </div>
        {tab === 'build' && (<>
        <div className="space-y-2">
          <label className="text-xs text-neutral-400">Inserir (separe vários por vírgula, ex.: 50, 30, 70)</label>
          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onInsert()}
              placeholder="50, 30, 70" inputMode="numeric" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-teal-300" />
            <button onClick={onInsert} disabled={busy} className={`${btn} bg-teal-400 text-neutral-950 hover:bg-teal-300`}><Plus className="size-4" />Inserir</button>
          </div>
          <label className="text-xs text-neutral-400">Remover valor</label>
          <div className="flex gap-2">
            <input value={rem} onChange={(e) => setRem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onRemove()}
              placeholder="30" inputMode="numeric" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-rose-400" />
            <button onClick={onRemove} disabled={busy} className={`${btn} bg-neutral-800 text-rose-300 hover:bg-neutral-700`}><Trash2 className="size-4" />Remover</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button onClick={sample} disabled={busy} className={`${btn} bg-neutral-800 hover:bg-neutral-700`}><Shuffle className="size-4" />Exemplo</button>
          <button onClick={restart} disabled={busy} className={`${btn} bg-neutral-800 hover:bg-neutral-700`}><RotateCcw className="size-4" />Reiniciar</button>
          <button onClick={clear} disabled={busy} className={`${btn} bg-neutral-800 hover:bg-neutral-700`}><Eraser className="size-4" />Limpar</button>
        </div>

        <p className="text-xs text-neutral-500">Ordem de inserção: {seq.length ? seq.join(' → ') : '—'}</p>

        <div className="min-h-32 flex-1 overflow-y-auto rounded-lg border border-white/10 bg-neutral-900/60 p-3 text-sm lg:max-h-[40vh]">
          {log.length === 0 && <p className="text-neutral-500">As explicações de cada passo aparecerão aqui.</p>}
          <ul className="space-y-1.5">{log.map((l, i) => <li key={i} className={tone[l.tone]}>{l.text}</li>)}</ul>
        </div>
        <div className="space-y-2 rounded-lg border border-white/10 p-3">
          <label className="text-xs text-neutral-400">Salvar em Minhas Árvores</label>
          <div className="flex gap-2">
            <input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} placeholder="Nome da árvore" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-teal-300" />
            <button onClick={() => save(false)} disabled={saving || busy || !user} className={`${btn} bg-emerald-600 text-white hover:bg-emerald-500`}><Save className="size-4" />{savedId ? 'Atualizar' : 'Salvar'}</button>
          </div>
          {savedId && <button onClick={() => save(true)} disabled={saving || busy || !user} className="text-xs text-teal-300 hover:underline disabled:opacity-50">Salvar como nova árvore</button>}
          {!user && <p className="text-xs text-neutral-500"><Link href="/login" className="text-teal-300 hover:underline">Entre</Link> ou <Link href="/cadastro" className="text-teal-300 hover:underline">crie uma conta</Link> para salvar.</p>}
        </div>
        </>)}
        {tab === 'steps' && <StepPanel type={type} onOverride={setOverride} />}
        {tab === 'trav' && <TraversalPanel root={root} onOverride={setOverride} />}
      </aside>
    </div>
  );
}
