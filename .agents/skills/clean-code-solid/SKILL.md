---
name: clean-code-solid
description: Use when reviewing, refactoring or extending Bolso em Dia code where responsibilities, naming, Supabase coupling, duplication, testability, security or performance need attention.
---

# Clean Code e SOLID

## Objetivo

Manter o projeto simples de entender e seguro de evoluir. Melhorar uma responsabilidade por vez, sem reescrever o sistema ou criar camadas sem necessidade.

## Antes de alterar

- Ler `docs/CODE_QUALITY_GUIDE.md` e as specs da funcionalidade.
- Confirmar o comportamento atual e os testes disponíveis.
- Separar correção de regra de negócio de refatoração estrutural.
- Criar checkpoint Git quando houver uma entrega estável pendente.

## Regras

- **SRP:** páginas coordenam, componentes exibem, actions autorizam, schemas validam e repositórios persistem.
- **OCP:** estender constantes e funções de domínio sem espalhar condicionais.
- **DIP:** depender de interfaces e fábricas server-side, não construir Supabase dentro de componentes.
- Manter funções pequenas, nomes do domínio e lógica financeira fora do JSX.
- Remover apenas duplicação comprovada.
- Isolar totalmente qualquer legado em `localStorage`.
- Filtrar dados financeiros por usuário autenticado e preservar RLS.
- Buscar somente colunas e períodos necessários.
- Não registrar dados financeiros, tokens ou credenciais.
- Preservar responsividade mobile-first e estados de interface.

## Evitar

- Refatoração ampla junto de uma feature.
- Interface genérica com uma única implementação sem benefício de teste ou desacoplamento.
- Cache público de dados privados.
- Otimização sem evidência.
- Mudança de regra de negócio disfarçada de limpeza.

## Verificação

- Revisar o diff e confirmar que o comportamento foi preservado.
- Rodar lint, typecheck, testes e build.
- Validar rotas privadas, 390px, 1280px e console do navegador.
- Listar riscos prevenidos e pendências honestas.
