---
name: security-privacy-finance
description: Orienta tarefas de segurança e privacidade no Bolso em Dia, especialmente ao lidar com gastos, comprovantes Pix, autenticação, uploads, banco de dados e dados financeiros sensíveis.
---

# Segurança e Privacidade Financeira

Use esta skill sempre que a tarefa envolver dados financeiros, comprovantes, autenticação, upload de arquivos ou banco de dados.

## Regras principais

- O sistema é multiusuário.
- Toda funcionalidade financeira deve exigir usuário autenticado.
- Nenhum gasto, comprovante, regra ou limite financeiro pode existir sem dono (`user_id`).
- Tratar gastos, comprovantes e dados financeiros como dados sensíveis.
- Não salvar tokens, senhas ou chaves no código.
- Usar variáveis de ambiente para segredos.
- Não registrar em logs dados completos de comprovantes Pix.
- Proteger rotas privadas com autenticação.
- Garantir que um usuário só veja os próprios gastos.
- O frontend não deve ser a única barreira de segurança.
- Validar usuário e autorização no servidor ou em políticas de banco.

## Uploads

- Validar arquivos enviados pelo usuário.
- Limitar tamanho dos arquivos aceitos.
- Limitar tipos de arquivo aceitos.
- Rejeitar arquivos inválidos de forma segura.
- Evitar expor detalhes internos em mensagens de erro.

## Banco e acesso a dados

- Separar dados por usuário.
- Verificar autorização antes de consultar, alterar ou excluir gastos.
- Evitar consultas que retornem dados de outros usuários.
- Revisar migrações e alterações de schema com cuidado.
- Em Supabase/Postgres, preparar Row Level Security por `user_id`.
- Não usar `user_metadata` como fonte de autorização.
- Não expor service role key no frontend.

## Revisão de risco

Ao alterar banco, autenticação ou upload:

- revisar riscos de segurança;
- verificar exposição de dados sensíveis;
- verificar se logs continuam seguros;
- confirmar que permissões por usuário foram preservadas.
- confirmar que testes ou cenários cobrem isolamento entre usuários.

## Ao finalizar

- Listar riscos encontrados.
- Listar riscos prevenidos.
- Informar qualquer pendência de segurança ou privacidade.
