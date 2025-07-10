
-- Create a trigger to automatically update the 'updated_at' column on profile changes.
CREATE TRIGGER handle_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE PROCEDURE public.update_updated_at_column();
