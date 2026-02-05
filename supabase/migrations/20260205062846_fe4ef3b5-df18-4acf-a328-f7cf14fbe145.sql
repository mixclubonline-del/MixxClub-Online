-- Insert 6 demo phase asset contexts
INSERT INTO public.asset_contexts (context_prefix, name, description, icon)
VALUES 
  ('demo_phase_problem', 'Demo: The Problem', 'Lone creator at 3am, isolation and unrealized potential', '😔'),
  ('demo_phase_discovery', 'Demo: The Discovery', 'Light breaking through, hope dawning', '✨'),
  ('demo_phase_connection', 'Demo: The Connection', 'Split-screen artist and engineer collaborating', '🤝'),
  ('demo_phase_transformation', 'Demo: The Transformation', 'Audio waveform before/after visualization', '🔄'),
  ('demo_phase_tribe', 'Demo: The Tribe', 'Global network constellation of creators', '🌍'),
  ('demo_phase_invitation', 'Demo: The Invitation', 'Open studio door, welcoming threshold', '🚪')
ON CONFLICT (context_prefix) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon;