# language: pt
Funcionalidade: Extrato de gastos
  Como usuario autenticado do Bolso em Dia
  Quero consultar, buscar e filtrar minhas despesas
  Para entender minhas movimentacoes sem misturar dados de outros usuarios

  Cenario: Impedir acesso ao extrato sem autenticacao
    Dado que nao estou autenticado
    Quando tento acessar o extrato
    Entao devo ser redirecionado para o login

  Cenario: Listar despesas reais do usuario autenticado
    Dado que estou autenticado no sistema
    E tenho despesas cadastradas
    Quando acesso a rota "/extrato"
    Entao devo ver apenas despesas da minha conta
    E devo ver valor, descricao, categoria, tipo e forma de pagamento

  Cenario: Buscar e filtrar despesas no extrato
    Dado que estou autenticado no sistema
    E tenho despesas cadastradas com categorias, tipos e pagamentos diferentes
    Quando uso a busca ou os filtros em pilulas
    Entao a lista deve mostrar apenas despesas correspondentes
    E deve manter o layout legivel no celular e no desktop

  Cenario: Filtrar despesas por periodo
    Dado que estou autenticado no sistema
    E tenho despesas em meses e dias diferentes
    Quando seleciono "Este mes", "Mes passado", "Ultimos 7 dias", "Ultimos 30 dias" ou um periodo personalizado
    Entao o extrato deve listar apenas despesas do periodo escolhido
    E o total exibido deve considerar apenas esse periodo e os filtros ativos

  Cenario: Editar uma despesa confirmada
    Dado que estou autenticado no sistema
    E tenho uma despesa cadastrada no extrato
    Quando edito valor, data, descricao, categoria, tipo ou forma de pagamento
    Entao a despesa deve ser atualizada apenas se pertencer a minha conta
    E dashboard, extrato e lancamentos devem refletir a alteracao

  Cenario: Excluir uma despesa confirmada com confirmacao
    Dado que estou autenticado no sistema
    E tenho uma despesa cadastrada no extrato
    Quando solicito a exclusao da despesa
    Entao o sistema deve pedir confirmacao antes de excluir
    E a exclusao deve afetar apenas despesas da minha conta
    E comprovantes vinculados devem permanecer privados
