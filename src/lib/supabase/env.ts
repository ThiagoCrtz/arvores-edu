export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Aceita apenas caminhos relativos internos (evita open redirect). */
export function safeNext(next: string | null | undefined, fallback = '/minhas-arvores') {
  return next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : fallback;
}
