# language: pt
Funcionalidade: Dashboard financeiro
  Como usuário do Bolso em Dia
  Quero visualizar meus gastos de forma simples
  Para entender onde estou gastando mais

  Cenário: Visualizar total gasto no mês
    Dado que tenho gastos confirmados no mês atual
    Quando acesso a dashboard
    Então o sistema deve exibir o gasto total do mês

  Cenário: Filtrar por categoria
    Dado que tenho gastos em categorias diferentes
    Quando filtro a dashboard por uma categoria
    Então o sistema deve mostrar apenas dados dessa categoria

  Cenário: Filtrar por tipo de gasto
    Dado que tenho gastos com tipos diferentes
    Quando filtro a dashboard por tipo de gasto
    Então o sistema deve atualizar cards, gráficos e rankings com esse tipo

  Cenário: Visualizar gastos supérfluos
    Dado que tenho gastos classificados como Supérfluo
    Quando acesso a dashboard
    Então o sistema deve exibir o total de gastos supérfluos
    E deve ajudar a identificar oportunidade de economia

  Cenário: Visualizar ranking de maiores gastos
    Dado que tenho vários gastos confirmados
    Quando acesso o ranking de maiores gastos
    Então o sistema deve listar os maiores gastos primeiro

  Cenário: Visualizar evolução mensal
    Dado que tenho gastos em meses diferentes
    Quando acesso o gráfico de evolução mensal
    Então o sistema deve mostrar a variação de gastos por mês

  Cenário: Visualizar economia possível
    Dado que tenho gastos supérfluos ou limite mensal definido
    Quando acesso a dashboard
    Então o sistema deve exibir uma estimativa simples de economia possível
    E deve deixar claro que é uma sugestão de controle, não uma recomendação financeira profissional
