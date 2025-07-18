/*
  # Add status field to log entries

  1. Changes
    - Add status column to log_entries table
    - Set default status as 'open'
    - Update existing entries to have 'open' status
*/

ALTER TABLE log_entries 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open' 
CHECK (status IN ('open', 'in_progress', 'closed'));

-- Update existing entries to have 'open' status
UPDATE log_entries SET status = 'open' WHERE status IS NULL;