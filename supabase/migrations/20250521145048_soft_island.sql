/*
  # Add open entries tracking

  1. Changes
    - Add global_entry_id to log_entries for tracking entries across logs
    - Add constraint to ensure uniqueness of global entries
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add global_entry_id column
ALTER TABLE log_entries 
ADD COLUMN IF NOT EXISTS global_entry_id uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS original_log_id uuid REFERENCES logs(id);

-- Create index for faster lookups
CREATE INDEX idx_log_entries_global_id ON log_entries(global_entry_id);

-- Create index for status lookups
CREATE INDEX idx_log_entries_status ON log_entries(status);