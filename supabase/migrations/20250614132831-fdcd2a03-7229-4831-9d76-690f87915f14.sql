
-- Create custom types for booking status and type
CREATE TYPE public.booking_status AS ENUM ('confirmed', 'cancelled', 'completed', 'rescheduled');
CREATE TYPE public.booking_type AS ENUM ('online', 'offline');

-- Create a table for consultant availability slots
CREATE TABLE public.consultant_availability (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    consultant_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    is_booked boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT check_end_time_after_start_time CHECK (end_time > start_time)
);

-- Add Row Level Security to the availability table
ALTER TABLE public.consultant_availability ENABLE ROW LEVEL SECURITY;

-- Policy: Allow consultants to manage their own availability
CREATE POLICY "Consultants can manage their own availability"
ON public.consultant_availability
FOR ALL
USING (public.has_role(auth.uid(), 'consultant') AND consultant_id = auth.uid())
WITH CHECK (public.has_role(auth.uid(), 'consultant') AND consultant_id = auth.uid());

-- Policy: Allow any authenticated user to see available slots
CREATE POLICY "Authenticated users can view available slots"
ON public.consultant_availability
FOR SELECT
USING (auth.role() = 'authenticated');

-- Create a table for bookings
CREATE TABLE public.bookings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consultant_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    availability_id uuid REFERENCES public.consultant_availability(id) ON DELETE SET NULL,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    status public.booking_status NOT NULL DEFAULT 'confirmed',
    type public.booking_type NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT check_booking_end_time_after_start_time CHECK (end_time > start_time)
);

-- Add Row Level Security to the bookings table
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow clients to create bookings for themselves
CREATE POLICY "Clients can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'client') AND client_id = auth.uid());

-- Policy: Allow users to view bookings they are part of (as client or consultant)
CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
USING (client_id = auth.uid() OR consultant_id = auth.uid());

-- Policy: Allow clients to update their own bookings
CREATE POLICY "Clients can update their own bookings"
ON public.bookings
FOR UPDATE
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());

-- Policy: Allow consultants to update their own bookings
CREATE POLICY "Consultants can update their bookings"
ON public.bookings
FOR UPDATE
USING (consultant_id = auth.uid())
WITH CHECK (consultant_id = auth.uid());

