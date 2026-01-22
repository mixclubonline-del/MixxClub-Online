-- Create artist_day1s table for tracking Day 1 supporter status
CREATE TABLE public.artist_day1s (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  followed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  artist_follower_count_at_follow INTEGER NOT NULL DEFAULT 0,
  puttin_in_at_time INTEGER NOT NULL DEFAULT 0,
  recognition_tier TEXT NOT NULL DEFAULT 'supporter',
  artist_milestone_1k BOOLEAN NOT NULL DEFAULT false,
  artist_milestone_10k BOOLEAN NOT NULL DEFAULT false,
  artist_milestone_verified BOOLEAN NOT NULL DEFAULT false,
  coinz_awarded_1k BOOLEAN NOT NULL DEFAULT false,
  coinz_awarded_10k BOOLEAN NOT NULL DEFAULT false,
  coinz_awarded_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(fan_id, artist_id)
);

-- Add comments for clarity
COMMENT ON TABLE public.artist_day1s IS 'Tracks Day 1 supporter status for fans who follow artists early';
COMMENT ON COLUMN public.artist_day1s.recognition_tier IS 'before_day1 (<10 followers), day1 (<100), early_supporter (<1000), supporter (1000+)';

-- Enable RLS
ALTER TABLE public.artist_day1s ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view all Day 1 records"
  ON public.artist_day1s FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own Day 1 records"
  ON public.artist_day1s FOR INSERT
  WITH CHECK (auth.uid() = fan_id);

CREATE POLICY "Users can update their own Day 1 records"
  ON public.artist_day1s FOR UPDATE
  USING (auth.uid() = fan_id);

-- Index for fast lookups
CREATE INDEX idx_artist_day1s_fan_id ON public.artist_day1s(fan_id);
CREATE INDEX idx_artist_day1s_artist_id ON public.artist_day1s(artist_id);
CREATE INDEX idx_artist_day1s_recognition_tier ON public.artist_day1s(recognition_tier);

-- Function to calculate recognition tier based on follower count
CREATE OR REPLACE FUNCTION public.calculate_recognition_tier(follower_count INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF follower_count < 10 THEN
    RETURN 'before_day1';
  ELSIF follower_count < 100 THEN
    RETURN 'day1';
  ELSIF follower_count < 1000 THEN
    RETURN 'early_supporter';
  ELSE
    RETURN 'supporter';
  END IF;
END;
$$;

-- Function to create Day 1 record when user follows an artist
CREATE OR REPLACE FUNCTION public.create_day1_record()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_artist_follower_count INTEGER;
  v_recognition_tier TEXT;
BEGIN
  -- Get the artist's current follower count (before this follow is counted)
  SELECT COALESCE(follower_count, 0) INTO v_artist_follower_count
  FROM public.profiles
  WHERE id = NEW.following_id;
  
  -- Calculate recognition tier
  v_recognition_tier := calculate_recognition_tier(v_artist_follower_count);
  
  -- Insert Day 1 record
  INSERT INTO public.artist_day1s (
    fan_id,
    artist_id,
    artist_follower_count_at_follow,
    recognition_tier
  ) VALUES (
    NEW.follower_id,
    NEW.following_id,
    v_artist_follower_count,
    v_recognition_tier
  )
  ON CONFLICT (fan_id, artist_id) DO NOTHING;
  
  -- Award XP for Day 1 status (before_day1 or day1)
  IF v_recognition_tier IN ('before_day1', 'day1') THEN
    PERFORM award_points(NEW.follower_id, 25, 'day1_follow', 'Became a Day 1 supporter');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to create Day 1 record on follow
CREATE TRIGGER on_follow_create_day1
  AFTER INSERT ON public.user_follows
  FOR EACH ROW
  EXECUTE FUNCTION public.create_day1_record();

-- Function to check artist milestones and reward Day 1s
CREATE OR REPLACE FUNCTION public.check_artist_milestones()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_day1_record RECORD;
BEGIN
  -- Check if artist hit 1K milestone
  IF NEW.follower_count >= 1000 AND (OLD.follower_count IS NULL OR OLD.follower_count < 1000) THEN
    FOR v_day1_record IN 
      SELECT * FROM public.artist_day1s 
      WHERE artist_id = NEW.id 
        AND NOT artist_milestone_1k
        AND recognition_tier IN ('before_day1', 'day1', 'early_supporter')
    LOOP
      -- Update milestone flag
      UPDATE public.artist_day1s 
      SET artist_milestone_1k = true, updated_at = now()
      WHERE id = v_day1_record.id;
      
      -- Create notification
      INSERT INTO public.notifications (user_id, type, title, message, metadata)
      VALUES (
        v_day1_record.fan_id,
        'milestone',
        'Your Day 1 artist hit 1K! 🎉',
        'You were follower #' || (v_day1_record.artist_follower_count_at_follow + 1) || '. They just hit 1,000 followers!',
        jsonb_build_object('artist_id', NEW.id, 'milestone', '1k', 'follower_rank', v_day1_record.artist_follower_count_at_follow + 1)
      );
    END LOOP;
  END IF;
  
  -- Check if artist hit 10K milestone
  IF NEW.follower_count >= 10000 AND (OLD.follower_count IS NULL OR OLD.follower_count < 10000) THEN
    FOR v_day1_record IN 
      SELECT * FROM public.artist_day1s 
      WHERE artist_id = NEW.id 
        AND NOT artist_milestone_10k
        AND recognition_tier IN ('before_day1', 'day1', 'early_supporter')
    LOOP
      UPDATE public.artist_day1s 
      SET artist_milestone_10k = true, updated_at = now()
      WHERE id = v_day1_record.id;
      
      INSERT INTO public.notifications (user_id, type, title, message, metadata)
      VALUES (
        v_day1_record.fan_id,
        'milestone',
        'Your Day 1 artist hit 10K! 🚀',
        'You were follower #' || (v_day1_record.artist_follower_count_at_follow + 1) || '. They just hit 10,000 followers!',
        jsonb_build_object('artist_id', NEW.id, 'milestone', '10k', 'follower_rank', v_day1_record.artist_follower_count_at_follow + 1)
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to check milestones on profile update
CREATE TRIGGER on_profile_update_check_milestones
  AFTER UPDATE OF follower_count ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_artist_milestones();