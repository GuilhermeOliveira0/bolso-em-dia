# Implementation Roadmap

Este roadmap organiza o projeto por Vertical Slice. Cada fatia deve entregar uma parte completa, testável e sem quebrar funcionalidades anteriores.

## Fatia 1: Base do projeto + Auth + cadastro manual por usuário

### Objetivo

Preparar a fundação técnica e entregar o primeiro fluxo financeiro seguro: usuário cria conta, entra, cadastra gasto manual e vê somente os próprios gastos.

### Escopo

- Estrutura inicial.
- Stack definida.
- PWA preparado.
- Layout base responsivo/mobile-first.
- Tela de cadastro de conta.
- Tela de login.
- Logout.
- Proteção de páginas privadas.
- Cadastro manual de gastos por usuário autenticado.
- Listagem simples por usuário autenticado.
- Preparação para Supabase Auth, Postgres e RLS.
- Testes básicos de autenticação, validação e isolamento por usuário.

### Arquivos prováveis

- Configuração do framework escolhido.
- Configuração de PWA.
- Estrutura base de rotas.
- Layout base.
- Documentação de ambiente.
- Rotas de login/cadastro.
- Área privada de gastos.
- Serviço de autenticação.
- Repositório de gastos preparado para Supabase.

### Critérios de aceite

- Projeto abre localmente.
- Estrutura suporta páginas privadas e públicas.
- Layout base funciona em celular e computador.
- Decisões de stack estão documentadas.
- Usuário não autenticado não acessa cadastro/listagem.
- Usuário autenticado cadastra gasto manual.
- Gasto salvo aparece somente para o usuário dono.
- Logout remove acesso à área privada.

### Critérios de verificação

- Build ou verificação equivalente do framework.
- Teste visual básico em viewport mobile.
- Teste visual básico em desktop.
- Testes de isolamento por usuário.
- Testes de validação de gasto.
- Revisão de documentação criada.

### Riscos

- Escolher stack sem considerar autenticação e storage.
- Criar estrutura grande demais antes do MVP.
- Deixar PWA como detalhe tardio.
- Tratar armazenamento local como se fosse seguro multiusuário.
- Proteger rota só no frontend.
- Esquecer RLS no desenho do banco.

### Não fazer nesta fatia

- Não criar dashboard completa.
- Não criar OCR.
- Não criar regras avançadas.
- Não implementar funcionalidades grandes.
- Não implementar upload Pix.
- Não implementar login social.

## Fatia 2: Dashboard básica

### Objetivo

Mostrar um resumo inicial dos gastos do mês do usuário autenticado.

### Escopo

- Cards principais.
- Filtros simples.
- Dados agregados por usuário.
- Responsividade mobile e desktop.

### Arquivos prováveis

- Página da dashboard.
- Componentes de cards.
- Componentes de filtros.
- Consulta agregada de gastos.
- Testes de cálculo.

### Critérios de aceite

- Usuário vê gasto total do mês.
- Usuário vê total necessário, lazer e supérfluo.
- Filtros básicos alteram os resultados.
- Interface é legível no celular e computador.

### Critérios de verificação

- Testes dos cálculos.
- Testes de filtros básicos.
- Teste para não agregar dados de outro usuário.
- Revisão visual mobile e desktop.

### Riscos

- Mostrar informação demais cedo.
- Cálculos inconsistentes com filtros.
- Agregações sem considerar usuário.

### Não fazer nesta fatia

- Não criar gráficos avançados.
- Não criar rankings completos.
- Não criar OCR.

## Fatia 3: Upload seguro de imagem de comprovante Pix

### Objetivo

Permitir envio seguro de imagem de comprovante Pix, sem OCR e sem criação automática de gasto.

### Escopo

- Upload de PNG, JPG/JPEG e WEBP.
- Validação server-side de tipo e limite de 5 MB.
- Armazenamento em bucket privado.
- Metadados em `receipts` com status `uploaded`.
- Listagem e preview privado por usuário autenticado.

### Arquivos prováveis

- Componente ou rota de upload.
- Serviço de validação de arquivo.
- Integração com storage.
- Registro de recibo.
- Testes de tipo e tamanho.

### Critérios de aceite

- Usuário envia PNG, JPG, JPEG ou WEBP.
- Sistema rejeita tipo inválido.
- Sistema rejeita arquivo acima do limite definido.
- Arquivo fica privado.
- Registro mostra status `uploaded`.
- Nenhum gasto é criado automaticamente.

### Critérios de verificação

- Testes de validação de upload.
- Teste de autorização.
- Verificação de bucket privado quando storage existir.

### Riscos

- Expor comprovante publicamente.
- Aceitar arquivo malicioso.
- Registrar dados sensíveis em logs.

### Não fazer nesta fatia

- Não salvar gasto automaticamente.
- Não aceitar PDF ainda.
- Não implementar OCR ainda.
- Não implementar classificação avançada.
- Não criar dashboard avançada.

## Fatia 4: OCR e extração

### Objetivo

Ler comprovante Pix e extrair dados iniciais.

### Escopo

- Leitura do comprovante.
- Extração de valor, data e recebedor.
- Tratamento de baixa confiança.

### Arquivos prováveis

- Serviço de OCR.
- Parser de texto Pix.
- Modelo de resultado extraído.
- Testes com exemplos controlados.

### Critérios de aceite

- Sistema tenta extrair valor, data e recebedor.
- Campos incertos são marcados como `precisa revisar`.
- Erros de leitura não salvam gasto.
- Usuário recebe feedback claro.

### Critérios de verificação

- Testes com texto de comprovante simulado.
- Testes de baixa confiança.
- Testes de erro de leitura.

### Riscos

- OCR retornar dados incorretos com confiança alta.
- Serviço externo expor dados sensíveis.
- Logs conterem texto completo do comprovante.

### Não fazer nesta fatia

- Não salvar gasto sem confirmação.
- Não criar aprendizado por histórico ainda.

## Fatia 5: Confirmação do gasto extraído

### Objetivo

Garantir que o usuário revise e confirme dados extraídos antes de salvar.

### Escopo

- Exibir dados extraídos.
- Permitir edição.
- Confirmar antes de salvar.

### Arquivos prováveis

- Página ou etapa de confirmação.
- Formulário de revisão.
- Action ou serviço para salvar gasto confirmado.
- Testes de fluxo de confirmação.

### Critérios de aceite

- Dados extraídos aparecem editáveis.
- Campos com baixa confiança aparecem destacados.
- Gasto só é salvo após confirmação explícita.
- Cancelamento não cria gasto.

### Critérios de verificação

- Teste impedindo salvamento automático.
- Teste de edição antes de salvar.
- Teste de cancelamento.

### Riscos

- Criar gasto antes da confirmação.
- Interface esconder campos incertos.
- Usuário confirmar sem perceber erro.

### Não fazer nesta fatia

- Não implementar ranking avançado.
- Não implementar aprendizado complexo.

## Fatia 6: Sugestão de categoria e tipo

### Objetivo

Reduzir esforço de classificação do gasto.

### Escopo

- Regras por palavras-chave.
- Histórico do usuário.
- Aprendizado por correção.

### Arquivos prováveis

- Serviço de classificação.
- Regras iniciais.
- Persistência de preferências do usuário.
- Testes de sugestão.

### Critérios de aceite

- Sistema sugere categoria.
- Sistema sugere tipo do gasto.
- Usuário pode corrigir ambos.
- Correções influenciam próximas sugestões do mesmo usuário.

### Critérios de verificação

- Testes de palavras-chave.
- Testes de histórico por usuário.
- Testes de isolamento entre usuários.

### Riscos

- Misturar preferências de usuários.
- Sugerir tipo inadequado como se fosse definitivo.
- Criar regras difíceis de explicar.

### Não fazer nesta fatia

- Não treinar modelo complexo.
- Não automatizar salvamento sem confirmação.

## Fatia 7: Dashboard avançada

### Objetivo

Expandir a análise financeira com gráficos, rankings e economia possível.

### Escopo

- Gráficos.
- Rankings.
- Filtros avançados.
- Economia possível.

### Arquivos prováveis

- Componentes de gráficos.
- Componentes de ranking.
- Consultas agregadas.
- Cálculos de economia possível.
- Testes de agregação.

### Critérios de aceite

- Dashboard mostra gastos por categoria.
- Dashboard mostra gastos por tipo.
- Dashboard mostra evolução mensal.
- Dashboard mostra maiores recebedores e maiores gastos.
- Dashboard mostra categorias com maior aumento.
- Dashboard mostra economia possível de forma simples.

### Critérios de verificação

- Testes de agregações.
- Testes de filtros avançados.
- Revisão visual mobile e desktop.
- Verificação de performance com volume inicial de dados.

### Riscos

- Excesso de informação.
- Gráficos difíceis de ler no celular.
- Consultas lentas sem índices.
- Economia possível parecer recomendação financeira absoluta.

### Não fazer nesta fatia

- Não criar aconselhamento financeiro profissional.
- Não criar integração bancária.
- Não criar relatórios fiscais.

## Fatia 8: Evoluções pós-MVP

### Objetivo

Adicionar melhorias após o MVP validado.

### Escopo

- Login social.
- Recuperação de senha avançada.
- Perfil completo.
- Compartilhamento de gastos.
- Relatórios exportáveis.

### Arquivos prováveis

- A definir conforme prioridade do produto.

### Critérios de aceite

- Evoluções não quebram isolamento por usuário.
- Evoluções mantêm responsividade.

### Critérios de verificação

- Testes específicos por evolução.
- Revisão de segurança quando houver dados financeiros.

### Riscos

- Crescer escopo antes do MVP.
- Criar permissões complexas sem necessidade.

### Não fazer nesta fatia

- Não substituir correções de segurança pendentes.

## Assumptions

- A primeira fatia a implementar deve ser a Fatia 1: Base do projeto + Auth + cadastro manual por usuário.
- Cada fatia deve ter cenários BDD ou testes equivalentes antes da implementação.
- O roadmap pode ser ajustado após validação do MVP com uso real.
