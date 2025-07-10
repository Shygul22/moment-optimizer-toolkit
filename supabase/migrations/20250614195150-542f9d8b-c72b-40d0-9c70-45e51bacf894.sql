
-- Step 1: Change the default status for new bookings from 'confirmed' to 'pending'.
ALTER TABLE public.bookings ALTER COLUMN status SET DEFAULT 'pending';

-- Step 2: Create a secure function for consultants and admins to update the booking status.
CREATE OR REPLACE FUNCTION public.update_booking_status(
    p_booking_id uuid,
    p_new_status public.booking_status
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_booking record;
    v_caller_id uuid := auth.uid();
BEGIN
    -- Find the booking that needs to be updated.
    SELECT * INTO v_booking
    FROM public.bookings
    WHERE id = p_booking_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found.';
    END IF;

    -- Authorization check: only the assigned consultant or an admin can modify the booking.
    IF NOT (public.has_role(v_caller_id, 'admin') OR v_booking.consultant_id = v_caller_id) THEN
        RAISE EXCEPTION 'You do not have permission to update this booking.';
    END IF;

    -- State transition validation to ensure a logical workflow.
    IF v_booking.status = 'pending' AND p_new_status NOT IN ('confirmed', 'cancelled') THEN
        RAISE EXCEPTION 'From pending, a booking can only be confirmed or cancelled.';
    END IF;

    IF v_booking.status = 'confirmed' AND p_new_status NOT IN ('completed', 'cancelled') THEN
        RAISE EXCEPTION 'From confirmed, a booking can only be completed or cancelled.';
    END IF;

    IF v_booking.status IN ('completed', 'cancelled') THEN
        RAISE EXCEPTION 'Cannot change the status of a completed or cancelled booking.';
    END IF;

    -- Update the booking status.
    UPDATE public.bookings
    SET status = p_new_status, updated_at = now()
    WHERE id = p_booking_id;

    -- If a booking is cancelled, free up the availability slot so another client can book it.
    IF p_new_status = 'cancelled' AND v_booking.availability_id IS NOT NULL THEN
        UPDATE public.consultant_availability
        SET is_booked = false, updated_at = now()
        WHERE id = v_booking.availability_id;
    END IF;
END;
$$;

-- Step 3: Update booking policies to prevent clients from changing status directly.
-- They can only cancel via a dedicated function if we choose to create one, but for now they can't change status.
DROP POLICY "Clients can update their own bookings" ON public.bookings;

CREATE POLICY "Clients can view their own bookings"
ON public.bookings
FOR SELECT
USING (client_id = auth.uid());

