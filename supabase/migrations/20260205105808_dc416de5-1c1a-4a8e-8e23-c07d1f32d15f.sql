-- Add custom license terms storage
ALTER TABLE public.producer_beats
ADD COLUMN IF NOT EXISTS custom_license_terms jsonb DEFAULT NULL;

-- Add index for marketplace text searches
CREATE INDEX IF NOT EXISTS idx_producer_beats_search 
ON public.producer_beats USING gin(to_tsvector('english', title || ' ' || coalesce(description, '')));

-- Add composite index for filtering published beats
CREATE INDEX IF NOT EXISTS idx_producer_beats_marketplace
ON public.producer_beats (status, genre, price_cents)
WHERE status = 'published';

-- Add index for producer catalog queries
CREATE INDEX IF NOT EXISTS idx_producer_beats_producer
ON public.producer_beats (producer_id, status, created_at DESC);