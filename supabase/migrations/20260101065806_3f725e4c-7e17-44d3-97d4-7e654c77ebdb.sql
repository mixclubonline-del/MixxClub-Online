-- Create user_matches table for persistent match storage
CREATE TABLE public.user_matches (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    matched_user_id UUID NOT NULL,
    match_score NUMERIC NOT NULL DEFAULT 0,
    match_reason TEXT,
    ai_explanation TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    viewed_at TIMESTAMP WITH TIME ZONE,
    contacted_at TIMESTAMP WITH TIME ZONE,
    saved BOOLEAN DEFAULT false,
    match_criteria JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT unique_match UNIQUE(user_id, matched_user_id)
);

-- Create activity_feed table for real-time activity tracking
CREATE TABLE public.activity_feed (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    activity_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_streaks table for engagement tracking
CREATE TABLE public.user_streaks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    streak_type TEXT NOT NULL DEFAULT 'daily',
    current_count INTEGER DEFAULT 0,
    longest_count INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trending_score to engineer_profiles
ALTER TABLE public.engineer_profiles 
ADD COLUMN IF NOT EXISTS trending_score NUMERIC DEFAULT 0;

-- Add genre_specialties JSONB to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS genre_specialties JSONB DEFAULT '[]'::jsonb;

-- Enable RLS on new tables
ALTER TABLE public.user_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_matches
CREATE POLICY "Users can view their own matches" 
ON public.user_matches 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own matches" 
ON public.user_matches 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches" 
ON public.user_matches 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own matches" 
ON public.user_matches 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for activity_feed
CREATE POLICY "Everyone can view public activity" 
ON public.activity_feed 
FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create activity" 
ON public.activity_feed 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for user_streaks
CREATE POLICY "Users can manage their streaks" 
ON public.user_streaks 
FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_matches_user_id ON public.user_matches(user_id);
CREATE INDEX idx_user_matches_matched_user_id ON public.user_matches(matched_user_id);
CREATE INDEX idx_user_matches_status ON public.user_matches(status);
CREATE INDEX idx_activity_feed_user_id ON public.activity_feed(user_id);
CREATE INDEX idx_activity_feed_created_at ON public.activity_feed(created_at DESC);
CREATE INDEX idx_activity_feed_public ON public.activity_feed(is_public) WHERE is_public = true;
CREATE INDEX idx_user_streaks_user_id ON public.user_streaks(user_id);

-- Enable realtime for activity feed
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_feed;