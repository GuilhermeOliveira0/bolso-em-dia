-- Bolso em Dia - private receipt image uploads and Row Level Security
-- Execute este SQL no Supabase para habilitar a fatia de comprovantes.
-- Nao coloque service role key no frontend.

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expense_id uuid null references public.expenses(id) on delete set null,
  file_path text not null unique,
  file_name text not null,
  file_type text not null check (file_type in ('image/png', 'image/jpeg', 'image/webp')),
  file_size integer not null check (file_size > 0 and file_size <= 5242880),
  status text not null default 'uploaded' check (status in ('uploaded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists receipts_user_id_created_at_idx
  on public.receipts (user_id, created_at desc);

create index if not exists receipts_expense_id_idx
  on public.receipts (expense_id)
  where expense_id is not null;

alter table public.receipts enable row level security;

grant select, insert, update, delete on public.receipts to authenticated;

drop policy if exists "receipts_select_own" on public.receipts;
create policy "receipts_select_own"
  on public.receipts
  for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "receipts_insert_own" on public.receipts;
create policy "receipts_insert_own"
  on public.receipts
  for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "receipts_update_own" on public.receipts;
create policy "receipts_update_own"
  on public.receipts
  for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists "receipts_delete_own" on public.receipts;
create policy "receipts_delete_own"
  on public.receipts
  for delete
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts',
  'receipts',
  false,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];

drop policy if exists "receipt_files_select_own_folder" on storage.objects;
create policy "receipt_files_select_own_folder"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'receipts'
    and (select auth.uid()) is not null
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "receipt_files_insert_own_folder" on storage.objects;
create policy "receipt_files_insert_own_folder"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'receipts'
    and (select auth.uid()) is not null
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "receipt_files_update_own_folder" on storage.objects;
create policy "receipt_files_update_own_folder"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'receipts'
    and (select auth.uid()) is not null
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'receipts'
    and (select auth.uid()) is not null
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "receipt_files_delete_own_folder" on storage.objects;
create policy "receipt_files_delete_own_folder"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'receipts'
    and (select auth.uid()) is not null
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
