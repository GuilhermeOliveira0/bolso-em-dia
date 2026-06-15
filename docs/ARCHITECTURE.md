# Architecture

## Visão geral

A arquitetura sugerida é simples, escalável e adequada para PWA mobile-first:

- Frontend web/PWA em Next.js e React.
- Backend/API usando rotas server-side do Next.js ou camada API equivalente.
- Supabase para Auth, Postgres, Storage e Row Level Security.
- Serviço de OCR isolado para processar imagem/PDF de comprovantes.
- Dashboard consumindo dados agregados do banco por usuário.

Esta é uma sugestão técnica. Nenhum código, migration ou dependência deve ser criado nesta fase.

## Stack sugerida

### Frontend

- Next.js com React.
- TypeScript para reduzir erros em entidades financeiras.
- PWA para instalação no celular e melhor experiência de uso recorrente.
- Componentes mobile-first, com formulários curtos e navegação simples.
- Layout responsivo para celular e computador.
- Telas de login, cadastro de conta, cadastro de gasto e listagem devem funcionar em telas pequenas.

### Backend/API

- Rotas server-side do Next.js para operações privadas.
- Server Actions ou API Routes podem ser avaliadas na implementação.
- Regras sensíveis devem rodar no servidor, não no cliente.
- OCR, persistência e acesso a comprovantes devem passar por validação server-side.
- Rotas privadas, Server Actions e Route Handlers devem validar usuário autenticado.
- O frontend pode esconder UI, mas a autorização real deve estar no servidor e no banco.

### Banco de dados

- Supabase/Postgres.
- Tabelas separadas por usuário.
- Row Level Security obrigatória para dados de gastos, comprovantes, categorias e regras.
- Índices planejados para filtros de dashboard.
- Todo registro financeiro deve ter `user_id`.
- Nenhuma consulta de dados financeiros pode depender apenas de filtro no cliente.

### Storage

- Supabase Storage para comprovantes.
- Buckets privados.
- Acesso controlado por usuário.
- URLs temporárias quando for necessário visualizar arquivo.

### OCR

- Serviço de OCR externo ou biblioteca backend.
- Processamento assíncrono pode ser adotado se o tempo de leitura for alto.
- Resultado deve gerar rascunho revisável, nunca gasto salvo automaticamente.

## Separação de responsabilidades

### Frontend

- Exibir formulários, listagens, confirmação de OCR e dashboard.
- Manter experiência rápida no celular.
- Não conter segredos.
- Não acessar comprovantes privados sem autorização.
- Não considerar uma tela concluída sem checar responsividade mobile e desktop.

### Backend/API

- Validar entrada de dados.
- Validar arquivos.
- Executar ou orquestrar OCR.
- Aplicar regras de autorização.
- Persistir dados confirmados.
- Retornar apenas dados do usuário autenticado.
- Impedir criação de gastos sem usuário autenticado.
- Impedir leitura, edição ou exclusão de dados de outro usuário.

### Banco de dados

- Guardar usuários, gastos, categorias, tipos, recibos, regras e limites mensais.
- Garantir isolamento por usuário com RLS.
- Apoiar filtros e agregações do dashboard.

### Storage de comprovantes

- Guardar arquivos enviados.
- Manter arquivos privados.
- Relacionar cada arquivo ao usuário e ao recibo correspondente.

### Serviço de OCR

- Receber arquivo autorizado.
- Extrair texto e campos prováveis.
- Retornar confiança por campo.
- Não decidir salvamento final do gasto.

## PWA

O sistema deve funcionar como PWA para facilitar uso frequente no celular:

- manifesto com nome, ícones e tema;
- layout responsivo e instalável;
- carregamento rápido;
- navegação simples;
- estados claros de carregamento e erro.

Offline completo fica fora do MVP, mas o design deve evitar bloquear melhorias futuras.
Service worker ou cache futuro não deve armazenar respostas privadas de forma compartilhada.

## Responsividade mobile

- O cadastro de gasto deve caber em poucos campos principais.
- Login e cadastro de conta devem ser simples em tela pequena.
- A confirmação de OCR deve destacar campos que precisam de revisão.
- Filtros da dashboard devem ser compactos e fáceis de abrir/fechar.
- Cards e gráficos devem priorizar leitura rápida em tela pequena.
- Tabelas extensas devem ser evitadas no celular.
- No desktop, usar melhor o espaço sem criar dependência de tela larga.

## Segurança e privacidade

- Nunca expor service role key ou segredos no frontend.
- Usar variáveis de ambiente para chaves.
- Validar autenticação em rotas privadas.
- Usar RLS em todas as tabelas expostas pelo Supabase.
- Não registrar dados completos de comprovantes em logs.
- Validar tipo e tamanho de arquivos.
- Garantir que cada usuário veja apenas os próprios dados.
- Não usar `user_metadata` para autorização.
- Não expor service role key no frontend.

## Decisões técnicas iniciais

- Next.js/React é a stack preferencial para PWA e interface mobile-first.
- Supabase é a opção preferencial para Auth, Postgres, Storage e RLS.
- O backend deve ser server-side, mesmo quando usar Next.js.
- OCR deve gerar uma sugestão revisável, não um lançamento automático.
- A primeira fatia corrigida deve incluir autenticação e isolamento por usuário antes de tratar cadastro manual como completo.
- O armazenamento local temporário não é seguro para multiusuário e só pode ser usado em desenvolvimento.
- Páginas e Server Actions devem obter o repositório financeiro por uma fábrica server-side, mantendo detalhes do Supabase fora da interface.
- Consultas da dashboard devem filtrar `user_id` e período no banco e selecionar somente as colunas necessárias.

## Assumptions

- O projeto começará como web/PWA antes de qualquer app nativo.
- A primeira versão terá baixo volume de usuários, mas deve nascer com isolamento correto de dados.
- Agregações de dashboard podem começar simples e evoluir para views ou funções se houver necessidade de performance.
