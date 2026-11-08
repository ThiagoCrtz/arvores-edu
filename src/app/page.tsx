import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto max-w-[1480px] px-6 lg:px-12">
    <section className="border-b border-white/10 pt-12 sm:pt-20">
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[.18em] text-neutral-500"><span>Laboratório visual / 01</span><span className="text-teal-300">● Sistema ativo</span></div>
      <div className="grid gap-8 py-12 lg:grid-cols-[1fr_280px] lg:items-end">
        <h1 className="max-w-5xl text-5xl font-semibold leading-[.98] tracking-[-.06em] text-white sm:text-7xl lg:text-[90px]">Dados têm<br/><span className="text-teal-300">uma forma.</span></h1>
        <div className="border-l border-teal-400/50 pl-5"><p className="text-sm leading-7 text-neutral-400">Descubra a lógica por trás de cada conexão. Experimente árvores e acompanhe sua estrutura ganhar vida.</p><Link href="/laboratorio" className="mt-5 inline-flex min-h-11 items-center gap-4 text-sm font-semibold text-teal-300 hover:text-white">Começar a explorar <span aria-hidden="true">↗</span></Link></div>
      </div>
      <div className="grid border-t border-white/10 sm:grid-cols-[1fr_auto]"><div className="py-5 font-mono text-xs uppercase tracking-widest text-neutral-500">BST / AVL / rubro-negra / B / B+</div><div className="pb-5 font-mono text-xs text-neutral-500 sm:border-l sm:border-white/10 sm:px-6 sm:py-5">05 estruturas · 01 espaço</div></div>
    </section>
    <section className="border-t border-white/10 pb-24 pt-12">
      <p className="font-mono text-xs uppercase tracking-[.2em] text-teal-300">02 / escolha uma estrutura</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">Seu mapa de exploração.</h2>
      <div className="mt-8 border-t border-white/10">
        {[
          {name:'BST e AVL', label:'01 / árvores binárias', text:'Compare inserções, rotações e percursos passo a passo.', href:'/laboratorio'},
          {name:'Rubro-negra', label:'02 / balanceamento por cores', text:'Explore uma árvore binária que se mantém balanceada.', href:'/estruturas'},
          {name:'Árvores B e B+', label:'03 / nós com múltiplas chaves', text:'Veja como dados e índices se organizam em níveis.', href:'/estruturas'},
        ].map(item => <Link key={item.name} href={item.href} className="group grid gap-3 border-b border-white/10 py-7 transition-colors hover:bg-white/[.03] sm:grid-cols-[220px_1fr_1fr_auto] sm:items-center"><span className="font-mono text-xs uppercase tracking-widest text-neutral-500">{item.label}</span><h3 className="text-xl font-semibold text-white">{item.name}</h3><p className="text-sm leading-6 text-neutral-400">{item.text}</p><span className="text-sm font-medium text-teal-300">Explorar ↗</span></Link>)}
      </div>
    </section>
    </main>
  );
}
