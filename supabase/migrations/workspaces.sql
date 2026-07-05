-- Wave 3A — Teams Workspaces (Part 1: schema + RLS only)
-- Run once in the Supabase SQL editor after public.profiles and public.documents exist.
-- Replaces the four per-user documents RLS policies with workspace-aware policies.
--
-- Authorization model: encryption stays server-side with one app key; sharing is
-- membership on workspace_id, not key exchange. NULL workspace_id = personal doc.
--
-- Audit: no DROP TABLE statements. Policy drops below are RLS-only (no row data loss).

-- =============================================================================
-- 1. workspaces
-- =============================================================================

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;

comment on table public.workspaces is
  'Shared team workspace. owner_id is authoritative; owner row is also inserted into workspace_members via trigger.';

-- =============================================================================
-- 2. workspace_members
-- =============================================================================

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

alter table public.workspace_members enable row level security;

comment on table public.workspace_members is
  'Membership and role per workspace. owner role mirrors workspaces.owner_id for the founding owner.';

-- =============================================================================
-- 3. workspace_invites
-- =============================================================================

create table if not exists public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  email text not null,
  role text not null check (role in ('editor', 'viewer')),
  token uuid not null default gen_random_uuid() unique,
  invited_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz
);

alter table public.workspace_invites enable row level security;

comment on table public.workspace_invites is
  'Pending email invites. Accept flow uses Edge Function + token (service role); invitees have no RLS path here by design.';

-- =============================================================================
-- 4. documents.workspace_id
-- =============================================================================

alter table public.documents
  add column if not exists workspace_id uuid references public.workspaces (id) on delete set null;

comment on column public.documents.workspace_id is
  'NULL = personal document (legacy behavior). Non-null = visible to workspace members per RLS.';

-- =============================================================================
-- 5. Helper functions (SECURITY DEFINER — break RLS recursion)
-- =============================================================================

create or replace function public.is_workspace_member(ws uuid, uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = ws
      and wm.user_id = uid
  );
$$;

comment on function public.is_workspace_member(uuid, uuid) is
  'SECURITY DEFINER membership probe for RLS. Bypasses workspace_members RLS to avoid recursion.';

create or replace function public.is_workspace_owner(ws uuid, uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspaces w
    where w.id = ws
      and w.owner_id = uid
  );
$$;

comment on function public.is_workspace_owner(uuid, uuid) is
  'True when uid is workspaces.owner_id (authoritative workspace owner, not merely role=owner in members).';

create or replace function public.has_workspace_role(ws uuid, uid uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_workspace_owner(ws, uid)
    or exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = ws
        and wm.user_id = uid
        and wm.role = any (allowed_roles)
    );
$$;

comment on function public.has_workspace_role(uuid, uuid, text[]) is
  'Membership role check for mutating policies. workspaces.owner_id always passes.';

revoke all on function public.is_workspace_member(uuid, uuid) from public;
revoke all on function public.is_workspace_owner(uuid, uuid) from public;
revoke all on function public.has_workspace_role(uuid, uuid, text[]) from public;

grant execute on function public.is_workspace_member(uuid, uuid) to authenticated, service_role;
grant execute on function public.is_workspace_owner(uuid, uuid) to authenticated, service_role;
grant execute on function public.has_workspace_role(uuid, uuid, text[]) to authenticated, service_role;

-- Seed owner membership when a workspace is created (owner is not yet in members for RLS).
create or replace function public.workspace_add_owner_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (workspace_id, user_id) do nothing;
  return new;
end;
$$;

create trigger workspaces_add_owner_member
  after insert on public.workspaces
  for each row
  execute function public.workspace_add_owner_member();

-- documents.user_id is the original creator and must not change via UPDATE.
create or replace function public.documents_preserve_user_id()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'documents.user_id is immutable (creator remains authoritative)';
  end if;
  return new;
end;
$$;

create trigger documents_preserve_user_id
  before update on public.documents
  for each row
  execute function public.documents_preserve_user_id();

-- =============================================================================
-- 6. RLS — workspaces
-- =============================================================================

create policy "Workspace members and owners can view workspace"
  on public.workspaces
  for select
  using (
    public.is_workspace_member(id, auth.uid())
    or owner_id = auth.uid()
  );

create policy "Authenticated users can create owned workspaces"
  on public.workspaces
  for insert
  with check (owner_id = auth.uid());

create policy "Workspace owner can update workspace"
  on public.workspaces
  for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Workspace owner can delete workspace"
  on public.workspaces
  for delete
  using (owner_id = auth.uid());

-- =============================================================================
-- 6. RLS — workspace_members
-- =============================================================================

create policy "Workspace members can view membership"
  on public.workspace_members
  for select
  using (public.is_workspace_member(workspace_id, auth.uid()));

create policy "Workspace owner can add members"
  on public.workspace_members
  for insert
  with check (public.is_workspace_owner(workspace_id, auth.uid()));

create policy "Workspace owner can change member roles"
  on public.workspace_members
  for update
  using (public.is_workspace_owner(workspace_id, auth.uid()))
  with check (public.is_workspace_owner(workspace_id, auth.uid()));

create policy "Workspace owner can remove members or member can leave"
  on public.workspace_members
  for delete
  using (
    public.is_workspace_owner(workspace_id, auth.uid())
    or user_id = auth.uid()
  );

comment on policy "Workspace owner can remove members or member can leave"
  on public.workspace_members is
  'Owner may revoke anyone. Any member may delete their own row (leave). Owner cannot leave if they are the sole owner without transferring ownership first — not enforced here; app/Edge Function should guard.';

-- =============================================================================
-- 6. RLS — workspace_invites
-- =============================================================================

create policy "Workspace owner can view invites"
  on public.workspace_invites
  for select
  using (public.is_workspace_owner(workspace_id, auth.uid()));

create policy "Workspace owner can create invites"
  on public.workspace_invites
  for insert
  with check (
    public.is_workspace_owner(workspace_id, auth.uid())
    and invited_by = auth.uid()
  );

create policy "Workspace owner can revoke invites"
  on public.workspace_invites
  for delete
  using (public.is_workspace_owner(workspace_id, auth.uid()));

-- No UPDATE policy on workspace_invites; acceptance sets accepted_at via Edge Function (service role).
-- No SELECT policy for invitees — token validation happens server-side only.

-- =============================================================================
-- 6. RLS — documents (replace four own-user policies)
-- DANGER: drops legacy documents RLS policies only — no table or row data affected.
-- =============================================================================

drop policy if exists "Users can view own documents" on public.documents;
drop policy if exists "Users can insert own documents" on public.documents;
drop policy if exists "Users can update own documents" on public.documents;
drop policy if exists "Users can delete own documents" on public.documents;

create policy "Documents select by owner or workspace member"
  on public.documents
  for select
  using (
    auth.uid() = user_id
    or (
      workspace_id is not null
      and public.is_workspace_member(workspace_id, auth.uid())
    )
  );

create policy "Documents insert as self with optional workspace"
  on public.documents
  for insert
  with check (
    auth.uid() = user_id
    and (
      workspace_id is null
      or public.has_workspace_role(
        workspace_id,
        auth.uid(),
        array['owner', 'editor']
      )
    )
  );

comment on policy "Documents insert as self with optional workspace"
  on public.documents is
  'Creator must be auth.uid(). When workspace_id is set, caller must be workspace owner or editor (viewers cannot create). COMPROMISE: workspace_id on INSERT is trusted if membership passes; moving an existing doc is an UPDATE handled separately.';

create policy "Documents update by owner or workspace editor"
  on public.documents
  for update
  using (
    auth.uid() = user_id
    or (
      workspace_id is not null
      and public.has_workspace_role(
        workspace_id,
        auth.uid(),
        array['owner', 'editor']
      )
    )
  )
  with check (
    auth.uid() = user_id
    or (
      workspace_id is not null
      and public.has_workspace_role(
        workspace_id,
        auth.uid(),
        array['owner', 'editor']
      )
    )
  );

comment on policy "Documents update by owner or workspace editor"
  on public.documents is
  'Personal docs: creator only. Workspace docs: creator OR workspace owner/editor role. user_id immutability enforced by trigger. COMPROMISE: RLS does not restrict which columns editors may change (e.g. workspace_id move); Edge Function must validate doc moves explicitly.';

create policy "Documents delete by creator or workspace owner"
  on public.documents
  for delete
  using (
    auth.uid() = user_id
    or (
      workspace_id is not null
      and public.is_workspace_owner(workspace_id, auth.uid())
    )
  );

comment on policy "Documents delete by creator or workspace owner"
  on public.documents is
  'Delete allowed for document creator (user_id) OR workspaces.owner_id. Workspace editors and viewers cannot delete. COMPROMISE: workspace member with role=owner in workspace_members but not workspaces.owner_id cannot delete unless also document creator.';

-- =============================================================================
-- 7. Indexes
-- =============================================================================

create index if not exists workspace_members_user_id_idx
  on public.workspace_members (user_id);

create index if not exists documents_workspace_id_idx
  on public.documents (workspace_id);

create index if not exists workspace_invites_token_idx
  on public.workspace_invites (token);
