-- Migration 026: Migrate initial_stock ONLY to default warehouse (correct logic)
-- For items with initial_stock > 0 and WITHOUT an existing INITIAL_STOCK transaction,
-- create warehouse_item and inventory_transaction ONLY for the item's default_warehouse_id or initial_warehouse_id

DO $$
DECLARE
  r_item RECORD;
  v_warehouse_id uuid;
  v_qty numeric;
BEGIN
  FOR r_item IN
    SELECT id, tenant_id, initial_stock, purchase_price, default_warehouse_id, initial_warehouse_id
    FROM item
    WHERE COALESCE(initial_stock, 0) > 0
      AND is_deleted = FALSE
      AND NOT EXISTS (
        SELECT 1 FROM inventory_transaction it
        WHERE it.item_id = item.id
          AND it.reference_type = 'INITIAL_STOCK'
          AND it.is_deleted = FALSE
      )
  LOOP
    -- Determine warehouse: prefer initial_warehouse_id, fallback to default_warehouse_id
    v_warehouse_id := COALESCE(r_item.initial_warehouse_id, r_item.default_warehouse_id);
    
    -- Skip if no warehouse is defined
    IF v_warehouse_id IS NULL THEN
      CONTINUE;
    END IF;
    
    v_qty := COALESCE(r_item.initial_stock, 0);

    -- Create warehouse_item if missing
    INSERT INTO warehouse_item (id, tenant_id, warehouse_id, item_id, min_stock, is_active, is_deleted, created_at, updated_at)
    SELECT gen_random_uuid(), r_item.tenant_id, v_warehouse_id, r_item.id, 0, TRUE, FALSE, NOW(), NOW()
    WHERE NOT EXISTS (
      SELECT 1 FROM warehouse_item wi
      WHERE wi.item_id = r_item.id
        AND wi.warehouse_id = v_warehouse_id
        AND wi.is_deleted = FALSE
    );

    -- Insert inventory_transaction IN for default warehouse only
    INSERT INTO inventory_transaction (
      id, tenant_id, warehouse_id, item_id,
      transaction_type, quantity, unit_price, total_value,
      transaction_date, reference_type, ref_id, ref_type,
      is_deleted, created_at, updated_at
    )
    VALUES (
      gen_random_uuid(), r_item.tenant_id, v_warehouse_id, r_item.id,
      'in', v_qty, COALESCE(r_item.purchase_price, 0), COALESCE(r_item.purchase_price, 0) * v_qty,
      NOW(), 'INITIAL_STOCK', r_item.id, 'item', FALSE, NOW(), NOW()
    );
    
    RAISE NOTICE 'Migrated item % with initial_stock=% to warehouse=%', r_item.id, v_qty, v_warehouse_id;

  END LOOP;
END$$;

-- Summary notice
DO $$
BEGIN
  RAISE NOTICE 'Migration 026 complete: initial_stock migrated to default warehouses only';
END$$;
