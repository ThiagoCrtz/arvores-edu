import { redirect } from 'next/navigation';
import MyTrees from '@/components/MyTrees';
import { getServerClient } from '@/lib/supabase/server';

export const metadata = { title: 'Minhas Árvores — ArvoreLab' };
export const dynamic = 'force-dynamic';

export default async function Page() {
  // Segunda camada de proteção (o proxy já redireciona visitantes).
  const supabase = await getServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  if (!user) redirect('/login?next=/minhas-arvores');
  return <MyTrees />;
}
