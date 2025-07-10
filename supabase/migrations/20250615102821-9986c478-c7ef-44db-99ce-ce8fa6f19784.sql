
-- Add a 'last_seen' column to the profiles table to track user activity.
ALTER TABLE public.profiles
ADD COLUMN last_seen TIMESTAMPTZ;

-- Set the replica identity to FULL to get detailed change records for real-time updates.
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add the 'profiles' table to the 'supabase_realtime' publication to enable broadcasting of changes.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles' AND schemaname = 'public'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END;
$$;
