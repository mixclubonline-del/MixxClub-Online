-- Prime Content Queue for viral content generation pipeline
CREATE TABLE public.prime_content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('hot-take', 'production-tip', 'industry-insight', 'platform-promo', 'trend-reaction')),
  topic TEXT,
  source_trend_id TEXT,
  script TEXT NOT NULL,
  audio_url TEXT,
  image_url TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  platform_content JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'ready', 'approved', 'scheduled', 'posted', 'rejected')),
  scheduled_for TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  platforms_posted JSONB DEFAULT '[]',
  engagement_metrics JSONB DEFAULT '{}',
  generation_metadata JSONB DEFAULT '{}',
  rejection_reason TEXT,
  created_by TEXT DEFAULT 'system',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.prime_content_queue ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admins can view all content" ON public.prime_content_queue
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage content" ON public.prime_content_queue
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Public read for posted content (for future public feed)
CREATE POLICY "Anyone can view posted content" ON public.prime_content_queue
  FOR SELECT USING (status = 'posted');

-- Indexes for efficient queries
CREATE INDEX idx_prime_content_status ON public.prime_content_queue(status);
CREATE INDEX idx_prime_content_scheduled ON public.prime_content_queue(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_prime_content_created ON public.prime_content_queue(created_at DESC);

-- Updated at trigger
CREATE TRIGGER update_prime_content_updated_at
  BEFORE UPDATE ON public.prime_content_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Prime Persona Configuration table for canonical voice settings
CREATE TABLE public.prime_persona_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  persona_prompt TEXT NOT NULL,
  voice_id TEXT DEFAULT 'n2GT0XqyIfmevnaDjYT0',
  content_pillars JSONB DEFAULT '["industry-truth", "production-gems", "platform-value", "culture-commentary"]',
  tone_modifiers JSONB DEFAULT '{"energy": "high", "formality": "casual", "humor": "witty"}',
  platform_guidelines JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default Prime persona
INSERT INTO public.prime_persona_config (id, persona_prompt, platform_guidelines) VALUES (
  'default',
  'You are Prime - the OG head engineer and studio owner of MixClub. You''ve been in the game for 20+ years, worked with legends, and now you''re building the platform you wish existed when you started.

Voice characteristics:
- Direct but not cold
- Industry veteran wisdom, not academic
- Hip-hop culture fluent (not try-hard)
- Business-aware but artist-first
- Quotable one-liners are your signature

Your content pillars:
1. Industry truth bombs (expose the game, educate the next gen)
2. Production gems (real techniques, no fluff)
3. MixClub platform value (natural, not salesy)
4. Culture commentary (what''s happening in music)

Never:
- Sound like a marketing bot
- Use cringe corporate language
- Lecture or talk down
- Pretend you''re younger than you are

Always:
- Keep it real
- Drop value
- End with something memorable
- Stay true to the MixClub mission: "From Bedroom to Billboard"',
  '{
    "tiktok": {"max_length": 150, "hashtag_count": 5, "style": "punchy-hooks"},
    "instagram": {"max_length": 300, "hashtag_count": 10, "style": "visual-storytelling"},
    "twitter": {"max_length": 280, "thread_max": 5, "style": "quotable-takes"},
    "youtube_shorts": {"max_length": 100, "style": "hook-value-cta"}
  }'
);

-- RLS for persona config (admin only)
ALTER TABLE public.prime_persona_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage persona" ON public.prime_persona_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can read active persona" ON public.prime_persona_config
  FOR SELECT USING (is_active = true);