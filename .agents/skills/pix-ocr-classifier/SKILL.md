---
name: pix-ocr-classifier
description: Orienta tarefas de upload de comprovante Pix, leitura de imagem ou PDF, OCR, extração de dados financeiros e sugestão automática de categoria e tipo de gasto no Bolso em Dia.
---

# Pix, OCR e Classificação

Use esta skill em tarefas relacionadas a comprovantes Pix, OCR e classificação automática de gastos.

## Regras principais

- Exigir usuário autenticado antes de enviar ou processar comprovantes.
- Associar todo comprovante e gasto extraído ao `user_id` do usuário autenticado.
- Nunca salvar um gasto automaticamente sem confirmação do usuário.
- Depois da leitura do comprovante, mostrar uma etapa de confirmação.
- Não exibir dados sensíveis do comprovante em logs.
- Se a confiança da leitura for baixa, marcar o campo como `precisa revisar`.

## Dados para extrair

Extrair quando possível:

- valor;
- data;
- recebedor;
- banco;
- forma de pagamento;
- descrição.

## Sugestões automáticas

- Sugerir categoria com base em palavras-chave do comprovante.
- Considerar o histórico do usuário quando existir.
- Sugerir tipo do gasto entre:
  - Necessário;
  - Importante;
  - Lazer;
  - Supérfluo;
  - Investimento;
  - Dívida.

## Aprendizado com correções

- Se o usuário corrigir categoria ou tipo, salvar essa preferência para próximas sugestões.
- Usar correções anteriores apenas para melhorar sugestões do próprio usuário.
- Não misturar histórico de usuários diferentes.
- Nunca usar histórico de outro usuário para classificar gastos.

## Segurança e privacidade

- Validar tipo e tamanho do arquivo enviado.
- Evitar guardar texto bruto completo do comprovante quando não for necessário.
- Mascarar ou omitir dados sensíveis em erros, logs e mensagens técnicas.
- Usar storage privado e autorização por usuário quando houver Supabase.
