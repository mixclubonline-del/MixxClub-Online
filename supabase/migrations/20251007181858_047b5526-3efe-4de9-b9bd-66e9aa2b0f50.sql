-- Unlock all community milestones and set them to completed
-- This is for design testing purposes

UPDATE public.community_milestones 
SET 
  is_unlocked = true,
  current_value = target_value,
  unlocked_at = NOW(),
  updated_at = NOW()
WHERE is_unlocked = false;

COMMENT ON TABLE public.community_milestones IS 'All milestones unlocked for design testing - 2025-01-07';