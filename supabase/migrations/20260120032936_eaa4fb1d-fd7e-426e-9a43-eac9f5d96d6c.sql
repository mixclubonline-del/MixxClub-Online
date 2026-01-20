-- Fix increment_course_enrollments function parameter name
DROP FUNCTION IF EXISTS increment_course_enrollments(UUID);
CREATE OR REPLACE FUNCTION increment_course_enrollments(p_course_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE courses 
  SET total_enrollments = COALESCE(total_enrollments, 0) + 1
  WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert demo courses with valid UUIDs
INSERT INTO courses (
  id, title, description, category, difficulty_level, tier, 
  price, currency, duration_hours, thumbnail_url, is_published,
  tags, requirements, outcomes, total_enrollments, average_rating
) VALUES 
-- Free Course
('11111111-aaaa-4aaa-aaaa-111111111111',
 'Beat Making Fundamentals',
 'Master the core concepts of hip-hop beat production from scratch. Perfect for beginners looking to start their production journey.',
 'production', 'beginner', 'free', 0, 'USD', 4,
 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
 true,
 ARRAY['beats', 'beginner', 'fundamentals', 'hip-hop'],
 ARRAY['No prior experience needed', 'Computer with any DAW software', 'Headphones or monitors'],
 ARRAY['Create your first complete beat', 'Understand drum patterns and rhythm', 'Learn sample selection and arrangement basics'],
 156, 4.7
),
-- Pro Courses
('22222222-bbbb-4bbb-bbbb-222222222222',
 'Hip-Hop Mixing Masterclass',
 'Learn the professional mixing techniques used in chart-topping hip-hop tracks. From vocals to 808s, master every element.',
 'mixing', 'intermediate', 'pro', 49, 'USD', 8,
 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800',
 true,
 ARRAY['mixing', 'hip-hop', 'professional', 'vocals'],
 ARRAY['Basic DAW knowledge', 'Understanding of EQ and compression', 'Reference tracks for comparison'],
 ARRAY['Mix vocals to industry standard', 'Master 808 and bass processing', 'Create punch, clarity and space in your mixes'],
 89, 4.9
),
('33333333-cccc-4ccc-cccc-333333333333',
 'Advanced Vocal Production',
 'Take your vocal production to the next level with advanced techniques for recording, editing, and processing vocals.',
 'vocals', 'advanced', 'pro', 79, 'USD', 6,
 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800',
 true,
 ARRAY['vocals', 'recording', 'advanced', 'production'],
 ARRAY['Intermediate mixing skills', 'Quality microphone and interface', 'Experience with vocal recording'],
 ARRAY['Record studio-quality vocals anywhere', 'Master vocal tuning and timing', 'Create professional vocal chains'],
 67, 4.8
),
('44444444-dddd-4ddd-dddd-444444444444',
 'Trap Production Blueprint',
 'The complete guide to producing hard-hitting trap beats. From hi-hats to 808 slides, learn every technique.',
 'production', 'intermediate', 'pro', 99, 'USD', 10,
 'https://images.unsplash.com/photo-1571974599782-87624638275e?w=800',
 true,
 ARRAY['trap', 'production', '808s', 'hi-hats'],
 ARRAY['Basic beat making knowledge', 'DAW with VST support', 'MIDI controller recommended'],
 ARRAY['Create authentic trap drums', 'Design punchy 808 patterns', 'Master hi-hat rolls and variations'],
 124, 4.6
),
-- Studio Courses
('55555555-eeee-4eee-eeee-555555555555',
 'Studio Business Mastery',
 'Learn how to build a profitable audio engineering business. From pricing to client management, everything you need to succeed.',
 'business', 'intermediate', 'studio', 199, 'USD', 15,
 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
 true,
 ARRAY['business', 'studio', 'marketing', 'entrepreneurship'],
 ARRAY['Active audio engineering practice', 'Basic business understanding', 'Portfolio of work'],
 ARRAY['Set profitable pricing structures', 'Build and manage client relationships', 'Create sustainable income streams'],
 43, 4.9
),
('66666666-ffff-4fff-ffff-666666666666',
 'Complete Engineer Certification',
 'The ultimate audio engineering certification program. Comprehensive training covering mixing, mastering, and professional practices.',
 'certification', 'advanced', 'studio', 499, 'USD', 40,
 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
 true,
 ARRAY['certification', 'professional', 'mixing', 'mastering'],
 ARRAY['2+ years mixing experience', 'Professional monitoring setup', 'Commitment to complete all modules'],
 ARRAY['Earn MixClub Engineer Certification', 'Master advanced mixing and mastering', 'Join the certified engineer network'],
 28, 5.0
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  tier = EXCLUDED.tier,
  price = EXCLUDED.price,
  is_published = EXCLUDED.is_published;

-- Insert lessons for Beat Making Fundamentals (free course)
INSERT INTO lessons (id, course_id, title, description, video_url, duration_minutes, order_index, is_free_preview)
VALUES
('a1111111-aaaa-4aaa-aaaa-a11111111111', '11111111-aaaa-4aaa-aaaa-111111111111', 'Welcome to Beat Making', 'Course overview and what you will learn on your journey to becoming a producer.', 'https://youtube.com/embed/dQw4w9WgXcQ', 8, 0, true),
('a2222222-aaaa-4aaa-aaaa-a22222222222', '11111111-aaaa-4aaa-aaaa-111111111111', 'Setting Up Your DAW', 'Configure your workspace for optimal beat production workflow.', 'https://youtube.com/embed/dQw4w9WgXcQ', 15, 1, true),
('a3333333-aaaa-4aaa-aaaa-a33333333333', '11111111-aaaa-4aaa-aaaa-111111111111', 'Understanding Drum Patterns', 'The backbone of hip-hop beats - learn rhythm and groove.', 'https://youtube.com/embed/dQw4w9WgXcQ', 22, 2, false),
('a4444444-aaaa-4aaa-aaaa-a44444444444', '11111111-aaaa-4aaa-aaaa-111111111111', 'Choosing the Right Samples', 'Sample selection that makes your beats stand out.', 'https://youtube.com/embed/dQw4w9WgXcQ', 18, 3, false),
('a5555555-aaaa-4aaa-aaaa-a55555555555', '11111111-aaaa-4aaa-aaaa-111111111111', 'Basic Arrangement', 'Structure your beats for maximum impact.', 'https://youtube.com/embed/dQw4w9WgXcQ', 25, 4, false),
('a6666666-aaaa-4aaa-aaaa-a66666666666', '11111111-aaaa-4aaa-aaaa-111111111111', 'Adding Melody', 'Create memorable melodic elements.', 'https://youtube.com/embed/dQw4w9WgXcQ', 20, 5, false),
('a7777777-aaaa-4aaa-aaaa-a77777777777', '11111111-aaaa-4aaa-aaaa-111111111111', 'Mixing Basics', 'Essential mixing techniques for beginners.', 'https://youtube.com/embed/dQw4w9WgXcQ', 28, 6, false),
('a8888888-aaaa-4aaa-aaaa-a88888888888', '11111111-aaaa-4aaa-aaaa-111111111111', 'Exporting Your Beat', 'Final steps to share your creation with the world.', 'https://youtube.com/embed/dQw4w9WgXcQ', 12, 7, false)
ON CONFLICT (id) DO NOTHING;

-- Insert lessons for Hip-Hop Mixing Masterclass (pro course)
INSERT INTO lessons (id, course_id, title, description, video_url, duration_minutes, order_index, is_free_preview)
VALUES
('b1111111-bbbb-4bbb-bbbb-b11111111111', '22222222-bbbb-4bbb-bbbb-222222222222', 'Course Introduction', 'What you will learn and how to get the most from this course.', 'https://youtube.com/embed/dQw4w9WgXcQ', 10, 0, true),
('b2222222-bbbb-4bbb-bbbb-b22222222222', '22222222-bbbb-4bbb-bbbb-222222222222', 'Session Setup', 'Organizing your session for an efficient mixing workflow.', 'https://youtube.com/embed/dQw4w9WgXcQ', 18, 1, true),
('b3333333-bbbb-4bbb-bbbb-b33333333333', '22222222-bbbb-4bbb-bbbb-222222222222', 'Gain Staging Fundamentals', 'The foundation of a great mix starts with proper levels.', 'https://youtube.com/embed/dQw4w9WgXcQ', 25, 2, false),
('b4444444-bbbb-4bbb-bbbb-b44444444444', '22222222-bbbb-4bbb-bbbb-222222222222', 'EQ for Hip-Hop', 'Carving space and adding character with EQ.', 'https://youtube.com/embed/dQw4w9WgXcQ', 35, 3, false),
('b5555555-bbbb-4bbb-bbbb-b55555555555', '22222222-bbbb-4bbb-bbbb-222222222222', 'Compression Techniques', 'Control dynamics while maintaining energy.', 'https://youtube.com/embed/dQw4w9WgXcQ', 40, 4, false),
('b6666666-bbbb-4bbb-bbbb-b66666666666', '22222222-bbbb-4bbb-bbbb-222222222222', 'Vocal Processing Chain', 'Build the perfect vocal chain from scratch.', 'https://youtube.com/embed/dQw4w9WgXcQ', 45, 5, false),
('b7777777-bbbb-4bbb-bbbb-b77777777777', '22222222-bbbb-4bbb-bbbb-222222222222', '808 and Bass Treatment', 'Get your low end hitting hard and clean.', 'https://youtube.com/embed/dQw4w9WgXcQ', 38, 6, false),
('b8888888-bbbb-4bbb-bbbb-b88888888888', '22222222-bbbb-4bbb-bbbb-222222222222', 'Spatial Effects', 'Reverb, delay, and creating depth.', 'https://youtube.com/embed/dQw4w9WgXcQ', 32, 7, false),
('b9999999-bbbb-4bbb-bbbb-b99999999999', '22222222-bbbb-4bbb-bbbb-222222222222', 'Bus Processing', 'Glue your mix together with bus processing.', 'https://youtube.com/embed/dQw4w9WgXcQ', 28, 8, false),
('ba111111-bbbb-4bbb-bbbb-ba1111111111', '22222222-bbbb-4bbb-bbbb-222222222222', 'Automation Mastery', 'Bring your mix to life with movement.', 'https://youtube.com/embed/dQw4w9WgXcQ', 30, 9, false),
('bb222222-bbbb-4bbb-bbbb-bb2222222222', '22222222-bbbb-4bbb-bbbb-222222222222', 'Reference Mixing', 'Use reference tracks to level up your mixes.', 'https://youtube.com/embed/dQw4w9WgXcQ', 22, 10, false),
('bc333333-bbbb-4bbb-bbbb-bc3333333333', '22222222-bbbb-4bbb-bbbb-222222222222', 'Final Export & Delivery', 'Prepare your mix for mastering and release.', 'https://youtube.com/embed/dQw4w9WgXcQ', 15, 11, false)
ON CONFLICT (id) DO NOTHING;

-- Insert lessons for Advanced Vocal Production
INSERT INTO lessons (id, course_id, title, description, video_url, duration_minutes, order_index, is_free_preview)
VALUES
('c1111111-cccc-4ccc-cccc-c11111111111', '33333333-cccc-4ccc-cccc-333333333333', 'Advanced Vocal Overview', 'What makes vocals sound professional.', 'https://youtube.com/embed/dQw4w9WgXcQ', 12, 0, true),
('c2222222-cccc-4ccc-cccc-c22222222222', '33333333-cccc-4ccc-cccc-333333333333', 'Room Treatment & Setup', 'Create a vocal recording space anywhere.', 'https://youtube.com/embed/dQw4w9WgXcQ', 20, 1, true),
('c3333333-cccc-4ccc-cccc-c33333333333', '33333333-cccc-4ccc-cccc-333333333333', 'Microphone Selection', 'Choosing the right mic for every voice.', 'https://youtube.com/embed/dQw4w9WgXcQ', 25, 2, false),
('c4444444-cccc-4ccc-cccc-c44444444444', '33333333-cccc-4ccc-cccc-333333333333', 'Recording Techniques', 'Capture the best vocal performance.', 'https://youtube.com/embed/dQw4w9WgXcQ', 35, 3, false),
('c5555555-cccc-4ccc-cccc-c55555555555', '33333333-cccc-4ccc-cccc-333333333333', 'Comping & Editing', 'Build the perfect vocal take.', 'https://youtube.com/embed/dQw4w9WgXcQ', 30, 4, false),
('c6666666-cccc-4ccc-cccc-c66666666666', '33333333-cccc-4ccc-cccc-333333333333', 'Pitch Correction Mastery', 'Natural-sounding tuning techniques.', 'https://youtube.com/embed/dQw4w9WgXcQ', 40, 5, false),
('c7777777-cccc-4ccc-cccc-c77777777777', '33333333-cccc-4ccc-cccc-333333333333', 'Timing & Groove', 'Align vocals to the beat.', 'https://youtube.com/embed/dQw4w9WgXcQ', 28, 6, false),
('c8888888-cccc-4ccc-cccc-c88888888888', '33333333-cccc-4ccc-cccc-333333333333', 'Creative Vocal Effects', 'Harmonizers, vocoders, and more.', 'https://youtube.com/embed/dQw4w9WgXcQ', 35, 7, false),
('c9999999-cccc-4ccc-cccc-c99999999999', '33333333-cccc-4ccc-cccc-333333333333', 'Doubles & Layers', 'Create thickness and width.', 'https://youtube.com/embed/dQw4w9WgXcQ', 25, 8, false),
('ca111111-cccc-4ccc-cccc-ca1111111111', '33333333-cccc-4ccc-cccc-333333333333', 'Final Vocal Polish', 'The finishing touches.', 'https://youtube.com/embed/dQw4w9WgXcQ', 20, 9, false)
ON CONFLICT (id) DO NOTHING;

-- Insert lessons for Trap Production Blueprint
INSERT INTO lessons (id, course_id, title, description, video_url, duration_minutes, order_index, is_free_preview)
VALUES
('d1111111-dddd-4ddd-dddd-d11111111111', '44444444-dddd-4ddd-dddd-444444444444', 'Trap Production Intro', 'Understanding the trap sound.', 'https://youtube.com/embed/dQw4w9WgXcQ', 10, 0, true),
('d2222222-dddd-4ddd-dddd-d22222222222', '44444444-dddd-4ddd-dddd-444444444444', 'Trap Drum Selection', 'Finding the perfect sounds.', 'https://youtube.com/embed/dQw4w9WgXcQ', 18, 1, true),
('d3333333-dddd-4ddd-dddd-d33333333333', '44444444-dddd-4ddd-dddd-444444444444', 'Hi-Hat Programming', 'Creating iconic trap hi-hat patterns.', 'https://youtube.com/embed/dQw4w9WgXcQ', 30, 2, false),
('d4444444-dddd-4ddd-dddd-d44444444444', '44444444-dddd-4ddd-dddd-444444444444', '808 Design & Processing', 'Craft 808s that hit hard.', 'https://youtube.com/embed/dQw4w9WgXcQ', 40, 3, false),
('d5555555-dddd-4ddd-dddd-d55555555555', '44444444-dddd-4ddd-dddd-444444444444', '808 Slides & Glides', 'Master the signature trap bass technique.', 'https://youtube.com/embed/dQw4w9WgXcQ', 25, 4, false),
('d6666666-dddd-4ddd-dddd-d66666666666', '44444444-dddd-4ddd-dddd-444444444444', 'Trap Melodies', 'Dark, atmospheric melody creation.', 'https://youtube.com/embed/dQw4w9WgXcQ', 35, 5, false),
('d7777777-dddd-4ddd-dddd-d77777777777', '44444444-dddd-4ddd-dddd-444444444444', 'Counter-Melodies', 'Add depth with layered elements.', 'https://youtube.com/embed/dQw4w9WgXcQ', 28, 6, false),
('d8888888-dddd-4ddd-dddd-d88888888888', '44444444-dddd-4ddd-dddd-444444444444', 'Trap Sound Design', 'Create unique sounds from scratch.', 'https://youtube.com/embed/dQw4w9WgXcQ', 45, 7, false),
('d9999999-dddd-4ddd-dddd-d99999999999', '44444444-dddd-4ddd-dddd-444444444444', 'Trap Arrangement', 'Structure for maximum impact.', 'https://youtube.com/embed/dQw4w9WgXcQ', 30, 8, false),
('da111111-dddd-4ddd-dddd-da1111111111', '44444444-dddd-4ddd-dddd-444444444444', 'Mixing Trap Beats', 'Get that clean, hard sound.', 'https://youtube.com/embed/dQw4w9WgXcQ', 40, 9, false),
('db222222-dddd-4ddd-dddd-db2222222222', '44444444-dddd-4ddd-dddd-444444444444', 'Trap FX & Transitions', 'Risers, falls, and transitions.', 'https://youtube.com/embed/dQw4w9WgXcQ', 22, 10, false),
('dc333333-dddd-4ddd-dddd-dc3333333333', '44444444-dddd-4ddd-dddd-444444444444', 'Advanced Hi-Hat Rolls', 'Complex patterns and variations.', 'https://youtube.com/embed/dQw4w9WgXcQ', 28, 11, false),
('dd444444-dddd-4ddd-dddd-dd4444444444', '44444444-dddd-4ddd-dddd-444444444444', 'Trap Vocal Chops', 'Creating rhythmic vocal elements.', 'https://youtube.com/embed/dQw4w9WgXcQ', 25, 12, false),
('de555555-dddd-4ddd-dddd-de5555555555', '44444444-dddd-4ddd-dddd-444444444444', 'Producer Tags', 'Create your signature tag.', 'https://youtube.com/embed/dQw4w9WgXcQ', 15, 13, false),
('df666666-dddd-4ddd-dddd-df6666666666', '44444444-dddd-4ddd-dddd-444444444444', 'Final Export for Trap', 'Prepare beats for artists.', 'https://youtube.com/embed/dQw4w9WgXcQ', 18, 14, false)
ON CONFLICT (id) DO NOTHING;

-- Insert lessons for Studio Business Mastery
INSERT INTO lessons (id, course_id, title, description, video_url, duration_minutes, order_index, is_free_preview)
VALUES
('e1111111-eeee-4eee-eeee-e11111111111', '55555555-eeee-4eee-eeee-555555555555', 'Business Mindset', 'Think like an entrepreneur.', 'https://youtube.com/embed/dQw4w9WgXcQ', 15, 0, true),
('e2222222-eeee-4eee-eeee-e22222222222', '55555555-eeee-4eee-eeee-555555555555', 'Finding Your Niche', 'Specialize to stand out.', 'https://youtube.com/embed/dQw4w9WgXcQ', 20, 1, true),
('e3333333-eeee-4eee-eeee-e33333333333', '55555555-eeee-4eee-eeee-555555555555', 'Pricing Strategies', 'Value-based pricing that works.', 'https://youtube.com/embed/dQw4w9WgXcQ', 35, 2, false),
('e4444444-eeee-4eee-eeee-e44444444444', '55555555-eeee-4eee-eeee-555555555555', 'Building Your Brand', 'Stand out in a crowded market.', 'https://youtube.com/embed/dQw4w9WgXcQ', 30, 3, false),
('e5555555-eeee-4eee-eeee-e55555555555', '55555555-eeee-4eee-eeee-555555555555', 'Portfolio Development', 'Showcase your best work.', 'https://youtube.com/embed/dQw4w9WgXcQ', 25, 4, false),
('e6666666-eeee-4eee-eeee-e66666666666', '55555555-eeee-4eee-eeee-555555555555', 'Client Acquisition', 'Find and attract ideal clients.', 'https://youtube.com/embed/dQw4w9WgXcQ', 40, 5, false),
('e7777777-eeee-4eee-eeee-e77777777777', '55555555-eeee-4eee-eeee-555555555555', 'Client Communication', 'Professional interactions.', 'https://youtube.com/embed/dQw4w9WgXcQ', 28, 6, false),
('e8888888-eeee-4eee-eeee-e88888888888', '55555555-eeee-4eee-eeee-555555555555', 'Project Management', 'Deliver on time, every time.', 'https://youtube.com/embed/dQw4w9WgXcQ', 35, 7, false),
('e9999999-eeee-4eee-eeee-e99999999999', '55555555-eeee-4eee-eeee-555555555555', 'Contracts & Agreements', 'Protect yourself legally.', 'https://youtube.com/embed/dQw4w9WgXcQ', 45, 8, false),
('ea111111-eeee-4eee-eeee-ea1111111111', '55555555-eeee-4eee-eeee-555555555555', 'Handling Revisions', 'Manage feedback professionally.', 'https://youtube.com/embed/dQw4w9WgXcQ', 25, 9, false),
('eb222222-eeee-4eee-eeee-eb2222222222', '55555555-eeee-4eee-eeee-555555555555', 'Multiple Revenue Streams', 'Diversify your income.', 'https://youtube.com/embed/dQw4w9WgXcQ', 38, 10, false),
('ec333333-eeee-4eee-eeee-ec3333333333', '55555555-eeee-4eee-eeee-555555555555', 'Online Presence', 'Website and social media.', 'https://youtube.com/embed/dQw4w9WgXcQ', 30, 11, false),
('ed444444-eeee-4eee-eeee-ed4444444444', '55555555-eeee-4eee-eeee-555555555555', 'Networking & Relationships', 'Build lasting connections.', 'https://youtube.com/embed/dQw4w9WgXcQ', 28, 12, false),
('ee555555-eeee-4eee-eeee-ee5555555555', '55555555-eeee-4eee-eeee-555555555555', 'Scaling Your Business', 'Grow beyond yourself.', 'https://youtube.com/embed/dQw4w9WgXcQ', 35, 13, false),
('ef666666-eeee-4eee-eeee-ef6666666666', '55555555-eeee-4eee-eeee-555555555555', 'Financial Management', 'Track income and expenses.', 'https://youtube.com/embed/dQw4w9WgXcQ', 40, 14, false),
('f0111111-eeee-4eee-eeee-f01111111111', '55555555-eeee-4eee-eeee-555555555555', 'Taxes for Creatives', 'Stay compliant and save money.', 'https://youtube.com/embed/dQw4w9WgXcQ', 35, 15, false),
('f1222222-eeee-4eee-eeee-f12222222222', '55555555-eeee-4eee-eeee-555555555555', 'Passive Income', 'Earn while you sleep.', 'https://youtube.com/embed/dQw4w9WgXcQ', 30, 16, false),
('f2333333-eeee-4eee-eeee-f23333333333', '55555555-eeee-4eee-eeee-555555555555', 'Testimonials & Reviews', 'Leverage social proof.', 'https://youtube.com/embed/dQw4w9WgXcQ', 22, 17, false),
('f3444444-eeee-4eee-eeee-f34444444444', '55555555-eeee-4eee-eeee-555555555555', 'Handling Difficult Clients', 'Navigate challenges gracefully.', 'https://youtube.com/embed/dQw4w9WgXcQ', 28, 18, false),
('f4555555-eeee-4eee-eeee-f45555555555', '55555555-eeee-4eee-eeee-555555555555', 'Long-Term Success', 'Build a sustainable career.', 'https://youtube.com/embed/dQw4w9WgXcQ', 25, 19, false)
ON CONFLICT (id) DO NOTHING;

-- Insert lessons for Complete Engineer Certification (studio course - 20 lessons for brevity)
INSERT INTO lessons (id, course_id, title, description, video_url, duration_minutes, order_index, is_free_preview)
VALUES
('f5111111-ffff-4fff-ffff-f51111111111', '66666666-ffff-4fff-ffff-666666666666', 'Certification Overview', 'What it means to be certified.', 'https://youtube.com/embed/dQw4w9WgXcQ', 15, 0, true),
('f6222222-ffff-4fff-ffff-f62222222222', '66666666-ffff-4fff-ffff-666666666666', 'Professional Standards', 'Industry expectations explained.', 'https://youtube.com/embed/dQw4w9WgXcQ', 25, 1, true),
('f7333333-ffff-4fff-ffff-f73333333333', '66666666-ffff-4fff-ffff-666666666666', 'Acoustics & Monitoring', 'Understanding your listening environment.', 'https://youtube.com/embed/dQw4w9WgXcQ', 45, 2, false),
('f8444444-ffff-4fff-ffff-f84444444444', '66666666-ffff-4fff-ffff-666666666666', 'Signal Flow Mastery', 'From source to speaker.', 'https://youtube.com/embed/dQw4w9WgXcQ', 50, 3, false),
('f9555555-ffff-4fff-ffff-f95555555555', '66666666-ffff-4fff-ffff-666666666666', 'Advanced EQ Theory', 'Deep dive into frequencies.', 'https://youtube.com/embed/dQw4w9WgXcQ', 55, 4, false),
('fa666666-ffff-4fff-ffff-fa6666666666', '66666666-ffff-4fff-ffff-666666666666', 'Dynamics Processing Deep Dive', 'Compression, limiting, and more.', 'https://youtube.com/embed/dQw4w9WgXcQ', 60, 5, false),
('fb777777-ffff-4fff-ffff-fb7777777777', '66666666-ffff-4fff-ffff-666666666666', 'Time-Based Effects', 'Reverb and delay mastery.', 'https://youtube.com/embed/dQw4w9WgXcQ', 45, 6, false),
('fc888888-ffff-4fff-ffff-fc8888888888', '66666666-ffff-4fff-ffff-666666666666', 'Modulation Effects', 'Chorus, flanger, phaser.', 'https://youtube.com/embed/dQw4w9WgXcQ', 35, 7, false),
('fd999999-ffff-4fff-ffff-fd9999999999', '66666666-ffff-4fff-ffff-666666666666', 'Harmonic Processing', 'Saturation and distortion.', 'https://youtube.com/embed/dQw4w9WgXcQ', 40, 8, false),
('feaaaaaa-ffff-4fff-ffff-feaaaaaaaaaa', '66666666-ffff-4fff-ffff-666666666666', 'Stereo Imaging', 'Width, depth, and space.', 'https://youtube.com/embed/dQw4w9WgXcQ', 38, 9, false),
('ffbbbbbb-ffff-4fff-ffff-ffbbbbbbbbbb', '66666666-ffff-4fff-ffff-666666666666', 'Mid-Side Processing', 'Advanced stereo techniques.', 'https://youtube.com/embed/dQw4w9WgXcQ', 42, 10, false),
('a0cccccc-ffff-4fff-ffff-a0cccccccccc', '66666666-ffff-4fff-ffff-666666666666', 'Multiband Processing', 'Frequency-specific control.', 'https://youtube.com/embed/dQw4w9WgXcQ', 48, 11, false),
('a1dddddd-ffff-4fff-ffff-a1dddddddddd', '66666666-ffff-4fff-ffff-666666666666', 'Genre-Specific Mixing: Hip-Hop', 'The hip-hop sound.', 'https://youtube.com/embed/dQw4w9WgXcQ', 55, 12, false),
('a2eeeeee-ffff-4fff-ffff-a2eeeeeeeeee', '66666666-ffff-4fff-ffff-666666666666', 'Mastering Fundamentals', 'Preparing for release.', 'https://youtube.com/embed/dQw4w9WgXcQ', 45, 13, false),
('a3ffffff-ffff-4fff-ffff-a3ffffffffff', '66666666-ffff-4fff-ffff-666666666666', 'Mastering Chain Deep Dive', 'Building the perfect chain.', 'https://youtube.com/embed/dQw4w9WgXcQ', 55, 14, false),
('a4000000-ffff-4fff-ffff-a40000000000', '66666666-ffff-4fff-ffff-666666666666', 'Loudness Standards', 'LUFS, streaming, and more.', 'https://youtube.com/embed/dQw4w9WgXcQ', 40, 15, false),
('a5111111-ffff-4fff-ffff-a51111111111', '66666666-ffff-4fff-ffff-666666666666', 'Quality Control', 'Final checks before delivery.', 'https://youtube.com/embed/dQw4w9WgXcQ', 30, 16, false),
('a6222222-ffff-4fff-ffff-a62222222222', '66666666-ffff-4fff-ffff-666666666666', 'Certification Exam Prep', 'What to expect.', 'https://youtube.com/embed/dQw4w9WgXcQ', 40, 17, false),
('a7333333-ffff-4fff-ffff-a73333333333', '66666666-ffff-4fff-ffff-666666666666', 'Practical Exam: Mixing', 'Apply your skills.', 'https://youtube.com/embed/dQw4w9WgXcQ', 60, 18, false),
('a8444444-ffff-4fff-ffff-a84444444444', '66666666-ffff-4fff-ffff-666666666666', 'Certification Ceremony', 'Welcome to the network.', 'https://youtube.com/embed/dQw4w9WgXcQ', 15, 19, false)
ON CONFLICT (id) DO NOTHING;