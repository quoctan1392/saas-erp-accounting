-- Migration: 003_create_sales_tables.sql
-- Description: Create tables for Sales module (Sale Voucher, Outward Voucher, Receipt Voucher)
-- Created: 2024-12-23

-- =====================================================
-- SALE VOUCHER (Chứng từ bán hàng)
-- =====================================================

CREATE TABLE IF NOT EXISTS sale_voucher (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL,
    transaction_no VARCHAR(50) NOT NULL,
    transaction_date DATE NOT NULL,
    posted_date DATE,
    transaction_code VARCHAR(50) NOT NULL,
    payment_type VARCHAR(20) NOT NULL DEFAULT 'pay_later' CHECK (payment_type IN ('pay_later', 'pay_now')),
    payment_method VARCHAR(20) NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank_transfer')),
    is_sale_with_outward BOOLEAN DEFAULT FALSE,
    is_sale_with_invoice BOOLEAN DEFAULT FALSE,
    account_object_id UUID NOT NULL,
    account_object_name VARCHAR(255) NOT NULL,
    account_object_address TEXT,
    account_object_tax_code VARCHAR(50),
    currency_id UUID NOT NULL,
    exchange_rate DECIMAL(18, 6) DEFAULT 1,
    total_sale_amount_oc DECIMAL(18, 2) DEFAULT 0,
    total_sale_amount DECIMAL(18, 2) DEFAULT 0,
    total_amount DECIMAL(18, 2) DEFAULT 0,
    total_discount_amount DECIMAL(18, 2) DEFAULT 0,
    discount_type VARCHAR(30) NOT NULL DEFAULT 'not_discount' CHECK (discount_type IN ('not_discount', 'by_item', 'by_invoice_amount', 'by_percent')),
    total_vat_amount DECIMAL(18, 2) DEFAULT 0,
    total_export_tax_amount DECIMAL(18, 2) DEFAULT 0,
    employee_id UUID,
    discount_rate DECIMAL(5, 2) DEFAULT 0,
    attached_file_ids TEXT[],
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Indexes for sale_voucher
CREATE INDEX idx_sale_voucher_tenant_id ON sale_voucher(tenant_id);
CREATE INDEX idx_sale_voucher_status ON sale_voucher(status);
CREATE INDEX idx_sale_voucher_transaction_date ON sale_voucher(transaction_date);
CREATE INDEX idx_sale_voucher_account_object_id ON sale_voucher(account_object_id);
CREATE INDEX idx_sale_voucher_code ON sale_voucher(tenant_id, code);

-- =====================================================
-- SALE VOUCHER DETAIL (Chi tiết chứng từ bán hàng)
-- =====================================================

CREATE TABLE IF NOT EXISTS sale_voucher_detail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_voucher_id UUID NOT NULL REFERENCES sale_voucher(id) ON DELETE CASCADE,
    item_id UUID NOT NULL,
    description TEXT,
    unit_id UUID NOT NULL,
    quantity DECIMAL(18, 2) NOT NULL,
    unit_price_oc DECIMAL(18, 2) NOT NULL,
    unit_price DECIMAL(18, 2) NOT NULL,
    amount_oc DECIMAL(18, 2) NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    discount_rate DECIMAL(5, 2) DEFAULT 0,
    discount_amount DECIMAL(18, 2) DEFAULT 0,
    vat_rate DECIMAL(5, 2) DEFAULT 0,
    vat_amount DECIMAL(18, 2) DEFAULT 0,
    export_tax_rate DECIMAL(5, 2) DEFAULT 0,
    export_tax_amount DECIMAL(18, 2) DEFAULT 0,
    revenue_account_id UUID NOT NULL,
    discount_account_id UUID,
    vat_account_id UUID,
    sort_order INTEGER DEFAULT 0
);

-- Indexes for sale_voucher_detail
CREATE INDEX idx_sale_voucher_detail_voucher_id ON sale_voucher_detail(sale_voucher_id);
CREATE INDEX idx_sale_voucher_detail_item_id ON sale_voucher_detail(item_id);

-- =====================================================
-- OUTWARD VOUCHER (Phiếu xuất kho)
-- =====================================================

CREATE TABLE IF NOT EXISTS outward_voucher (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL,
    sale_voucher_ref_id UUID,
    transaction_no VARCHAR(50) NOT NULL,
    transaction_date DATE NOT NULL,
    posted_date DATE,
    account_object_id UUID NOT NULL,
    employee_id UUID,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Indexes for outward_voucher
CREATE INDEX idx_outward_voucher_tenant_id ON outward_voucher(tenant_id);
CREATE INDEX idx_outward_voucher_status ON outward_voucher(status);
CREATE INDEX idx_outward_voucher_transaction_date ON outward_voucher(transaction_date);
CREATE INDEX idx_outward_voucher_sale_ref ON outward_voucher(sale_voucher_ref_id);

-- =====================================================
-- OUTWARD VOUCHER DETAIL (Chi tiết phiếu xuất kho)
-- =====================================================

CREATE TABLE IF NOT EXISTS outward_voucher_detail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outward_voucher_id UUID NOT NULL REFERENCES outward_voucher(id) ON DELETE CASCADE,
    item_id UUID NOT NULL,
    unit_id UUID NOT NULL,
    quantity DECIMAL(18, 2) NOT NULL,
    unit_price DECIMAL(18, 2) NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    warehouse_id UUID NOT NULL,
    inventory_account_id UUID NOT NULL,
    cogs_account_id UUID NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0
);

-- Indexes for outward_voucher_detail
CREATE INDEX idx_outward_voucher_detail_voucher_id ON outward_voucher_detail(outward_voucher_id);
CREATE INDEX idx_outward_voucher_detail_item_id ON outward_voucher_detail(item_id);
CREATE INDEX idx_outward_voucher_detail_warehouse_id ON outward_voucher_detail(warehouse_id);

-- =====================================================
-- RECEIPT VOUCHER (Phiếu thu tiền)
-- =====================================================

CREATE TABLE IF NOT EXISTS receipt_voucher (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    sale_voucher_ref_id UUID,
    transaction_no VARCHAR(50) NOT NULL,
    transaction_date DATE NOT NULL,
    posted_date DATE,
    account_object_id UUID NOT NULL,
    employee_id UUID,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'posted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Indexes for receipt_voucher
CREATE INDEX idx_receipt_voucher_tenant_id ON receipt_voucher(tenant_id);
CREATE INDEX idx_receipt_voucher_status ON receipt_voucher(status);
CREATE INDEX idx_receipt_voucher_transaction_date ON receipt_voucher(transaction_date);
CREATE INDEX idx_receipt_voucher_sale_ref ON receipt_voucher(sale_voucher_ref_id);

-- =====================================================
-- RECEIPT VOUCHER DETAIL (Chi tiết phiếu thu tiền)
-- =====================================================

CREATE TABLE IF NOT EXISTS receipt_voucher_detail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_voucher_id UUID NOT NULL REFERENCES receipt_voucher(id) ON DELETE CASCADE,
    debit_account_id UUID NOT NULL,
    credit_account_id UUID NOT NULL,
    amount DECIMAL(18, 2) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0
);

-- Indexes for receipt_voucher_detail
CREATE INDEX idx_receipt_voucher_detail_voucher_id ON receipt_voucher_detail(receipt_voucher_id);
CREATE INDEX idx_receipt_voucher_detail_debit_account ON receipt_voucher_detail(debit_account_id);
CREATE INDEX idx_receipt_voucher_detail_credit_account ON receipt_voucher_detail(credit_account_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all sales tables
ALTER TABLE sale_voucher ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_voucher_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE outward_voucher ENABLE ROW LEVEL SECURITY;
ALTER TABLE outward_voucher_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_voucher ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_voucher_detail ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies should be created based on your tenant isolation strategy
-- Example policy (uncomment and adjust as needed):
-- CREATE POLICY tenant_isolation_policy ON sale_voucher
--     USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE sale_voucher IS 'Chứng từ bán hàng - Sales vouchers';
COMMENT ON TABLE sale_voucher_detail IS 'Chi tiết chứng từ bán hàng - Sales voucher details';
COMMENT ON TABLE outward_voucher IS 'Phiếu xuất kho - Outward/delivery vouchers';
COMMENT ON TABLE outward_voucher_detail IS 'Chi tiết phiếu xuất kho - Outward voucher details';
COMMENT ON TABLE receipt_voucher IS 'Phiếu thu tiền - Receipt vouchers';
COMMENT ON TABLE receipt_voucher_detail IS 'Chi tiết phiếu thu tiền - Receipt voucher details';
