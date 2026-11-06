import Link from 'next/link';

export default function Home() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-white">Veja as árvores crescerem.</h1>
      <p className="mt-5 text-slate-400">
        Construa Árvores Binárias de Busca e AVL, acompanhe cada comparação, rotação e percurso — passo a passo.
      </p>
      <Link href="/laboratorio" className="mt-8 inline-block rounded-lg bg-indigo-500 px-6 py-3 font-medium text-white hover:bg-indigo-400">
        Abrir o Laboratório
      </Link>
    </section>
  );
}
