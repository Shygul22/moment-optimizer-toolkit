
-- Add is_active column to track user account status
ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Enable Row Level Security on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to view all profiles.
-- This is useful for features like chat and seeing consultant details.
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Allow users to update their own profile.
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Allow admins to update any user's profile.
-- This will be used for activating/deactivating accounts.
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
