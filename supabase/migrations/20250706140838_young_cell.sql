/*
  # Add is_featured column to profiles table

  1. Changes
    - Add `is_featured` column to `profiles` table
    - Set default value to `false`
    - Allow null values initially for existing records

  2. Security
    - No changes to existing RLS policies needed
*/

-- Add is_featured column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_featured boolean DEFAULT false;
  END IF;
END $$;