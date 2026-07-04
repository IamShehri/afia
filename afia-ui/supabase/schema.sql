-- Run once in the Supabase SQL editor before pilot onboarding.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  consent_given_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Shared updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Documents (per-user; encrypted fields via documents-crypto Edge Function)
-- title, content, and metadata are stored as base64 AES-256-GCM ciphertext.
-- Client must NOT read/write those columns directly — use the Edge Function.
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  bridge_document_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  title_encrypted text not null,
  content_encrypted text,
  metadata_encrypted text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, bridge_document_id)
);

alter table public.documents enable row level security;

create policy "Users can view own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on public.documents for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

create index if not exists documents_user_bridge_idx
  on public.documents (user_id, bridge_document_id);

-- Audit log (append-only from client)
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  action text not null,
  resource_type text not null,
  resource_id text,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

create policy "Users can insert own audit entries"
  on public.audit_log for insert
  with check (auth.uid() = user_id);

