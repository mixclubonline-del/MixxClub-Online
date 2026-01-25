
-- Create Organizations table
create table public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Organization Members table
create table public.organization_members (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references auth.users(id), -- Nullable for pending invites (by email)
  email text not null, -- For invites
  role text not null check (role in ('Admin', 'Manager', 'A&R', 'Member')),
  status text not null check (status in ('Active', 'Pending')) default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Contracts table
create table public.contracts (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) on delete cascade not null,
  title text not null,
  type text not null,
  value text,
  description text,
  status text not null check (status in ('Draft', 'Review', 'Signed', 'Rejected')) default 'Draft',
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.contracts enable row level security;

-- Policies (Simplified for Phase 2 - Owner has full access)

-- Organizations: Owners can do everything
create policy "Owners can manage their organization"
  on public.organizations for all
  using (auth.uid() = owner_id);

-- Members: Organization members can view other members
create policy "Members can view their organization members"
  on public.organization_members for select
  using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = organization_members.organization_id
      and om.user_id = auth.uid()
    )
    or
    exists (
      select 1 from public.organizations o
      where o.id = organization_members.organization_id
      and o.owner_id = auth.uid()
    )
  );

-- Members: Only Admins/Owners can manage members
create policy "Admins and Owners can manage members"
  on public.organization_members for all
  using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_members.organization_id
      and o.owner_id = auth.uid()
    )
  );

-- Contracts: Organization members can view contracts
create policy "Members can view contracts"
  on public.contracts for select
  using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = contracts.organization_id
      and om.user_id = auth.uid()
    )
    or
    exists (
      select 1 from public.organizations o
      where o.id = contracts.organization_id
      and o.owner_id = auth.uid()
    )
  );

-- Contracts: Admins/Owners can manage contracts
create policy "Admins and Owners can manage contracts"
  on public.contracts for all
  using (
    exists (
      select 1 from public.organizations o
      where o.id = contracts.organization_id
      and o.owner_id = auth.uid()
    )
  );
