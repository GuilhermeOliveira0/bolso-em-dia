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

  Cenário: Card de comprovante mostra somente dados essenciais
    Dado que enviei uma imagem válida de comprovante Pix
    Quando acesso a listagem de comprovantes
    Então o card deve mostrar preview, nome do arquivo, data de envio, status de OCR e a ação "Ler comprovante"
    E detalhes técnicos como tamanho e tipo não devem poluir o card

  Cenário: Abrir detalhes do comprovante
    Dado que enviei uma imagem válida de comprovante Pix
    Quando abro os detalhes do comprovante
    Então devo ver tamanho, tipo, data de envio, status de OCR, dados extraídos e despesa vinculada quando existir
    E o preview deve continuar privado e autorizado somente para minha conta

  Cenário: Impedir acesso sem autenticação
    Dado que não estou autenticado
    Quando tento acessar a área de comprovantes
    Então devo ser redirecionado para o login

  Cenário: Não criar gasto automaticamente
    Dado que enviei uma imagem válida de comprovante Pix
    Quando o upload for concluído
    Então nenhum gasto deve ser criado automaticamente
    E o sistema deve aguardar minha ação para ler ou revisar o comprovante

  Cenário: Enviar comprovante no fluxo de lançamentos
    Dado que estou autenticado no sistema
    Quando acesso a área de lançamentos
    Então devo ver uma aba ou seção "Novo comprovante"
    E o envio deve manter as mesmas regras de tipo, tamanho, privacidade e autoria
    E nenhum gasto deve ser criado automaticamente

  Cenário: Ler imagem de comprovante Pix enviada
    Dado que estou autenticado no sistema
    E enviei uma imagem válida de comprovante Pix
    Quando clico em "Ler comprovante"
    Então o sistema deve tentar extrair valor, data e recebedor
    E deve mostrar uma etapa de revisão antes de salvar qualquer despesa
    E o botão de leitura deve ficar desabilitado enquanto o OCR estiver processando

  Cenário: Revisar dados extraídos antes de salvar despesa
    Dado que o sistema leu uma imagem de comprovante Pix
    Quando a revisão é exibida
    Então devo poder editar valor, data, recebedor, descrição, categoria, tipo do gasto e forma de pagamento
    E campos ausentes ou de baixa confiança devem ficar claros para revisão manual

  Cenário: Sugerir categoria e tipo por palavra-chave na revisão
    Dado que o sistema leu uma imagem de comprovante Pix com recebedor "iFood"
    Quando a revisão é exibida
    Então o sistema deve sugerir categoria "Alimentação"
    E deve sugerir tipo do gasto "Lazer"
    E deve explicar a palavra-chave usada na sugestão
    E devo poder alterar categoria e tipo antes de salvar
    E nenhuma despesa deve ser criada antes da minha confirmação

  Cenário: Manter revisão manual quando não houver sugestão confiável
    Dado que o sistema leu uma imagem de comprovante Pix sem palavra-chave conhecida
    Quando a revisão é exibida
    Então o sistema deve indicar que não conseguiu sugerir com segurança
    E categoria e tipo do gasto devem continuar editáveis
    E nenhuma despesa deve ser criada automaticamente

  Cenário: Confirmar despesa criada a partir de comprovante
    Dado que estou revisando dados extraídos de um comprovante meu
    Quando confirmo os campos obrigatórios
    Então o sistema deve criar a despesa com o usuário autenticado
    E deve vincular o comprovante à despesa criada quando possível
    E a despesa deve aparecer no Extrato e na Dashboard

  Cenário: Falha de OCR permite preenchimento manual
    Dado que estou autenticado no sistema
    E tenho um comprovante cuja leitura falhou
    Quando acesso a revisão do comprovante
    Então o sistema deve permitir preencher os dados manualmente
    E não deve salvar despesa sem confirmação

  Cenário: Impedir leitura de comprovante de outro usuário
    Dado que existe um comprovante de outro usuário
    Quando tento processar esse comprovante
    Então o sistema deve negar a operação
    E nenhum texto de OCR ou despesa deve ser criado para minha conta
