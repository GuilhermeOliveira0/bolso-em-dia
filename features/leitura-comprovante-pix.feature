# language: pt
Funcionalidade: Leitura de comprovante Pix
  Como usuário do Bolso em Dia
  Quero enviar um comprovante Pix
  Para extrair dados do gasto e revisar antes de salvar

  Cenário: Enviar imagem de comprovante Pix
    Dado que estou autenticado no sistema
    Quando envio uma imagem válida de comprovante Pix
    Então o sistema deve aceitar o arquivo
    E deve iniciar a leitura do comprovante

  Cenário: Enviar PDF de comprovante Pix
    Dado que estou autenticado no sistema
    Quando envio um PDF válido de comprovante Pix
    Então o sistema deve aceitar o arquivo
    E deve iniciar a leitura do comprovante

  Cenário: Extrair valor, data e recebedor
    Dado que enviei um comprovante Pix legível
    Quando a leitura do comprovante for concluída
    Então o sistema deve extrair valor, data e recebedor quando possível
    E deve exibir os dados extraídos para revisão

  Cenário: Sugerir categoria
    Dado que o sistema extraiu dados do comprovante
    Quando identifica palavras-chave ou histórico do usuário
    Então o sistema deve sugerir uma categoria
    E a categoria deve permanecer editável

  Cenário: Sugerir tipo do gasto
    Dado que o sistema extraiu dados do comprovante
    Quando identifica palavras-chave ou histórico do usuário
    Então o sistema deve sugerir um tipo de gasto
    E o tipo deve permanecer editável

  Cenário: Pedir confirmação antes de salvar
    Dado que o sistema extraiu dados do comprovante Pix
    Quando exibe a etapa de revisão
    Então o sistema deve pedir confirmação do usuário antes de salvar

  Cenário: Tratar leitura com baixa confiança
    Dado que enviei um comprovante Pix com leitura incerta
    Quando o sistema identificar campos com baixa confiança
    Então deve marcar esses campos como "precisa revisar"
    E deve permitir edição manual

  Cenário: Permitir correção manual
    Dado que o sistema exibiu dados extraídos do comprovante
    Quando corrijo valor, data, recebedor, categoria ou tipo
    Então o sistema deve usar os dados corrigidos para salvar após confirmação

  Cenário: Impedir salvamento automático sem confirmação
    Dado que enviei um comprovante Pix legível
    Quando a leitura do comprovante for concluída com alta confiança
    Então o sistema não deve salvar o gasto automaticamente
    E deve aguardar confirmação explícita do usuário
