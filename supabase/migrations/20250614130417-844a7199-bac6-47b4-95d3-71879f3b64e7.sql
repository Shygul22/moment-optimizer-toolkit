
-- Function to check if a user has a specific role. This is a secure way to check roles within policies.
CREATE OR REPLACE FUNCTION public.has_role(p_user_id UUID, p_role public.app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = p_user_id AND role = p_role
  );
END;
$$;

-- The old policy allowed anyone to view all profiles, which we'll replace with more secure rules.
DROP POLICY "Public profiles are viewable by everyone." ON public.profiles;

-- This policy ensures users can still view their own profile.
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id );

-- This new policy allows users with the 'admin' role to view all profiles.
CREATE POLICY "Admins can view all profiles."
  ON public.profiles FOR SELECT
  USING ( public.has_role(auth.uid(), 'admin') );

-- This new policy allows admins to view all user roles, which is needed for user management.
CREATE POLICY "Admins can view all user roles."
  ON public.user_roles FOR SELECT
  USING ( public.has_role(auth.uid(), 'admin') );
