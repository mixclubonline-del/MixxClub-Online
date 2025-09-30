-- Update your user to admin role (replace 'your-email@example.com' with your actual email)
-- This is a one-time setup to create the first admin user
-- After this, you can use the admin panel to promote other users

-- Example: UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

COMMENT ON TABLE profiles IS 'Run: UPDATE profiles SET role = ''admin'' WHERE email = ''your-email@example.com''; to create your first admin user';
