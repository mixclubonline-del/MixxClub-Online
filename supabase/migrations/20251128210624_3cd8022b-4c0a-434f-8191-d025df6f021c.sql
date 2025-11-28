-- Seed Marketplace Categories
INSERT INTO marketplace_categories (id, category_name, category_description, icon, is_active) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Beats & Instrumentals', 'Professional beats and instrumental tracks for your next project', 'music', true),
('b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'Samples & Loops', 'High-quality samples, loops, and one-shots', 'waveform', true),
('c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'Vocal Presets', 'Professional vocal chain presets for mixing', 'mic', true),
('d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'Mixing Templates', 'DAW templates and mixing sessions', 'sliders', true),
('e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'Sound Design Packs', 'Unique sound design elements and FX', 'sparkles', true);

-- Seed Marketplace Items
INSERT INTO marketplace_items (id, seller_id, item_name, item_description, item_type, price, currency, category_id, status, sales_count, preview_urls) VALUES
-- Beats & Instrumentals
('f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c', (SELECT id FROM profiles LIMIT 1), 'Dark Trap Beat Pack Vol. 1', '10 hard-hitting trap beats with 808s and dark melodies. Includes stems and MIDI files.', 'beat_pack', 49.99, 'USD', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'active', 127, ARRAY['https://example.com/preview1.mp3']),
('a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d', (SELECT id FROM profiles LIMIT 1), 'Lo-Fi Hip Hop Collection', '15 chill lo-fi beats perfect for study sessions. WAV + MP3 formats included.', 'beat_pack', 34.99, 'USD', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'active', 89, ARRAY['https://example.com/preview2.mp3']),
('b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e', (SELECT id FROM profiles LIMIT 1), 'Afrobeat Essentials', '8 authentic Afrobeat instrumentals with traditional percussion and melodies.', 'beat_pack', 39.99, 'USD', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'active', 64, ARRAY['https://example.com/preview3.mp3']),

-- Samples & Loops
('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', (SELECT id FROM profiles LIMIT 1), 'Analog Drum Kit - 500 Samples', 'Professionally recorded analog drum samples. Kicks, snares, hi-hats, and more.', 'sample_pack', 24.99, 'USD', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'active', 203, ARRAY['https://example.com/preview4.mp3']),
('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', (SELECT id FROM profiles LIMIT 1), 'Vocal Chop Library', '300+ vocal chops and phrases for creative sampling. Royalty-free.', 'sample_pack', 29.99, 'USD', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'active', 156, ARRAY['https://example.com/preview5.mp3']),
('e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', (SELECT id FROM profiles LIMIT 1), 'Synth Wave Pack', 'Retro synthwave loops and one-shots inspired by 80s classics.', 'sample_pack', 19.99, 'USD', 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', 'active', 98, ARRAY['https://example.com/preview6.mp3']),

-- Vocal Presets
('f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', (SELECT id FROM profiles LIMIT 1), 'Pro Vocal Chain - FL Studio', 'Complete vocal processing chain preset for FL Studio. Radio-ready sound.', 'preset', 14.99, 'USD', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'active', 312, NULL),
('a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d', (SELECT id FROM profiles LIMIT 1), 'Ableton Vocal Suite', '10 professional vocal presets for Ableton Live. Includes reverb, delay, compression.', 'preset', 19.99, 'USD', 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', 'active', 245, NULL),

-- Mixing Templates
('b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e', (SELECT id FROM profiles LIMIT 1), 'Hip Hop Mixing Template', 'Pro Tools mixing template with routing, effects, and automation ready.', 'template', 39.99, 'USD', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'active', 178, NULL),
('c5d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9f', (SELECT id FROM profiles LIMIT 1), 'Logic Pro X Pop Session', 'Complete Logic Pro X template for pop production with all plugins configured.', 'template', 44.99, 'USD', 'd4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a', 'active', 134, NULL),

-- Sound Design Packs
('d6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a', (SELECT id FROM profiles LIMIT 1), 'Cinematic FX Collection', '200+ cinematic sound effects and transitions for film scoring.', 'sound_pack', 54.99, 'USD', 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'active', 87, ARRAY['https://example.com/preview7.mp3']),
('e7f8a9b0-c1d2-4e3f-4a5b-6c7d8e9f0a1b', (SELECT id FROM profiles LIMIT 1), 'EDM Riser Pack', '50 professional EDM risers, impacts, and build-ups for electronic music.', 'sound_pack', 16.99, 'USD', 'e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b', 'active', 221, ARRAY['https://example.com/preview8.mp3']);

-- Seed Label Partnerships
INSERT INTO label_partnerships (id, label_name, label_type, contact_email, partnership_status, revenue_share, metadata) VALUES
('f8a9b0c1-d2e3-4f4a-5b6c-7d8e9f0a1b2c', 'Empire Distribution', 'major', 'partners@empire.com', 'active', 15.0, '{"distribution_territories": ["worldwide"], "advance_available": true}'::jsonb),
('a9b0c1d2-e3f4-4a5b-6c7d-8e9f0a1b2c3d', 'AWAL (Kobalt)', 'independent', 'info@awal.com', 'active', 20.0, '{"distribution_territories": ["worldwide"], "advance_available": false}'::jsonb),
('b0c1d2e3-f4a5-4b6c-7d8e-9f0a1b2c3d4e', 'United Masters', 'independent', 'support@unitedmasters.com', 'active', 10.0, '{"distribution_territories": ["worldwide"], "advance_available": true}'::jsonb),
('c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f', 'DistroKid', 'digital', 'hello@distrokid.com', 'active', 0.0, '{"distribution_territories": ["worldwide"], "flat_fee_model": true}'::jsonb);

-- Seed Label Services
INSERT INTO label_services (id, partnership_id, service_name, service_type, description, price, currency, is_active) VALUES
-- Empire Distribution Services
('d2e3f4a5-b6c7-4d8e-9f0a-1b2c3d4e5f6a', 'f8a9b0c1-d2e3-4f4a-5b6c-7d8e9f0a1b2c', 'Digital Distribution + Marketing', 'distribution', 'Worldwide digital distribution with dedicated marketing support and playlist pitching.', 299.99, 'USD', true),
('e3f4a5b6-c7d8-4e9f-0a1b-2c3d4e5f6a7b', 'f8a9b0c1-d2e3-4f4a-5b6c-7d8e9f0a1b2c', 'Advance Funding Program', 'funding', 'Get an advance on your future royalties. Up to $50,000 available for qualified artists.', 0.00, 'USD', true),
('f4a5b6c7-d8e9-4f0a-1b2c-3d4e5f6a7b8c', 'f8a9b0c1-d2e3-4f4a-5b6c-7d8e9f0a1b2c', 'Sync Licensing Service', 'licensing', 'Professional sync licensing for TV, film, and commercials. Industry connections included.', 149.99, 'USD', true),

-- AWAL Services
('a5b6c7d8-e9f0-4a1b-2c3d-4e5f6a7b8c9d', 'a9b0c1d2-e3f4-4a5b-6c7d-8e9f0a1b2c3d', 'Premium Distribution', 'distribution', 'Global distribution with analytics, marketing tools, and dedicated artist support.', 0.00, 'USD', true),
('b6c7d8e9-f0a1-4b2c-3d4e-5f6a7b8c9d0e', 'a9b0c1d2-e3f4-4a5b-6c7d-8e9f0a1b2c3d', 'Playlist Pitching Campaign', 'marketing', 'Professional playlist pitching to Spotify, Apple Music, and Amazon Music curators.', 199.99, 'USD', true),

-- United Masters Services
('c7d8e9f0-a1b2-4c3d-4e5f-6a7b8c9d0e1f', 'b0c1d2e3-f4a5-4b6c-7d8e-9f0a1b2c3d4e', 'Standard Distribution', 'distribution', 'Keep 100% of your royalties. Distribute to all major platforms worldwide.', 0.00, 'USD', true),
('d8e9f0a1-b2c3-4d4e-5f6a-7b8c9d0e1f2a', 'b0c1d2e3-f4a5-4b6c-7d8e-9f0a1b2c3d4e', 'Brand Partnership Access', 'marketing', 'Exclusive access to brand partnership opportunities with major companies.', 99.99, 'USD', true),
('e9f0a1b2-c3d4-4e5f-6a7b-8c9d0e1f2a3b', 'b0c1d2e3-f4a5-4b6c-7d8e-9f0a1b2c3d4e', 'Advance on Royalties', 'funding', 'Get immediate funding based on your streaming performance. No credit check required.', 0.00, 'USD', true),

-- DistroKid Services
('f0a1b2c3-d4e5-4f6a-7b8c-9d0e1f2a3b4c', 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f', 'Unlimited Distribution', 'distribution', 'Upload unlimited songs to all major streaming platforms for one annual fee.', 19.99, 'USD', true),
('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f', 'YouTube Content ID', 'monetization', 'Monetize your music on YouTube and collect revenue from user-generated content.', 4.99, 'USD', true),
('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f', 'Instant Spotify Verification', 'verification', 'Get your Spotify artist profile verified instantly with blue checkmark.', 7.99, 'USD', true);

-- Seed Integration Providers (Streaming Platforms)
INSERT INTO integration_providers (id, provider_name, provider_type, provider_description, logo_url, auth_url, is_active, config) VALUES
('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'Spotify', 'streaming', 'Connect your Spotify account to sync your music, playlists, and analytics.', 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png', 'https://accounts.spotify.com/authorize', true, '{"api_version": "v1", "scopes": ["user-read-email", "user-library-read", "playlist-modify-public"]}'::jsonb),
('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'Apple Music', 'streaming', 'Sync your Apple Music library and access exclusive distribution features.', 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Apple_Music_icon.svg', 'https://appleid.apple.com/auth/authorize', true, '{"api_version": "v1", "requires_developer_token": true}'::jsonb),
('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'YouTube Music', 'streaming', 'Connect YouTube Music for video distribution and Content ID management.', 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Youtube_Music_icon.svg', 'https://accounts.google.com/o/oauth2/auth', true, '{"api_version": "v3", "content_id_enabled": true}'::jsonb),
('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c', 'Amazon Music', 'streaming', 'Distribute and track your music on Amazon Music and Alexa devices.', 'https://m.media-amazon.com/images/G/01/digital/music/player/web/Amazon_Music_logo.png', 'https://www.amazon.com/ap/oa', true, '{"api_version": "v1", "alexa_integration": true}'::jsonb),
('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 'SoundCloud', 'streaming', 'Upload tracks directly to SoundCloud and manage your artist profile.', 'https://developers.soundcloud.com/assets/logo_big_black-4fbe88aa0bf28767bbfc65a08c828c76.png', 'https://soundcloud.com/connect', true, '{"api_version": "v2", "monetization_enabled": true}'::jsonb),
('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 'Tidal', 'streaming', 'Connect to TIDAL for high-fidelity audio distribution and MQA support.', 'https://upload.wikimedia.org/wikipedia/commons/0/00/Tidal_logo.svg', 'https://auth.tidal.com/oauth2/auth', true, '{"api_version": "v1", "hifi_support": true, "mqa_support": true}'::jsonb);
