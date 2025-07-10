
-- Add is_featured column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_featured boolean DEFAULT false;

-- Create index for better query performance on featured consultants
CREATE INDEX IF NOT EXISTS idx_profiles_is_featured 
ON public.profiles(is_featured) 
WHERE is_featured = true;
