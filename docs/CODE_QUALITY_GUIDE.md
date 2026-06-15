# Guia de Qualidade de Código

Este guia define regras práticas para manter o Bolso em Dia simples, seguro e fácil de evoluir.

## Princípios gerais

- Preferir código direto e nomes que expliquem a intenção.
- Manter funções pequenas e com uma responsabilidade clara.
- Remover duplicação real, sem criar abstrações para casos únicos.
- Preservar o comportamento existente durante refatorações.
- Alterar uma fronteira por vez e verificar antes de continuar.
- Não misturar novas funcionalidades com refatorações de qualidade.

## Clean Code

- Usar nomes do domínio: `expense`, `period`, `userId`, `amountInCents`.
- Evitar abreviações e nomes genéricos como `data`, `item` ou `handle` sem contexto.
- Manter regras financeiras fora do JSX.
- Extrair cálculos para funções puras e cobri-los com testes.
- Centralizar categorias, tipos de gasto e formas de pagamento nas listas padrão existentes.
- Retornar mensagens seguras ao usuário, sem detalhes internos do Supabase ou payload financeiro.
- Usar comentários apenas para decisões que não ficam claras pelo código.

## SOLID

### SRP

- Páginas coordenam sessão, dados e renderização.
- Componentes exibem interface e tratam interação local.
- Server Actions validam sessão e chamam serviços ou repositórios.
- Repositórios executam persistência e mapeiam registros.
- Schemas validam entrada.
- Helpers puros calculam totais, períodos e formatação.

### OCP

- Adicionar categorias, tipos e formas de pagamento pelas constantes centrais.
- Adicionar cálculos da dashboard por funções novas ou composição das existentes.
- Evitar condicionais espalhadas quando uma lista ou função de domínio pode ser estendida.

### DIP

- Páginas e actions devem depender de `ExpenseRepository` sempre que possível.
- A criação concreta do cliente Supabase deve ficar em uma fábrica server-side.
- Componentes React não devem importar clientes ou tipos internos do Supabase.
- O legado em `localStorage` deve permanecer isolado e nunca entrar no fluxo principal.

## Segurança

- Toda consulta financeira exige usuário autenticado.
- Consultas devem filtrar explicitamente por `user_id`; RLS permanece como proteção principal.
- Nunca usar `user_metadata` para autorização. O nome é apenas informação de apresentação.
- Nunca usar service role key no frontend.
- Não alterar ou expor `.env.local`.
- Não registrar gastos, comprovantes, tokens ou credenciais em logs.
- Erros devem ser genéricos para o usuário e não revelar detalhes do banco.

## Performance

- Buscar apenas as colunas necessárias.
- Filtrar período e usuário no banco, não depois de baixar todo o histórico.
- Evitar consultas em loop.
- Após criar um gasto, usar o registro retornado quando isso evitar uma nova consulta segura.
- Preferir cálculo linear e previsível para agregações pequenas.
- Manter o índice `expenses_user_id_date_idx` para consultas por usuário e data.
- Não adicionar dependência pesada sem benefício medido.
- Não armazenar respostas financeiras em cache público.

## React e interface

- Buscar dados privados no servidor quando a interação não exigir estado client-side.
- Evitar estado duplicado e efeitos que possam ser substituídos por dados já retornados.
- Manter componentes focados; extrair quando houver regra, repetição ou dificuldade de teste.
- Preservar estados de carregamento, vazio, erro e sucesso.
- Validar em 390px e 1280px, sem overflow horizontal.

## Testes e conclusão

- Regras financeiras puras devem ter testes unitários.
- Mudanças em autenticação ou repositório devem revisar isolamento por usuário.
- Rodar `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`.
- Verificar login, cadastro, gastos e dashboard no navegador.
- Relatar riscos prevenidos, limitações e trabalho fora do escopo.
