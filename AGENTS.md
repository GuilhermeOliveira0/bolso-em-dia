# AGENTS.md

Regras gerais para agentes trabalhando no projeto Bolso em Dia.

## Desenvolvimento

- Este projeto deve seguir Spec-Driven Development + BDD + Vertical Slice.
- Antes de implementar código, consultar `docs/`, `specs/` e `features/`.
- Não implementar funcionalidades grandes de uma vez.
- Implementar uma feature completa por etapa.
- Não quebrar funcionalidades existentes.
- Sempre explicar os arquivos alterados.
- Sempre sugerir ou criar testes quando fizer sentido.
- Nenhuma feature financeira deve ser considerada completa sem autenticação e isolamento por usuário.

## Produto

- O sistema deve ser pensado primeiro para uso no celular.
- O sistema também deve funcionar bem em telas de computador.
- O cadastro de gasto precisa ser rápido e simples.
- O dashboard precisa ajudar o usuário a entender onde está gastando mais.
- Toda interface deve ser mobile-first, responsiva e confortável em telas pequenas.

## Pix e OCR

- Nunca salvar gasto extraído de comprovante Pix sem confirmação do usuário.
- Mostrar uma etapa de revisão antes de gravar dados extraídos.
- Marcar campos com baixa confiança como itens que precisam de revisão.

## Segurança e privacidade

- O sistema é multiusuário.
- Toda funcionalidade financeira deve considerar usuário autenticado.
- Nenhum gasto pode existir sem dono (`user_id`).
- Tratar dados financeiros como sensíveis.
- Não salvar tokens, senhas ou chaves no código.
- Usar variáveis de ambiente para segredos.
- Não registrar dados completos de comprovantes Pix em logs.
- Garantir que um usuário só veja os próprios gastos.
- O frontend não deve ser a única barreira de segurança.
- Consultas futuras no banco devem filtrar pelo usuário autenticado.
- Com Supabase, usar Auth e preparar Row Level Security para isolamento por `user_id`.
- Nunca considerar uma feature financeira completa se ela permitir vazamento de dados entre usuários.
