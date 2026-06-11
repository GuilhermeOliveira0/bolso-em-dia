# Supabase

Esta pasta prepara a fronteira para Supabase Auth, Postgres e Storage.

O armazenamento local existente é apenas um fallback temporário de desenvolvimento. Ele não é seguro para multiusuário, não protege dados financeiros e não substitui autenticação, consultas server-side e Row Level Security.

A primeira fatia corrigida só deve ser considerada completa quando gastos manuais forem vinculados ao usuário autenticado e a listagem não depender apenas de filtro no frontend.

Quando a integração real for implementada:

- usar Supabase Auth para obter o usuário autenticado;
- persistir `Expense`, `Category` e `ExpenseType` no Postgres;
- habilitar Row Level Security antes de expor tabelas;
- criar políticas por `user_id = auth.uid()`;
- nunca expor service role key no frontend;
- manter segredos fora de `NEXT_PUBLIC_*`;
- validar dados no servidor antes de gravar;
- testar que um usuário não consegue ver gastos de outro usuário.

## SQL inicial

O SQL inicial para `expenses` e RLS está em `supabase/sql/001_expenses_rls.sql`.

Ele deve ser executado no Supabase antes de usar dados reais. As políticas permitem que um usuário autenticado selecione, insira, atualize e exclua somente linhas com `user_id` igual ao próprio `auth.uid()`.
