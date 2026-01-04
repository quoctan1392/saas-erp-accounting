-- =====================================================
-- Migration: 004_create_invoice_tables.sql
-- Description: Create invoice and invoice_detail tables
-- Author: System
-- Date: 2024-12-23
-- =====================================================
-- Drop tables if exist (for clean migration)
DROP TABLE IF EXISTS invoice_detail CASCADE;

DROP TABLE IF EXISTS invoice CASCADE;

-- =====================================================
-- Table: invoice
-- Description: Hóa đơn (Invoice)
-- =====================================================
CREATE TABLE invoice (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    -- Invoice Information
    invoice_form VARCHAR(50) NOT NULL,
    -- Mẫu số hóa đơn
    invoice_sign VARCHAR(50) NOT NULL,
    -- Ký hiệu hóa đơn
    invoice_number VARCHAR(50),
    -- Số hóa đơn (auto-generated when published)
    invoice_date DATE NOT NULL,
    -- Ngày hóa đơn
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    -- draft | published | cancelled
    CHECK (status IN ('draft', 'published', 'cancelled')),
    -- Reference to source document
    ref_id UUID,
    -- ID chứng từ liên quan
    ref_type VARCHAR(50),
    -- sale_voucher | purchase_voucher | etc
    -- Customer/Buyer Information
    account_object_id UUID NOT NULL,
    -- ID đối tượng (khách hàng/người mua)
    account_object_name VARCHAR(255) NOT NULL,
    -- Tên đối tượng
    account_object_address TEXT,
    -- Địa chỉ
    account_object_tax_code VARCHAR(50),
    -- Mã số thuế
    identity_number VARCHAR(50),
    -- CMND/CCCD (nếu cá nhân)
    phone_number VARCHAR(20),
    -- Số điện thoại
    -- Payment Information
    payment_method VARCHAR(20) NOT NULL DEFAULT 'cash',
    -- cash | bank_transfer | both
    CHECK (
        payment_method IN ('cash', 'bank_transfer', 'both')
    ),
    -- Currency Information
    currency_id UUID NOT NULL,
    -- Loại tiền
    exchange_rate DECIMAL(18, 6) NOT NULL DEFAULT 1,
    -- Tỷ giá
    -- Amounts
    total_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    -- Tổng tiền hàng
    total_discount_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    -- Tổng chiết khấu
    total_vat_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    -- Tổng thuế GTGT
    total_payment DECIMAL(18, 2) NOT NULL DEFAULT 0,
    -- Tổng thanh toán (sau thuế)
    -- Electronic Invoice Provider Info (if applicable)
    einvoice_provider_id UUID,
    -- ID nhà cung cấp hóa đơn điện tử
    einvoice_transaction_id VARCHAR(255),
    -- ID giao dịch từ nhà cung cấp
    einvoice_url TEXT,
    -- URL hóa đơn điện tử
    -- Metadata
    note TEXT,
    -- Ghi chú
    created_by UUID,
    -- User tạo
    updated_by UUID,
    -- User cập nhật
    published_by UUID,
    -- User phát hành
    published_at TIMESTAMP,
    -- Thời gian phát hành
    cancelled_by UUID,
    -- User hủy
    cancelled_at TIMESTAMP,
    -- Thời gian hủy
    cancel_reason TEXT,
    -- Lý do hủy
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    -- Indexes
    CONSTRAINT fk_invoice_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT uq_invoice_number UNIQUE (
        tenant_id,
        invoice_form,
        invoice_sign,
        invoice_number
    )
);

-- =====================================================
-- Table: invoice_detail
-- Description: Chi tiết hóa đơn (Invoice Line Items)
-- =====================================================
CREATE TABLE invoice_detail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL,
    -- Item Information
    item_id UUID NOT NULL,
    -- ID hàng hóa
    item_code VARCHAR(50) NOT NULL,
    -- Mã hàng hóa
    item_name VARCHAR(255) NOT NULL,
    -- Tên hàng hóa
    -- Description
    description TEXT,
    -- Mô tả
    -- Unit Information
    unit_id UUID NOT NULL,
    -- Đơn vị tính
    unit_name VARCHAR(50) NOT NULL,
    -- Tên đơn vị
    -- Quantity and Price
    quantity DECIMAL(18, 3) NOT NULL,
    -- Số lượng
    unit_price DECIMAL(18, 2) NOT NULL,
    -- Đơn giá
    amount DECIMAL(18, 2) NOT NULL,
    -- Thành tiền (quantity * unit_price)
    -- Discount
    discount_rate DECIMAL(5, 2) DEFAULT 0,
    -- % chiết khấu
    discount_amount DECIMAL(18, 2) DEFAULT 0,
    -- Tiền chiết khấu
    -- VAT
    vat_rate DECIMAL(5, 2) DEFAULT 0,
    -- % thuế GTGT
    vat_amount DECIMAL(18, 2) DEFAULT 0,
    -- Tiền thuế GTGT
    -- Total
    total_amount DECIMAL(18, 2) NOT NULL,
    -- Tổng cộng (sau thuế)
    -- Display Order
    line_number INTEGER NOT NULL,
    -- Số thứ tự dòng
    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Constraints
    CONSTRAINT fk_invoice_detail_invoice FOREIGN KEY (invoice_id) REFERENCES invoice(id) ON DELETE CASCADE,
    CONSTRAINT chk_quantity_positive CHECK (quantity > 0),
    CONSTRAINT chk_unit_price_non_negative CHECK (unit_price >= 0)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================
-- Invoice table indexes
CREATE INDEX idx_invoice_tenant_id ON invoice(tenant_id);

CREATE INDEX idx_invoice_status ON invoice(status);

CREATE INDEX idx_invoice_date ON invoice(invoice_date);

CREATE INDEX idx_invoice_account_object ON invoice(account_object_id);

CREATE INDEX idx_invoice_ref ON invoice(ref_type, ref_id);

CREATE INDEX idx_invoice_number ON invoice(tenant_id, invoice_number)
WHERE
    invoice_number IS NOT NULL;

CREATE INDEX idx_invoice_created_at ON invoice(created_at);

-- Invoice detail table indexes
CREATE INDEX idx_invoice_detail_invoice_id ON invoice_detail(invoice_id);

CREATE INDEX idx_invoice_detail_item_id ON invoice_detail(item_id);

CREATE INDEX idx_invoice_detail_line_number ON invoice_detail(invoice_id, line_number);

-- =====================================================
-- Row Level Security (RLS) for Multi-tenancy
-- =====================================================
-- Enable RLS
ALTER TABLE
    invoice ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    invoice_detail ENABLE ROW LEVEL SECURITY;

-- RLS Policy for invoice
CREATE POLICY invoice_tenant_isolation ON invoice FOR ALL USING (
    tenant_id = current_setting('app.current_tenant_id', TRUE) :: UUID
);

-- RLS Policy for invoice_detail (inherit from invoice)
CREATE POLICY invoice_detail_tenant_isolation ON invoice_detail FOR ALL USING (
    invoice_id IN (
        SELECT
            id
        FROM
            invoice
        WHERE
            tenant_id = current_setting('app.current_tenant_id', TRUE) :: UUID
    )
);

-- =====================================================
-- Triggers for updated_at
-- =====================================================
-- Function to update updated_at timestamp
CREATE
OR REPLACE FUNCTION update_invoice_updated_at() RETURNS TRIGGER AS $ $ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;

RETURN NEW;

END;

$ $ LANGUAGE plpgsql;

-- Trigger for invoice
CREATE TRIGGER trg_invoice_updated_at BEFORE
UPDATE
    ON invoice FOR EACH ROW EXECUTE FUNCTION update_invoice_updated_at();

-- Trigger for invoice_detail
CREATE TRIGGER trg_invoice_detail_updated_at BEFORE
UPDATE
    ON invoice_detail FOR EACH ROW EXECUTE FUNCTION update_invoice_updated_at();

-- =====================================================
-- Comments for Documentation
-- =====================================================
COMMENT ON TABLE invoice IS 'Hóa đơn (Invoice) - Lưu trữ thông tin hóa đơn';

COMMENT ON TABLE invoice_detail IS 'Chi tiết hóa đơn (Invoice Line Items)';

COMMENT ON COLUMN invoice.status IS 'Trạng thái hóa đơn: draft (nháp), published (đã phát hành), cancelled (đã hủy)';

COMMENT ON COLUMN invoice.invoice_number IS 'Số hóa đơn tự động sinh khi phát hành';

COMMENT ON COLUMN invoice.ref_type IS 'Loại chứng từ gốc: sale_voucher, purchase_voucher, etc';

COMMENT ON COLUMN invoice.payment_method IS 'Phương thức thanh toán: cash (tiền mặt), bank_transfer (chuyển khoản), both (cả hai)';

-- =====================================================
-- Grant Permissions
-- =====================================================
-- Grant permissions to application role (adjust role name as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON invoice TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON invoice_detail TO app_user;
-- =====================================================
-- End of Migration
-- =====================================================