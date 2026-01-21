-- Migration 016: Add soft delete columns to voucher entities
-- Add is_deleted and deleted_at to entities that inherit from BaseEntity pattern

-- Add to outward_voucher (already exists, confirmed in table check)
-- Add to receipt_voucher (already exists, confirmed in table check)

-- These columns already exist in the database but not in the entities
-- No DB changes needed - entities need to be updated to extend BaseEntity instead

-- For consistency, ensure all other tables have these columns too
ALTER TABLE inventory_transaction ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE inventory_transaction ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

ALTER TABLE outward_voucher_detail ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE outward_voucher_detail ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

ALTER TABLE receipt_voucher_detail ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE receipt_voucher_detail ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

ALTER TABLE sale_voucher_detail ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE sale_voucher_detail ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
