-- Prime Brain Training Data Collection
-- Stores every Prime Brain conversation exchange as a training pair for io.net SFT
-- Format: instruction (user message + ALS context) → output (AI response)

create table if not exists prime_brain_training_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text not null,
  instruction text not null,
  output text not null,
  als_snapshot jsonb,
  quality_rating smallint check (quality_rating between 1 and 5),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Index for export queries
create index idx_training_data_created on prime_brain_training_data(created_at desc);
create index idx_training_data_user on prime_brain_training_data(user_id);
create index idx_training_data_session on prime_brain_training_data(session_id);

-- RLS: users can insert their own data, admins can read all
alter table prime_brain_training_data enable row level security;

create policy "Users can insert own training data"
  on prime_brain_training_data for insert
  with check (auth.uid() = user_id);

create policy "Users can read own training data"
  on prime_brain_training_data for select
  using (auth.uid() = user_id);
