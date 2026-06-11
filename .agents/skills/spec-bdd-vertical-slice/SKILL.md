---
name: spec-bdd-vertical-slice
description: Orienta o desenvolvimento do projeto Bolso em Dia usando Spec-Driven Development, BDD e Vertical Slice Development. Use quando for planejar, implementar, alterar ou revisar funcionalidades do sistema financeiro pessoal.
---

# Spec, BDD e Vertical Slice

Use esta skill para manter o desenvolvimento guiado por especificação, comportamento esperado e entregas pequenas.

## Antes de implementar

- Verificar se existe especificação em `docs/`, `specs/` ou `features/`.
- Se não existir especificação suficiente, criar ou sugerir a spec antes de codar.
- Criar user stories quando a funcionalidade precisar de clareza sobre usuário, objetivo e benefício.
- Criar cenários BDD em `features/` quando a funcionalidade tiver comportamento de usuário.
- Confirmar o escopo da tarefa antes de alterar partes grandes do sistema.
- Para funcionalidades financeiras, confirmar autenticação, `user_id` e isolamento por usuário antes de codar.
- Para interface, confirmar que há requisitos mobile-first e responsivos para celular e desktop.

## Como implementar

- Implementar uma funcionalidade completa por vez.
- Preferir Vertical Slice: fluxo completo da feature, da interface ao armazenamento, quando aplicável.
- Em fatias financeiras, incluir autenticação e autorização server-side como parte do fluxo completo.
- Não implementar várias features grandes ao mesmo tempo.
- Preservar funcionalidades existentes.
- Evitar refatorações fora do escopo.
- Manter o código alinhado com a estrutura atual do projeto.
- Não considerar uma fatia completa se dados de um usuário puderem aparecer para outro.
- Não considerar uma interface completa se ela não funcionar bem no celular.

## Ao finalizar

- Explicar os arquivos alterados.
- Informar os testes feitos ou sugeridos.
- Listar próximos passos úteis.
- Avisar claramente se algo ficou pendente.
