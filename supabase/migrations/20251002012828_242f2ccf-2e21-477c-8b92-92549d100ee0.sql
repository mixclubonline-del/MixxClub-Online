-- Add admin role to demo admin user
INSERT INTO public.user_roles (user_id, role)
VALUES ('b004a710-09d3-4613-b7c6-ddc2bf8af0cf', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;