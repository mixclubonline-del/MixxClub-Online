-- Create curator_profiles table for fans who become curators
CREATE TABLE public.curator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  curator_name text NOT NULL,
  bio text,
  genres text[] DEFAULT '{}',
  avatar_url text,
  cover_url text,
  social_links jsonb DEFAULT '{}',
  total_placements integer DEFAULT 0,
  total_earnings integer DEFAULT 0,
  average_rating numeric DEFAULT 0,
  total_reviews integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  featured_playlist_id uuid REFERENCES public.playlists(id) ON DELETE SET NULL,
  minimum_payment integer DEFAULT 50,
  response_time_hours integer DEFAULT 48,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'suspended')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create curator_premiere_slots table for slot offerings
CREATE TABLE public.curator_premiere_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curator_id uuid REFERENCES public.curator_profiles(id) ON DELETE CASCADE NOT NULL,
  slot_name text NOT NULL,
  description text,
  price_coinz integer NOT NULL,
  slot_type text DEFAULT 'standard' CHECK (slot_type IN ('standard', 'featured', 'exclusive')),
  time_window text,
  max_duration_seconds integer DEFAULT 300,
  available_days text[] DEFAULT '{}',
  max_bookings_per_day integer DEFAULT 3,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create curator_slot_bookings table for booked premiere slots
CREATE TABLE public.curator_slot_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid REFERENCES public.curator_premiere_slots(id) ON DELETE CASCADE NOT NULL,
  curator_id uuid REFERENCES public.curator_profiles(id) NOT NULL,
  artist_id uuid REFERENCES public.profiles(id) NOT NULL,
  track_id uuid,
  track_title text NOT NULL,
  track_url text,
  premiere_date date NOT NULL,
  payment_amount integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'refunded')),
  artist_notes text,
  curator_notes text,
  escrow_transaction_id uuid,
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  completed_at timestamptz
);

-- Enable RLS on all tables
ALTER TABLE public.curator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curator_premiere_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curator_slot_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for curator_profiles
CREATE POLICY "Anyone can view active curator profiles"
  ON public.curator_profiles FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can create their own curator profile"
  ON public.curator_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own curator profile"
  ON public.curator_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for curator_premiere_slots
CREATE POLICY "Anyone can view active slots"
  ON public.curator_premiere_slots FOR SELECT
  USING (is_active = true);

CREATE POLICY "Curators can manage their own slots"
  ON public.curator_premiere_slots FOR ALL
  USING (curator_id IN (SELECT id FROM public.curator_profiles WHERE user_id = auth.uid()));

-- RLS Policies for curator_slot_bookings
CREATE POLICY "Artists can view their own bookings"
  ON public.curator_slot_bookings FOR SELECT
  USING (artist_id = auth.uid());

CREATE POLICY "Curators can view bookings for their slots"
  ON public.curator_slot_bookings FOR SELECT
  USING (curator_id IN (SELECT id FROM public.curator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Artists can create bookings"
  ON public.curator_slot_bookings FOR INSERT
  WITH CHECK (artist_id = auth.uid());

CREATE POLICY "Curators can update booking status"
  ON public.curator_slot_bookings FOR UPDATE
  USING (curator_id IN (SELECT id FROM public.curator_profiles WHERE user_id = auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_curator_profiles_user ON public.curator_profiles(user_id);
CREATE INDEX idx_curator_profiles_status ON public.curator_profiles(status) WHERE status = 'active';
CREATE INDEX idx_curator_slots_curator ON public.curator_premiere_slots(curator_id);
CREATE INDEX idx_curator_slots_active ON public.curator_premiere_slots(is_active) WHERE is_active = true;
CREATE INDEX idx_curator_bookings_artist ON public.curator_slot_bookings(artist_id);
CREATE INDEX idx_curator_bookings_curator ON public.curator_slot_bookings(curator_id);
CREATE INDEX idx_curator_bookings_status ON public.curator_slot_bookings(status);

-- Create trigger for updated_at on curator_profiles
CREATE TRIGGER update_curator_profiles_updated_at
  BEFORE UPDATE ON public.curator_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();