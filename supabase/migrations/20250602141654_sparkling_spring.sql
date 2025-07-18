/*
  # Add multi-hotel support

  1. Changes
    - Add hotel_id to logs table if not exists
    - Insert initial hotels if they don't exist
    - Update existing logs to belong to Costa do Sol
    - Make hotel_id required for future logs
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add hotel_id to logs table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'logs' 
    AND column_name = 'hotel_id'
  ) THEN
    ALTER TABLE logs
    ADD COLUMN hotel_id uuid REFERENCES hotels(id);
    
    CREATE INDEX idx_logs_hotel_id ON logs(hotel_id);
  END IF;
END $$;

-- Insert hotels if they don't exist
INSERT INTO hotels (name, code, pin)
VALUES 
  ('Costa do Sol Boutique Hotel', 'CS', '0000'),
  ('Brava Club', 'BC', '1111'),
  ('Maria Maria', 'MM', '2222'),
  ('Vila Pitanga', 'VP', '3333')
ON CONFLICT (code) DO NOTHING;

-- Update existing logs to belong to Costa do Sol if they don't have a hotel
UPDATE logs 
SET hotel_id = (SELECT id FROM hotels WHERE code = 'CS')
WHERE hotel_id IS NULL;

-- Make hotel_id required if it's not already
DO $$ 
BEGIN 
  ALTER TABLE logs
  ALTER COLUMN hotel_id SET NOT NULL;
EXCEPTION
  WHEN others THEN
    NULL;
END $$;