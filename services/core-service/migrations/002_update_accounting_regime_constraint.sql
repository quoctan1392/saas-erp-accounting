-- Migration: Update accounting_regime check constraint to support Circular 200 and 133
-- Date: 2026-01-04
BEGIN;

-- Drop the old check constraint
ALTER TABLE
    chart_of_accounts_general DROP CONSTRAINT IF EXISTS chart_of_accounts_general_accounting_regime_check;

-- Add new check constraint supporting '200' and '133'
ALTER TABLE
    chart_of_accounts_general
ADD
    CONSTRAINT chart_of_accounts_general_accounting_regime_check CHECK (
        accounting_regime IN ('simple', 'standard', '200', '133')
    );

-- Update existing 'simple' to '133' and 'standard' to '200' (optional, if needed)
-- UPDATE chart_of_accounts_general SET accounting_regime = '200' WHERE accounting_regime = 'standard';
-- UPDATE chart_of_accounts_general SET accounting_regime = '133' WHERE accounting_regime = 'simple';
COMMIT;