'use client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getBrowserClient } from './client';

export function useUser() {
  const [state, setState] = useState<{ user: User | null; loading: boolean }>({ user: null, loading: true });
  useEffect(() => {
    const sb = getBrowserClient();
    if (!sb) return setState({ user: null, loading: false });
    sb.auth.getUser().then(({ data }) => setState({ user: data.user, loading: false }));
    const { data } = sb.auth.onAuthStateChange((_e, session) => setState({ user: session?.user ?? null, loading: false }));
    return () => data.subscription.unsubscribe();
  }, []);
  return state;
}
