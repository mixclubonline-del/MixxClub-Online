-- ===========================================
-- MIXCLUB LIVE: DATABASE FOUNDATION
-- ===========================================

-- 1. Live Streams Table
CREATE TABLE public.live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  stream_type TEXT DEFAULT 'broadcast' CHECK (stream_type IN ('broadcast', 'session', 'battle', 'premiere', 'collab')),
  category TEXT DEFAULT 'general',
  thumbnail_url TEXT,
  is_live BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  viewer_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  total_gifts_value NUMERIC(10,2) DEFAULT 0,
  recording_url TEXT,
  is_recorded BOOLEAN DEFAULT true,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'subscribers', 'private')),
  co_hosts JSONB DEFAULT '[]',
  stream_key TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  playback_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Live Gifts Definitions
CREATE TABLE public.live_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  animation_type TEXT DEFAULT 'float' CHECK (animation_type IN ('float', 'burst', 'rain', 'special')),
  coin_cost INTEGER NOT NULL,
  creator_value NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pre-populate gifts
INSERT INTO public.live_gifts (name, emoji, coin_cost, creator_value, animation_type, sort_order) VALUES
('Fire', '🔥', 10, 0.05, 'float', 1),
('Speaker', '🔊', 25, 0.12, 'float', 2),
('Microphone', '🎤', 50, 0.25, 'burst', 3),
('Headphones', '🎧', 100, 0.50, 'burst', 4),
('Vinyl', '💿', 250, 1.25, 'rain', 5),
('Gold Record', '🏆', 500, 2.50, 'special', 6),
('Platinum', '💎', 1000, 5.00, 'special', 7),
('Stadium', '🏟️', 5000, 25.00, 'special', 8);

-- 3. Stream Gifts (Gifts sent during streams)
CREATE TABLE public.stream_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES public.live_streams(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  gift_id UUID REFERENCES public.live_gifts(id) NOT NULL,
  quantity INTEGER DEFAULT 1,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. User Coins Balance
CREATE TABLE public.user_coins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance INTEGER DEFAULT 0,
  total_purchased INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Live Chat Messages
CREATE TABLE public.live_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES public.live_streams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'chat' CHECK (message_type IN ('chat', 'system', 'gift', 'reaction', 'pinned')),
  is_highlighted BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Stream Followers (for notifications)
CREATE TABLE public.stream_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  notify_live BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, creator_id)
);

-- 7. Stream Analytics
CREATE TABLE public.stream_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES public.live_streams(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  viewer_count INTEGER DEFAULT 0,
  chat_count INTEGER DEFAULT 0,
  gift_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================
CREATE INDEX idx_live_streams_host ON public.live_streams(host_id);
CREATE INDEX idx_live_streams_is_live ON public.live_streams(is_live) WHERE is_live = true;
CREATE INDEX idx_live_streams_category ON public.live_streams(category);
CREATE INDEX idx_stream_gifts_stream ON public.stream_gifts(stream_id);
CREATE INDEX idx_stream_gifts_sender ON public.stream_gifts(sender_id);
CREATE INDEX idx_live_chat_stream ON public.live_chat_messages(stream_id);
CREATE INDEX idx_live_chat_created ON public.live_chat_messages(created_at);
CREATE INDEX idx_stream_followers_creator ON public.stream_followers(creator_id);
CREATE INDEX idx_stream_followers_follower ON public.stream_followers(follower_id);
CREATE INDEX idx_stream_analytics_stream ON public.stream_analytics(stream_id);

-- ===========================================
-- ENABLE ROW LEVEL SECURITY
-- ===========================================
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_analytics ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- RLS POLICIES: LIVE STREAMS
-- ===========================================
CREATE POLICY "Anyone can view public live streams"
  ON public.live_streams FOR SELECT
  USING (visibility = 'public' OR host_id = auth.uid());

CREATE POLICY "Users can create their own streams"
  ON public.live_streams FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their own streams"
  ON public.live_streams FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their own streams"
  ON public.live_streams FOR DELETE
  USING (auth.uid() = host_id);

-- ===========================================
-- RLS POLICIES: LIVE GIFTS
-- ===========================================
CREATE POLICY "Anyone can view active gifts"
  ON public.live_gifts FOR SELECT
  USING (is_active = true);

-- ===========================================
-- RLS POLICIES: STREAM GIFTS
-- ===========================================
CREATE POLICY "Anyone can view stream gifts"
  ON public.stream_gifts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can send gifts"
  ON public.stream_gifts FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- ===========================================
-- RLS POLICIES: USER COINS
-- ===========================================
CREATE POLICY "Users can view their own coins"
  ON public.user_coins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coins record"
  ON public.user_coins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coins"
  ON public.user_coins FOR UPDATE
  USING (auth.uid() = user_id);

-- ===========================================
-- RLS POLICIES: LIVE CHAT
-- ===========================================
CREATE POLICY "Anyone can view chat messages"
  ON public.live_chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can send chat messages"
  ON public.live_chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- RLS POLICIES: STREAM FOLLOWERS
-- ===========================================
CREATE POLICY "Users can view their own follows"
  ON public.stream_followers FOR SELECT
  USING (auth.uid() = follower_id OR auth.uid() = creator_id);

CREATE POLICY "Users can follow creators"
  ON public.stream_followers FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow creators"
  ON public.stream_followers FOR DELETE
  USING (auth.uid() = follower_id);

-- ===========================================
-- RLS POLICIES: STREAM ANALYTICS
-- ===========================================
CREATE POLICY "Stream hosts can view their analytics"
  ON public.stream_analytics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.live_streams 
    WHERE live_streams.id = stream_analytics.stream_id 
    AND live_streams.host_id = auth.uid()
  ));

-- ===========================================
-- ENABLE REALTIME FOR LIVE FEATURES
-- ===========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_streams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stream_gifts;

-- ===========================================
-- FUNCTION: Update stream viewer count
-- ===========================================
CREATE OR REPLACE FUNCTION public.update_stream_viewer_count(p_stream_id UUID, p_count INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.live_streams 
  SET 
    viewer_count = p_count,
    peak_viewers = GREATEST(peak_viewers, p_count),
    updated_at = now()
  WHERE id = p_stream_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- FUNCTION: Process gift and update balances
-- ===========================================
CREATE OR REPLACE FUNCTION public.process_stream_gift(
  p_stream_id UUID,
  p_sender_id UUID,
  p_gift_id UUID,
  p_quantity INTEGER DEFAULT 1,
  p_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_gift_cost INTEGER;
  v_creator_value NUMERIC;
  v_sender_balance INTEGER;
  v_gift_record_id UUID;
  v_host_id UUID;
BEGIN
  -- Get gift cost and creator value
  SELECT coin_cost, creator_value INTO v_gift_cost, v_creator_value
  FROM public.live_gifts WHERE id = p_gift_id AND is_active = true;
  
  IF v_gift_cost IS NULL THEN
    RAISE EXCEPTION 'Gift not found or inactive';
  END IF;
  
  -- Get sender balance
  SELECT balance INTO v_sender_balance
  FROM public.user_coins WHERE user_id = p_sender_id;
  
  IF v_sender_balance IS NULL OR v_sender_balance < (v_gift_cost * p_quantity) THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;
  
  -- Get stream host
  SELECT host_id INTO v_host_id FROM public.live_streams WHERE id = p_stream_id;
  
  -- Deduct coins from sender
  UPDATE public.user_coins 
  SET 
    balance = balance - (v_gift_cost * p_quantity),
    total_spent = total_spent + (v_gift_cost * p_quantity),
    updated_at = now()
  WHERE user_id = p_sender_id;
  
  -- Add gift value to stream total
  UPDATE public.live_streams 
  SET 
    total_gifts_value = total_gifts_value + (v_creator_value * p_quantity),
    updated_at = now()
  WHERE id = p_stream_id;
  
  -- Record the gift
  INSERT INTO public.stream_gifts (stream_id, sender_id, gift_id, quantity, message)
  VALUES (p_stream_id, p_sender_id, p_gift_id, p_quantity, p_message)
  RETURNING id INTO v_gift_record_id;
  
  RETURN v_gift_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;