/*
  # Fix active logs handling

  1. Changes
    - Add unique constraint on status='active' to ensure only one active log at a time
    - Add new columns for shift values
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add unique constraint for active logs
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_active_log 
ON logs (status) 
WHERE status = 'active';

-- Add new columns for shift values if they don't exist
ALTER TABLE logs 
ADD COLUMN IF NOT EXISTS envelope_brl_start numeric(10,2),
ADD COLUMN IF NOT EXISTS envelope_brl_end numeric(10,2),
ADD COLUMN IF NOT EXISTS calculator_start integer,
ADD COLUMN IF NOT EXISTS calculator_end integer,
ADD COLUMN IF NOT EXISTS phone_start integer,
ADD COLUMN IF NOT EXISTS phone_end integer,
ADD COLUMN IF NOT EXISTS car_key_start integer,
ADD COLUMN IF NOT EXISTS car_key_end integer,
ADD COLUMN IF NOT EXISTS adapter_start integer,
ADD COLUMN IF NOT EXISTS adapter_end integer,
ADD COLUMN IF NOT EXISTS umbrella_start integer,
ADD COLUMN IF NOT EXISTS umbrella_end integer,
ADD COLUMN IF NOT EXISTS highlighter_start integer,
ADD COLUMN IF NOT EXISTS highlighter_end integer,
ADD COLUMN IF NOT EXISTS cards_start integer,
ADD COLUMN IF NOT EXISTS cards_end integer,
ADD COLUMN IF NOT EXISTS towels_start integer,
ADD COLUMN IF NOT EXISTS towels_end integer;