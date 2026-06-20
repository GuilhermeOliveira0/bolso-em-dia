# Decisao: fluxo visual do prototipo

Esta fatia aplica o visual de `Mobile.html` e `dasktop.html` ao projeto real sem copiar HTML puro.

## Navegacao principal

- `/dashboard`: resumo financeiro do mes, cards de total, necessario, lazer, superfluo e economia.
- `/lancamentos`: tela de cadastro, juntando nova despesa manual e novo comprovante Pix.
- `/extrato`: tela propria de consulta, busca e filtros de despesas da tabela `expenses`.

## Rotas preservadas

- `/gastos` continua existindo e pode redirecionar para `/lancamentos`.
- `/comprovantes` continua existindo como rota segura de upload/listagem.

## Fora do escopo desta fatia

- OCR.
- PDF.
- Sugestao automatica de categoria ou tipo.
- Criacao automatica de gasto a partir de comprovante.
- Alteracao de Auth, RLS, SQL ou `.env.local`.
