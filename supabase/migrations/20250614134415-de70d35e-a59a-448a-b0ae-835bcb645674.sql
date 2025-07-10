
-- This policy allows admins to view all bookings, which is needed for appointment management.
CREATE POLICY "Admins can view all bookings."
  ON public.bookings FOR SELECT
  USING ( public.has_role(auth.uid(), 'admin') );

-- This policy allows admins to update bookings, which is needed for cancelling or rescheduling.
CREATE POLICY "Admins can update all bookings."
  ON public.bookings
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
