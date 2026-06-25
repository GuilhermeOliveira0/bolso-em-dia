# Deployment

## Vercel

Projeto Vercel: `bolso-em-dia`.

URL de produção atual:

- `https://bolso-em-dia-eosin.vercel.app`

O deploy inicial de produção foi feito via Vercel CLI. A conexão GitHub no painel pode precisar ser revisada se a Vercel não listar o repositório `GuilhermeOliveira0/bolso-em-dia` no fluxo de importação.

Configuração esperada:

- Framework: Next.js.
- Root directory: `./`.
- Build command: padrão da Vercel para Next.js, equivalente a `npm run build`.
- Output directory: padrão Next.js.
- Install command: padrão da Vercel.

Comando usado para deploy local pela CLI:

```bash
npx vercel@latest deploy --prod --yes
```

Variáveis necessárias na Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Essas variáveis são públicas por causa do prefixo `NEXT_PUBLIC_`. Não configurar `service_role` ou qualquer segredo do Supabase no frontend.

## Validação local

Antes de publicar:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Para smoke test local de produção:

```bash
npm run build
npm run start
```

Validar:

- `/login` e `/cadastro` abrem sem autenticação.
- `/dashboard`, `/lancamentos`, `/extrato`, `/gastos` e `/comprovantes` redirecionam para `/login` quando não há sessão.
- Layout não tem overflow horizontal em 390px e 1280px.

## Supabase

O projeto depende das migrations em `supabase/sql/`:

- `001_expenses_rls.sql`
- `002_receipts_storage.sql`
- `003_receipts_ocr.sql`

A migration `003_receipts_ocr.sql` precisa estar aplicada para o fluxo atual de comprovantes e OCR, porque a aplicação seleciona e atualiza as colunas:

- `ocr_text`
- `extracted_amount`
- `extracted_date`
- `extracted_recipient`
- `ocr_status`
- `ocr_confidence`
- `processed_at`
- `expense_id`

Se a SQL 003 não estiver aplicada, a listagem ou leitura de comprovantes pode falhar em produção.

Checklist Supabase:

- RLS habilitado em `expenses` e `receipts`.
- Bucket `receipts` privado.
- Policies de Storage restringindo arquivos à pasta do `auth.uid()`.
- Auth Site URL configurada para a URL de produção da Vercel.
- Redirect URLs mantendo localhost para desenvolvimento e adicionando a URL de produção.

## OCR na Vercel

O OCR usa `tesseract.js` em runtime Node/server. O fluxo tem:

- timeout de 60 segundos;
- encerramento do worker no `finally`;
- erro amigável;
- fallback para revisão manual;
- botão de leitura desabilitado durante processamento.

Limitação conhecida: OCR em serverless pode ser mais lento na primeira execução. Se a leitura exceder o limite do ambiente ou falhar, a revisão manual deve continuar disponível e nenhuma despesa deve ser salva automaticamente.

## Segurança

- Não commitar `.env.local`.
- Não expor valores de variáveis em logs ou documentação.
- Nunca usar chave `service_role` no frontend.
- Não tornar o bucket `receipts` público.
- Não desabilitar RLS.
- Não salvar despesa extraída de comprovante sem confirmação do usuário.
