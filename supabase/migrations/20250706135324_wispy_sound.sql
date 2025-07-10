/*
  # Add is_featured column to profiles table

  1. Changes
    - Add `is_featured` column to `profiles` table
    - Set default value to `false`
    - Column is NOT NULL with default value for data consistency

  2. Purpose
    - Enables the featured consultants functionality
    - Allows admins to mark consultants as featured for display on landing page
    - Ensures backward compatibility with existing records
*/

ALTER TABLE public.profiles ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE;