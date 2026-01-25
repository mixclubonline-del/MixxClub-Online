
-- Create a table for daily analytics snapshots
create table if not exists public.prime_analytics_daily (
  id uuid default gen_random_uuid() primary key,
  content_id uuid references public.prime_content_queue(id) on delete cascade,
  date date not null default CURRENT_DATE,
  platform text not null, -- 'tiktok', 'instagram', 'youtube_shorts'
  views integer default 0,
  likes integer default 0,
  shares integer default 0,
  comments integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure unique record per content/platform/date
  unique(content_id, platform, date)
);

-- RLS Policies
alter table public.prime_analytics_daily enable row level security;

create policy "Enable read access for authenticated users"
  on public.prime_analytics_daily for select
  to authenticated
  using (true);

create policy "Enable insert for authenticated users (service role/functions)"
  on public.prime_analytics_daily for insert
  to authenticated
  with check (true);
