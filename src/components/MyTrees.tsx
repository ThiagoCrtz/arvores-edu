'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import MiniTree from '@/components/tree/MiniTree';
import { deserializeNodes, serializeNodes, restoreTree } from '@/lib/trees/persist';
import { height, size } from '@/lib/trees/tree';
import type { TreeType } from '@/lib/trees/types';

interface Row { id: string; name: string; tree_type: TreeType; nodes: unknown; updated_at: string }

export default function MyTrees() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<TreeType>('AVL');
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const load = useCallback(async () => {
    const sb = getBrowserClient();
    if (!sb) return setError('Supabase não configurado.');
    const { data, error } = await sb.from('trees').select('id,name,tree_type,nodes,updated_at').order('updated_at', { ascending: false });
    if (error) return setError('Não foi possível carregar suas árvores. Tente novamente.');
    setRows(data as Row[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create() {
    const name = newName.trim();
    if (!name) return setError('Dê um nome à nova árvore.');
    setError('');
    const { data, error } = await getBrowserClient()!.from('trees').insert({ name, tree_type: newType, nodes: serializeNodes([]) }).select('id').single();
    if (error || !data) return setError('Não foi possível criar a árvore.');
    window.location.assign(`/laboratorio?id=${data.id}`);
  }

  async function rename(id: string) {
    const name = editName.trim();
    if (!name) return setError('O nome não pode ficar vazio.');
    const { error } = await getBrowserClient()!.from('trees').update({ name }).eq('id', id);
    if (error) return setError('Não foi possível renomear.');
    setError(''); setEditing(null); load();
  }

  async function del(r: Row) {
    if (!window.confirm(`Excluir "${r.name}"? Essa ação não pode ser desfeita.`)) return;
    const { error } = await getBrowserClient()!.from('trees').delete().eq('id', r.id);
    if (error) return setError('Não foi possível excluir.');
    setRows((list) => list?.filter((x) => x.id !== r.id) ?? null);
  }

  const input = 'rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-teal-300';
  return (
    <div className="mx-auto w-full max-w-5xl p-4">
      <h1 className="text-2xl font-bold text-white">Minhas Árvores</h1>
      <p className="mt-1 text-sm text-neutral-400">Suas árvores salvas ficam privadas e só você consegue vê-las.</p>

      <div className="mt-5 flex flex-wrap gap-2 rounded-xl border border-white/10 bg-neutral-900/50 p-3">
        <input value={newName} maxLength={80} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && create()} placeholder="Nome da nova árvore" className={`${input} min-w-0 flex-1`} />
        <select value={newType} onChange={(e) => setNewType(e.target.value as TreeType)} className={input}>
          <option value="AVL">AVL</option><option value="BST">BST</option>
        </select>
        <button onClick={create} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-400 px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-teal-300"><Plus className="size-4" />Nova árvore</button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}

      {rows === null && !error && <p className="mt-8 text-sm text-neutral-500">Carregando…</p>}
      {rows?.length === 0 && (
        <p className="mt-8 text-sm text-neutral-400">
          Você ainda não salvou nenhuma árvore. Crie uma acima ou <Link href="/laboratorio" className="text-teal-300 hover:underline">monte uma no Laboratório</Link> e clique em Salvar.
        </p>
      )}

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows?.map((r) => {
          const order = deserializeNodes(r.nodes);
          let root = null;
          try { root = order ? restoreTree(r.nodes, r.tree_type) : null; } catch { /* Dados inválidos. */ }
          return (
            <li key={r.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-neutral-900/60 p-4">
              <MiniTree root={root} />
              <div className="flex items-center gap-2">
                {editing === r.id ? (
                  <>
                    <input autoFocus value={editName} maxLength={80} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && rename(r.id)} className={`${input} min-w-0 flex-1 !py-1`} />
                    <button onClick={() => rename(r.id)} aria-label="Confirmar" className="text-emerald-300"><Check className="size-4" /></button>
                    <button onClick={() => setEditing(null)} aria-label="Cancelar" className="text-neutral-400"><X className="size-4" /></button>
                  </>
                ) : (
                  <>
                    <h2 className="min-w-0 flex-1 truncate font-medium text-white" title={r.name}>{r.name}</h2>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${r.tree_type === 'AVL' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-sky-500/15 text-sky-300'}`}>{r.tree_type}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-neutral-400">
                {order ? `${size(root)} nós · altura ${height(root)}` : 'Dados inválidos'} · atualizada em {new Date(r.updated_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </p>
              <div className="mt-auto flex gap-2">
                <Link href={`/laboratorio?id=${r.id}`} className="flex-1 rounded-lg bg-teal-400 py-1.5 text-center text-sm font-medium text-neutral-950 hover:bg-teal-300">Abrir</Link>
                <button onClick={() => { setEditing(r.id); setEditName(r.name); }} aria-label="Renomear" title="Renomear" className="rounded-lg bg-neutral-800 p-2 hover:bg-neutral-700"><Pencil className="size-4" /></button>
                <button onClick={() => del(r)} aria-label="Excluir" title="Excluir" className="rounded-lg bg-neutral-800 p-2 text-rose-300 hover:bg-neutral-700"><Trash2 className="size-4" /></button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
