
-- First, let's check if there are any existing policies on admin_users and drop them
DROP POLICY IF EXISTS "Admin users can view admin list" ON public.admin_users;
DROP POLICY IF EXISTS "Only admins can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Only admins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Only admins can delete admin users" ON public.admin_users;

-- Create a security definer function to check admin status without causing recursion
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = user_id
  );
$$;

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create simple policies that don't cause recursion
CREATE POLICY "Admin users can view all admin records" 
  ON public.admin_users 
  FOR SELECT 
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admin users can insert admin records" 
  ON public.admin_users 
  FOR INSERT 
  WITH CHECK (public.is_admin_user(auth.uid()));

-- For products table, let's also add RLS policies using the same function
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can manage all products" 
  ON public.products 
  FOR ALL 
  USING (public.is_admin_user(auth.uid()));

-- Allow public read access to products for the main site
CREATE POLICY "Public can view products" 
  ON public.products 
  FOR SELECT 
  USING (true);
