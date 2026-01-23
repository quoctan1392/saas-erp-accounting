-- Test create Matcha item manually
BEGIN;

-- Insert item
INSERT INTO item (
  id, tenant_id, code, name, type, unit_id, 
  sell_price, purchase_price,
  initial_stock, initial_warehouse_id, default_warehouse_id,
  minimum_stock, is_deleted, created_at, updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '4abd8de1-168b-47fa-a226-ea6feeabf123',
  'MATCHA-001',
  'Matcha Premium',
  'goods',
  'd3029d03-1243-4cae-9108-a30ac71cdd28',
  150000,
  100000,
  200,
  '95e56a76-fd5b-4124-8e79-10242aad0b1a',
  '95e56a76-fd5b-4124-8e79-10242aad0b1a',
  20,
  false,
  NOW(),
  NOW()
);

-- Insert warehouse_item
INSERT INTO warehouse_item (
  id, tenant_id, warehouse_id, item_id,
  min_stock, is_active, is_deleted,
  created_at, updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '4abd8de1-168b-47fa-a226-ea6feeabf123',
  '95e56a76-fd5b-4124-8e79-10242aad0b1a',
  '11111111-1111-1111-1111-111111111111',
  20,
  true,
  false,
  NOW(),
  NOW()
);

-- Insert inventory_transaction (IN)
INSERT INTO inventory_transaction (
  id, tenant_id, warehouse_id, item_id,
  transaction_type, quantity, unit_price, total_value,
  transaction_date, reference_type,
  is_deleted, created_at, updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '4abd8de1-168b-47fa-a226-ea6feeabf123',
  '95e56a76-fd5b-4124-8e79-10242aad0b1a',
  '11111111-1111-1111-1111-111111111111',
  'in',
  200,
  100000,
  20000000,
  NOW(),
  'INITIAL_STOCK',
  false,
  NOW(),
  NOW()
);

COMMIT;
