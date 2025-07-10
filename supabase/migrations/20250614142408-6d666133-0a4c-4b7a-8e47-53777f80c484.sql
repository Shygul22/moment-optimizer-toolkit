
-- Creates a function to securely fetch all consultant profiles
-- without exposing the user_roles table directly to clients.
CREATE OR REPLACE FUNCTION public.get_all_consultants()
RETURNS SETOF public.profiles
LANGUAGE plpgsql
STABLE
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT p.*
    FROM public.profiles p
    WHERE public.has_role(p.id, 'consultant');
END;
$$;

-- Grants authenticated users permission to call this new function.
GRANT EXECUTE ON FUNCTION public.get_all_consultants() TO authenticated;

-- This policy allows any authenticated user to view the full profile of a consultant.
-- This is needed for the consultant profile page to load, and for clients to see
-- which consultant they've booked on their dashboard.
-- It will be combined with existing policies, so users can also see their own
-- profile and admins can see all profiles.
CREATE POLICY "Authenticated users can view consultant profiles"
ON public.profiles
FOR SELECT
USING ( public.has_role(id, 'consultant') );
