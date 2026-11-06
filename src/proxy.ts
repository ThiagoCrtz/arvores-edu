import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from '@/lib/supabase/env';

const PRIVATE = ['/minhas-arvores'];
const AUTH_ONLY_GUESTS = ['/login', '/cadastro'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPrivate = PRIVATE.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const redirectTo = (path: string, search = '') => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = search;
    const redirect = NextResponse.redirect(url);
    if (response) response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    redirect.headers.set('Cache-Control', 'private, no-store');
    return redirect;
  };

  let response = NextResponse.next({ request });
  if (!supabaseConfigured) return isPrivate ? redirectTo('/login') : response;
  response.headers.set('Cache-Control', 'private, no-store');
  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        response.headers.set('Cache-Control', 'private, no-store');
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() valida o token no servidor do Supabase (getSession() não valida).
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && isPrivate) return redirectTo('/login', `?next=${encodeURIComponent(pathname)}`);
  if (user && AUTH_ONLY_GUESTS.includes(pathname)) return redirectTo('/minhas-arvores');
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
