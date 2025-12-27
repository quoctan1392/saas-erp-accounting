-- Migration: 004_fix_invoice_tables.sql
-- Description: Create invoice tables without tenants FK constraint
-- Date: 2024-12-27
CREATE TABLE IF NOT EXISTS invoice (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    -- Invoice Information
    invoice_form VARCHAR(50) NOT NULL,
    invoice_sign VARCHAR(50) NOT NULL,
    invoice_number VARCHAR(50),
    invoice_date DATE NOT NULL,
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    CHECK (status IN ('draft', 'published', 'cancelled')),
    -- Reference to source document
    ref_id UUID,
    ref_type VARCHAR(50),
    -- Customer/Buyer Information
    account_object_id UUID,
    account_object_name VARCHAR(255) NOT NULL,
    account_object_address TEXT,
    account_object_tax_code VARCHAR(50),
    identity_number VARCHAR(50),
    phone_number VARCHAR(20),
    -- Payment Information
    payment_method VARCHAR(20) NOT NULL DEFAULT 'cash',
    CHECK (
        payment_method IN ('cash', 'bank_transfer', 'both')
    ),
    -- Currency Information
    currency_id UUID,
    exchange_rate DECIMAL(18, 6) NOT NULL DEFAULT 1,
    -- Amounts
    total_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    total_discount_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    total_vat_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    total_payment DECIMAL(18, 2) NOT NULL DEFAULT 0,
    -- Electronic Invoice Provider Info
    einvoice_provider_id UUID,
    einvoice_transaction_id VARCHAR(255),
    einvoice_url TEXT,
    -- Metadata
    note TEXT,
    created_by UUID,
    updated_by UUID,
    published_by UUID,
    published_at TIMESTAMP,
    cancelled_by UUID,
    cancelled_at TIMESTAMP,
    cancel_reason TEXT,
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_invoice_number UNIQUE (
        tenant_id,
        invoice_form,
        invoice_sign,
        invoice_number
    ),
    FOREIGN KEY (account_object_id) REFERENCES accounting_object(id) ON DELETE
    SET
        NULL,
        FOREIGN KEY (einvoice_provider_id) REFERENCES einvoice_provider(id) ON DELETE
    SET
        NULL,
        FOREIGN KEY (currency_id) REFERENCES currency(id) ON DELETE
    SET
        NULL
);

CREATE TABLE IF NOT EXISTS invoice_detail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    -- Item Information
    item_id UUID,
    item_code VARCHAR(50) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    -- Description
    description TEXT,
    -- Unit Information
    unit_id UUID,
    unit_name VARCHAR(50) NOT NULL,
    -- Quantity and Price
    quantity DECIMAL(18, 4) NOT NULL DEFAULT 0,
    unit_price DECIMAL(18, 2) NOT NULL DEFAULT 0,
    amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    -- Discount
    discount_rate DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(18, 2) DEFAULT 0,
    amount_after_discount DECIMAL(18, 2) DEFAULT 0,
    -- VAT
    vat_rate DECIMAL(5, 2) DEFAULT 0,
    vat_amount DECIMAL(18, 2) DEFAULT 0,
    total_amount DECIMAL(18, 2) DEFAULT 0,
    -- Sort Order
    sort_order INTEGER DEFAULT 0,
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoice(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES item(id) ON DELETE
    SET
        NULL,
        FOREIGN KEY (unit_id) REFERENCES unit(id) ON DELETE
    SET
        NULL
);

-- Indexes for invoice
CREATE INDEX IF NOT EXISTS idx_invoice_tenant_id ON invoice(tenant_id);

CREATE INDEX IF NOT EXISTS idx_invoice_status ON invoice(status);

CREATE INDEX IF NOT EXISTS idx_invoice_date ON invoice(invoice_date);

CREATE INDEX IF NOT EXISTS idx_invoice_account_object ON invoice(account_object_id);

CREATE INDEX IF NOT EXISTS idx_invoice_ref ON invoice(ref_id, ref_type);

-- Indexes for invoice_detail
CREATE INDEX IF NOT EXISTS idx_invoice_detail_invoice_id ON invoice_detail(invoice_id);

CREATE INDEX IF NOT EXISTS idx_invoice_detail_item_id ON invoice_detail(item_id);

-- Update trigger for invoice
CREATE TRIGGER update_invoice_updated_at BEFORE
UPDATE
    ON invoice FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for invoice_detail
CREATE TRIGGER update_invoice_detail_updated_at BEFORE
UPDATE
    ON invoice_detail FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();