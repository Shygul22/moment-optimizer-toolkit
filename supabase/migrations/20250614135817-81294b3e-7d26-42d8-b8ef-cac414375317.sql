
-- This policy allows admins to add new roles to any user.
CREATE POLICY "Admins can insert user roles."
  ON public.user_roles FOR INSERT
  WITH CHECK ( public.has_role(auth.uid(), 'admin') );

-- This policy allows admins to update existing user roles.
CREATE POLICY "Admins can update user roles."
  ON public.user_roles FOR UPDATE
  USING ( public.has_role(auth.uid(), 'admin') )
  WITH CHECK ( public.has_role(auth.uid(), 'admin') );

-- This policy allows admins to remove roles from any user.
CREATE POLICY "Admins can delete user roles."
  ON public.user_roles FOR DELETE
  USING ( public.has_role(auth.uid(), 'admin') );
