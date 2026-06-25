# language: pt
Funcionalidade: Dashboard financeiro
  Como usuário do Bolso em Dia
  Quero visualizar meus gastos de forma simples
  Para entender onde estou gastando mais

  Cenário: Visualizar total gasto no mês
    Dado que tenho gastos confirmados no mês atual
    Quando acesso a dashboard
    Então o sistema deve exibir o gasto total do mês

  Cenário: Filtrar por mês e ano
    Dado que tenho gastos em períodos diferentes
    Quando seleciono um mês e um ano na dashboard
    Então o sistema deve calcular o resumo apenas com gastos desse período

  Cenário: Visualizar resumos por categoria e tipo
    Dado que tenho gastos em categorias e tipos diferentes
    Quando acesso a dashboard
    Então o sistema deve agrupar os totais por categoria
    E deve agrupar os totais por tipo de gasto

  Cenário: Visualizar gastos supérfluos
    Dado que tenho gastos classificados como Supérfluo
    Quando acesso a dashboard
    Então o sistema deve exibir o total de gastos supérfluos
    E deve ajudar a identificar oportunidade de economia

  Cenário: Visualizar ranking de maiores gastos
    Dado que tenho vários gastos confirmados
    Quando acesso o ranking de maiores gastos
    Então o sistema deve listar os maiores gastos primeiro

  Cenário: Visualizar economia possível
    Dado que tenho gastos supérfluos no período selecionado
    Quando acesso a dashboard
    Então o sistema deve exibir como economia possível 50% do total supérfluo
    E não deve incluir Necessário, Importante, Lazer, Investimento, Dívida ou A receber nesse cálculo
    E deve deixar claro que é uma sugestão de controle, não uma recomendação financeira profissional

  Cenário: Ignorar gasto sem data válida no resumo do período
    Dado que existe um gasto confirmado sem data válida
    Quando acesso a dashboard filtrando por mês e ano
    Então esse gasto não deve aparecer como "Sem data" no resumo do período
    E não deve entrar no total, categorias, ranking ou economia possível

  Cenário: Visualizar estado vazio
    Dado que não tenho gastos no período selecionado
    Quando acesso a dashboard
    Então o sistema deve mostrar uma mensagem amigável
    E deve oferecer acesso ao cadastro de gasto

  Cenário: Impedir acesso sem autenticação
    Dado que não estou autenticado
    Quando tento acessar a dashboard
    Então devo ser redirecionado para o login
