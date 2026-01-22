DROP VIEW IF EXISTS stock_level_view;

CREATE VIEW stock_level_view AS
SELECT
  it.tenant_id AS tenant_id,
  it.tenant_id AS "tenantId",
  it.item_id AS item_id,
  it.item_id AS "itemId",
  i.code AS item_code,
  i.code AS "itemCode",
  i.name AS item_name,
  i.name AS "itemName",
  it.warehouse_id AS warehouse_id,
  it.warehouse_id AS "warehouseId",
  w.name AS warehouse_name,
  w.name AS "warehouseName",
  SUM(CASE WHEN it.transaction_type = 'in' THEN it.quantity WHEN it.transaction_type = 'out' THEN -it.quantity WHEN it.transaction_type = 'adjust' THEN it.quantity ELSE 0 END) AS quantity_on_hand,
  SUM(CASE WHEN it.transaction_type = 'in' THEN it.quantity WHEN it.transaction_type = 'out' THEN -it.quantity WHEN it.transaction_type = 'adjust' THEN it.quantity ELSE 0 END) AS "quantityOnHand",
  0 AS quantity_reserved,
  0 AS "quantityReserved",
  SUM(CASE WHEN it.transaction_type = 'in' THEN it.quantity WHEN it.transaction_type = 'out' THEN -it.quantity WHEN it.transaction_type = 'adjust' THEN it.quantity ELSE 0 END) AS quantity_available,
  SUM(CASE WHEN it.transaction_type = 'in' THEN it.quantity WHEN it.transaction_type = 'out' THEN -it.quantity WHEN it.transaction_type = 'adjust' THEN it.quantity ELSE 0 END) AS "quantityAvailable",
  CASE WHEN SUM(CASE WHEN it.transaction_type = 'in' THEN it.quantity WHEN it.transaction_type = 'out' THEN -it.quantity WHEN it.transaction_type = 'adjust' THEN it.quantity ELSE 0 END) > 0 THEN SUM(CASE WHEN it.transaction_type = 'in' THEN it.total_value ELSE 0 END) / NULLIF(SUM(CASE WHEN it.transaction_type = 'in' THEN it.quantity WHEN it.transaction_type = 'out' THEN -it.quantity WHEN it.transaction_type = 'adjust' THEN it.quantity ELSE 0 END),0) ELSE 0 END AS average_unit_price,
  CASE WHEN SUM(CASE WHEN it.transaction_type = 'in' THEN it.quantity WHEN it.transaction_type = 'out' THEN -it.quantity WHEN it.transaction_type = 'adjust' THEN it.quantity ELSE 0 END) > 0 THEN SUM(CASE WHEN it.transaction_type = 'in' THEN it.total_value ELSE 0 END) / NULLIF(SUM(CASE WHEN it.transaction_type = 'in' THEN it.quantity WHEN it.transaction_type = 'out' THEN -it.quantity WHEN it.transaction_type = 'adjust' THEN it.quantity ELSE 0 END),0) ELSE 0 END AS "averageUnitPrice",
  SUM(CASE WHEN it.transaction_type = 'in' THEN it.quantity WHEN it.transaction_type = 'out' THEN -it.quantity WHEN it.transaction_type = 'adjust' THEN it.quantity ELSE 0 END) * CASE WHEN SUM(CASE WHEN it.transaction_type = 'in' THEN it.quantity WHEN it.transaction_type = 'out' THEN -it.quantity WHEN it.transaction_type = 'adjust' THEN it.quantity ELSE 0 END) > 0 THEN SUM(CASE WHEN it.transaction_type = 'in' THEN it.total_value ELSE 0 END) / NULLIF(SUM(CASE WHEN it.transaction_type = 'in' THEN it.quantity WHEN it.transaction_type = 'out' THEN -it.quantity WHEN it.transaction_type = 'adjust' THEN it.quantity ELSE 0 END),0) ELSE 0 END AS total_value,
  SUM(CASE WHEN it.transaction_type = 'in' THEN it.quantity WHEN it.transaction_type = 'out' THEN -it.quantity WHEN it.transaction_type = 'adjust' THEN it.quantity ELSE 0 END) * CASE WHEN SUM(CASE WHEN it.transaction_type = 'in' THEN it.quantity WHEN it.transaction_type = 'out' THEN -it.quantity WHEN it.transaction_type = 'adjust' THEN it.quantity ELSE 0 END) > 0 THEN SUM(CASE WHEN it.transaction_type = 'in' THEN it.total_value ELSE 0 END) / NULLIF(SUM(CASE WHEN it.transaction_type = 'in' THEN it.quantity WHEN it.transaction_type = 'out' THEN -it.quantity WHEN it.transaction_type = 'adjust' THEN it.quantity ELSE 0 END),0) ELSE 0 END AS "totalValue"
FROM inventory_transaction it
LEFT JOIN item i ON it.item_id = i.id
LEFT JOIN warehouse w ON it.warehouse_id = w.id
WHERE it.is_deleted = false
GROUP BY it.tenant_id, it.item_id, i.code, i.name, it.warehouse_id, w.name;
