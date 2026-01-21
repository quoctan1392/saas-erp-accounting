-- Migration: Change list_bank_account_ids from UUID[] to TEXT[]
-- Date: 2026-01-21
-- Reason: Frontend sends bank account numbers (strings) not UUIDs

-- Change column type from UUID[] to TEXT[]
ALTER TABLE accounting_object 
ALTER COLUMN list_bank_account_ids TYPE TEXT[];

-- Add comment
COMMENT ON COLUMN accounting_object.list_bank_account_ids IS 'List of bank account numbers (text array)';
