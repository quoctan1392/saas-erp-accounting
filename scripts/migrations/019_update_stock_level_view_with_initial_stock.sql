DROP VIEW IF EXISTS stock_level_view;

CREATE VIEW stock_level_view AS
SELECT
  i.tenant_id AS tenant_id,
  i.tenant_id AS "tenantId",
  i.id AS item_id,
  i.id AS "itemId",
  i.code AS item_code,
  i.code AS "itemCode",
  i.name AS item_name,
  i.name AS "itemName",
  COALESCE(w.id, i.default_warehouse_id, i.initial_warehouse_id) AS warehouse_id,
  COALESCE(w.id, i.default_warehouse_id, i.initial_warehouse_id) AS "warehouseId",
  COALESCE(w.name, 'Default') AS warehouse_name,
  COALESCE(w.name, 'Default') AS "warehouseName",
  
  -- Quantity on hand = initial_stock + sum of transactions
  COALESCE(i.initial_stock, 0) + COALESCE(
    SUM(
      CASE 
        WHEN it.transaction_type = 'in' THEN it.quantity
        WHEN it.transaction_type = 'out' THEN -it.quantity
        WHEN it.transaction_type = 'adjust' THEN it.quantity
        ELSE 0
      END
    ), 0
  ) AS quantity_on_hand,
  
  COALESCE(i.initial_stock, 0) + COALESCE(
    SUM(
      CASE 
        WHEN it.transaction_type = 'in' THEN it.quantity
        WHEN it.transaction_type = 'out' THEN -it.quantity
        WHEN it.transaction_type = 'adjust' THEN it.quantity
        ELSE 0
      END
    ), 0
  ) AS "quantityOnHand",
  
  -- Reserved quantity (placeholder for future)
  0 AS quantity_reserved,
  0 AS "quantityReserved",
  
  -- Available = on_hand - reserved
  COALESCE(i.initial_stock, 0) + COALESCE(
    SUM(
      CASE 
        WHEN it.transaction_type = 'in' THEN it.quantity
        WHEN it.transaction_type = 'out' THEN -it.quantity
        WHEN it.transaction_type = 'adjust' THEN it.quantity
        ELSE 0
      END
    ), 0
  ) AS quantity_available,
  
  COALESCE(i.initial_stock, 0) + COALESCE(
    SUM(
      CASE 
        WHEN it.transaction_type = 'in' THEN it.quantity
        WHEN it.transaction_type = 'out' THEN -it.quantity
        WHEN it.transaction_type = 'adjust' THEN it.quantity
        ELSE 0
      END
    ), 0
  ) AS "quantityAvailable",
  
  -- Average unit price calculation
  CASE 
    WHEN (COALESCE(i.initial_stock, 0) + COALESCE(
      SUM(
        CASE 
          WHEN it.transaction_type = 'in' THEN it.quantity
          WHEN it.transaction_type = 'out' THEN -it.quantity
          WHEN it.transaction_type = 'adjust' THEN it.quantity
          ELSE 0
        END
      ), 0
    )) > 0 
    THEN COALESCE(SUM(CASE WHEN it.transaction_type = 'in' THEN it.total_value ELSE 0 END), 0) / 
         NULLIF((COALESCE(i.initial_stock, 0) + COALESCE(
           SUM(
             CASE 
               WHEN it.transaction_type = 'in' THEN it.quantity
               WHEN it.transaction_type = 'out' THEN -it.quantity
               WHEN it.transaction_type = 'adjust' THEN it.quantity
               ELSE 0
             END
           ), 0
         )), 0)
    ELSE 0 
  END AS average_unit_price,
  
  CASE 
    WHEN (COALESCE(i.initial_stock, 0) + COALESCE(
      SUM(
        CASE 
          WHEN it.transaction_type = 'in' THEN it.quantity
          WHEN it.transaction_type = 'out' THEN -it.quantity
          WHEN it.transaction_type = 'adjust' THEN it.quantity
          ELSE 0
        END
      ), 0
    )) > 0 
    THEN COALESCE(SUM(CASE WHEN it.transaction_type = 'in' THEN it.total_value ELSE 0 END), 0) / 
         NULLIF((COALESCE(i.initial_stock, 0) + COALESCE(
           SUM(
             CASE 
               WHEN it.transaction_type = 'in' THEN it.quantity
               WHEN it.transaction_type = 'out' THEN -it.quantity
               WHEN it.transaction_type = 'adjust' THEN it.quantity
               ELSE 0
             END
           ), 0
         )), 0)
    ELSE 0 
  END AS "averageUnitPrice",
  
  -- Total value
  (COALESCE(i.initial_stock, 0) + COALESCE(
    SUM(
      CASE 
        WHEN it.transaction_type = 'in' THEN it.quantity
        WHEN it.transaction_type = 'out' THEN -it.quantity
        WHEN it.transaction_type = 'adjust' THEN it.quantity
        ELSE 0
      END
    ), 0
  )) * 
  CASE 
    WHEN (COALESCE(i.initial_stock, 0) + COALESCE(
      SUM(
        CASE 
          WHEN it.transaction_type = 'in' THEN it.quantity
          WHEN it.transaction_type = 'out' THEN -it.quantity
          WHEN it.transaction_type = 'adjust' THEN it.quantity
          ELSE 0
        END
      ), 0
    )) > 0 
    THEN COALESCE(SUM(CASE WHEN it.transaction_type = 'in' THEN it.total_value ELSE 0 END), 0) / 
         NULLIF((COALESCE(i.initial_stock, 0) + COALESCE(
           SUM(
             CASE 
               WHEN it.transaction_type = 'in' THEN it.quantity
               WHEN it.transaction_type = 'out' THEN -it.quantity
               WHEN it.transaction_type = 'adjust' THEN it.quantity
               ELSE 0
             END
           ), 0
         )), 0)
    ELSE 0 
  END AS total_value,
  
  (COALESCE(i.initial_stock, 0) + COALESCE(
    SUM(
      CASE 
        WHEN it.transaction_type = 'in' THEN it.quantity
        WHEN it.transaction_type = 'out' THEN -it.quantity
        WHEN it.transaction_type = 'adjust' THEN it.quantity
        ELSE 0
      END
    ), 0
  )) * 
  CASE 
    WHEN (COALESCE(i.initial_stock, 0) + COALESCE(
      SUM(
        CASE 
          WHEN it.transaction_type = 'in' THEN it.quantity
          WHEN it.transaction_type = 'out' THEN -it.quantity
          WHEN it.transaction_type = 'adjust' THEN it.quantity
          ELSE 0
        END
      ), 0
    )) > 0 
    THEN COALESCE(SUM(CASE WHEN it.transaction_type = 'in' THEN it.total_value ELSE 0 END), 0) / 
         NULLIF((COALESCE(i.initial_stock, 0) + COALESCE(
           SUM(
             CASE 
               WHEN it.transaction_type = 'in' THEN it.quantity
               WHEN it.transaction_type = 'out' THEN -it.quantity
               WHEN it.transaction_type = 'adjust' THEN it.quantity
               ELSE 0
             END
           ), 0
         )), 0)
    ELSE 0 
  END AS "totalValue"
  
FROM item i
LEFT JOIN inventory_transaction it ON i.id = it.item_id AND it.is_deleted = false
LEFT JOIN warehouse w ON it.warehouse_id = w.id
WHERE i.is_deleted = false
GROUP BY 
  i.tenant_id, 
  i.id, 
  i.code, 
  i.name, 
  i.initial_stock,
  i.default_warehouse_id,
  i.initial_warehouse_id,
  w.id, 
  w.name;

COMMENT ON VIEW stock_level_view IS 'Real-time stock levels including initial_stock from item table plus inventory transactions';
