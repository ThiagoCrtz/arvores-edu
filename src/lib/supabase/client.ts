import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from './env';

let client: SupabaseClient | null = null;

/** Cliente do navegador (usa apenas a chave anon pública). Retorna null se não configurado. */
export function getBrowserClient(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  client ??= createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  return client;
}
