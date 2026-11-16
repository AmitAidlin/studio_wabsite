
-- Insert your email as an admin user
-- First, let's get your user ID from the auth.users table and insert it into admin_users
INSERT INTO public.admin_users (id)
SELECT id FROM auth.users WHERE email = 'aidlin427@gmail.com'
ON CONFLICT (id) DO NOTHING;
