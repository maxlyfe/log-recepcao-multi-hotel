/*
  # Add edit tracking columns to logs table

  1. Changes
    - Add `values_last_edited_at` column to track when shift values were last modified
    - Add `values_edited_by` column to track who last modified shift values

  2. Security
    - No RLS changes needed as logs table already has appropriate policies
*/

-- Add the missing columns to the logs table
DO $$
BEGIN
  -- Add values_last_edited_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'logs' AND column_name = 'values_last_edited_at'
  ) THEN
    ALTER TABLE logs ADD COLUMN values_last_edited_at timestamptz;
  END IF;

  -- Add values_edited_by column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'logs' AND column_name = 'values_edited_by'
  ) THEN
    ALTER TABLE logs ADD COLUMN values_edited_by text;
  END IF;
END $$;