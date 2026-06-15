# language: pt
Funcionalidade: Upload de imagem de comprovante Pix
  Como usuário do Bolso em Dia
  Quero enviar uma imagem de comprovante Pix
  Para guardar o comprovante com segurança antes da leitura automática

  Cenário: Enviar imagem de comprovante Pix
    Dado que estou autenticado no sistema
    Quando envio uma imagem válida de comprovante Pix
    Então o sistema deve aceitar o arquivo
    E deve salvar o comprovante com status "uploaded"
    E deve exibir a imagem na minha listagem

  Cenário: Impedir envio de PDF nesta fatia
    Dado que estou autenticado no sistema
    Quando tento enviar um PDF de comprovante Pix
    Então o sistema deve recusar o arquivo
    E deve informar que somente PNG, JPG, JPEG ou WEBP são aceitos agora

  Cenário: Impedir arquivo maior que 5 MB
    Dado que estou autenticado no sistema
    Quando tento enviar uma imagem maior que 5 MB
    Então o sistema deve recusar o arquivo
    E não deve salvar metadados do comprovante

  Cenário: Listar somente meus comprovantes
    Dado que existem comprovantes de usuários diferentes
    Quando acesso a área de comprovantes
    Então devo ver somente os comprovantes da minha conta

  Cenário: Visualizar preview privado
    Dado que enviei uma imagem válida de comprovante Pix
    Quando acesso a listagem de comprovantes
    Então o sistema deve mostrar um preview da imagem
    E o arquivo deve continuar em bucket privado

  Cenário: Impedir acesso sem autenticação
    Dado que não estou autenticado
    Quando tento acessar a área de comprovantes
    Então devo ser redirecionado para o login

  Cenário: Não criar gasto automaticamente
    Dado que enviei uma imagem válida de comprovante Pix
    Quando o upload for concluído
    Então nenhum gasto deve ser criado automaticamente
    E OCR deve permanecer fora desta fatia
