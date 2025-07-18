/*
  # Update log system with new fields

  1. Changes
    - Add new columns to logs table for shift start/end values
    - Add reply_to column to log_entries for threading
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to logs table
ALTER TABLE logs 
ADD COLUMN IF NOT EXISTS cash_brl_start numeric(10,2),
ADD COLUMN IF NOT EXISTS cash_usd_start numeric(10,2),
ADD COLUMN IF NOT EXISTS pens_count_start integer,
ADD COLUMN IF NOT EXISTS cash_brl_end numeric(10,2),
ADD COLUMN IF NOT EXISTS cash_usd_end numeric(10,2),
ADD COLUMN IF NOT EXISTS pens_count_end integer;

-- Add reply_to column to log_entries
ALTER TABLE log_entries
ADD COLUMN IF NOT EXISTS reply_to uuid REFERENCES log_entries(id);