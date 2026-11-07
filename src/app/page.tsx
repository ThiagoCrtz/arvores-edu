import Link from 'next/link';

export default function Home() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-68px)] max-w-[1480px] items-center gap-14 px-6 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-12">
      <div className="max-w-2xl">
      <p className="mb-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.22em] text-amber-300"><span className="size-1.5 rounded-full bg-amber-300" /> laboratório visual de algoritmos</p>
      <h1 className="max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-.055em] text-white sm:text-7xl">Veja as árvores <span className="text-amber-300">crescerem.</span></h1>
      <p className="mt-7 max-w-lg text-[17px] leading-8 text-slate-400">
        Construa Árvores Binárias de Busca e AVL, acompanhe cada comparação, rotação e percurso — passo a passo.
      </p>
      <Link href="/laboratorio" className="mt-9 inline-flex items-center rounded-xl bg-[#5b7cfa] px-5 py-3.5 font-medium text-white shadow-[0_12px_28px_rgba(91,124,250,.2)] hover:bg-[#6d8bff]">
        Abrir o Laboratório
      </Link>
      </div>
      <div className="relative hidden min-h-[390px] overflow-hidden rounded-[28px] border border-white/[.1] bg-[#111923] p-8 shadow-2xl lg:block">
        <div className="absolute inset-0 opacity-40" style={{backgroundImage:'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)', backgroundSize:'32px 32px'}} />
        <div className="relative flex h-full flex-col justify-between"><div><span className="text-[11px] uppercase tracking-[.2em] text-slate-500">árvore ativa</span><div className="mt-2 text-2xl font-semibold text-white">AVL / rotação à direita</div></div><div className="mx-auto grid size-16 place-items-center rounded-full border-2 border-amber-300 bg-amber-300/15 text-xl font-semibold text-amber-200 shadow-[0_0_36px_rgba(242,184,75,.2)]">30</div><div className="flex justify-center gap-20 text-lg font-semibold text-slate-200"><span className="grid size-12 place-items-center rounded-full border border-blue-300/40 bg-blue-400/10">20</span><span className="grid size-12 place-items-center rounded-full border border-blue-300/40 bg-blue-400/10">40</span></div><div className="flex items-center justify-between text-xs text-slate-500"><span>comparações 04</span><span className="text-emerald-300">estrutura balanceada</span></div></div>
      </div>
    </section>
  );
}
