# ArvoreLab

> Integração com o Supabase ArvoreBi configurada. Consulte [CONFIGURACAO.md](CONFIGURACAO.md) para instruções atualizadas de execução, conexão e publicação. Use a chave publicável em `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (a chave anon antiga continua aceita).

Plataforma educacional para estudar Árvores Binárias de Busca (BST) e AVL.

## Rodar localmente
```bash
npm install
cp .env.example .env.local   # preencha com os dados do seu projeto Supabase
npm run dev                  # http://localhost:3000
npm test                     # testes da lógica das árvores
npm run build                # build de produção
```

## Configurar o Supabase
1. Crie um projeto em https://supabase.com.
2. **Project Settings → API**: copie *Project URL* e a chave *anon public* para `.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). **Nunca** use a `service_role` no frontend.
3. **SQL Editor**: cole e execute o conteúdo de `supabase/schema.sql` (cria a tabela `trees` com RLS).
4. **Authentication → Providers**: mantenha apenas *Email* habilitado.
5. **Authentication → URL Configuration**:
   - *Site URL*: `http://localhost:3000` (em produção, a URL da Vercel).
   - *Redirect URLs*: adicione `http://localhost:3000/auth/callback` e `https://SEU-APP.vercel.app/auth/callback`.
6. (Opcional) Para testes rápidos, desative "Confirm email" nas configurações do provedor Email.
