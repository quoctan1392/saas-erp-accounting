-- Migration 021: Sync inventory_transaction table schema with entity
-- Add missing columns: transaction_no, posted_date, ref_id, ref_type, status

ALTER TABLE inventory_transaction
  ADD COLUMN IF NOT EXISTS transaction_no VARCHAR(50),
  ADD COLUMN IF NOT EXISTS posted_date TIMESTAMP,
  ADD COLUMN IF NOT EXISTS ref_id UUID,
  ADD COLUMN IF NOT EXISTS ref_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';

-- Migrate reference_id -> ref_id, reference_type -> ref_type for existing rows
UPDATE inventory_transaction
SET ref_id = reference_id,
    ref_type = reference_type,
    status = 'posted', -- assume existing transactions are posted
    transaction_no = 'TXN-' || id::TEXT
WHERE ref_id IS NULL;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_inventory_transaction_transaction_no ON inventory_transaction(tenant_id, transaction_no);
CREATE INDEX IF NOT EXISTS idx_inventory_transaction_ref ON inventory_transaction(ref_id, ref_type);
CREATE INDEX IF NOT EXISTS idx_inventory_transaction_status ON inventory_transaction(tenant_id, status);

COMMENT ON COLUMN inventory_transaction.transaction_no IS 'Transaction number (auto-generated or manual)';
COMMENT ON COLUMN inventory_transaction.posted_date IS 'Date when transaction was posted/finalized';
COMMENT ON COLUMN inventory_transaction.ref_id IS 'Reference ID to source document';
COMMENT ON COLUMN inventory_transaction.ref_type IS 'Type of reference document';
COMMENT ON COLUMN inventory_transaction.status IS 'Transaction status: draft or posted';
