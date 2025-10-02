-- Tier 1: Mix Battles Arena & Studio Partnership Beta
-- Create battle tournaments table
CREATE TABLE public.battle_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_name TEXT NOT NULL,
  tournament_type TEXT NOT NULL DEFAULT 'bracket', -- bracket, round_robin, elimination
  status TEXT NOT NULL DEFAULT 'upcoming', -- upcoming, active, completed, cancelled
  entry_fee NUMERIC DEFAULT 0,
  prize_pool NUMERIC DEFAULT 0,
  max_participants INTEGER DEFAULT 16,
  current_participants INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  rules JSONB DEFAULT '{}',
  bracket_data JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tournament participants table
CREATE TABLE public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.battle_tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  engineer_id UUID REFERENCES auth.users(id),
  entry_status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, eliminated, withdrawn
  seed_number INTEGER,
  current_round INTEGER DEFAULT 1,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  total_score NUMERIC DEFAULT 0,
  submission_file_id UUID REFERENCES public.audio_files(id),
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Create AI match analysis table for musical DNA
CREATE TABLE public.ai_match_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_file_id UUID REFERENCES public.audio_files(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  analysis_type TEXT NOT NULL DEFAULT 'musical_dna', -- musical_dna, compatibility, skill_assessment
  key_signature TEXT,
  tempo_bpm INTEGER,
  detected_genre TEXT,
  mood_score JSONB DEFAULT '{}', -- {energy: 0.8, valence: 0.6, danceability: 0.7}
  complexity_score NUMERIC DEFAULT 0, -- 0-100
  technical_quality NUMERIC DEFAULT 0, -- 0-100
  vocal_presence NUMERIC DEFAULT 0, -- 0-1
  instrumentation JSONB DEFAULT '[]', -- [drums, bass, guitar, etc]
  mixing_quality JSONB DEFAULT '{}',
  full_analysis JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create studio partnerships table
CREATE TABLE public.studio_partnerships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_name TEXT NOT NULL,
  studio_type TEXT NOT NULL DEFAULT 'recording', -- recording, mixing, mastering, multi
  location_city TEXT NOT NULL,
  location_state TEXT,
  location_country TEXT NOT NULL,
  address TEXT,
  coordinates JSONB, -- {lat: 0, lng: 0}
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  equipment_list JSONB DEFAULT '[]',
  room_types JSONB DEFAULT '[]', -- [control_room, live_room, iso_booth]
  hourly_rate NUMERIC,
  day_rate NUMERIC,
  amenities JSONB DEFAULT '[]',
  photos JSONB DEFAULT '[]',
  availability_calendar JSONB DEFAULT '{}',
  partner_since TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  revenue_share_percentage NUMERIC DEFAULT 15.00,
  total_bookings INTEGER DEFAULT 0,
  rating_average NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create hybrid bookings table
CREATE TABLE public.hybrid_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID REFERENCES public.studio_partnerships(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  engineer_id UUID REFERENCES auth.users(id),
  booking_type TEXT NOT NULL DEFAULT 'hybrid', -- in_person, remote, hybrid
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_hours NUMERIC NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  total_cost NUMERIC NOT NULL,
  studio_payment NUMERIC,
  engineer_payment NUMERIC,
  special_requests TEXT,
  equipment_needed JSONB DEFAULT '[]',
  attendees JSONB DEFAULT '[]',
  session_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create engineer skill assessments table
CREATE TABLE public.engineer_skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id UUID REFERENCES auth.users(id) NOT NULL,
  assessment_type TEXT NOT NULL, -- mixing, mastering, production, sound_design
  skill_level TEXT NOT NULL DEFAULT 'intermediate', -- beginner, intermediate, advanced, expert
  genre_specialties JSONB DEFAULT '[]',
  technical_scores JSONB DEFAULT '{}', -- {eq: 85, compression: 90, reverb: 88}
  portfolio_analysis JSONB DEFAULT '{}',
  match_compatibility_score NUMERIC DEFAULT 0, -- 0-100
  verified_by_ai BOOLEAN DEFAULT false,
  last_assessed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(engineer_id, assessment_type)
);

-- Enable RLS
ALTER TABLE public.battle_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_match_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hybrid_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineer_skill_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for battle_tournaments
CREATE POLICY "Everyone can view active tournaments"
  ON public.battle_tournaments FOR SELECT
  USING (status IN ('upcoming', 'active', 'completed'));

CREATE POLICY "Admins can manage tournaments"
  ON public.battle_tournaments FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for tournament_participants
CREATE POLICY "Users can view tournament participants"
  ON public.tournament_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join tournaments"
  ON public.tournament_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
  ON public.tournament_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_match_analysis
CREATE POLICY "Users can view their own analysis"
  ON public.ai_match_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert analysis"
  ON public.ai_match_analysis FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Engineers can view analysis for their projects"
  ON public.ai_match_analysis FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN audio_files af ON af.project_id = p.id
      WHERE af.id = ai_match_analysis.audio_file_id
      AND p.engineer_id = auth.uid()
    )
  );

-- RLS Policies for studio_partnerships
CREATE POLICY "Everyone can view active studios"
  ON public.studio_partnerships FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage studio partnerships"
  ON public.studio_partnerships FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for hybrid_bookings
CREATE POLICY "Users can view their own bookings"
  ON public.hybrid_bookings FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = engineer_id);

CREATE POLICY "Users can create bookings"
  ON public.hybrid_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON public.hybrid_bookings FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = engineer_id);

-- RLS Policies for engineer_skill_assessments
CREATE POLICY "Engineers can view their own assessments"
  ON public.engineer_skill_assessments FOR SELECT
  USING (auth.uid() = engineer_id);

CREATE POLICY "Everyone can view verified assessments"
  ON public.engineer_skill_assessments FOR SELECT
  USING (verified_by_ai = true);

CREATE POLICY "System can manage assessments"
  ON public.engineer_skill_assessments FOR ALL
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_battle_tournaments_status ON public.battle_tournaments(status);
CREATE INDEX idx_battle_tournaments_start_date ON public.battle_tournaments(start_date);
CREATE INDEX idx_tournament_participants_tournament ON public.tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_user ON public.tournament_participants(user_id);
CREATE INDEX idx_ai_match_analysis_audio_file ON public.ai_match_analysis(audio_file_id);
CREATE INDEX idx_ai_match_analysis_user ON public.ai_match_analysis(user_id);
CREATE INDEX idx_studio_partnerships_location ON public.studio_partnerships(location_city, location_country);
CREATE INDEX idx_studio_partnerships_active ON public.studio_partnerships(is_active);
CREATE INDEX idx_hybrid_bookings_studio ON public.hybrid_bookings(studio_id);
CREATE INDEX idx_hybrid_bookings_user ON public.hybrid_bookings(user_id);
CREATE INDEX idx_hybrid_bookings_session_date ON public.hybrid_bookings(session_date);
CREATE INDEX idx_engineer_skill_assessments_engineer ON public.engineer_skill_assessments(engineer_id);

-- Create trigger for updated_at
CREATE TRIGGER update_battle_tournaments_updated_at
  BEFORE UPDATE ON public.battle_tournaments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_match_analysis_updated_at
  BEFORE UPDATE ON public.ai_match_analysis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_studio_partnerships_updated_at
  BEFORE UPDATE ON public.studio_partnerships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hybrid_bookings_updated_at
  BEFORE UPDATE ON public.hybrid_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_engineer_skill_assessments_updated_at
  BEFORE UPDATE ON public.engineer_skill_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert Tier 1 community milestone
INSERT INTO public.community_milestones (
  feature_key,
  milestone_name,
  milestone_description,
  milestone_type,
  target_value,
  current_value,
  display_order,
  icon_name,
  reward_description
) VALUES (
  'TIER_1_BATTLES_STUDIOS',
  'Tier 1: Mix Battles Arena',
  'Unlock competitive mixing tournaments and studio partnerships',
  'user_count',
  100,
  0,
  1,
  'trophy',
  'Advanced AI Matching Engine, Battle Tournaments, Studio Partnership Directory'
);

-- Insert sample studio partnerships (5 partners for beta)
INSERT INTO public.studio_partnerships (studio_name, studio_type, location_city, location_state, location_country, equipment_list, hourly_rate, day_rate, is_active) VALUES
('Sound Haven Studios', 'multi', 'Los Angeles', 'CA', 'USA', '["SSL 9000K Console", "Neve 1073 Preamps", "Pro Tools HDX", "Neumann U87", "ATC Monitors"]'::jsonb, 150.00, 1200.00, true),
('Urban Beat Factory', 'recording', 'Atlanta', 'GA', 'USA', '["API 2500 Console", "Universal Audio Apollo", "Antelope Audio Interfaces", "Vintage Mics Collection"]'::jsonb, 125.00, 1000.00, true),
('Mastering Lab NYC', 'mastering', 'New York', 'NY', 'USA', '["Manley Massive Passive", "Dangerous Music Master", "Weiss Engineering DS1-MK3", "Prism Sound ADA-8XR"]'::jsonb, 200.00, 1500.00, true),
('Coast Creative', 'mixing', 'Miami', 'FL', 'USA', '["Avid S6 Console", "Focal Twin6 Be", "UAD Satellite", "Avalon VT-737sp"]'::jsonb, 100.00, 800.00, true),
('Digital Dreams Studio', 'multi', 'Nashville', 'TN', 'USA', '["Pro Tools HDX3", "Adam A77X", "Tube-Tech Collection", "AKG C12 VR"]'::jsonb, 135.00, 1100.00, true);