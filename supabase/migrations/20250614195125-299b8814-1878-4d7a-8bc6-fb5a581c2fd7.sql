
-- Step 1: Add a new 'pending' status to the booking_status type.
-- This allows new bookings to wait for approval.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        WHERE t.typname = 'booking_status' AND e.enumlabel = 'pending'
    ) THEN
        ALTER TYPE public.booking_status ADD VALUE 'pending' BEFORE 'confirmed';
    END IF;
END$$;
