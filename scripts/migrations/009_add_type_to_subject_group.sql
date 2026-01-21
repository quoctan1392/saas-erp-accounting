-- Migration: Add type column to subject_group table
-- Date: 2026-01-21

-- Add type column to subject_group table
ALTER TABLE subject_group 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'both';

-- Set default value for existing rows
UPDATE subject_group 
SET type = 'both' 
WHERE type IS NULL;

-- Add comment
COMMENT ON COLUMN subject_group.type IS 'Type of subject group: customer, vendor, or both';
