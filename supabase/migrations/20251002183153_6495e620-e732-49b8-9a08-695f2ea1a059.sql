-- Insert marketplace categories
INSERT INTO public.marketplace_categories (category_name, category_description, icon_name, display_order, is_active)
VALUES 
  ('Hip Hop & Trap', 'Beats, 808s, and trap essentials for urban producers', 'Music', 1, true),
  ('Electronic & EDM', 'Synths, loops, and electronic sounds for dance music', 'Radio', 2, true),
  ('Vocals & Instruments', 'Live recorded instruments and vocal samples', 'Mic', 3, true),
  ('Mixing & Mastering', 'Professional tools and presets for audio engineering', 'Sliders', 4, true),
  ('Sound Effects', 'Cinematic and atmospheric sound design elements', 'Volume2', 5, true);

-- Create demo data using first available user or system user
DO $$
DECLARE
  demo_seller_id uuid;
  hip_hop_cat_id uuid;
  edm_cat_id uuid;
  vocal_cat_id uuid;
  mixing_cat_id uuid;
  sfx_cat_id uuid;
BEGIN
  -- Get first user from profiles or use NULL (will need to be updated later)
  SELECT id INTO demo_seller_id FROM auth.users LIMIT 1;
  
  -- If no users exist, we can't proceed with items that require seller_id
  IF demo_seller_id IS NULL THEN
    RAISE NOTICE 'No users found in database. Please create a user account first to populate marketplace items.';
    RETURN;
  END IF;

  -- Get category IDs
  SELECT id INTO hip_hop_cat_id FROM marketplace_categories WHERE category_name = 'Hip Hop & Trap';
  SELECT id INTO edm_cat_id FROM marketplace_categories WHERE category_name = 'Electronic & EDM';
  SELECT id INTO vocal_cat_id FROM marketplace_categories WHERE category_name = 'Vocals & Instruments';
  SELECT id INTO mixing_cat_id FROM marketplace_categories WHERE category_name = 'Mixing & Mastering';
  SELECT id INTO sfx_cat_id FROM marketplace_categories WHERE category_name = 'Sound Effects';

  -- Insert Sample Packs
  INSERT INTO public.marketplace_items (
    seller_id, category_id, item_name, item_description, item_type,
    price, is_free, thumbnail_url, tags, featured,
    average_rating, total_reviews, download_count, total_sales, is_published
  ) VALUES
  (
    demo_seller_id, hip_hop_cat_id,
    '808 King Bundle',
    'Professional collection of 50+ hard-hitting 808s, kicks, and bass samples. Perfected for trap, hip-hop, and modern urban production. Includes sub-bass shakers, melodic 808s, and punchy kicks.',
    'sample_pack',
    29.99, false,
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    ARRAY['808', 'bass', 'trap', 'hip-hop', 'kicks'],
    true,
    4.8, 127, 2450, 2450, true
  ),
  (
    demo_seller_id, hip_hop_cat_id,
    'Trap Starter Pack',
    'Complete drum collection with 100+ samples including hi-hats, snares, claps, and percussion. Perfect for producers starting with trap production.',
    'sample_pack',
    19.99, false,
    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400',
    ARRAY['trap', 'drums', 'percussion', 'hi-hats'],
    false,
    4.5, 89, 1820, 1820, true
  ),
  (
    demo_seller_id, edm_cat_id,
    'Future Bass Essentials',
    'Modern synth collection featuring lush pads, cutting leads, and signature plucks. 200+ samples crafted for future bass and melodic EDM production.',
    'sample_pack',
    34.99, false,
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
    ARRAY['future-bass', 'edm', 'synths', 'melodic'],
    true,
    4.9, 203, 3890, 3890, true
  ),
  (
    demo_seller_id, edm_cat_id,
    'House Drums Vol. 1',
    'Classic house drum loops and one-shots. Includes vintage 909 and 808 sounds, shuffled grooves, and modern house percussion.',
    'sample_pack',
    24.99, false,
    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400',
    ARRAY['house', 'drums', 'loops', 'techno'],
    false,
    4.6, 156, 2340, 2340, true
  ),
  (
    demo_seller_id, vocal_cat_id,
    'Vocal Chops Collection',
    '200+ professionally processed vocal samples perfect for chopping and pitching. Includes male and female vocals across multiple genres and tempos.',
    'sample_pack',
    39.99, false,
    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400',
    ARRAY['vocals', 'chops', 'processing', 'melodic'],
    true,
    4.7, 178, 3120, 3120, true
  ),
  (
    demo_seller_id, vocal_cat_id,
    'Guitar & Bass Loops',
    'Live recorded guitar and bass loops spanning multiple genres. Includes electric guitar riffs, acoustic strums, and deep bass grooves. Royalty-free.',
    'sample_pack',
    0.00, true,
    'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400',
    ARRAY['guitar', 'bass', 'live', 'free', 'loops'],
    false,
    4.4, 234, 5120, 0, true
  ),
  (
    demo_seller_id, sfx_cat_id,
    'Cinematic Risers Pack',
    'Essential transition effects and risers for cinematic productions. Build tension and energy with professional sound design elements.',
    'sample_pack',
    14.99, false,
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
    ARRAY['cinematic', 'sfx', 'transitions', 'risers'],
    false,
    4.3, 67, 890, 890, true
  ),
  (
    demo_seller_id, sfx_cat_id,
    'Ambient Textures',
    'Atmospheric sound design pack with 100+ evolving textures, drones, and pads. Perfect for film scoring and ambient music production.',
    'sample_pack',
    27.99, false,
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    ARRAY['ambient', 'textures', 'atmosphere', 'cinematic'],
    false,
    4.6, 92, 1560, 1560, true
  ),
  (
    demo_seller_id, hip_hop_cat_id,
    '808 Serum Presets',
    '50 custom Serum presets designed specifically for trap and hip-hop 808s. Includes sub-bass fundamentals, melodic leads, and distorted variations.',
    'preset',
    24.99, false,
    'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400',
    ARRAY['serum', '808', 'presets', 'trap', 'synth'],
    true,
    4.7, 145, 2890, 2890, true
  ),
  (
    demo_seller_id, hip_hop_cat_id,
    'Trap Melody Presets',
    '75 melody presets for Serum and Vital. Bell-like leads, dark pads, and plucky synths. Instantly create chart-ready trap melodies.',
    'preset',
    29.99, false,
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
    ARRAY['trap', 'melody', 'serum', 'vital', 'leads'],
    false,
    4.5, 112, 1980, 1980, true
  ),
  (
    demo_seller_id, edm_cat_id,
    'EDM Lead Pack',
    '100 cutting-edge lead synth presets for Serum. Perfect for progressive house, trance, and big room productions. Includes supersaws and plucks.',
    'preset',
    34.99, false,
    'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400',
    ARRAY['edm', 'leads', 'synths', 'serum', 'progressive'],
    true,
    4.8, 189, 3450, 3450, true
  ),
  (
    demo_seller_id, edm_cat_id,
    'Bass House Sounds',
    'Heavy bass presets for bass house and electro. 60 presets featuring growling basses, wobbles, and aggressive synths. Requires Serum.',
    'preset',
    27.99, false,
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    ARRAY['bass-house', 'bass', 'edm', 'serum', 'wobble'],
    false,
    4.6, 134, 2210, 2210, true
  ),
  (
    demo_seller_id, mixing_cat_id,
    'Vocal Processing Chain',
    'Professional vocal presets for EQ, compression, and effects. Includes chains for rap, singing, and podcasting. Works with most DAWs.',
    'preset',
    19.99, false,
    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400',
    ARRAY['vocals', 'processing', 'mixing', 'eq', 'compression'],
    false,
    4.7, 167, 2670, 2670, true
  ),
  (
    demo_seller_id, mixing_cat_id,
    'Mastering Suite Presets',
    'Complete mastering chain templates for various genres. Includes EQ curves, multiband compression, limiting, and stereo imaging presets.',
    'preset',
    44.99, false,
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
    ARRAY['mastering', 'templates', 'professional', 'mixing'],
    true,
    4.9, 223, 4120, 4120, true
  ),
  (
    demo_seller_id, mixing_cat_id,
    'Free Mixing Starter Pack',
    'Basic mixing presets collection for beginners. Includes essential EQ, compression, and reverb settings. Great starting point for new producers.',
    'preset',
    0.00, true,
    'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400',
    ARRAY['mixing', 'free', 'beginner', 'eq', 'starter'],
    false,
    4.2, 312, 6780, 0, true
  );
  
  RAISE NOTICE 'Successfully inserted % marketplace items using seller ID: %', 15, demo_seller_id;
END $$;