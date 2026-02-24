-- Promo Campaign Infrastructure
-- Tracks campaigns, generated assets, and phase configs

-- Campaign orchestration table
create table if not exists promo_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phase text not null check (phase in ('made-with-mixxclub', 'character-launch', 'challenge', 'insider-drip', 'grand-opening')),
  status text not null default 'draft' check (status in ('draft', 'generating', 'ready', 'published', 'archived')),
  config jsonb not null default '{}',
  character_id text, -- prime | jax | rell | nova
  genre text, -- role-specific genre context
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  published_at timestamptz,
  asset_count int default 0
);

-- Generated assets per campaign
create table if not exists promo_assets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references promo_campaigns(id) on delete cascade not null,
  asset_type text not null check (asset_type in (
    'beat', 'album_art', 'video', 'ad_copy', 'social_post',
    'waveform', 'voiceover', 'landing_image', 'avatar', 'track_name',
    'economy_asset'
  )),
  generator_function text not null, -- which edge function created it
  content_url text, -- storage URL for media assets
  content_text text, -- for text assets (ad copy, captions)
  metadata jsonb default '{}',
  status text default 'generating' check (status in ('generating', 'ready', 'failed', 'published')),
  created_at timestamptz default now()
);

-- Phase config templates
create table if not exists promo_phase_configs (
  id uuid primary key default gen_random_uuid(),
  phase text not null unique,
  display_name text not null,
  description text,
  asset_pipeline jsonb not null default '[]', -- ordered list of generator functions to call
  default_config jsonb not null default '{}',
  created_at timestamptz default now()
);

-- Seed phase configs
insert into promo_phase_configs (phase, display_name, description, asset_pipeline, default_config) values
  ('made-with-mixxclub', 'Made With MixxClub', '5 original tracks + visuals, all created by MixxClub tools', 
   '["generate-trap-beat", "generate-album-art", "generate-track-name", "generate-ad-copy", "generate-social-posts", "generate-waveform"]'::jsonb,
   '{"track_count": 5, "genres": ["trap", "r&b", "drill", "lo-fi", "afrobeats"]}'::jsonb),
  
  ('character-launch', 'Character Launch Series', 'Cinematic intros for Jax/Prime/Rell/Nova narrated by Prime voice',
   '["generate-video", "prime-speak", "generate-ad-copy", "generate-social-posts", "generate-landing-image"]'::jsonb,
   '{"episodes": 4, "characters": ["jax", "prime", "rell", "nova"]}'::jsonb),
  
  ('challenge', 'The MixxClub Challenge', '24-hour livestreamed production challenge',
   '["generate-trap-beat", "generate-social-posts", "generate-ad-copy", "generate-video"]'::jsonb,
   '{"duration_hours": 24, "live_stream": true}'::jsonb),
  
  ('insider-drip', 'Insider Access', 'Personalized AI-generated content for waitlist subscribers',
   '["generate-ad-copy", "prime-chat", "generate-music", "generate-ai-avatar", "generate-economy-asset"]'::jsonb,
   '{"drip_count": 5, "personalize_by_role": true}'::jsonb),
  
  ('grand-opening', 'The Grand Opening', 'Live cross-platform launch event',
   '["generate-trap-beat", "prime-speak", "generate-social-posts", "generate-economy-asset", "generate-video"]'::jsonb,
   '{"live_event": true, "simulcast": ["twitch", "youtube"]}'::jsonb);

-- RLS policies
alter table promo_campaigns enable row level security;
alter table promo_assets enable row level security;
alter table promo_phase_configs enable row level security;

-- Admin-only access for campaigns
create policy "Admins can manage promo campaigns"
  on promo_campaigns for all
  using (
    exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );

-- Admin-only access for assets
create policy "Admins can manage promo assets"
  on promo_assets for all
  using (
    exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );

-- Phase configs are readable by admins
create policy "Admins can read phase configs"
  on promo_phase_configs for select
  using (
    exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
  );

-- Indexes for performance
create index idx_promo_campaigns_phase on promo_campaigns(phase);
create index idx_promo_campaigns_status on promo_campaigns(status);
create index idx_promo_assets_campaign on promo_assets(campaign_id);
create index idx_promo_assets_type on promo_assets(asset_type);
