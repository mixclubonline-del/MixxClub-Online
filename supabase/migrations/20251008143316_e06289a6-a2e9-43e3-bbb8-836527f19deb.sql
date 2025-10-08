-- ============================================
-- PHASE 1: REMOTE COLLABORATION
-- ============================================

-- Remote collaboration sessions with WebRTC support
CREATE TABLE public.remote_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_name TEXT NOT NULL,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('mixing', 'mastering', 'recording', 'production')),
  is_public BOOLEAN DEFAULT false,
  max_participants INTEGER DEFAULT 8,
  webrtc_room_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_remote_sessions_host ON public.remote_sessions(host_id);
CREATE INDEX idx_remote_sessions_status ON public.remote_sessions(status);
CREATE INDEX idx_remote_sessions_project ON public.remote_sessions(project_id);

-- Participants in remote sessions
CREATE TABLE public.remote_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.remote_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('host', 'co-host', 'participant', 'observer')),
  is_active BOOLEAN DEFAULT true,
  audio_enabled BOOLEAN DEFAULT true,
  video_enabled BOOLEAN DEFAULT false,
  screen_sharing BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  connection_quality TEXT DEFAULT 'good' CHECK (connection_quality IN ('excellent', 'good', 'fair', 'poor')),
  UNIQUE(session_id, user_id)
);

CREATE INDEX idx_remote_participants_session ON public.remote_participants(session_id);
CREATE INDEX idx_remote_participants_user ON public.remote_participants(user_id);

-- Real-time chat for remote sessions
CREATE TABLE public.remote_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.remote_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'audio', 'system')),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_remote_chat_session ON public.remote_chat(session_id, created_at);

-- Enable RLS
ALTER TABLE public.remote_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remote_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.remote_chat ENABLE ROW LEVEL SECURITY;

-- RLS Policies for remote_sessions
CREATE POLICY "Public sessions are viewable by everyone"
  ON public.remote_sessions FOR SELECT
  USING (is_public = true);

CREATE POLICY "Hosts can view their sessions"
  ON public.remote_sessions FOR SELECT
  USING (auth.uid() = host_id);

CREATE POLICY "Participants can view their sessions"
  ON public.remote_sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.remote_participants
    WHERE session_id = remote_sessions.id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create sessions"
  ON public.remote_sessions FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their sessions"
  ON public.remote_sessions FOR UPDATE
  USING (auth.uid() = host_id);

-- RLS Policies for remote_participants
CREATE POLICY "Participants can view session members"
  ON public.remote_participants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.remote_participants rp
    WHERE rp.session_id = remote_participants.session_id
    AND rp.user_id = auth.uid()
  ));

CREATE POLICY "System can manage participants"
  ON public.remote_participants FOR ALL
  USING (true);

-- RLS Policies for remote_chat
CREATE POLICY "Participants can view chat"
  ON public.remote_chat FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.remote_participants
    WHERE session_id = remote_chat.session_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Participants can send messages"
  ON public.remote_chat FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.remote_participants
    WHERE session_id = remote_chat.session_id
    AND user_id = auth.uid()
    AND is_active = true
  ));

-- ============================================
-- PHASE 2: LABEL SERVICES
-- ============================================

-- Label service packages
CREATE TABLE public.label_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_name TEXT NOT NULL,
  package_type TEXT NOT NULL CHECK (package_type IN ('basic', 'professional', 'premium', 'enterprise')),
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  services_included JSONB DEFAULT '[]'::jsonb,
  contract_duration_months INTEGER DEFAULT 12,
  royalty_split NUMERIC(5,2), -- Percentage to label
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_label_packages_type ON public.label_packages(package_type);
CREATE INDEX idx_label_packages_active ON public.label_packages(is_active);

-- Artist label deals
CREATE TABLE public.label_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.label_packages(id),
  deal_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  contract_url TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  start_date DATE NOT NULL,
  end_date DATE,
  total_value NUMERIC(10,2) NOT NULL,
  advance_amount NUMERIC(10,2) DEFAULT 0,
  royalty_percentage NUMERIC(5,2) NOT NULL,
  releases_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_label_deals_artist ON public.label_deals(artist_id);
CREATE INDEX idx_label_deals_status ON public.label_deals(status);

-- Label deal milestones
CREATE TABLE public.label_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.label_deals(id) ON DELETE CASCADE,
  milestone_name TEXT NOT NULL,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('release', 'revenue', 'streaming', 'marketing')),
  target_value NUMERIC(10,2),
  current_value NUMERIC(10,2) DEFAULT 0,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'missed')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_label_milestones_deal ON public.label_milestones(deal_id);
CREATE INDEX idx_label_milestones_status ON public.label_milestones(status);

-- Enable RLS
ALTER TABLE public.label_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.label_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.label_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view active packages"
  ON public.label_packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage packages"
  ON public.label_packages FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Artists can view their deals"
  ON public.label_deals FOR SELECT
  USING (auth.uid() = artist_id);

CREATE POLICY "Artists can create deals"
  ON public.label_deals FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Admins can manage all deals"
  ON public.label_deals FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Artists can view their milestones"
  ON public.label_milestones FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.label_deals
    WHERE id = label_milestones.deal_id
    AND artist_id = auth.uid()
  ));

CREATE POLICY "Admins can manage milestones"
  ON public.label_milestones FOR ALL
  USING (is_admin(auth.uid()));

-- ============================================
-- PHASE 3: MIX BATTLES ARENA
-- ============================================

-- Battle competitions
CREATE TABLE public.mix_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_name TEXT NOT NULL,
  battle_type TEXT NOT NULL CHECK (battle_type IN ('head_to_head', 'tournament', 'weekly_challenge', 'open_entry')),
  genre TEXT,
  difficulty TEXT DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  description TEXT,
  rules JSONB DEFAULT '{}'::jsonb,
  stems_url TEXT,
  reference_mix_url TEXT,
  entry_fee NUMERIC(10,2) DEFAULT 0,
  prize_pool NUMERIC(10,2) DEFAULT 0,
  max_participants INTEGER,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  submission_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  voting_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'open', 'voting', 'completed', 'cancelled')),
  winner_id UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_mix_battles_status ON public.mix_battles(status);
CREATE INDEX idx_mix_battles_dates ON public.mix_battles(start_date, submission_deadline);

-- Battle submissions
CREATE TABLE public.battle_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES public.mix_battles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  description TEXT,
  technical_notes TEXT,
  score NUMERIC(5,2) DEFAULT 0,
  votes_count INTEGER DEFAULT 0,
  rank INTEGER,
  is_disqualified BOOLEAN DEFAULT false,
  disqualification_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(battle_id, user_id)
);

CREATE INDEX idx_battle_submissions_battle ON public.battle_submissions(battle_id);
CREATE INDEX idx_battle_submissions_user ON public.battle_submissions(user_id);
CREATE INDEX idx_battle_submissions_score ON public.battle_submissions(battle_id, score DESC);

-- Battle votes
CREATE TABLE public.battle_submission_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.battle_submissions(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_score INTEGER NOT NULL CHECK (vote_score BETWEEN 1 AND 10),
  categories JSONB DEFAULT '{}'::jsonb, -- {mixing: 8, mastering: 9, creativity: 7}
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(submission_id, voter_id)
);

CREATE INDEX idx_battle_votes_submission ON public.battle_submission_votes(submission_id);
CREATE INDEX idx_battle_votes_voter ON public.battle_submission_votes(voter_id);

-- Enable RLS
ALTER TABLE public.mix_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_submission_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mix_battles
CREATE POLICY "Everyone can view battles"
  ON public.mix_battles FOR SELECT
  USING (status != 'cancelled');

CREATE POLICY "Admins can manage battles"
  ON public.mix_battles FOR ALL
  USING (is_admin(auth.uid()));

-- RLS Policies for battle_submissions
CREATE POLICY "Everyone can view submissions during voting"
  ON public.battle_submissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.mix_battles
    WHERE id = battle_submissions.battle_id
    AND status IN ('voting', 'completed')
  ));

CREATE POLICY "Users can view their own submissions"
  ON public.battle_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit entries"
  ON public.battle_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.mix_battles
    WHERE id = battle_submissions.battle_id
    AND status = 'open'
    AND submission_deadline > now()
  ));

CREATE POLICY "Users can update their submissions before deadline"
  ON public.battle_submissions FOR UPDATE
  USING (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.mix_battles
    WHERE id = battle_submissions.battle_id
    AND status = 'open'
    AND submission_deadline > now()
  ));

-- RLS Policies for battle_submission_votes
CREATE POLICY "Everyone can view votes after voting ends"
  ON public.battle_submission_votes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.battle_submissions bs
    JOIN public.mix_battles mb ON bs.battle_id = mb.id
    WHERE bs.id = battle_submission_votes.submission_id
    AND mb.status = 'completed'
  ));

CREATE POLICY "Users can vote during voting period"
  ON public.battle_submission_votes FOR INSERT
  WITH CHECK (auth.uid() = voter_id AND EXISTS (
    SELECT 1 FROM public.battle_submissions bs
    JOIN public.mix_battles mb ON bs.battle_id = mb.id
    WHERE bs.id = battle_submission_votes.submission_id
    AND mb.status = 'voting'
    AND mb.voting_deadline > now()
    AND bs.user_id != auth.uid() -- Can't vote for yourself
  ));

CREATE POLICY "Users can update their votes during voting period"
  ON public.battle_submission_votes FOR UPDATE
  USING (auth.uid() = voter_id AND EXISTS (
    SELECT 1 FROM public.battle_submissions bs
    JOIN public.mix_battles mb ON bs.battle_id = mb.id
    WHERE bs.id = battle_submission_votes.submission_id
    AND mb.status = 'voting'
    AND mb.voting_deadline > now()
  ));