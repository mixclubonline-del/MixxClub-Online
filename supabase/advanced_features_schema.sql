
-- Add advanced columns to prime_content_queue
alter table public.prime_content_queue 
add column if not exists priority text default 'normal', -- 'normal', 'high'
add column if not exists audience_segment text default 'general', -- 'general', 'artists', 'engineers', 'labels'
add column if not exists caption_variants jsonb default '[]'; -- Array of variant objects

-- Add index for priority to speed up fetching urgent items
create index if not exists idx_prime_content_queue_priority on public.prime_content_queue(priority);
