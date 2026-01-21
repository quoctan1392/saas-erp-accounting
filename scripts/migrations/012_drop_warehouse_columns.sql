-- 012_drop_warehouse_columns.sql
-- Drop columns added in migration 011 that are not required: description, manager_name, manager_phone

ALTER TABLE warehouse
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS manager_name,
  DROP COLUMN IF EXISTS manager_phone;

-- Optionally add a comment recording why these were dropped
COMMENT ON TABLE warehouse IS 'Columns description, manager_name, manager_phone removed by migration 012';
