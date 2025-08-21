-- Add isactive column to companies table
-- This script should be run in your Supabase SQL editor

-- Add the isactive column with a default value of true
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS isactive BOOLEAN DEFAULT true;

-- Update existing records to have isactive = true (for backward compatibility)
UPDATE companies 
SET isactive = true 
WHERE isactive IS NULL;

-- Create an index on isactive for better query performance
CREATE INDEX IF NOT EXISTS idx_companies_isactive ON companies(isactive);

-- Optional: Add a comment to document the column
COMMENT ON COLUMN companies.isactive IS 'Flag to indicate if the company is active (true) or soft deleted (false)'; 