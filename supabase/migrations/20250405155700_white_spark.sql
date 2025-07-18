/*
  # Fix column names for cards and towels

  1. Changes
    - Combine cards_start/cards_end and towels_start/towels_end into cards_towels_start/cards_towels_end
    - Migrate existing data
    
  2. Security
    - Maintain existing RLS policies
*/

-- Create new combined columns
ALTER TABLE logs 
ADD COLUMN IF NOT EXISTS cards_towels_start integer,
ADD COLUMN IF NOT EXISTS cards_towels_end integer;

-- Migrate data if old columns exist
DO $$ 
BEGIN 
  -- Only run if both old columns exist
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'logs' 
    AND column_name IN ('cards_start', 'towels_start')
  ) THEN
    -- Update new column with sum of old columns
    UPDATE logs 
    SET cards_towels_start = COALESCE(cards_start, 0) + COALESCE(towels_start, 0),
        cards_towels_end = COALESCE(cards_end, 0) + COALESCE(towels_end, 0);
        
    -- Drop old columns
    ALTER TABLE logs 
    DROP COLUMN IF EXISTS cards_start,
    DROP COLUMN IF EXISTS cards_end,
    DROP COLUMN IF EXISTS towels_start,
    DROP COLUMN IF EXISTS towels_end;
  END IF;
END $$;