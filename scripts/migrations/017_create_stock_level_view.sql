-- Migration: Create stock_level_view for inventory reporting
-- Creates a materialized or standard view to compute aggregated stock levels

CREATE OR REPLACE VIEW stock_level_view AS
SELECT 
  it.tenant_id AS "tenantId",
  it.item_id AS "itemId",
  i.code AS "itemCode",
  i.name AS "itemName",
  it.warehouse_id AS "warehouseId",
  w.name AS "warehouseName",
  SUM(CASE 
    WHEN it.transaction_type = 'in' THEN it.quantity
    WHEN it.transaction_type = 'out' THEN -it.quantity
    WHEN it.transaction_type = 'adjust' THEN it.quantity
    ELSE 0
  END) AS "quantityOnHand",
  0 AS "quantityReserved",
  SUM(CASE 
    WHEN it.transaction_type = 'in' THEN it.quantity
    WHEN it.transaction_type = 'out' THEN -it.quantity
    WHEN it.transaction_type = 'adjust' THEN it.quantity
    ELSE 0
  END) AS "quantityAvailable",
  CASE 
    WHEN SUM(CASE 
      WHEN it.transaction_type = 'in' THEN it.quantity
      WHEN it.transaction_type = 'out' THEN -it.quantity
      WHEN it.transaction_type = 'adjust' THEN it.quantity
      ELSE 0
    END) > 0 
    THEN SUM(CASE 
      WHEN it.transaction_type = 'in' THEN it.total_value
      ELSE 0
    END) / SUM(CASE 
      WHEN it.transaction_type = 'in' THEN it.quantity
      WHEN it.transaction_type = 'out' THEN -it.quantity
      WHEN it.transaction_type = 'adjust' THEN it.quantity
      ELSE 0
    END)
    ELSE 0
  END AS "averageUnitPrice",
  SUM(CASE 
    WHEN it.transaction_type = 'in' THEN it.quantity
    WHEN it.transaction_type = 'out' THEN -it.quantity
    WHEN it.transaction_type = 'adjust' THEN it.quantity
    ELSE 0
  END) * 
  CASE 
    WHEN SUM(CASE 
      WHEN it.transaction_type = 'in' THEN it.quantity
      WHEN it.transaction_type = 'out' THEN -it.quantity
      WHEN it.transaction_type = 'adjust' THEN it.quantity
      ELSE 0
    END) > 0 
    THEN SUM(CASE 
      WHEN it.transaction_type = 'in' THEN it.total_value
      ELSE 0
    END) / SUM(CASE 
      WHEN it.transaction_type = 'in' THEN it.quantity
      WHEN it.transaction_type = 'out' THEN -it.quantity
      WHEN it.transaction_type = 'adjust' THEN it.quantity
      ELSE 0
    END)
    ELSE 0
  END AS "totalValue"
FROM inventory_transaction it
LEFT JOIN item i ON it.item_id = i.id
LEFT JOIN warehouse w ON it.warehouse_id = w.id
WHERE it.is_deleted = false
GROUP BY 
  it.tenant_id,
  it.item_id,
  i.code,
  i.name,
  it.warehouse_id,
  w.name;
