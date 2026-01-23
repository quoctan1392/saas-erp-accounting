-- Migration 024: Fix stock_level_view double counting
-- Remove initial_stock from calculation since it's already in inventory_transaction

DROP VIEW IF EXISTS stock_level_view;

CREATE VIEW stock_level_view AS
SELECT
  wi.tenant_id AS tenant_id,
  wi.tenant_id AS "tenantId",
  wi.item_id AS item_id,
  wi.item_id AS "itemId",
  i.code AS item_code,
  i.code AS "itemCode",
  i.name AS item_name,
  i.name AS "itemName",
  wi.warehouse_id AS warehouse_id,
  wi.warehouse_id AS "warehouseId",
  w.name AS warehouse_name,
  w.name AS "warehouseName",
  
  -- Quantity on hand = sum of transactions ONLY (initial_stock already in transactions)
  COALESCE(
    (SELECT SUM(
      CASE 
        WHEN it.transaction_type = 'in' THEN it.quantity
        WHEN it.transaction_type = 'out' THEN -it.quantity
        WHEN it.transaction_type = 'adjust' THEN it.quantity
        ELSE 0
      END
    )
    FROM inventory_transaction it
    WHERE it.item_id = wi.item_id
      AND it.warehouse_id = wi.warehouse_id
      AND it.is_deleted = FALSE
    ), 0
  ) AS quantity_on_hand,
  
  COALESCE(
    (SELECT SUM(
      CASE 
        WHEN it.transaction_type = 'in' THEN it.quantity
        WHEN it.transaction_type = 'out' THEN -it.quantity
        WHEN it.transaction_type = 'adjust' THEN it.quantity
        ELSE 0
      END
    )
    FROM inventory_transaction it
    WHERE it.item_id = wi.item_id
      AND it.warehouse_id = wi.warehouse_id
      AND it.is_deleted = FALSE
    ), 0
  ) AS "quantityOnHand",
  
  -- Reserved quantity (placeholder for future)
  0 AS quantity_reserved,
  0 AS "quantityReserved",
  
  -- Available = on_hand - reserved
  COALESCE(
    (SELECT SUM(
      CASE 
        WHEN it.transaction_type = 'in' THEN it.quantity
        WHEN it.transaction_type = 'out' THEN -it.quantity
        WHEN it.transaction_type = 'adjust' THEN it.quantity
        ELSE 0
      END
    )
    FROM inventory_transaction it
    WHERE it.item_id = wi.item_id
      AND it.warehouse_id = wi.warehouse_id
      AND it.is_deleted = FALSE
    ), 0
  ) AS quantity_available,
  
  COALESCE(
    (SELECT SUM(
      CASE 
        WHEN it.transaction_type = 'in' THEN it.quantity
        WHEN it.transaction_type = 'out' THEN -it.quantity
        WHEN it.transaction_type = 'adjust' THEN it.quantity
        ELSE 0
      END
    )
    FROM inventory_transaction it
    WHERE it.item_id = wi.item_id
      AND it.warehouse_id = wi.warehouse_id
      AND it.is_deleted = FALSE
    ), 0
  ) AS "quantityAvailable",
  
  -- Average unit price
  CASE 
    WHEN COALESCE(
      (SELECT SUM(
        CASE 
          WHEN it.transaction_type = 'in' THEN it.quantity
          ELSE 0
        END
      )
      FROM inventory_transaction it
      WHERE it.item_id = wi.item_id
        AND it.warehouse_id = wi.warehouse_id
        AND it.is_deleted = FALSE
      ), 0
    ) > 0
    THEN COALESCE(
      (SELECT SUM(
        CASE 
          WHEN it.transaction_type = 'in' THEN it.total_value
          ELSE 0
        END
      )
      FROM inventory_transaction it
      WHERE it.item_id = wi.item_id
        AND it.warehouse_id = wi.warehouse_id
        AND it.is_deleted = FALSE
      ), 0
    ) / NULLIF(COALESCE(
      (SELECT SUM(
        CASE 
          WHEN it.transaction_type = 'in' THEN it.quantity
          ELSE 0
        END
      )
      FROM inventory_transaction it
      WHERE it.item_id = wi.item_id
        AND it.warehouse_id = wi.warehouse_id
        AND it.is_deleted = FALSE
      ), 0
    ), 0)
    ELSE 0
  END AS average_unit_price,
  
  CASE 
    WHEN COALESCE(
      (SELECT SUM(
        CASE 
          WHEN it.transaction_type = 'in' THEN it.quantity
          ELSE 0
        END
      )
      FROM inventory_transaction it
      WHERE it.item_id = wi.item_id
        AND it.warehouse_id = wi.warehouse_id
        AND it.is_deleted = FALSE
      ), 0
    ) > 0
    THEN COALESCE(
      (SELECT SUM(
        CASE 
          WHEN it.transaction_type = 'in' THEN it.total_value
          ELSE 0
        END
      )
      FROM inventory_transaction it
      WHERE it.item_id = wi.item_id
        AND it.warehouse_id = wi.warehouse_id
        AND it.is_deleted = FALSE
      ), 0
    ) / NULLIF(COALESCE(
      (SELECT SUM(
        CASE 
          WHEN it.transaction_type = 'in' THEN it.quantity
          ELSE 0
        END
      )
      FROM inventory_transaction it
      WHERE it.item_id = wi.item_id
        AND it.warehouse_id = wi.warehouse_id
        AND it.is_deleted = FALSE
      ), 0
    ), 0)
    ELSE 0
  END AS "averageUnitPrice",
  
  -- Total value (quantity * avg price)
  (COALESCE(
    (SELECT SUM(
      CASE 
        WHEN it.transaction_type = 'in' THEN it.quantity
        WHEN it.transaction_type = 'out' THEN -it.quantity
        WHEN it.transaction_type = 'adjust' THEN it.quantity
        ELSE 0
      END
    )
    FROM inventory_transaction it
    WHERE it.item_id = wi.item_id
      AND it.warehouse_id = wi.warehouse_id
      AND it.is_deleted = FALSE
    ), 0
  )) * 
  CASE 
    WHEN COALESCE(
      (SELECT SUM(
        CASE 
          WHEN it.transaction_type = 'in' THEN it.quantity
          ELSE 0
        END
      )
      FROM inventory_transaction it
      WHERE it.item_id = wi.item_id
        AND it.warehouse_id = wi.warehouse_id
        AND it.is_deleted = FALSE
      ), 0
    ) > 0
    THEN COALESCE(
      (SELECT SUM(
        CASE 
          WHEN it.transaction_type = 'in' THEN it.total_value
          ELSE 0
        END
      )
      FROM inventory_transaction it
      WHERE it.item_id = wi.item_id
        AND it.warehouse_id = wi.warehouse_id
        AND it.is_deleted = FALSE
      ), 0
    ) / NULLIF(COALESCE(
      (SELECT SUM(
        CASE 
          WHEN it.transaction_type = 'in' THEN it.quantity
          ELSE 0
        END
      )
      FROM inventory_transaction it
      WHERE it.item_id = wi.item_id
        AND it.warehouse_id = wi.warehouse_id
        AND it.is_deleted = FALSE
      ), 0
    ), 0)
    ELSE 0
  END AS total_value,
  
  (COALESCE(
    (SELECT SUM(
      CASE 
        WHEN it.transaction_type = 'in' THEN it.quantity
        WHEN it.transaction_type = 'out' THEN -it.quantity
        WHEN it.transaction_type = 'adjust' THEN it.quantity
        ELSE 0
      END
    )
    FROM inventory_transaction it
    WHERE it.item_id = wi.item_id
      AND it.warehouse_id = wi.warehouse_id
      AND it.is_deleted = FALSE
    ), 0
  )) * 
  CASE 
    WHEN COALESCE(
      (SELECT SUM(
        CASE 
          WHEN it.transaction_type = 'in' THEN it.quantity
          ELSE 0
        END
      )
      FROM inventory_transaction it
      WHERE it.item_id = wi.item_id
        AND it.warehouse_id = wi.warehouse_id
        AND it.is_deleted = FALSE
      ), 0
    ) > 0
    THEN COALESCE(
      (SELECT SUM(
        CASE 
          WHEN it.transaction_type = 'in' THEN it.total_value
          ELSE 0
        END
      )
      FROM inventory_transaction it
      WHERE it.item_id = wi.item_id
        AND it.warehouse_id = wi.warehouse_id
        AND it.is_deleted = FALSE
      ), 0
    ) / NULLIF(COALESCE(
      (SELECT SUM(
        CASE 
          WHEN it.transaction_type = 'in' THEN it.quantity
          ELSE 0
        END
      )
      FROM inventory_transaction it
      WHERE it.item_id = wi.item_id
        AND it.warehouse_id = wi.warehouse_id
        AND it.is_deleted = FALSE
      ), 0
    ), 0)
    ELSE 0
  END AS "totalValue",
  
  -- Warehouse-specific thresholds from warehouse_item
  wi.min_stock AS min_stock,
  wi.min_stock AS "minStock",
  wi.max_stock AS max_stock,
  wi.max_stock AS "maxStock",
  wi.reorder_point AS reorder_point,
  wi.reorder_point AS "reorderPoint"
  
FROM warehouse_item wi
INNER JOIN item i ON wi.item_id = i.id AND i.is_deleted = FALSE
INNER JOIN warehouse w ON wi.warehouse_id = w.id AND w.is_deleted = FALSE
WHERE wi.is_deleted = FALSE
  AND wi.is_active = TRUE;

COMMENT ON VIEW stock_level_view IS 'Stock levels calculated from inventory transactions only (initial_stock already recorded as transactions)';
