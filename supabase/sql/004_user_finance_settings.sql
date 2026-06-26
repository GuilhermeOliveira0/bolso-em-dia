create table if not exists public.user_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 50),
  color text not null default '#8b5cf6',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_expense_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 50),
  description text not null default '',
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 50),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_categories
  alter column is_active set default true;

alter table public.user_categories
  add column if not exists default_option_id text,
  add column if not exists is_hidden boolean not null default false;

alter table public.user_expense_types
  alter column is_active set default true;

alter table public.user_expense_types
  add column if not exists default_option_id text,
  add column if not exists is_hidden boolean not null default false;

alter table public.user_payment_methods
  alter column is_active set default true;

alter table public.user_payment_methods
  add column if not exists default_option_id text,
  add column if not exists is_hidden boolean not null default false;

update public.user_categories
set is_active = true
where is_active is null;

update public.user_expense_types
set is_active = true
where is_active is null;

update public.user_payment_methods
set is_active = true
where is_active is null;

update public.user_categories
set is_hidden = false
where is_hidden is null;

update public.user_expense_types
set is_hidden = false
where is_hidden is null;

update public.user_payment_methods
set is_hidden = false
where is_hidden is null;

create unique index if not exists user_categories_user_name_active_idx
  on public.user_categories (user_id, lower(trim(name)))
  where is_active and not is_hidden;

create unique index if not exists user_expense_types_user_name_active_idx
  on public.user_expense_types (user_id, lower(trim(name)))
  where is_active and not is_hidden;

create unique index if not exists user_payment_methods_user_name_active_idx
  on public.user_payment_methods (user_id, lower(trim(name)))
  where is_active and not is_hidden;

create unique index if not exists user_categories_default_override_active_idx
  on public.user_categories (user_id, default_option_id)
  where is_active and default_option_id is not null;

create unique index if not exists user_expense_types_default_override_active_idx
  on public.user_expense_types (user_id, default_option_id)
  where is_active and default_option_id is not null;

create unique index if not exists user_payment_methods_default_override_active_idx
  on public.user_payment_methods (user_id, default_option_id)
  where is_active and default_option_id is not null;

create index if not exists user_categories_user_id_idx on public.user_categories (user_id);
create index if not exists user_expense_types_user_id_idx on public.user_expense_types (user_id);
create index if not exists user_payment_methods_user_id_idx on public.user_payment_methods (user_id);

alter table public.user_categories enable row level security;
alter table public.user_expense_types enable row level security;
alter table public.user_payment_methods enable row level security;

grant select, insert, update, delete on public.user_categories to authenticated;
grant select, insert, update, delete on public.user_expense_types to authenticated;
grant select, insert, update, delete on public.user_payment_methods to authenticated;

drop policy if exists "users can select own categories" on public.user_categories;
create policy "users can select own categories"
on public.user_categories
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "users can insert own categories" on public.user_categories;
create policy "users can insert own categories"
on public.user_categories
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "users can update own categories" on public.user_categories;
create policy "users can update own categories"
on public.user_categories
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "users can delete own categories" on public.user_categories;
create policy "users can delete own categories"
on public.user_categories
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "users can select own expense types" on public.user_expense_types;
create policy "users can select own expense types"
on public.user_expense_types
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "users can insert own expense types" on public.user_expense_types;
create policy "users can insert own expense types"
on public.user_expense_types
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "users can update own expense types" on public.user_expense_types;
create policy "users can update own expense types"
on public.user_expense_types
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "users can delete own expense types" on public.user_expense_types;
create policy "users can delete own expense types"
on public.user_expense_types
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "users can select own payment methods" on public.user_payment_methods;
create policy "users can select own payment methods"
on public.user_payment_methods
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "users can insert own payment methods" on public.user_payment_methods;
create policy "users can insert own payment methods"
on public.user_payment_methods
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "users can update own payment methods" on public.user_payment_methods;
create policy "users can update own payment methods"
on public.user_payment_methods
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "users can delete own payment methods" on public.user_payment_methods;
create policy "users can delete own payment methods"
on public.user_payment_methods
for delete
to authenticated
using ((select auth.uid()) = user_id);
