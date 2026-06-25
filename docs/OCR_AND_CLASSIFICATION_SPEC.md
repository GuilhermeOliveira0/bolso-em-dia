# OCR and Classification Spec

## Objetivo

Permitir que o usuário envie comprovante Pix por imagem ou PDF, leia os dados automaticamente e receba sugestões de categoria e tipo do gasto. O resultado deve sempre passar por confirmação antes de virar gasto salvo.

## Upload do comprovante Pix

### Fatia atual: OCR básico de imagem com revisão

Nesta fatia, o sistema deve permitir upload de imagem de comprovante Pix e leitura OCR acionada pelo usuário. A leitura tenta extrair apenas valor, data e recebedor. O usuário sempre revisa e confirma os campos antes de qualquer despesa ser criada.

- formatos aceitos: PNG, JPG/JPEG e WEBP;
- limite: 5 MB por imagem;
- PDF fica para uma fatia futura;
- OCR é feito somente para imagem;
- OCR é acionado pelo usuário, não automaticamente em todo upload;
- arquivo deve ficar em bucket privado;
- o caminho deve ser organizado por `user_id`;
- o sistema deve salvar metadados do comprovante com status `uploaded`;
- resultado inicial pode preencher `extracted_amount`, `extracted_date`, `extracted_recipient`, `ocr_status`, `ocr_confidence` e `processed_at`;
- o comprovante pode se vincular ao gasto confirmado por `expense_id`;
- nenhum gasto deve ser criado automaticamente.

### Fluxo de OCR e revisão

1. O usuário escolhe um arquivo.
2. O sistema valida tipo e tamanho.
3. O arquivo é enviado para armazenamento privado.
4. O sistema cria um registro de comprovante com status `uploaded`.
5. O usuário clica em "Ler comprovante".
6. O OCR tenta ler valor, data e recebedor.
7. O sistema mostra uma etapa de revisão com campos editáveis.
8. O sistema pode sugerir categoria e tipo por palavras-chave, mantendo os campos editáveis.
9. O usuário informa ou ajusta categoria, tipo do gasto e forma de pagamento manualmente.
10. Só depois da confirmação o gasto é salvo.
11. Se possível, o comprovante é vinculado à despesa criada.

## Formatos aceitos

- Imagens: PNG, JPG, JPEG e WEBP.
- PDF: fora do escopo desta fatia.

Formatos e limites finais devem ser revisados na implementação de segurança.

## Dados a extrair

Extrair quando possível:

- valor;
- data;
- recebedor;

Banco e forma de pagamento ficam manuais nesta fatia. Categoria e tipo podem receber sugestão simples por palavras-chave, sempre editável e sem salvamento automático.

## Erro de leitura

Quando o OCR não conseguir ler o comprovante:

- informar que a leitura falhou;
- permitir preenchimento manual;
- permitir novo envio;
- não apagar o arquivo sem decisão clara do usuário;
- não salvar gasto automaticamente.

## Baixa confiança

Cada campo extraído deve ter confiança própria quando possível.

Campos com baixa confiança devem ser marcados como:

- `precisa revisar`;
- visualmente destacados na etapa de confirmação;
- editáveis pelo usuário.

Exemplos de baixa confiança:

- valor ambíguo;
- data em formato estranho;
- recebedor incompleto;
- comprovante com imagem cortada;
- PDF sem texto legível.

## Sugestão de categoria

Nesta fatia, a revisão pode sugerir categoria e tipo do gasto com base em palavras-chave do recebedor, da descrição sugerida e do texto OCR. A sugestão não usa IA externa, não consulta histórico do usuário e não salva despesa sozinha.

Regras atuais de palavra-chave:

- `combustivel`, `gasolina`, `etanol`, `diesel` e `posto` sugerem Combustível / Necessário.
- `mecanica`, `oficina`, `manutencao`, `troca de oleo` e `pneu` sugerem Mecânica / Importante.

Quando houver confiança suficiente:

- preencher categoria e tipo no formulário de revisão;
- mostrar a palavra-chave usada;
- permitir que o usuário altere os campos antes de confirmar.

Quando não houver regra confiável:

- manter categoria e tipo para revisão manual;
- informar que a sugestão não foi segura.

### Futuro

A categoria deve ser sugerida com base em:

- palavras-chave do recebedor;
- palavras-chave da descrição;
- histórico de correções do usuário;
- categorias usadas anteriormente para recebedores parecidos.

A sugestão deve ser exibida como editável. O usuário sempre pode trocar.

## Sugestão de tipo do gasto

O sistema deve sugerir um dos tipos:

- Necessário;
- Importante;
- Lazer;
- Supérfluo;
- Investimento;
- Dívida.

A sugestão deve ser explicável de forma simples quando fizer sentido, por exemplo: "sugerido por histórico" ou "sugerido por palavra-chave".

## Classificação por palavras-chave

Regras iniciais podem usar palavras comuns:

- mercado, farmácia, aluguel e transporte tendem a Necessário;
- escola, curso e saúde podem ser Importante;
- cinema, restaurante e viagem podem ser Lazer;
- delivery frequente, compras impulsivas e itens não essenciais podem ser Supérfluo;
- corretora e aplicação podem ser Investimento;
- empréstimo, financiamento e cartão atrasado podem ser Dívida.

Essas regras devem ser ajustáveis e não devem substituir a decisão do usuário.

## Histórico do usuário

O histórico deve melhorar sugestões quando:

- o mesmo recebedor aparece novamente;
- uma palavra-chave já foi corrigida antes;
- o usuário usa a mesma categoria ou tipo repetidamente para casos parecidos.

O histórico deve ser usado apenas dentro da conta do próprio usuário.

## Aprendizado por correção

Quando o usuário corrigir categoria ou tipo:

- salvar uma regra ou preferência do usuário;
- aumentar prioridade dessa preferência em sugestões futuras;
- preservar a correção apenas para o usuário atual;
- permitir mudanças futuras, pois hábitos podem mudar.

## Regra obrigatória

Nunca salvar automaticamente um gasto extraído de comprovante Pix sem confirmação do usuário.

Essa regra vale mesmo quando a confiança do OCR for alta.

## Privacidade e logs

- Não registrar texto bruto completo de comprovantes em logs.
- Não registrar dados completos de recebedor, valor e descrição juntos.
- Mascarar informações sensíveis em erros.
- Não expor caminho privado do arquivo para usuários não autorizados.
- Evitar enviar comprovantes para serviços externos sem decisão técnica documentada.

## Assumptions

- A primeira versão pode começar com extração parcial: valor, data e recebedor.
- Campos não encontrados devem ser preenchidos manualmente.
- A confiança mínima para marcar campo como revisável será definida na implementação.
