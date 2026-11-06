# Configuração concluída — ArvoreLab

## Executar

Requer Node.js 20.9 ou superior e npm.

```sh
npm ci
npm run dev
```

Abra http://localhost:3000 (ou a porta informada pelo terminal). O laboratório funciona sem conta. Para salvar, crie uma conta, confirme o e-mail e entre. Em **Minhas Árvores**, você pode criar, abrir, renomear e excluir árvores. No laboratório, **Atualizar** grava alterações e **Salvar como nova árvore** cria uma cópia.

```sh
npm test
npm run typecheck
npm run build
npm start
```

O desenvolvimento e a compilação usam Webpack para evitar a falha do Turbopack observada nesta pasta no Windows.

## Banco conectado

O ambiente local está configurado em `.env.local` para o projeto Supabase **ArvoreBi** (`rnuwlckqayfndczblaid`). Esse arquivo é ignorado pelo Git. Usa apenas URL e chave publicável.

A tabela `public.trees` foi criada no banco remoto. O esquema está em `supabase/schema.sql`, com índice por usuário/data, atualização automática de `updated_at` e políticas RLS para todas as operações. Cada pessoa só acessa as próprias árvores; visitantes não acessam a tabela.

Os registros novos guardam a sequência de inserção e um snapshot em pré-ordem, preservando a estrutura depois de remoções e rotações. O leitor mantém compatibilidade com o formato anterior.

## Outro ambiente ou publicação

Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. A variável antiga `NEXT_PUBLIC_SUPABASE_ANON_KEY` também é aceita. Nunca use chaves secretas ou `service_role` em variáveis `NEXT_PUBLIC_*`.

Em outro banco, execute `supabase/schema.sql` no SQL Editor. Em **Authentication → URL Configuration**, configure o Site URL e permita os retornos do ambiente:

- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/callback?next=/redefinir-senha`
- Os mesmos caminhos no domínio de produção quando publicado.

Se usar outra porta, adicione também os retornos correspondentes. Mantenha a confirmação de e-mail habilitada. A entrega de confirmação e recuperação depende das configurações e limites de e-mail do Supabase; configure SMTP próprio para produção.
