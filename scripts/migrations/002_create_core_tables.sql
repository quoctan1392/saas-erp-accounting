-- Migration: Create core service tables
-- Database: core_db

\c core_db;

-- Create base entity columns function
CREATE OR REPLACE FUNCTION create_base_columns() RETURNS TEXT AS $$
BEGIN
  RETURN '
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
  ';
END;
$$ LANGUAGE plpgsql;

-- Subject Groups Table
CREATE TABLE IF NOT EXISTS subject_group (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  group_code VARCHAR NOT NULL,
  group_name VARCHAR NOT NULL,
  UNIQUE(tenant_id, group_code)
);

-- Accounting Objects Table (Customers/Vendors/Employees)
CREATE TABLE IF NOT EXISTS object (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  account_object_code VARCHAR NOT NULL,
  account_object_name VARCHAR NOT NULL,
  address TEXT,
  phone VARCHAR,
  is_customer BOOLEAN DEFAULT FALSE,
  is_vendor BOOLEAN DEFAULT FALSE,
  is_employee BOOLEAN DEFAULT FALSE,
  is_local_object BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  subject_group_id UUID REFERENCES subject_group(id),
  legal_representative VARCHAR,
  company_tax_code VARCHAR,
  pay_account_id UUID,
  receive_account_id UUID,
  contact_name VARCHAR,
  contact_phone VARCHAR,
  contact_email VARCHAR,
  list_bank_account_ids TEXT,
  identity_number VARCHAR,
  note TEXT,
  email VARCHAR,
  website VARCHAR,
  tax_code VARCHAR,
  UNIQUE(tenant_id, account_object_code)
);

CREATE INDEX IF NOT EXISTS idx_object_tenant_id ON object(tenant_id);
CREATE INDEX IF NOT EXISTS idx_object_is_customer ON object(is_customer);
CREATE INDEX IF NOT EXISTS idx_object_is_vendor ON object(is_vendor);
CREATE INDEX IF NOT EXISTS idx_object_is_employee ON object(is_employee);

-- Chart of Accounts Table
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  account_code VARCHAR NOT NULL,
  account_name VARCHAR NOT NULL,
  account_type VARCHAR NOT NULL,
  parent_id UUID REFERENCES chart_of_accounts(id),
  is_system_account BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  UNIQUE(tenant_id, account_code)
);

CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_tenant_id ON chart_of_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_parent_id ON chart_of_accounts(parent_id);

-- Items/Products Table
CREATE TABLE IF NOT EXISTS item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  item_code VARCHAR NOT NULL,
  item_name VARCHAR NOT NULL,
  unit VARCHAR,
  unit_price DECIMAL(18, 2) DEFAULT 0,
  cost_price DECIMAL(18, 2) DEFAULT 0,
  vat_rate DECIMAL(5, 2) DEFAULT 0,
  is_service BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  UNIQUE(tenant_id, item_code)
);

CREATE INDEX IF NOT EXISTS idx_item_tenant_id ON item(tenant_id);

-- Warehouses Table
CREATE TABLE IF NOT EXISTS warehouse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  warehouse_code VARCHAR NOT NULL,
  warehouse_name VARCHAR NOT NULL,
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(tenant_id, warehouse_code)
);

CREATE INDEX IF NOT EXISTS idx_warehouse_tenant_id ON warehouse(tenant_id);

-- Bank Accounts Table
CREATE TABLE IF NOT EXISTS bank_account (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  bank_code VARCHAR NOT NULL,
  bank_name VARCHAR NOT NULL,
  account_number VARCHAR NOT NULL,
  account_name VARCHAR,
  branch VARCHAR,
  currency VARCHAR DEFAULT 'VND',
  is_active BOOLEAN DEFAULT TRUE,
  opening_balance DECIMAL(18, 2) DEFAULT 0,
  current_balance DECIMAL(18, 2) DEFAULT 0,
  UNIQUE(tenant_id, bank_code)
);

CREATE INDEX IF NOT EXISTS idx_bank_account_tenant_id ON bank_account(tenant_id);

COMMIT;
