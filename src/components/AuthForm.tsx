'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { safeNext, supabaseConfigured } from '@/lib/supabase/env';

export type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

const COPY: Record<AuthMode, { title: string; subtitle: string; cta: string }> = {
  login: { title: 'Entrar', subtitle: 'Acesse suas árvores salvas.', cta: 'Entrar' },
  signup: { title: 'Criar conta', subtitle: 'Use apenas e-mail e senha.', cta: 'Criar conta' },
  forgot: { title: 'Recuperar senha', subtitle: 'Enviaremos um link para o seu e-mail.', cta: 'Enviar link' },
  reset: { title: 'Nova senha', subtitle: 'Escolha uma nova senha para sua conta.', cta: 'Salvar nova senha' },
};

function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail pelo link que enviamos antes de entrar.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Já existe uma conta com este e-mail.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
  if (m.includes('password') && m.includes('characters')) return 'A senha é muito curta.';
  if (m.includes('same password') || m.includes('different from the old')) return 'A nova senha deve ser diferente da anterior.';
  if (m.includes('session') && m.includes('missing')) return 'Link expirado. Solicite a recuperação de senha novamente.';
  if (m.includes('fetch') || m.includes('network')) return 'Falha de conexão. Verifique sua internet.';
  return 'Não foi possível concluir a operação. Tente novamente.';
}

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const copy = COPY[mode];
  const needsPassword = mode !== 'forgot';
  const needsConfirm = mode === 'signup' || mode === 'reset';
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('erro') === 'link') {
      setError('Este link expirou ou já foi utilizado. Solicite um novo link de recuperação ou tente entrar novamente.');
    }
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(''); setInfo('');
    const sb = getBrowserClient();
    if (!sb) return setError('Supabase não configurado. Defina as variáveis de ambiente (veja .env.example).');
    if (needsPassword && password.length < 8) return setError('A senha deve ter pelo menos 8 caracteres.');
    if (needsConfirm && password !== confirm) return setError('As senhas não coincidem.');

    setLoading(true);
    const origin = window.location.origin;
    const next = safeNext(new URLSearchParams(window.location.search).get('next'));
    try {
      if (mode === 'login') {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(next); router.refresh();
      } else if (mode === 'signup') {
        const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: `${origin}/auth/callback` } });
        if (error) throw error;
        if (data.session) { router.replace('/minhas-arvores'); router.refresh(); }
        else setInfo('Conta criada! Enviamos um link de confirmação para o seu e-mail. Confirme para poder entrar.');
      } else if (mode === 'forgot') {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/redefinir-senha` });
        if (error) throw error;
        setInfo('Se existir uma conta com este e-mail, você receberá um link para redefinir a senha.');
      } else {
        const { error } = await sb.auth.updateUser({ password });
        if (error) throw error;
        setInfo('Senha atualizada com sucesso! Redirecionando…');
        setTimeout(() => { router.replace('/minhas-arvores'); router.refresh(); }, 1200);
      }
    } catch (err) {
      setError(friendly(err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  const input = 'w-full rounded-lg border border-white/10 bg-neutral-900 px-3 py-2.5 text-sm outline-none focus:border-teal-300';
  return (
    <div className="mx-auto w-full max-w-sm px-4 py-16">
      <h1 className="text-2xl font-bold text-white">{copy.title}</h1>
      <p className="mt-1 text-sm text-neutral-400">{copy.subtitle}</p>

      {!supabaseConfigured && (
        <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-teal-200">
          Supabase ainda não configurado neste ambiente. Copie <code>.env.example</code> para <code>.env.local</code> e preencha as variáveis.
        </p>
      )}

      <form onSubmit={submit} className="mt-6 space-y-3">
        {mode !== 'reset' && (
          <input type="email" required autoComplete="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        )}
        {needsPassword && (
          <input type="password" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder={mode === 'reset' ? 'Nova senha (mín. 8 caracteres)' : 'Senha'} value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        )}
        {needsConfirm && (
          <input type="password" required autoComplete="new-password" placeholder="Confirmar senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={input} />
        )}
        {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
        {info && <p role="status" className="text-sm text-emerald-300">{info}</p>}
        <button disabled={loading} className="w-full rounded-lg bg-teal-400 py-2.5 text-sm font-medium text-neutral-950 hover:bg-teal-300 disabled:opacity-50">
          {loading ? 'Aguarde…' : copy.cta}
        </button>
      </form>

      <div className="mt-5 space-y-1.5 text-center text-sm text-neutral-400">
        {mode === 'login' && (<>
          <p><Link href="/recuperar-senha" className="text-teal-300 hover:underline">Esqueci minha senha</Link></p>
          <p>Não tem conta? <Link href="/cadastro" className="text-teal-300 hover:underline">Cadastre-se</Link></p>
        </>)}
        {mode === 'signup' && <p>Já tem conta? <Link href="/login" className="text-teal-300 hover:underline">Entrar</Link></p>}
        {mode === 'forgot' && <p><Link href="/login" className="text-teal-300 hover:underline">Voltar ao login</Link></p>}
      </div>
    </div>
  );
}
