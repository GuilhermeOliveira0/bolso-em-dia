# Product Spec

## Objetivo do sistema

Criar um sistema web/PWA de controle financeiro pessoal para registrar gastos com rapidez, importar comprovantes Pix, sugerir classificação automática e mostrar uma dashboard clara sobre onde o dinheiro está sendo gasto.

## Problema que ele resolve

Muitas pessoas deixam de controlar gastos porque o cadastro manual é lento, os comprovantes ficam espalhados e a análise do mês exige esforço. O Bolso em Dia deve reduzir esse atrito com cadastro rápido, OCR de comprovantes e resumo visual simples.

## Público-alvo

- Pessoas que usam Pix com frequência.
- Pessoas que querem entender melhor seus gastos mensais.
- Usuários que preferem controlar finanças pelo celular.
- Usuários que precisam de uma solução simples, sem complexidade de sistema contábil.

## Funcionalidades principais

- Autenticação com conta individual por usuário.
- Cadastro manual rápido de gasto.
- Listagem simples de gastos.
- Upload de comprovante Pix por imagem ou PDF.
- OCR para extrair dados do comprovante.
- Revisão dos dados extraídos antes de salvar.
- Sugestão de categoria.
- Sugestão de tipo do gasto.
- Dashboard com cards, filtros, gráficos e rankings.
- Limite mensal para apoiar a análise de economia possível.
- Interface responsiva, mobile-first e confortável também no computador.

## Fora do escopo da primeira versão

- Integração direta com bancos.
- Conciliação automática de conta bancária.
- Compartilhamento de carteira entre usuários.
- Gestão empresarial ou contábil.
- Emissão de relatórios fiscais.
- Assinaturas pagas ou cobrança.
- Aplicativo nativo publicado em lojas.

## Fluxo principal do usuário

1. O usuário acessa o sistema pelo celular.
2. Se ainda não tiver conta, o usuário cria uma conta com e-mail e senha.
3. O usuário faz login.
4. O usuário acessa uma área principal de lançamentos.
5. Na mesma experiência visual, o usuário alterna entre nova despesa, novo comprovante e extrato.
6. O usuário cadastra um gasto manualmente ou envia uma imagem de comprovante Pix.
7. Nesta fatia, comprovantes enviados não geram gasto automaticamente.
8. Quando houver OCR em fatia futura, o sistema lê o arquivo e extrai dados possíveis.
9. O sistema sugere categoria e tipo do gasto somente em fatia futura.
10. O usuário revisa, corrige se necessário e confirma antes de qualquer gasto extraído ser salvo.
11. O gasto confirmado aparece no extrato somente do usuário autenticado.
12. A dashboard mostra totais, filtros, gráficos e rankings somente com dados do usuário autenticado.

## MVP

O MVP será considerado a primeira versão utilizável do produto. Ele deve incluir:

- cadastro manual de gastos;
- listagem simples;
- autenticação por usuário;
- isolamento de dados por usuário;
- dashboard básica;
- upload de comprovante Pix;
- OCR inicial;
- etapa de confirmação antes de salvar gasto extraído;
- sugestão de categoria e tipo;
- filtros básicos.

## Critérios de sucesso

- O usuário consegue registrar um gasto manual em poucos passos.
- O usuário consegue criar conta, entrar e sair.
- O usuário só visualiza os próprios gastos.
- O usuário consegue enviar comprovante Pix e revisar dados extraídos.
- Nenhum gasto extraído de comprovante é salvo sem confirmação.
- A dashboard ajuda o usuário a identificar maiores gastos, gastos supérfluos e economia possível.
- O sistema funciona bem em tela de celular e computador.
- Dados financeiros não aparecem em logs completos ou mensagens técnicas.

## Restrições importantes

- O sistema deve ser mobile-first.
- O sistema deve ser responsivo para celular e desktop.
- O sistema é multiusuário.
- Toda funcionalidade financeira exige usuário autenticado.
- Nenhum gasto pode existir sem dono (`user_id`).
- O frontend não pode ser a única barreira de segurança.
- Com Supabase, Auth e Row Level Security devem proteger os dados por `user_id`.
- Dados financeiros e comprovantes são sensíveis.
- A especificação é a fonte principal de verdade do projeto.
- O desenvolvimento deve seguir Spec-Driven Development, BDD e Vertical Slice.
- Cada fatia vertical deve entregar uma funcionalidade completa e verificável.
- Não criar funcionalidades grandes sem dividir em etapas.

## Decisão de UX: lançamentos unificados

- "Nova despesa" e "Novo comprovante" ficam no mesmo fluxo visual para reduzir troca de tela.
- "Extrato" passa a ser a área de leitura dos gastos cadastrados na tabela `expenses`.
- `/lancamentos` é a rota preferencial dessa experiência.
- `/gastos` e `/comprovantes` devem continuar funcionando para compatibilidade e acesso direto.
- OCR, PDF e sugestão automática de categoria continuam fora do escopo desta fatia.

## Assumptions

- O usuário terá conta individual no sistema.
- A primeira versão usará autenticação por e-mail e senha.
- A stack preferencial será Next.js/React com Supabase, salvo decisão futura diferente.
- OCR poderá começar com serviço externo ou biblioteca, desde que o processamento respeite privacidade.
