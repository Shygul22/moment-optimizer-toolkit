
-- Part 1: Reset and fix policies for the 'profiles' table.

-- Drop all potentially conflicting policies on the profiles table to ensure a clean slate.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view consultant profiles" ON public.profiles;
DROP POLICY IF EXISTS "Consultants can view their clients' profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to view consultant profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow consultants to view their clients' profiles" ON public.profiles;

-- Re-create all the necessary policies for the 'profiles' table.
-- Policy 1: Allow users to view their own profile information.
CREATE POLICY "Allow users to view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Policy 2: Allow users to update their own profile information.
CREATE POLICY "Allow users to update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Policy 3: Allow any authenticated user to see the profiles of all consultants.
CREATE POLICY "Allow authenticated users to view consultant profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(id, 'consultant'));

-- Policy 4: Allow consultants to see the profiles of clients who have booked with them.
CREATE POLICY "Allow consultants to view their clients' profiles" ON public.profiles FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.bookings WHERE client_id = profiles.id AND consultant_id = auth.uid()));

-- Part 2: Add and fix policies for the 'bookings' table.

-- Drop existing policies on the bookings table to ensure a clean slate.
DROP POLICY IF EXISTS "Clients can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Consultants can view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Clients can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow clients to view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow consultants to view their bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow clients to create bookings" ON public.bookings;

-- Enable Row-Level Security on the bookings table if it's not already enabled.
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy 1 for bookings: Clients can see their own bookings.
CREATE POLICY "Allow clients to view their own bookings" ON public.bookings FOR SELECT USING (client_id = auth.uid());

-- Policy 2 for bookings: Consultants can see bookings made with them.
CREATE POLICY "Allow consultants to view their bookings" ON public.bookings FOR SELECT USING (consultant_id = auth.uid());

-- Policy 3 for bookings: Clients can create bookings for themselves.
CREATE POLICY "Allow clients to create bookings" ON public.bookings FOR INSERT WITH CHECK (client_id = auth.uid());
