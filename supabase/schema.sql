-- ArvoreLab: tabela de árvores salvas + Row Level Security.
-- Execute no Supabase: SQL Editor > New query > cole e rode.

create table if not exists public.trees (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 80),
  tree_type  text not null check (tree_type in ('BST', 'AVL')),
  -- { "version": 1, "insertionOrder": [50, 30, 70, ...] } — a árvore é reconstruída a partir da ordem de inserção
  nodes      jsonb not null default '{"version":1,"insertionOrder":[]}'::jsonb
             check (pg_column_size(nodes) < 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists trees_user_updated_idx on public.trees (user_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trees_set_updated_at on public.trees;
create trigger trees_set_updated_at
  before update on public.trees
  for each row execute function public.set_updated_at();

alter table public.trees enable row level security;

-- Visitantes anônimos não têm nenhum acesso à tabela.
revoke all on public.trees from anon;
grant select, insert, update, delete on public.trees to authenticated;

drop policy if exists "trees_select_own" on public.trees;
drop policy if exists "trees_insert_own" on public.trees;
drop policy if exists "trees_update_own" on public.trees;
drop policy if exists "trees_delete_own" on public.trees;

create policy "trees_select_own" on public.trees for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "trees_insert_own" on public.trees for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "trees_update_own" on public.trees for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "trees_delete_own" on public.trees for delete to authenticated
  using ((select auth.uid()) = user_id);
