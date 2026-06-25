# First Vertical Slice Plan

## 1. Objetivo da fatia

Entregar a primeira fatia vertical corrigida do MVP:

**Base do projeto + Auth + layout responsivo/mobile-first + cadastro manual de gastos por usuário + listagem simples por usuário.**

Esta fatia deve permitir que uma pessoa crie conta, faça login, acesse uma área privada, cadastre um gasto manual e veja esse gasto em uma listagem simples. Todo gasto deve pertencer ao usuário autenticado.

Esta fatia não estará completa se o sistema permitir cadastro sem login, salvar gasto sem dono ou listar dados filtrados apenas no frontend. A segurança deve ser preparada para Supabase Auth, Postgres e Row Level Security.

OCR, upload de comprovante Pix, sugestão automática, dashboard avançada e gráficos ficam para fatias futuras.

## 2. Decisões técnicas

### Stack recomendada

- Frontend: Next.js, React e TypeScript.
- Backend/API: recursos server-side do Next.js, usando Server Components, Server Actions ou Route Handlers conforme a necessidade.
- Autenticação: Supabase Auth com e-mail e senha.
- Banco de dados: Supabase Postgres.
- Segurança no banco: Row Level Security em tabelas com dados financeiros.
- Storage: Supabase Storage apenas em fatia futura de comprovantes Pix.
- UI: mobile-first, responsiva também para desktop.
- PWA: manifesto, metadados e base preparada para instalação no celular.
- Testes: validação de domínio, auth, cadastro, listagem e isolamento entre usuários.

### Decisões de arquitetura

- Auth não é opcional nesta fatia.
- O usuário autenticado deve ser a fonte do `user_id`.
- O frontend nunca deve decidir sozinho quais gastos o usuário pode acessar.
- Toda consulta de dados financeiros deve filtrar pelo usuário autenticado no servidor e futuramente também por RLS.
- Não usar `user_metadata` como fonte de autorização.
- Não expor service role key no frontend.
- Não salvar tokens, senhas ou chaves no código.
- Dados financeiros não devem aparecer completos em logs.
- OCR não entra nesta fatia, mas `Expense.source` deve permitir o valor `manual`.

### Decisão temporária sobre persistência local

Se a integração real com Supabase ainda não puder ser concluída na implementação, qualquer armazenamento local deve ser tratado apenas como recurso temporário de desenvolvimento.

Esse fallback não é seguro para multiusuário, não substitui Supabase Auth/Postgres/RLS e não pode ser considerado entrega final de segurança.

## 3. Escopo incluído

- Criar ou ajustar a base do projeto Next.js/React/TypeScript.
- Preparar layout mobile-first e responsivo para desktop.
- Preparar estrutura PWA básica sem cache inseguro de dados financeiros.
- Criar tela de criação de conta com e-mail e senha.
- Criar tela de login com e-mail e senha.
- Criar ação de logout.
- Proteger área privada de gastos.
- Bloquear acesso ao cadastro/listagem de gastos sem login.
- Criar cadastro manual de gasto.
- Validar valor, data, categoria, tipo e forma de pagamento.
- Impedir valor vazio, zero ou negativo.
- Associar gasto ao usuário autenticado.
- Criar listagem simples apenas dos gastos do usuário autenticado.
- Criar estado vazio para a listagem.
- Criar categorias iniciais.
- Criar tipos iniciais de gasto.
- Criar formas iniciais de pagamento.
- Preparar repositório/camada de dados para Supabase.
- Preparar testes básicos de validação, auth, cadastro, listagem e isolamento.

## 4. Escopo excluído

Não implementar nesta fatia:

- login social;
- recuperação avançada de senha;
- perfil completo de usuário;
- permissões administrativas;
- gastos compartilhados entre usuários;
- upload de comprovante Pix;
- OCR;
- extração automática de dados;
- sugestão automática de categoria;
- sugestão automática de tipo;
- aprendizado por histórico;
- dashboard avançada;
- gráficos;
- rankings;
- filtros avançados;
- deploy;
- aplicativo nativo.

## 5. Modelo inicial de dados

### User

Representa o usuário autenticado pelo Supabase Auth.

Campos planejados:

- `id`: UUID vindo da autenticação.
- `email`: e-mail de login.
- `created_at`: data de criação.

Regras:

- O `id` deve vir da sessão autenticada.
- Não usar dados editáveis pelo usuário para autorização.
- Dados financeiros só podem ser acessados com usuário autenticado.

### Expense

Representa um gasto manual confirmado pelo usuário.

Campos planejados:

- `id`: UUID.
- `user_id`: dono do gasto, obrigatório.
- `amount`: valor do gasto.
- `date`: data do gasto.
- `description`: descrição curta opcional.
- `category_id`: categoria.
- `expense_type_id`: tipo do gasto.
- `payment_method`: forma de pagamento.
- `merchant_name`: recebedor opcional.
- `source`: valor inicial `manual`.
- `created_at`: data de criação.
- `updated_at`: data de alteração.

Regras:

- `user_id` é obrigatório.
- Não existe gasto sem dono.
- `amount` é obrigatório e maior que zero.
- `date` é obrigatória.
- `category_id` é obrigatória.
- `expense_type_id` é obrigatório.
- O usuário só pode listar, editar ou excluir os próprios gastos.
- Valores monetários devem evitar `float`; preferir centavos inteiros ou decimal seguro.

### Category

Representa a categoria do gasto.

Categorias iniciais:

- Alimentação.
- Mercado.
- Mecânica.
- Combustível.
- Lazer.
- Saúde.
- Educação.
- Moradia.
- Contas.
- Compras.
- Assinaturas.
- Sítio.
- Outros.

Observação: `Transporte` permanece apenas para exibir registros antigos.

Regras:

- Categorias padrão podem ser globais.
- Categorias personalizadas futuras devem ter `user_id`.
- O usuário não deve acessar categorias privadas de outro usuário.

### ExpenseType

Representa o tipo do gasto.

Tipos iniciais obrigatórios:

- Necessário.
- Importante.
- Lazer.
- Supérfluo.
- Investimento.
- Dívida.
- A receber.

Regras:

- A lista inicial pode ser controlada pelo sistema.
- Alterações futuras devem preservar histórico.

## 6. Fluxo do usuário

1. Usuário acessa o sistema.
2. Se não estiver autenticado, vê login ou criação de conta.
3. Usuário cria conta ou faz login com e-mail e senha.
4. Sistema libera a área privada.
5. Usuário acessa o cadastro manual de gasto.
6. Usuário informa valor, descrição, data, categoria, tipo e forma de pagamento.
7. Sistema valida os campos obrigatórios.
8. Sistema impede cadastro sem valor, com valor zero ou negativo.
9. Usuário salva o gasto.
10. Sistema associa o gasto ao `user_id` autenticado.
11. Usuário vê o gasto na listagem simples.
12. Ao sair da conta, o usuário perde acesso à área privada.

## 7. Critérios de aceite

- O usuário consegue criar conta com e-mail e senha.
- O usuário consegue fazer login com e-mail e senha.
- O usuário consegue sair da conta.
- A área de gastos é bloqueada para usuário não autenticado.
- O usuário consegue cadastrar um gasto com valor, data, categoria, tipo e forma de pagamento.
- O sistema impede cadastro sem valor.
- O sistema impede valor zero ou negativo.
- O sistema impede cadastro sem data.
- O sistema impede cadastro sem categoria.
- O sistema impede cadastro sem tipo.
- O gasto cadastrado recebe o usuário autenticado como dono.
- Nenhum gasto é salvo sem `user_id`.
- A listagem mostra apenas gastos do usuário autenticado.
- A segurança não depende apenas de filtro no frontend.
- O layout funciona bem em celular.
- O layout também funciona bem em desktop.
- Nenhuma funcionalidade de comprovante Pix é implementada.
- Nenhuma funcionalidade de OCR é implementada.
- Nenhuma sugestão automática é implementada.
- Nenhum gráfico ou dashboard avançada é implementado.

## 8. Critérios BDD relacionados

Cenários de `features/autenticacao.feature` atendidos:

- Criar conta com e-mail e senha.
- Fazer login com e-mail e senha.
- Bloquear login com credenciais inválidas.
- Bloquear área privada sem login.
- Acessar área privada após login.
- Sair da conta.
- Manter dados financeiros acessíveis apenas ao usuário autenticado.
- Usar login e cadastro em tela pequena.

Cenários de `features/cadastro-rapido.feature` atendidos:

- Bloquear cadastro de gasto sem autenticação.
- Cadastrar gasto manualmente após login.
- Impedir cadastro sem valor.
- Impedir valor zero ou negativo.
- Escolher categoria.
- Escolher tipo do gasto.
- Salvar gasto vinculado ao usuário autenticado.
- Listar apenas os próprios gastos.
- Usar cadastro de gasto no celular.
- Usar listagem de gastos no celular e no desktop.

Cenários de `features/responsividade.feature` atendidos:

- Login funciona no celular.
- Cadastro de gasto funciona no celular.
- Listagem funciona no celular.
- Sistema funciona no desktop sem quebrar layout.
- Campos e botões continuam fáceis de usar em tela pequena.

## 9. Arquivos prováveis

Os caminhos podem mudar conforme a implementação, mas a primeira fatia deve tender a esta organização:

```text
package.json
next.config.*
tsconfig.json
eslint.config.*
postcss.config.*
public/manifest.json
public/icons/
src/app/layout.tsx
src/app/page.tsx
src/app/(auth)/login/page.tsx
src/app/(auth)/cadastro/page.tsx
src/app/(app)/layout.tsx
src/app/(app)/gastos/page.tsx
src/app/(app)/gastos/actions.ts
src/components/auth/LoginForm.tsx
src/components/auth/SignupForm.tsx
src/components/expense/ExpenseForm.tsx
src/components/expense/ExpenseList.tsx
src/components/layout/AppShell.tsx
src/components/ui/
src/lib/auth/require-user.ts
src/lib/auth/auth-actions.ts
src/lib/supabase/client.ts
src/lib/supabase/server.ts
src/lib/expenses/expense-schema.ts
src/lib/expenses/expense-repository.ts
src/lib/categories/default-categories.ts
src/lib/expense-types/default-expense-types.ts
src/types/database.ts
tests/auth/auth-flow.test.ts
tests/expenses/expense-schema.test.ts
tests/expenses/expense-repository.test.ts
tests/expenses/user-isolation.test.ts
tests/e2e/cadastro-rapido.spec.ts
.env.example
```

Migrations só devem ser criadas quando a tarefa pedir explicitamente banco ou integração real com Supabase.

## 10. Testes e verificação

### Testes de autenticação

- Criar conta com dados válidos.
- Fazer login com dados válidos.
- Impedir login inválido.
- Bloquear rota privada sem usuário autenticado.
- Permitir rota privada com usuário autenticado.
- Fazer logout e bloquear acesso privado depois.

### Testes de validação

- Impedir gasto sem valor.
- Impedir valor zero.
- Impedir valor negativo.
- Impedir gasto sem data.
- Impedir gasto sem categoria.
- Impedir gasto sem tipo.
- Validar forma de pagamento.
- Confirmar `source = manual`.

### Testes de cadastro e listagem

- Criar gasto manual válido.
- Associar gasto ao usuário autenticado.
- Exibir gasto cadastrado na listagem.
- Exibir estado vazio quando não houver gastos.
- Garantir que usuário A não veja gasto do usuário B.

### Verificação visual

- Conferir login em viewport mobile.
- Conferir cadastro em viewport mobile.
- Conferir listagem em viewport mobile.
- Conferir app em desktop.
- Garantir que campos, botões e mensagens não sobreponham conteúdo.
- Garantir que botões tenham área confortável de toque.

### Comandos

Quando existirem scripts no projeto, rodar:

- `npm run lint`;
- `npm run typecheck`;
- `npm test`;
- `npm run build`.

Se algum script não existir, registrar isso claramente.

## 11. Riscos

### Riscos técnicos

- Implementar auth tarde demais e precisar refatorar toda a camada de dados.
- Criar formulário funcional, mas sem proteção real de rota.
- Usar `localStorage` como se fosse persistência segura.
- Definir banco sem `user_id` obrigatório.
- Usar valor monetário com `float`.
- Criar UI boa no celular, mas quebrada em desktop.
- Criar UI boa no desktop, mas difícil de usar no celular.

### Riscos de segurança e privacidade

- Dados financeiros são sensíveis.
- Usuário ver gastos de outro usuário.
- Gasto ser salvo sem dono.
- Autorização depender apenas do frontend.
- Falta de RLS no Supabase.
- Service role key exposta no frontend.
- Segredos em variáveis `NEXT_PUBLIC_*`.
- Logs com dados financeiros completos.
- Cache PWA armazenar dados privados de forma insegura.

### Mitigações

- Usar Supabase Auth como fonte de identidade.
- Exigir `user_id` em `Expense`.
- Proteger rotas privadas no servidor.
- Planejar RLS desde a primeira modelagem real de banco.
- Criar testes de isolamento entre usuários.
- Manter armazenamento local apenas como fallback temporário documentado.
- Validar dados no servidor.
- Evitar logs com payload financeiro completo.

## 12. Ordem de implementação

1. Revisar o protótipo atual e separar o que pode ser reaproveitado.
   - Verificação: lista de componentes úteis e pontos inseguros registrada.

2. Preparar variáveis e fronteira de Supabase/Auth.
   - Verificação: `.env.example` documenta variáveis públicas e privadas sem segredos reais.

3. Criar camada de auth.
   - Verificação: existe forma clara de obter o usuário autenticado no servidor.

4. Criar telas de login e criação de conta.
   - Verificação: formulários funcionam no celular e no desktop.

5. Criar logout e proteção da área privada.
   - Verificação: usuário sem sessão não acessa gastos.

6. Ajustar modelo de gasto para exigir usuário dono.
   - Verificação: nenhum gasto pode ser criado sem `user_id`.

7. Ajustar repositório/camada de dados.
   - Verificação: listagem busca somente dados do usuário autenticado.

8. Reaproveitar e adaptar cadastro manual.
   - Verificação: validação impede valor ausente, zero ou negativo.

9. Reaproveitar e adaptar listagem simples.
   - Verificação: gasto salvo aparece na listagem do próprio usuário.

10. Criar ou ajustar testes.
    - Verificação: testes cobrem auth, validação, cadastro, listagem e isolamento.

11. Verificar responsividade.
    - Verificação: app revisado em mobile e desktop.

12. Rodar verificação final.
    - Verificação: lint, typecheck, tests e build passam ou falhas são registradas.

## 13. Revisão da implementação atual

A implementação anterior criou uma boa base de protótipo, mas ainda não atende a fatia corrigida.

### Pode ser reaproveitado

- Estrutura Next.js/React/TypeScript já criada.
- Formulário manual de gastos.
- Listagem simples de gastos.
- Categorias iniciais.
- Tipos iniciais de gasto.
- Formas iniciais de pagamento.
- Validação básica.
- Testes de schema e repositório local.
- CSS mobile-first já iniciado.

### Precisa ser corrigido antes de considerar a fatia completa

- `src/lib/users/current-user.ts` usa um usuário demo fixo.
- `src/lib/expenses/expense-repository.ts` usa `localStorage`.
- `src/components/expense/ManualExpenseApp.tsx` depende do usuário demo.
- Não existe criação de conta real.
- Não existe login real.
- Não existe logout real.
- Não existe proteção real de rota privada.
- Não existe garantia real de isolamento entre usuários.
- `localStorage` não é seguro para dados financeiros multiusuário.
- A listagem atual não prova isolamento real com Supabase Auth/Postgres/RLS.

### Decisão sobre o protótipo atual

Não é necessário apagar o que já foi feito. A próxima implementação deve adaptar o protótipo para autenticação real ou para uma fronteira de auth clara, substituindo o usuário demo por sessão autenticada e deixando explícito o que ainda for fallback temporário.

## 14. Próximo prompt recomendado

```text
Use $Tlc Spec Driven.
Use também $Executing Plans, $React Best Practices, $Supabase, $Supabase Postgres Best Practices, $Security Best Practices, $Frontend Testing Debugging, $Verification Before Completion, $Interface Design e $shadcn/ui quando fizer sentido.

Implemente a primeira fatia vertical corrigida seguindo specs/FIRST_VERTICAL_SLICE_PLAN.md.

Antes de implementar, leia:
- AGENTS.md
- docs/PRODUCT_SPEC.md
- docs/ARCHITECTURE.md
- docs/DATA_MODEL.md
- docs/SECURITY_AND_PRIVACY_SPEC.md
- specs/MVP_SCOPE.md
- specs/IMPLEMENTATION_ROADMAP.md
- specs/FIRST_VERTICAL_SLICE_PLAN.md
- features/autenticacao.feature
- features/cadastro-rapido.feature
- features/responsividade.feature

Escopo:
- Auth com criação de conta, login e logout;
- proteção de área privada;
- cadastro manual de gastos por usuário autenticado;
- listagem simples apenas dos gastos do usuário autenticado;
- validação básica;
- layout mobile-first e responsivo para desktop;
- estrutura preparada para Supabase Auth, Postgres e RLS;
- testes básicos e verificação final.

Não implemente upload Pix, OCR, sugestão automática, dashboard avançada, gráficos, compartilhamento de gastos ou deploy.
```
