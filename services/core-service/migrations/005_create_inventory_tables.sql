-- Migration: Create Inventory Tables
-- Description: Creates inventory_transaction table for tracking stock movements

-- Create inventory_transaction table
CREATE TABLE IF NOT EXISTS inventory_transaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  item_id UUID NOT NULL,
  warehouse_id UUID NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('in', 'out', 'transfer', 'adjust')),
  transaction_no VARCHAR(50) NOT NULL,
  transaction_date DATE NOT NULL,
  posted_date TIMESTAMP,
  quantity DECIMAL(15, 4) NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description TEXT,
  target_warehouse_id UUID,
  ref_id UUID,
  ref_type VARCHAR(50),
  employee_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,

  CONSTRAINT fk_inventory_transaction_item FOREIGN KEY (item_id) REFERENCES item(id),
  CONSTRAINT fk_inventory_transaction_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouse(id),
  CONSTRAINT fk_inventory_transaction_target_warehouse FOREIGN KEY (target_warehouse_id) REFERENCES warehouse(id)
);

-- Create indexes
CREATE INDEX idx_inventory_transaction_tenant_id ON inventory_transaction(tenant_id);
CREATE INDEX idx_inventory_transaction_tenant_item_warehouse ON inventory_transaction(tenant_id, item_id, warehouse_id);
CREATE INDEX idx_inventory_transaction_tenant_transaction_no ON inventory_transaction(tenant_id, transaction_no);
CREATE INDEX idx_inventory_transaction_tenant_transaction_date ON inventory_transaction(tenant_id, transaction_date);
CREATE INDEX idx_inventory_transaction_ref ON inventory_transaction(ref_id, ref_type);
CREATE INDEX idx_inventory_transaction_status ON inventory_transaction(tenant_id, status);

-- Create stock level view
CREATE OR REPLACE VIEW stock_level_view AS
SELECT 
  it.tenant_id,
  it.item_id,
  i.code as item_code,
  i.name as item_name,
  it.warehouse_id,
  w.name as warehouse_name,
  SUM(CASE 
    WHEN it.transaction_type = 'in' THEN it.quantity
    WHEN it.transaction_type = 'out' THEN -it.quantity
    WHEN it.transaction_type = 'adjust' THEN it.quantity
    ELSE 0
  END) as quantity_on_hand,
  0 as quantity_reserved,
  SUM(CASE 
    WHEN it.transaction_type = 'in' THEN it.quantity
    WHEN it.transaction_type = 'out' THEN -it.quantity
    WHEN it.transaction_type = 'adjust' THEN it.quantity
    ELSE 0
  END) as quantity_available,
  CASE 
    WHEN SUM(CASE 
      WHEN it.transaction_type = 'in' THEN it.quantity
      WHEN it.transaction_type = 'out' THEN -it.quantity
      WHEN it.transaction_type = 'adjust' THEN it.quantity
      ELSE 0
    END) > 0 
    THEN SUM(CASE 
      WHEN it.transaction_type = 'in' THEN it.amount
      ELSE 0
    END) / SUM(CASE 
      WHEN it.transaction_type = 'in' THEN it.quantity
      WHEN it.transaction_type = 'out' THEN -it.quantity
      WHEN it.transaction_type = 'adjust' THEN it.quantity
      ELSE 0
    END)
    ELSE 0
  END as average_unit_price,
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
      WHEN it.transaction_type = 'in' THEN it.amount
      ELSE 0
    END) / SUM(CASE 
      WHEN it.transaction_type = 'in' THEN it.quantity
      WHEN it.transaction_type = 'out' THEN -it.quantity
      WHEN it.transaction_type = 'adjust' THEN it.quantity
      ELSE 0
    END)
    ELSE 0
  END as total_value
FROM inventory_transaction it
LEFT JOIN item i ON it.item_id = i.id
LEFT JOIN warehouse w ON it.warehouse_id = w.id
WHERE it.status = 'posted' AND it.is_deleted = FALSE
GROUP BY it.tenant_id, it.item_id, i.code, i.name, it.warehouse_id, w.name;

-- Add comment
COMMENT ON TABLE inventory_transaction IS 'Stores all inventory movements including IN, OUT, TRANSFER, and ADJUST transactions';
COMMENT ON VIEW stock_level_view IS 'Real-time view of stock levels by item and warehouse';

-- Enable Row Level Security
ALTER TABLE inventory_transaction ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for tenant isolation
CREATE POLICY tenant_isolation_policy ON inventory_transaction
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Grant permissions (adjust as needed)
GRANT SELECT, INSERT, UPDATE ON inventory_transaction TO core_service_user;
GRANT SELECT ON stock_level_view TO core_service_user;
