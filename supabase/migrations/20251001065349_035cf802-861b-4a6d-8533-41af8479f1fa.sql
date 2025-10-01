-- Broaden is_admin to allow the demo admin account by email, avoiding client-side role inserts
create or replace function public.is_admin(user_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = 'public'
as $$
  select public.has_role(user_uuid, 'admin')
  or exists (
    select 1 from auth.users u
    where u.id = user_uuid
      and u.email = 'mixclub.demo.admin@gmail.com'
  );
$$;