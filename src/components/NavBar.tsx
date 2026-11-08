'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GitBranch, LogOut } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/client';
import { useUser } from '@/lib/supabase/useUser';

export default function NavBar() {
  const router = useRouter();
  const { user, loading } = useUser();

  async function logout() {
    await getBrowserClient()?.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const link = 'whitespace-nowrap text-[13px] font-medium text-neutral-400 transition-colors hover:text-white';
  return (
    <header className="sticky top-0 z-20 border-b border-white/[.08] bg-[#090b09]/85 backdrop-blur-xl">
      <nav className="mx-auto flex h-[68px] max-w-[1480px] items-center gap-7 px-5 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5 text-[15px] font-semibold tracking-[-.02em] text-white">
          <span className="grid size-8 place-items-center rounded-[10px] bg-teal-400/10 text-teal-300 ring-1 ring-teal-300/20"><GitBranch className="size-[18px]" /></span>
          <span>Arvore<span className="text-teal-300">Lab</span></span>
        </Link>
        <Link href="/laboratorio" className={`${link} rounded-full bg-white/[.06] px-3 py-1.5 text-neutral-200`}>Laboratório</Link>
        <Link href="/estruturas" className={`${link} hidden sm:inline`}>Estruturas avançadas</Link>
        {user && <Link href="/minhas-arvores" className={link}>Minhas Árvores</Link>}

        <div className="ml-auto flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <span className="hidden max-w-[180px] truncate text-xs text-neutral-400 md:block" title={user.email ?? ''}>{user.email}</span>
              <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[.05] px-3 py-2 text-neutral-200 hover:bg-white/[.1]">
                <LogOut className="size-4" /> Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={link}>Entrar</Link>
              <Link href="/cadastro" className="rounded-lg bg-teal-400 px-3.5 py-2 font-medium text-neutral-950 hover:bg-teal-300">Criar conta</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
