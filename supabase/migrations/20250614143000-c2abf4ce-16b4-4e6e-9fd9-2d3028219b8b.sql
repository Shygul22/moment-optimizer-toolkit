
-- This enables Row-Level Security on the bookings table to ensure
-- users can only access bookings they are involved in.
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- This policy allows clients to view bookings they have made.
CREATE POLICY "Clients can view their own bookings"
ON public.bookings
FOR SELECT
USING (client_id = auth.uid());

-- This policy allows consultants to view bookings they are assigned to.
CREATE POLICY "Consultants can view their bookings"
ON public.bookings
FOR SELECT
USING (consultant_id = auth.uid());

-- This policy allows consultants to view the profiles of clients who have
-- booked a session with them. This is needed for the consultant dashboard.
CREATE POLICY "Consultants can view their clients profiles"
ON public.profiles
FOR SELECT
USING (
  id IN (
    SELECT client_id
    FROM public.bookings
    WHERE consultant_id = auth.uid()
  )
);
