# Security and Privacy Spec

## Objetivo

Proteger gastos, comprovantes Pix e informações financeiras do usuário. Segurança e privacidade devem ser consideradas desde o início, mesmo no MVP.
O sistema é multiusuário e deve isolar dados por usuário autenticado.

## Dados sensíveis

São dados sensíveis:

- gastos;
- valores;
- datas de pagamento;
- recebedores;
- descrições;
- categorias;
- tipos de gasto;
- comprovantes Pix;
- texto extraído por OCR;
- regras de classificação do usuário;
- limites mensais;
- e-mail e dados de autenticação.
- identificador do usuário (`user_id`);
- sessões e estado de login.

## Proteção de comprovantes

- Armazenar comprovantes em bucket privado.
- Validar autorização antes de permitir acesso.
- Usar URLs temporárias quando necessário.
- Evitar expor caminho interno do arquivo.
- Evitar guardar texto bruto completo quando não for necessário.
- Remover ou anonimizar dados em logs de erro.

## Proteção de gastos por usuário

- Todo gasto deve ter dono.
- Nenhum gasto pode existir sem `user_id`.
- Consultas devem filtrar pelo usuário autenticado.
- Row Level Security deve impedir acesso cruzado.
- Operações de leitura, criação, edição e exclusão devem validar autorização.
- A interface não deve ser a única barreira de segurança.
- Testes devem cobrir que um usuário não vê dados de outro.

## Autenticação

- O sistema deve ter tela de criação de conta.
- O sistema deve ter tela de login.
- O sistema deve ter logout.
- Proteger rotas privadas.
- Não confiar em dados editáveis pelo usuário para autorização.
- Validar sessão no servidor para operações sensíveis.
- Evitar expor dados financeiros antes de confirmar autenticação.
- Cadastro manual de gastos só deve funcionar para usuário autenticado.
- Listagem de gastos só deve retornar dados do usuário autenticado.

## Supabase e Row Level Security

Caso Supabase seja usado:

- habilitar RLS em tabelas expostas;
- criar políticas por usuário;
- usar `auth.uid()` ou mecanismo equivalente para comparar dono do registro;
- não usar `user_metadata` para autorização;
- nunca expor service role key no cliente;
- revisar views para não burlar RLS;
- manter funções privilegiadas fora de schemas expostos.
- impedir `insert` de gasto quando `user_id` não for o usuário autenticado;
- impedir `select`, `update` e `delete` de linhas de outro usuário.

## Storage de comprovantes

- Buckets devem ser privados.
- Arquivos devem ficar em caminho associado ao usuário.
- Upload deve exigir usuário autenticado.
- Download ou visualização deve exigir autorização.
- Substituição de arquivo deve ser controlada.

## Logs

- Não registrar comprovante completo.
- Não registrar texto bruto completo do OCR.
- Não registrar valor, recebedor e descrição completa juntos.
- Mascarar identificadores sensíveis em erros.
- Logs devem ajudar suporte técnico sem expor vida financeira do usuário.

## Variáveis de ambiente

- Segredos devem ficar em variáveis de ambiente.
- Não salvar tokens, senhas ou chaves no código.
- Não criar variáveis públicas para segredos.
- Em Next.js, variáveis com prefixo público só podem conter dados realmente públicos.

## Upload permitido

Tipos permitidos na primeira versão:

- PNG;
- JPG;
- JPEG;
- WEBP;
- PDF.

Limite inicial sugerido:

- até 10 MB por arquivo.

Esse limite pode ser ajustado depois com base no OCR escolhido e nos custos de storage.

## Riscos principais

- Usuário acessar gastos de outra pessoa.
- Gasto criado sem dono.
- Login existir só no frontend, sem proteção real no servidor/banco.
- Comprovante privado ficar público.
- Chave secreta ser enviada para o frontend.
- Logs vazarem dados financeiros.
- Upload aceitar arquivo malicioso.
- OCR externo receber dados sem decisão clara.
- Dashboard agregar dados de usuários diferentes por erro de filtro.
- Cache ou storage local vazar dados entre contas no mesmo navegador.

## Medidas para reduzir riscos

- RLS desde a primeira migration futura.
- Auth antes de permitir dados financeiros reais.
- Buckets privados.
- Validação server-side de arquivos.
- Limite de tamanho.
- Lista restrita de MIME types.
- Autorização em todas as rotas privadas.
- Testes de isolamento por usuário.
- Logs minimizados.
- Revisão de segurança sempre que alterar banco, autenticação ou upload.
- Não considerar armazenamento local temporário como solução segura multiusuário.

## Assumptions

- O projeto usará autenticação antes de permitir gastos reais.
- Comprovantes serão privados por padrão.
- OCR externo só será usado se a decisão ficar documentada e os riscos forem aceitos.
- A primeira fatia corrigida deve implementar ou bloquear corretamente áreas financeiras sem login real.
