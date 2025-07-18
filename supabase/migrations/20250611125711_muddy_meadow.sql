/*
  # Add hotel_id to log_entries table

  1. Changes
    - Add hotel_id column to log_entries table
    - Add foreign key constraint to hotels table
    - Update existing entries to have hotel_id from their parent log
    - Add index for performance
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add hotel_id column to log_entries
ALTER TABLE log_entries 
ADD COLUMN IF NOT EXISTS hotel_id uuid REFERENCES hotels(id);

-- Update existing entries to have hotel_id from their parent log
UPDATE log_entries 
SET hotel_id = logs.hotel_id
FROM logs 
WHERE log_entries.log_id = logs.id 
AND log_entries.hotel_id IS NULL;

-- Make hotel_id required for future entries
ALTER TABLE log_entries 
ALTER COLUMN hotel_id SET NOT NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_log_entries_hotel_id ON log_entries(hotel_id);

-- Add timestamp column if it doesn't exist
ALTER TABLE log_entries 
ADD COLUMN IF NOT EXISTS timestamp timestamptz DEFAULT now();

-- Add created_by column if it doesn't exist
ALTER TABLE log_entries 
ADD COLUMN IF NOT EXISTS created_by text;

-- Add reply_to column if it doesn't exist
ALTER TABLE log_entries 
ADD COLUMN IF NOT EXISTS reply_to uuid REFERENCES log_entries(id);

-- Add editing tracking columns
ALTER TABLE log_entries 
ADD COLUMN IF NOT EXISTS last_edited_at timestamptz,
ADD COLUMN IF NOT EXISTS edited_by text;