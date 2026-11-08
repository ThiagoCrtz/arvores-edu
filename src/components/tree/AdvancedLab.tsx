'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { buildAdvanced, type AdvancedKind, type AdvancedNode } from '@/lib/trees/advanced';

const descriptions: Record<AdvancedKind, { title: string; text: string }> = {
  rb: { title: 'Rubro-negra', text: 'Uma árvore binária balanceada que usa cores para limitar sua altura.' },
  b: { title: 'Árvore B', text: 'Cada nó armazena várias chaves, reduzindo a altura da árvore.' },
  bplus: { title: 'Árvore B+', text: 'Os dados ficam nas folhas; os nós internos guiam a busca.' },
};

function Branch({ node, found }: { node: AdvancedNode; found: number | null }) {
  const children = node.children.filter(Boolean);
  return <div className="flex min-w-max flex-col items-center">
    <div className={`rounded-lg border px-3 py-2 font-mono text-sm ${node.keys.includes(found as number) ? 'border-teal-300 bg-teal-400 text-black' : node.red ? 'border-red-400 bg-red-950 text-white' : 'border-neutral-600 bg-neutral-900 text-white'}`}>
      {node.keys.join('  |  ')}{node.red && <span className="ml-2 text-xs text-red-300">vermelho</span>}
    </div>
    {children.length > 0 && <><div className="h-6 w-px bg-neutral-600" /><div className="flex gap-4 border-t border-neutral-700 pt-5">{children.map((child, i) => <Branch key={i} node={child} found={found} />)}</div></>}
  </div>;
}

export default function AdvancedLab() {
  const [kind, setKind] = useState<AdvancedKind>('rb');
  const [values, setValues] = useState<number[]>([]);
  const [input, setInput] = useState('');
  const [found, setFound] = useState<number | null>(null);
  const [message, setMessage] = useState('Insira valores ou carregue um exemplo para começar.');
  const root = useMemo(() => buildAdvanced(values, kind), [values, kind]);
  function read(): number | null {
    const s = input.trim();
    if (!/^-?\d+$/.test(s) || !Number.isSafeInteger(Number(s))) { setMessage('Digite um número inteiro válido.'); return null; }
    return Number(s);
  }
  function insert() {
    const n = read(); if (n === null) return;
    if (values.includes(n)) { setMessage(`O valor ${n} já existe na árvore.`); return; }
    setValues([...values, n]); setFound(null); setInput(''); setMessage(`Valor ${n} inserido.`);
  }
  function remove() {
    const n = read(); if (n === null) return;
    if (!values.includes(n)) { setMessage(`O valor ${n} não está na árvore.`); return; }
    setValues(values.filter(v => v !== n)); setFound(null); setInput('');
    setMessage(`Valor ${n} removido. A árvore foi reconstruída com os valores restantes.`);
  }
  function search() {
    const n = read(); if (n === null) return;
    setFound(values.includes(n) ? n : null); setMessage(values.includes(n) ? `Valor ${n} encontrado.` : `Valor ${n} não encontrado.`);
  }
  return <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-xs uppercase tracking-[.2em] text-teal-300">laboratório / estruturas avançadas</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Explore além do binário.</h1><p className="mt-2 text-neutral-400">Construa e compare estruturas balanceadas.</p></div><Link className="text-sm text-neutral-400 hover:text-teal-300" href="/laboratorio">← Laboratório BST e AVL</Link></div>
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <section className="min-h-[480px] overflow-auto rounded-2xl border border-white/10 bg-[#101310] p-6 lg:order-2">
        <div className="flex justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-widest text-neutral-500">visualização</p><h2 className="mt-2 text-xl font-semibold text-white">{descriptions[kind].title}</h2></div><span className="font-mono text-sm text-teal-300">{values.length} valores</span></div>
        <div className="flex min-h-[340px] min-w-max items-start justify-center pt-14">{root ? <Branch node={root} found={found} /> : <p className="text-sm text-neutral-500">A árvore está vazia. Insira um valor para começar.</p>}</div>
      </section>
      <aside className="space-y-5 rounded-2xl border border-white/10 bg-neutral-900/50 p-5 lg:order-1">
        <div><p className="mb-3 text-xs uppercase tracking-widest text-neutral-500">estrutura</p><div className="grid grid-cols-3 gap-1 rounded-lg bg-black/40 p-1">{(['rb','b','bplus'] as AdvancedKind[]).map(k => <button key={k} onClick={() => { setKind(k); setFound(null); }} className={`min-h-10 rounded-md text-sm font-medium ${kind === k ? 'bg-teal-400 text-black' : 'text-neutral-400 hover:text-white'}`}>{k === 'rb' ? 'Rubro-negra' : k === 'b' ? 'B' : 'B+'}</button>)}</div><p className="mt-3 text-sm leading-6 text-neutral-400">{descriptions[kind].text}</p></div>
        <div><label htmlFor="advanced-value" className="text-xs uppercase tracking-widest text-neutral-500">valor inteiro</label><input id="advanced-value" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') insert(); }} placeholder="Ex.: 42" className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-3 text-white outline-none focus:border-teal-400" /><div className="mt-3 grid grid-cols-3 gap-2"><button onClick={insert} className="rounded-lg bg-teal-400 px-2 py-3 text-sm font-semibold text-black hover:bg-teal-300">Inserir</button><button onClick={search} className="rounded-lg bg-neutral-800 px-2 py-3 text-sm text-white hover:bg-neutral-700">Buscar</button><button onClick={remove} className="rounded-lg bg-neutral-800 px-2 py-3 text-sm text-white hover:bg-neutral-700">Remover</button></div></div>
        <div className="flex gap-2"><button onClick={() => {setValues([40,20,60,10,30,50,70,25,35]); setFound(null); setMessage('Exemplo carregado.');}} className="flex-1 rounded-lg border border-white/10 py-2 text-sm hover:bg-white/5">Carregar exemplo</button><button onClick={() => {setValues([]); setFound(null); setMessage('Árvore limpa.');}} className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5">Limpar</button></div>
        <p role="status" className="border-t border-white/10 pt-4 text-sm leading-6 text-neutral-400">{message}</p>
        {kind === 'bplus' && <p className="text-xs leading-5 text-neutral-500">As folhas guardam os valores; os separadores internos podem repetir uma chave da folha.</p>}
      </aside>
    </div>
  </main>;
}
