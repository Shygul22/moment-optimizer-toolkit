
CREATE OR REPLACE FUNCTION public.book_consultation(
    p_availability_id uuid
)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_availability public.consultant_availability%ROWTYPE;
    v_booking public.bookings%ROWTYPE;
    v_client_id uuid := auth.uid();
BEGIN
    -- Check if user is a client
    IF NOT public.has_role(v_client_id, 'client') THEN
        RAISE EXCEPTION 'Only clients can book consultations.';
    END IF;

    -- 1. Lock the availability row and check if it's available
    SELECT *
    INTO v_availability
    FROM public.consultant_availability
    WHERE id = p_availability_id AND is_booked = false
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'This time slot is no longer available or does not exist.';
    END IF;

    -- 2. Create the booking
    INSERT INTO public.bookings (client_id, consultant_id, availability_id, start_time, end_time, type)
    VALUES (
        v_client_id,
        v_availability.consultant_id,
        v_availability.id,
        v_availability.start_time,
        v_availability.end_time,
        'online' -- Assuming 'online' as default booking type
    )
    RETURNING * INTO v_booking;

    -- 3. Mark the availability slot as booked
    UPDATE public.consultant_availability
    SET is_booked = true, updated_at = now()
    WHERE id = v_availability.id;

    -- 4. Return the created booking
    RETURN v_booking;
END;
$$;
