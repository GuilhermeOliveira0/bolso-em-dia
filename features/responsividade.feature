# language: pt
Funcionalidade: Responsividade
  Como usuário do Bolso em Dia
  Quero usar o sistema no celular e no desktop
  Para cadastrar e consultar gastos sem dificuldade

  Cenário: Login funciona no celular
    Dado que acesso o sistema por uma tela pequena
    Quando abro a tela de login
    Então os campos devem caber na tela
    E o botão principal deve ser fácil de tocar

  Cenário: Cadastro de gasto funciona no celular
    Dado que estou autenticado no sistema
    E acesso o cadastro de gasto por uma tela pequena
    Quando preencho valor, data, categoria, tipo e forma de pagamento
    Então o formulário deve continuar legível
    E nenhuma informação importante deve ficar sobreposta

  Cenário: Listagem funciona no celular
    Dado que estou autenticado no sistema
    E tenho gastos cadastrados
    Quando abro a listagem em uma tela pequena
    Então os gastos devem ser legíveis
    E ações principais devem ser fáceis de tocar

  Cenário: Sistema funciona no desktop
    Dado que acesso o sistema em uma tela maior
    Quando uso login, cadastro e listagem
    Então o conteúdo deve aproveitar melhor o espaço
    E não deve parecer uma tela mobile esticada

  Cenário: Dashboard funciona no celular
    Dado que estou autenticado no sistema
    Quando acesso a dashboard em uma tela com 390 pixels de largura
    Então cards, filtros e listas devem caber sem rolagem horizontal
    E a navegação para gastos deve continuar acessível

  Cenário: Upload de comprovante funciona no celular
    Dado que estou autenticado no sistema
    Quando acesso a área de comprovantes em uma tela pequena
    Então o campo de imagem e o botão de envio devem ser fáceis de tocar
    E a listagem de comprovantes deve aparecer em cards sem rolagem horizontal

  Cenário: Campos e botões não quebram em telas pequenas
    Dado que uso o sistema em largura reduzida
    Quando navego pelas telas principais da primeira fatia
    Então textos, campos e botões não devem sobrepor outros elementos
    E nenhum controle importante deve ficar fora da tela

  Cenário: Lançamentos unificados funcionam no celular
    Dado que estou autenticado no sistema
    Quando acesso a área de lançamentos em uma tela com 390 pixels de largura
    Então as abas de nova despesa, novo comprovante e extrato devem caber sem rolagem horizontal
    E os cards do extrato devem ser legíveis e confortáveis para toque
