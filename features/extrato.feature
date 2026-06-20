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
