-- Migration: 001_create_base_tables.sql
-- Description: Create all base tables for Core Service ERP modules
-- Created: 2024-12-27
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- MODULE 1: BUSINESS PROFILE
-- =====================================================
CREATE TABLE IF NOT EXISTS business_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('business', 'household')),
    tax_number VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    owner_name VARCHAR(255),
    identity_number VARCHAR(50),
    fields_of_operation TEXT,
    sector TEXT [],
    accounting_regime VARCHAR(20) NOT NULL DEFAULT 'simple' CHECK (accounting_regime IN ('simple', 'standard')),
    start_data_date DATE NOT NULL,
    tax_calculation_method VARCHAR(20) DEFAULT 'deduction' CHECK (
        tax_calculation_method IN ('deduction', 'direct')
    ),
    accounting_currency VARCHAR(10) DEFAULT 'VND',
    tax_frequency VARCHAR(20) DEFAULT 'monthly' CHECK (tax_frequency IN ('monthly', 'quarterly')),
    use_invoice_machine BOOLEAN DEFAULT FALSE,
    inventory_method VARCHAR(20) DEFAULT 'fifo' CHECK (inventory_method IN ('fifo', 'lifo', 'average')),
    initial_cash_on_hand DECIMAL(18, 2) DEFAULT 0,
    initial_bank_balance DECIMAL(18, 2) DEFAULT 0,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_business_profile_tenant_id ON business_profile(tenant_id);

-- E-Invoice Provider
CREATE TABLE IF NOT EXISTS einvoice_provider (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    provider_code VARCHAR(50),
    api_url TEXT,
    username VARCHAR(255),
    password VARCHAR(255),
    tax_code VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    config JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_einvoice_provider_tenant_id ON einvoice_provider(tenant_id);

-- =====================================================
-- MODULE 2: CHART OF ACCOUNTS
-- =====================================================
CREATE TABLE IF NOT EXISTS chart_of_accounts_general (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_number VARCHAR(10) NOT NULL UNIQUE,
    account_name VARCHAR(255) NOT NULL,
    account_name_en VARCHAR(255),
    account_nature VARCHAR(10) NOT NULL CHECK (account_nature IN ('debit', 'credit', 'both')),
    account_level INTEGER NOT NULL,
    parent_account_number VARCHAR(10),
    description TEXT,
    accounting_regime VARCHAR(20) NOT NULL DEFAULT 'standard' CHECK (accounting_regime IN ('simple', 'standard')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chart_general_account_number ON chart_of_accounts_general(account_number);

CREATE INDEX idx_chart_general_parent ON chart_of_accounts_general(parent_account_number);

CREATE TABLE IF NOT EXISTS chart_of_accounts_custom (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    account_number VARCHAR(10) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_name_en VARCHAR(255),
    account_nature VARCHAR(10) NOT NULL CHECK (account_nature IN ('debit', 'credit', 'both')),
    account_level INTEGER NOT NULL,
    parent_id UUID,
    characteristics TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    UNIQUE(tenant_id, account_number)
);

CREATE INDEX idx_chart_custom_tenant_id ON chart_of_accounts_custom(tenant_id);

CREATE INDEX idx_chart_custom_account_number ON chart_of_accounts_custom(tenant_id, account_number);

CREATE INDEX idx_chart_custom_parent_id ON chart_of_accounts_custom(parent_id);

-- =====================================================
-- MODULE 3: ACCOUNTING OBJECTS
-- =====================================================
CREATE TABLE IF NOT EXISTS subject_group (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_subject_group_tenant_id ON subject_group(tenant_id);

CREATE TABLE IF NOT EXISTS accounting_object (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    account_object_code VARCHAR(50) NOT NULL,
    account_object_name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    is_customer BOOLEAN DEFAULT FALSE,
    is_vendor BOOLEAN DEFAULT FALSE,
    is_employee BOOLEAN DEFAULT FALSE,
    is_local_object BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    subject_group_id UUID,
    legal_representative VARCHAR(255),
    company_tax_code VARCHAR(50),
    pay_account_id UUID,
    receive_account_id UUID,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    list_bank_account_ids UUID [],
    identity_number VARCHAR(50),
    note TEXT,
    email VARCHAR(255),
    website VARCHAR(255),
    tax_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    UNIQUE(tenant_id, account_object_code),
    FOREIGN KEY (subject_group_id) REFERENCES subject_group(id) ON DELETE
    SET
        NULL
);

CREATE INDEX idx_accounting_object_tenant_id ON accounting_object(tenant_id);

CREATE INDEX idx_accounting_object_code ON accounting_object(tenant_id, account_object_code);

CREATE INDEX idx_accounting_object_customer ON accounting_object(tenant_id, is_customer)
WHERE
    is_customer = TRUE;

CREATE INDEX idx_accounting_object_vendor ON accounting_object(tenant_id, is_vendor)
WHERE
    is_vendor = TRUE;

CREATE INDEX idx_accounting_object_employee ON accounting_object(tenant_id, is_employee)
WHERE
    is_employee = TRUE;

-- =====================================================
-- MODULE 4: ITEMS (Hàng hóa dịch vụ)
-- =====================================================
CREATE TABLE IF NOT EXISTS item_category (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    UNIQUE(tenant_id, code),
    FOREIGN KEY (parent_id) REFERENCES item_category(id) ON DELETE
    SET
        NULL
);

CREATE INDEX idx_item_category_tenant_id ON item_category(tenant_id);

CREATE INDEX idx_item_category_parent_id ON item_category(parent_id);

CREATE TABLE IF NOT EXISTS unit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_unit_tenant_id ON unit(tenant_id);

CREATE TABLE IF NOT EXISTS item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('goods', 'service', 'material')),
    category_id UUID,
    description TEXT,
    unit_id UUID,
    sale_price DECIMAL(18, 2) DEFAULT 0,
    purchase_price DECIMAL(18, 2) DEFAULT 0,
    vat_rate DECIMAL(5, 2) DEFAULT 0,
    sale_account_id UUID,
    purchase_account_id UUID,
    inventory_account_id UUID,
    cogs_account_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    barcode VARCHAR(255),
    sku VARCHAR(255),
    minimum_stock DECIMAL(18, 4) DEFAULT 0,
    maximum_stock DECIMAL(18, 4),
    reorder_point DECIMAL(18, 4),
    default_warehouse_id UUID,
    default_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    UNIQUE(tenant_id, code),
    FOREIGN KEY (category_id) REFERENCES item_category(id) ON DELETE
    SET
        NULL,
        FOREIGN KEY (unit_id) REFERENCES unit(id) ON DELETE
    SET
        NULL
);

CREATE INDEX idx_item_tenant_id ON item(tenant_id);

CREATE INDEX idx_item_code ON item(tenant_id, code);

CREATE INDEX idx_item_type ON item(tenant_id, type);

CREATE INDEX idx_item_category ON item(category_id);

-- =====================================================
-- MODULE 5: WAREHOUSES
-- =====================================================
CREATE TABLE IF NOT EXISTS warehouse (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    manager_id UUID,
    inventory_account_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    UNIQUE(tenant_id, code)
);

CREATE INDEX idx_warehouse_tenant_id ON warehouse(tenant_id);

CREATE INDEX idx_warehouse_code ON warehouse(tenant_id, code);

-- =====================================================
-- MODULE 6: INVENTORY TRANSACTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_transaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    item_id UUID NOT NULL,
    warehouse_id UUID NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (
        transaction_type IN ('in', 'out', 'transfer', 'adjust')
    ),
    transaction_date DATE NOT NULL,
    quantity DECIMAL(18, 4) NOT NULL,
    unit_price DECIMAL(18, 2) DEFAULT 0,
    total_value DECIMAL(18, 2) DEFAULT 0,
    reference_id UUID,
    reference_type VARCHAR(50),
    reference_code VARCHAR(100),
    from_warehouse_id UUID,
    to_warehouse_id UUID,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE CASCADE,
    FOREIGN KEY (warehouse_id) REFERENCES warehouse(id) ON DELETE CASCADE,
    FOREIGN KEY (from_warehouse_id) REFERENCES warehouse(id) ON DELETE
    SET
        NULL,
        FOREIGN KEY (to_warehouse_id) REFERENCES warehouse(id) ON DELETE
    SET
        NULL
);

CREATE INDEX idx_inventory_transaction_tenant_id ON inventory_transaction(tenant_id);

CREATE INDEX idx_inventory_transaction_item ON inventory_transaction(item_id);

CREATE INDEX idx_inventory_transaction_warehouse ON inventory_transaction(warehouse_id);

CREATE INDEX idx_inventory_transaction_date ON inventory_transaction(transaction_date);

CREATE INDEX idx_inventory_transaction_reference ON inventory_transaction(reference_id, reference_type);

-- =====================================================
-- MODULE 7: BANK ACCOUNTS  
-- =====================================================
CREATE TABLE IF NOT EXISTS bank_account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    branch VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'VND',
    initial_balance DECIMAL(18, 2) DEFAULT 0,
    chart_of_account_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    UNIQUE(tenant_id, account_number)
);

CREATE INDEX idx_bank_account_tenant_id ON bank_account(tenant_id);

CREATE INDEX idx_bank_account_number ON bank_account(tenant_id, account_number);

-- =====================================================
-- Add missing tables from existing migrations
-- (These are referenced in 003, 004, 005 migrations)
-- =====================================================
-- Currency table (referenced in sales/invoices)
CREATE TABLE IF NOT EXISTS currency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default currencies
INSERT INTO
    currency (code, name, symbol, is_active)
VALUES
    ('VND', 'Vietnamese Dong', '₫', TRUE),
    ('USD', 'US Dollar', '$', TRUE),
    ('EUR', 'Euro', '€', TRUE) ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- TRIGGER: Update updated_at timestamp
-- =====================================================
CREATE
OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $ $ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;

RETURN NEW;

END;

$ $ LANGUAGE 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_business_profile_updated_at BEFORE
UPDATE
    ON business_profile FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_einvoice_provider_updated_at BEFORE
UPDATE
    ON einvoice_provider FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chart_custom_updated_at BEFORE
UPDATE
    ON chart_of_accounts_custom FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subject_group_updated_at BEFORE
UPDATE
    ON subject_group FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounting_object_updated_at BEFORE
UPDATE
    ON accounting_object FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_category_updated_at BEFORE
UPDATE
    ON item_category FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unit_updated_at BEFORE
UPDATE
    ON unit FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_updated_at BEFORE
UPDATE
    ON item FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warehouse_updated_at BEFORE
UPDATE
    ON warehouse FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_account_updated_at BEFORE
UPDATE
    ON bank_account FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
-- Grant all permissions to erp_admin (current user)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO erp_admin;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO erp_admin;

GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO erp_admin;