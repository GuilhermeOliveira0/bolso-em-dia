# Dashboard Spec

## Objetivo

A dashboard deve ajudar o usuário autenticado a entender onde está gastando mais, identificar gastos supérfluos e perceber oportunidades de economia. A leitura deve ser simples, visual, mobile-first e boa no celular e no computador.

## Cards principais

O topo da dashboard deve mostrar:

- gasto total do mês;
- total necessário;
- total lazer;
- total supérfluo;
- economia possível.

Todos os cards devem usar apenas gastos do usuário autenticado.

## Filtros

A dashboard deve permitir filtrar por:

- mês;
- ano;
- categoria;
- tipo do gasto;
- forma de pagamento;
- recebedor;
- valor mínimo;
- valor máximo.

Filtros devem afetar cards, gráficos e rankings de forma consistente.
Filtros devem funcionar bem em celular, evitando controles pequenos ou difíceis de tocar.

## Gráficos

Incluir visualizações para:

- gastos por categoria;
- gastos por tipo;
- evolução mensal.

Os gráficos devem priorizar clareza em tela pequena. Quando houver muitos itens, mostrar os principais e agrupar o restante como "Outros".
No desktop, os gráficos podem ocupar mais espaço, mas a versão mobile deve continuar legível.

## Rankings

Incluir rankings para:

- maiores recebedores;
- maiores gastos;
- categorias com maior aumento.

Rankings devem mostrar poucos itens por padrão, evitando uma tela longa demais.

## Regras para visual mobile

- Cards devem aparecer antes de gráficos detalhados.
- Filtros devem ficar compactos, com abertura simples.
- Gráficos devem ter rótulos curtos.
- Evitar tabelas largas.
- Usar listas verticais quando houver muitos dados.
- Manter botões e campos fáceis de tocar.
- Evitar depender de tabelas largas.
- Usar cards/listas responsivas para rankings.
- Validar a dashboard em celular e computador antes de concluir.

## Evitar excesso de informação

- Mostrar primeiro o resumo do mês.
- Evitar muitos gráficos na primeira dobra da tela.
- Mostrar detalhes progressivamente.
- Não usar cores em excesso.
- Priorizar comparações simples, como mês atual versus mês anterior.

## Como ajudar o usuário

A dashboard deve responder perguntas como:

- Quanto eu gastei este mês?
- Onde está indo a maior parte do dinheiro?
- Quanto foi gasto em itens supérfluos?
- Quem recebeu mais pagamentos?
- Quais categorias aumentaram mais?
- Quanto eu poderia economizar se reduzisse certos gastos?

## Economia possível

A economia possível pode começar com uma regra simples:

- considerar total de gastos supérfluos;
- comparar com limite mensal, quando existir;
- mostrar alerta quando o gasto mensal estiver perto ou acima do limite.

Essa regra deve ser explicada de forma simples para não parecer cálculo financeiro absoluto.

## Assumptions

- A dashboard inicial usará dados confirmados, não rascunhos de OCR.
- A dashboard só deve estar disponível para usuário autenticado.
- A dashboard nunca deve agregar dados de usuários diferentes.
- Gráficos avançados podem ficar para depois do MVP básico.
- A primeira versão deve priorizar leitura rápida em celular.
