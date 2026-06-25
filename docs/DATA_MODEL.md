# Data Model

Este documento descreve o modelo de dados previsto. O banco poderá ser Supabase/Postgres, mas nenhuma migration deve ser criada nesta fase.

## User

### Objetivo

Representar a pessoa autenticada que usa o sistema.

### Campos principais

- `id`: identificador único do usuário.
- `email`: e-mail de login.
- `name`: nome opcional.
- `created_at`: data de criação.
- `updated_at`: data da última alteração.

### Relacionamentos

- Um usuário possui muitos gastos.
- Um usuário possui muitas categorias.
- Um usuário possui muitos comprovantes.
- Um usuário possui muitas regras de recebedor.
- Um usuário pode possuir limites mensais.

### Regras importantes

- Cada registro financeiro deve estar associado a um usuário.
- O usuário não deve acessar dados de outro usuário.
- Cadastro manual, upload Pix, dashboard e limites mensais exigem usuário autenticado.
- Logout deve encerrar acesso às áreas privadas.

### Segurança

- Não usar dados editáveis pelo usuário como fonte de autorização.
- A autorização deve usar o identificador autenticado do usuário.
- Em Supabase, usar o usuário autenticado de Auth como fonte do `user_id`.
- Nunca usar dados do frontend como prova final de identidade.

### Filtros da dashboard

- O `user_id` deve estar presente nas entidades financeiras para filtrar todas as consultas.

## Expense

### Objetivo

Representar um gasto confirmado pelo usuário.

### Campos principais

- `id`: identificador único.
- `user_id`: dono do gasto.
- `amount`: valor.
- `date`: data do gasto.
- `description`: descrição curta.
- `merchant_name`: recebedor.
- `payment_method`: forma de pagamento.
- `category_id`: categoria.
- `expense_type_id`: tipo do gasto.
- `receipt_id`: comprovante relacionado, quando existir.
- `source`: origem manual ou OCR.
- `created_at`: data de criação.
- `updated_at`: data de alteração.

### Relacionamentos

- Pertence a um usuário.
- Pode pertencer a uma categoria.
- Pode pertencer a um tipo de gasto.
- Pode estar ligado a um comprovante.

### Regras importantes

- Gasto extraído por OCR só pode ser salvo após confirmação do usuário.
- Valor é obrigatório.
- Data deve ser informada ou revisada.
- `user_id` é obrigatório.
- Nenhum gasto pode ser criado, listado, editado ou excluído sem usuário autenticado.
- A listagem deve retornar apenas gastos do usuário autenticado.
- O Extrato da área de lançamentos lista apenas registros confirmados de `expenses`.
- Comprovantes enviados sem gasto vinculado permanecem em `receipts` e não entram automaticamente no Extrato.

### Segurança

- RLS deve impedir acesso entre usuários.
- Logs não devem conter descrição completa quando vier de comprovante sensível.
- Backend e RLS devem reforçar o isolamento por usuário; o frontend sozinho não é suficiente.

### Filtros da dashboard

- `date` para mês e ano.
- `category_id` para categoria.
- `expense_type_id` para tipo.
- `payment_method` para forma de pagamento.
- `merchant_name` para recebedor.
- `amount` para valor mínimo e máximo.

## Category

### Objetivo

Classificar gastos por tema, como mercado, transporte, saúde ou alimentação.

### Campos principais

- `id`: identificador único.
- `user_id`: dono da categoria.
- `name`: nome.
- `color`: cor opcional.
- `is_default`: indica categoria padrão.
- `created_at`: data de criação.

### Relacionamentos

- Uma categoria pode ter muitos gastos.
- Pode ser usada por regras de sugestão.

### Regras importantes

- Categorias padrão podem existir para todos, mas categorias personalizadas pertencem ao usuário.
- Nomes duplicados para o mesmo usuário devem ser evitados.
- Categorias personalizadas exigem `user_id`.

### Segurança

- Categorias personalizadas devem ser isoladas por usuário.
- Categorias padrão podem ser globais, mas vínculos com gastos continuam privados.

### Filtros da dashboard

- Usada para agrupamento de gastos por categoria.
- Usada para ranking de categorias com maior aumento.

### Categorias padrão atuais

- Alimentação.
- Mercado.
- Mecânica.
- Combustível.
- Saúde.
- Educação.
- Moradia.
- Contas.
- Compras.
- Assinaturas.
- Sítio.
- Outros.

`Transporte` permanece reconhecida apenas para exibição de gastos antigos e compatibilidade de histórico.

## ExpenseType

### Objetivo

Classificar o tipo de gasto para ajudar o usuário a entender prioridade e comportamento.

### Campos principais

- `id`: identificador único.
- `name`: nome do tipo.
- `description`: explicação curta.
- `sort_order`: ordem de exibição.

### Valores iniciais

- Necessário.
- Importante.
- Lazer.
- Supérfluo.
- Investimento.
- Dívida.
- A receber.

### Relacionamentos

- Um tipo pode estar em muitos gastos.

### Regras importantes

- A lista inicial deve ser simples e estável.
- Alterações futuras devem preservar histórico de gastos.
- "A receber" é uma classificação manual nesta fatia; não cria ciclo de cobrança, baixa ou contas a receber.

### Segurança

- Não contém dado sensível por si só, mas os vínculos com gastos são sensíveis.

### Filtros da dashboard

- Usado para cards de total necessário, lazer e supérfluo.
- Usado para gráfico de gastos por tipo.

## Receipt

### Objetivo

Representar o comprovante enviado pelo usuário. Na fatia atual, guarda apenas imagem e metadados; OCR fica para a próxima fatia.

### Campos principais

- `id`: identificador único.
- `user_id`: dono do comprovante.
- `expense_id`: gasto relacionado, opcional por enquanto.
- `file_path`: caminho privado no storage.
- `file_name`: nome original higienizado.
- `file_type`: MIME type da imagem.
- `file_size`: tamanho do arquivo.
- `status`: status do comprovante, começando com `uploaded`.
- `extracted_amount`: valor extraído.
- `extracted_date`: data extraída.
- `extracted_receiver`: recebedor extraído.
- `extracted_bank`: banco extraído.
- `extracted_payment_method`: forma de pagamento extraída.
- `extracted_description`: descrição extraída.
- `confidence`: confiança geral.
- `fields_need_review`: campos com baixa confiança.
- `created_at`: data de envio.
- `updated_at`: data da última alteração.

### Relacionamentos

- Pertence a um usuário.
- Pode gerar um gasto confirmado.

### Regras importantes

- Comprovante não cria gasto automaticamente.
- Nesta fatia, aceitar somente `image/png`, `image/jpeg` e `image/webp`.
- Nesta fatia, recusar arquivos acima de 5 MB.
- PDF e OCR ficam para fatias futuras.
- Campos de baixa confiança devem ser revisados.
- OCR com erro deve permitir correção manual ou novo envio.
- Nesta fatia, OCR em comprovante tenta preencher apenas valor, data e recebedor.
- Categoria e tipo podem ser sugeridos por palavras-chave na revisão, mas continuam editáveis.
- Forma de pagamento é informada manualmente na revisão.
- PDF, IA externa e aprendizado por histórico ficam fora do escopo desta fatia.

### Segurança

- Arquivo deve ficar em storage privado.
- Caminho deve ser organizado por usuário: `user_id/receipt_id/nome-do-arquivo.png`.
- Texto bruto do comprovante deve ser evitado ou minimizado.
- Logs não devem conter dados completos do comprovante.

### Filtros da dashboard

- Normalmente não filtra dashboard diretamente.
- Pode apoiar origem do gasto e auditoria do lançamento.

## MerchantRule

### Objetivo

Guardar preferências de classificação baseadas em recebedor, palavra-chave ou correção do usuário.

### Campos principais

- `id`: identificador único.
- `user_id`: dono da regra.
- `keyword`: palavra-chave ou recebedor.
- `category_id`: categoria sugerida.
- `expense_type_id`: tipo sugerido.
- `match_count`: quantidade de vezes usada.
- `last_used_at`: último uso.
- `created_at`: data de criação.

### Relacionamentos

- Pertence a um usuário.
- Pode apontar para categoria.
- Pode apontar para tipo de gasto.

### Regras importantes

- Correções do usuário devem melhorar próximas sugestões.
- Regras de um usuário não devem afetar outro usuário.
- Sugestões devem ser apresentadas como sugestão, não como verdade final.

### Segurança

- Pode revelar hábitos de consumo, então deve ser tratada como dado sensível.

### Filtros da dashboard

- Não é filtro principal.
- Ajuda a manter categorias mais consistentes, melhorando a qualidade dos gráficos.

## MonthlyLimit

### Objetivo

Representar limite mensal definido pelo usuário para apoiar análise de controle e economia possível.

### Campos principais

- `id`: identificador único.
- `user_id`: dono do limite.
- `month`: mês.
- `year`: ano.
- `total_limit`: limite geral.
- `category_id`: categoria opcional.
- `expense_type_id`: tipo opcional.
- `created_at`: data de criação.
- `updated_at`: data de alteração.

### Relacionamentos

- Pertence a um usuário.
- Pode estar ligado a categoria.
- Pode estar ligado a tipo de gasto.

### Regras importantes

- Pode existir limite geral mensal.
- Limites por categoria ou tipo podem ficar para evolução.
- Economia possível deve considerar gastos supérfluos e limite mensal.

### Segurança

- Limites revelam planejamento financeiro e devem ser isolados por usuário.

### Filtros da dashboard

- Usado para calcular economia possível.
- Pode apoiar alertas futuros por mês, categoria ou tipo.

## Assumptions

- Identificadores públicos devem ser UUIDs.
- Datas devem usar fuso consistente na aplicação.
- Valores monetários devem ser armazenados de forma precisa, evitando float.
- Índices serão planejados depois para `user_id`, `date`, `category_id`, `expense_type_id`, `payment_method`, `merchant_name` e `amount`.
- Supabase Auth será a fonte de identidade da versão persistida.
- Row Level Security será obrigatória antes de dados reais de usuários.
