-- Add character asset contexts for Jax, Rell, and Nova
INSERT INTO asset_contexts (context_prefix, name, description, icon) VALUES
('character_jax_', 'Jax Character', 'Artist entry character poses and expressions', 'user'),
('character_rell_', 'Rell Character', 'Engineer entry character poses and expressions', 'wrench'),
('character_nova_', 'Nova Character', 'Community character poses and expressions', 'heart')
ON CONFLICT (context_prefix) DO NOTHING;