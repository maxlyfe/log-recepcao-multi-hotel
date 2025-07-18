/*
  # Fix active log constraint to allow one per hotel

  1. Changes
    - Drop the existing global unique constraint on active logs
    - Create a new unique constraint that allows one active log per hotel_id
    
  2. Security
    - No changes to existing RLS policies
    
  3. Notes
    - This allows multiple hotels to have active logs simultaneously
    - Each hotel can still only have one active log at a time
*/

-- Drop the existing global unique constraint
DROP INDEX IF EXISTS idx_single_active_log;

-- Create a new unique constraint that includes hotel_id
-- This allows one active log per hotel instead of one globally
CREATE UNIQUE INDEX idx_single_active_log_per_hotel 
ON logs (hotel_id, status) 
WHERE status = 'active';