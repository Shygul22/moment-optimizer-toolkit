/*
  # Add is_featured column to profiles table

  1. Schema Changes
    - Add `is_featured` boolean column to `profiles` table
    - Set default value to `false`
    - Make column nullable for flexibility

  2. Security
    - No changes to existing RLS policies needed
    - Column will inherit existing profile security rules

  3. Notes
    - This enables the featured consultants functionality
    - Admins can toggle consultant featured status
    - Featured consultants appear on the landing page
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

-- Create index for better query performance on featured consultants
CREATE INDEX IF NOT EXISTS idx_profiles_is_featured ON profiles(is_featured) WHERE is_featured = true;