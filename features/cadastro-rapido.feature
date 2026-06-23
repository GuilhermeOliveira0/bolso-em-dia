# language: pt
Funcionalidade: Cadastro rápido de gastos
  Como usuário autenticado do Bolso em Dia
  Quero cadastrar gastos com poucos passos
  Para manter meu controle financeiro atualizado pelo celular

  Cenário: Bloquear cadastro de gasto sem autenticação
    Dado que não estou autenticado no sistema
    Quando tento acessar o cadastro de gastos
    Então o sistema deve bloquear o acesso
    E deve me orientar a fazer login ou criar conta

  Cenário: Cadastrar gasto manualmente após login
    Dado que tenho uma conta no sistema
    E estou autenticado
    Quando informo valor, data, categoria, tipo do gasto e forma de pagamento
    Então o sistema deve permitir o cadastro manual do gasto

  Cenário: Impedir cadastro sem valor
    Dado que estou autenticado no sistema
    Quando tento cadastrar um gasto sem informar valor
    Então o sistema deve impedir o cadastro
    E deve informar que o valor é obrigatório

  Cenário: Impedir cadastro com valor zero ou negativo
    Dado que estou autenticado no sistema
    Quando tento cadastrar um gasto com valor zero ou negativo
    Então o sistema deve impedir o cadastro
    E deve informar que o valor precisa ser maior que zero

  Cenário: Escolher categoria
    Dado que estou autenticado no sistema
    E estou cadastrando um gasto manualmente
    Quando seleciono uma categoria
    Então o sistema deve associar a categoria ao gasto

  Cenário: Escolher tipo do gasto
    Dado que estou autenticado no sistema
    E estou cadastrando um gasto manualmente
    Quando seleciono o tipo do gasto
    Então o sistema deve associar o tipo ao gasto

  Cenário: Manter classificação manual no cadastro rápido
    Dado que estou autenticado no sistema
    E estou cadastrando um gasto manualmente
    Quando digito a descrição do gasto
    Então categoria e tipo do gasto devem continuar sob meu controle
    E nenhuma classificação deve salvar despesa automaticamente

  Cenário: Salvar gasto vinculado ao usuário autenticado
    Dado que estou autenticado no sistema
    E preenchi os dados obrigatórios do gasto
    Quando confirmo o cadastro
    Então o sistema deve salvar o gasto
    E o gasto deve pertencer ao meu usuário
    E nenhum gasto deve ser salvo sem dono

  Cenário: Listar apenas os próprios gastos
    Dado que estou autenticado no sistema
    E salvei um gasto confirmado
    Quando acesso o Extrato na área de lançamentos
    Então o sistema deve exibir o gasto cadastrado
    E não deve exibir gastos de outros usuários

  Cenário: Alternar entre nova despesa e extrato
    Dado que estou autenticado no sistema
    Quando acesso a área de lançamentos
    Então devo ver uma aba ou seção "Nova despesa"
    E devo ver uma aba ou seção "Extrato"
    E o cadastro manual deve continuar disponível sem sair do fluxo

  Cenário: Sair da conta após cadastrar gasto
    Dado que estou autenticado no sistema
    E cadastrei um gasto manual
    Quando faço logout
    Então o sistema deve encerrar minha sessão
    E deve bloquear o acesso à listagem de gastos

  Cenário: Usar o cadastro de gasto no celular
    Dado que estou autenticado no sistema
    E acesso o cadastro por uma tela pequena
    Quando preencho os campos do gasto
    Então os campos e botões devem continuar fáceis de usar
    E o conteúdo não deve quebrar visualmente

  Cenário: Usar a listagem de gastos no celular e no desktop
    Dado que estou autenticado no sistema
    E tenho gastos cadastrados
    Quando acesso a listagem em celular ou desktop
    Então os gastos devem ser legíveis
    E a listagem deve se adaptar ao tamanho da tela
