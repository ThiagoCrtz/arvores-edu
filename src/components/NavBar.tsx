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

  const link = 'text-slate-300 hover:text-white whitespace-nowrap';
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0f1a]/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 text-sm">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <GitBranch className="size-5 text-indigo-400" /> <span className="hidden xs:inline sm:inline">ArvoreLab</span>
        </Link>
        <Link href="/laboratorio" className={link}>Laboratório</Link>
        {user && <Link href="/minhas-arvores" className={link}>Minhas Árvores</Link>}

        <div className="ml-auto flex items-center gap-3">
          {loading ? null : user ? (
            <>
              <span className="hidden max-w-[180px] truncate text-xs text-slate-400 md:block" title={user.email ?? ''}>{user.email}</span>
              <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-slate-200 hover:bg-slate-700">
                <LogOut className="size-4" /> Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={link}>Entrar</Link>
              <Link href="/cadastro" className="rounded-lg bg-indigo-500 px-3 py-1.5 font-medium text-white hover:bg-indigo-400">Criar conta</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
