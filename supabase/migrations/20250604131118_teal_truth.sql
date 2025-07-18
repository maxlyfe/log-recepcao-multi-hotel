/*
  # Fix PIN storage format

  1. Changes
    - Ensure PIN column is text type
    - Update existing PINs to be consistent text format
    - Add NOT NULL constraint
    
  2. Security
    - Maintain existing RLS policies
*/

-- Ensure PIN column is text and NOT NULL
ALTER TABLE hotels 
ALTER COLUMN pin TYPE text,
ALTER COLUMN pin SET NOT NULL;

-- Update existing PINs to ensure consistent format
UPDATE hotels SET pin = LPAD(pin::text, 4, '0');

-- Add check constraint to ensure PIN is exactly 4 characters
ALTER TABLE hotels
ADD CONSTRAINT hotels_pin_check CHECK (length(pin) = 4);

-- Update hotel PINs with correct values
UPDATE hotels 
SET pin = CASE 
  WHEN code = 'CS' THEN '0000'
  WHEN code = 'BC' THEN '1111'
  WHEN code = 'MM' THEN '2222'
  WHEN code = 'VP' THEN '3333'
END
WHERE code IN ('CS', 'BC', 'MM', 'VP');