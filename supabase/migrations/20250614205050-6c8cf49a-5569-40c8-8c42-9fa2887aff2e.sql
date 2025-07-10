
-- Add Google Meet link column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN google_meet_link TEXT,
ADD COLUMN google_meet_id TEXT;

-- Create a function to generate Google Meet links when booking is confirmed
CREATE OR REPLACE FUNCTION public.create_google_meet_for_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only create Google Meet link when status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    -- We'll trigger the Google Meet creation from the application
    -- This trigger just ensures we have the right timing
    NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run after booking status update
CREATE TRIGGER create_google_meet_trigger
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.create_google_meet_for_booking();
