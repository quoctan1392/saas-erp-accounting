-- Migration: Fix opening_balance.account_id to be nullable
-- Date: 2026-01-06
-- Description: Make account_id nullable since we use accountNumber as primary identifier

-- Make account_id nullable
ALTER TABLE opening_balance 
ALTER COLUMN account_id DROP NOT NULL;

-- Add index on account_number for better query performance
CREATE INDEX IF NOT EXISTS idx_opening_balance_account_number 
ON opening_balance(tenant_id, account_number);

-- Update constraint to check uniqueness by account_number instead of account_id
-- Drop old unique constraint if exists
ALTER TABLE opening_balance 
DROP CONSTRAINT IF EXISTS uq_opening_balance_account;

-- Add new unique constraint using account_number
ALTER TABLE opening_balance 
ADD CONSTRAINT uq_opening_balance_account_number 
UNIQUE (tenant_id, period_id, account_number, currency_id);
