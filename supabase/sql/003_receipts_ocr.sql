-- Bolso em Dia - OCR básico de comprovantes Pix com revisão manual.
-- Execute este SQL no Supabase antes de usar o fluxo de leitura OCR.
-- Nao coloque service role key no frontend.

alter table public.receipts
  add column if not exists ocr_text text null,
  add column if not exists extracted_amount integer null check (extracted_amount is null or extracted_amount > 0),
  add column if not exists extracted_date date null,
  add column if not exists extracted_recipient text null,
  add column if not exists ocr_status text null,
  add column if not exists ocr_confidence numeric(4, 3) null check (
    ocr_confidence is null or (ocr_confidence >= 0 and ocr_confidence <= 1)
  ),
  add column if not exists processed_at timestamptz null;

alter table public.receipts
  drop constraint if exists receipts_status_check;

alter table public.receipts
  add constraint receipts_status_check
  check (status in ('uploaded', 'processing', 'processed', 'failed', 'reviewed'));

alter table public.receipts
  drop constraint if exists receipts_ocr_status_check;

alter table public.receipts
  add constraint receipts_ocr_status_check
  check (ocr_status is null or ocr_status in ('pending', 'processing', 'processed', 'failed'));

alter table public.expenses
  drop constraint if exists expenses_source_check;

alter table public.expenses
  add constraint expenses_source_check
  check (source in ('manual', 'ocr'));

create index if not exists receipts_user_id_ocr_status_idx
  on public.receipts (user_id, ocr_status, processed_at desc);
