-- Migration: Insert INITIAL_STOCK inventory_transaction rows
-- Inserts a single 'in' inventory_transaction for each item that has
-- initial_stock > 0 but no existing transaction with ref_type = 'INITIAL_STOCK'.
-- Also creates warehouse_item records if missing.
-- Requires: gen_random_uuid() extension available (pgcrypto) and careful review before running in production.

BEGIN;

-- Step 1: Create warehouse_item records for items that have initial_stock but no warehouse_item
INSERT INTO warehouse_item (
  id,
  tenant_id,
  warehouse_id,
  item_id,
  min_stock,
  is_active,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid() AS id,
  i.tenant_id,
  COALESCE(i.default_warehouse_id, i.initial_warehouse_id) AS warehouse_id,
  i.id AS item_id,
  COALESCE(i.minimum_stock, 0) AS min_stock,
  true AS is_active,
  now() AS created_at,
  now() AS updated_at
FROM item i
WHERE (i.initial_stock IS NOT NULL AND i.initial_stock::numeric > 0)
  AND COALESCE(i.default_warehouse_id, i.initial_warehouse_id) IS NOT NULL
  AND i.is_deleted = false
  AND NOT EXISTS (
    SELECT 1 FROM warehouse_item wi
    WHERE wi.item_id = i.id 
      AND wi.warehouse_id = COALESCE(i.default_warehouse_id, i.initial_warehouse_id)
      AND wi.is_deleted = false
  )
ON CONFLICT (tenant_id, warehouse_id, item_id) DO NOTHING;

-- Step 2: Create INITIAL_STOCK inventory transactions for items missing them
INSERT INTO inventory_transaction (
  id,
  tenant_id,
  created_at,
  updated_at,
  created_by,
  transaction_type,
  transaction_date,
  item_id,
  warehouse_id,
  quantity,
  unit_price,
  total_value,
  description,
  reference_id,
  reference_type,
  reference_code,
  is_deleted
)
SELECT
  gen_random_uuid() AS id,
  i.tenant_id,
  now() AS created_at,
  now() AS updated_at,
  i.created_by,
  'in'::text AS transaction_type,
  now()::date AS transaction_date,
  i.id AS item_id,
  COALESCE(i.default_warehouse_id, i.initial_warehouse_id) AS warehouse_id,
  i.initial_stock::decimal AS quantity,
  COALESCE(i.purchase_price, 0)::decimal AS unit_price,
  (i.initial_stock::numeric * COALESCE(i.purchase_price,0)::numeric) AS total_value,
  'Migration: create initial stock transaction from item.initial_stock' AS description,
  i.id AS reference_id,
  'INITIAL_STOCK' AS reference_type,
  concat('INITIAL-', i.code, '-', to_char(now(), 'YYYYMMDDHH24MISS')) AS reference_code,
  false AS is_deleted
FROM item i
WHERE (i.initial_stock IS NOT NULL AND i.initial_stock::numeric > 0)
  AND COALESCE(i.default_warehouse_id, i.initial_warehouse_id) IS NOT NULL
  AND i.is_deleted = false
  AND NOT EXISTS (
    SELECT 1 FROM inventory_transaction it
    WHERE it.item_id = i.id AND it.reference_type = 'INITIAL_STOCK'
  );

COMMIT;

-- Notes:
-- - Items without any associated warehouse (default_warehouse_id and initial_warehouse_id both NULL)
--   are skipped and should be handled manually.
-- - Review unit_price assignment: uses item.purchase_price or 0 if missing.
-- - Run on staging first and verify `stock_level_view` and API responses before applying to production.
