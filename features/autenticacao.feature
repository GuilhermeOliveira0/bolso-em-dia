# language: pt
Funcionalidade: Autenticação
  Como usuário do Bolso em Dia
  Quero criar conta, entrar e sair do sistema
  Para manter meus dados financeiros privados

  Cenário: Criar conta com e-mail e senha
    Dado que não tenho conta no sistema
    Quando informo e-mail e senha válidos
    Então o sistema deve criar minha conta
    E deve liberar o acesso à área privada

  Cenário: Fazer login com e-mail e senha
    Dado que tenho uma conta no sistema
    Quando informo e-mail e senha corretos
    Então o sistema deve autenticar meu usuário
    E deve liberar o acesso à área privada

  Cenário: Bloquear login com credenciais inválidas
    Dado que tento entrar no sistema
    Quando informo e-mail ou senha inválidos
    Então o sistema deve bloquear o login
    E não deve liberar acesso à área privada

  Cenário: Bloquear área privada sem login
    Dado que não estou autenticado
    Quando tento acessar a área de gastos
    Então o sistema deve bloquear o acesso
    E deve me orientar a fazer login ou criar conta

  Cenário: Acessar área privada após login
    Dado que tenho uma conta no sistema
    E fiz login com sucesso
    Quando acesso a área de gastos
    Então o sistema deve mostrar apenas meus dados financeiros

  Cenário: Sair da conta
    Dado que estou autenticado no sistema
    Quando faço logout
    Então o sistema deve encerrar minha sessão
    E deve bloquear novas ações privadas até novo login

  Cenário: Manter dados financeiros acessíveis apenas ao usuário autenticado
    Dado que existem gastos de usuários diferentes
    Quando acesso minha área privada
    Então devo ver somente os meus gastos
    E não devo conseguir listar, editar ou excluir gastos de outro usuário

  Cenário: Usar login e cadastro no celular
    Dado que acesso o sistema por uma tela pequena
    Quando uso login ou criação de conta
    Então os campos devem ser legíveis
    E os botões devem ser fáceis de tocar
    E o layout não deve quebrar
