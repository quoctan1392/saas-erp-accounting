-- Migration: Create bank_account table
-- Description: Tạo bảng bank_account để quản lý tài khoản ngân hàng
-- Create bank_account table
CREATE TABLE IF NOT EXISTS bank_account (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    -- Bank account information
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    initial_balance DECIMAL(15, 2) DEFAULT 0 NOT NULL,
    account_id UUID NOT NULL,
    -- Link to chart_of_accounts_custom
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    -- Indexes
    CONSTRAINT uk_bank_account_number UNIQUE (tenant_id, account_number, is_deleted)
);

-- Create indexes
CREATE INDEX idx_bank_account_tenant_id ON bank_account(tenant_id);

CREATE INDEX idx_bank_account_account_id ON bank_account(account_id);

CREATE INDEX idx_bank_account_is_active ON bank_account(is_active);

CREATE INDEX idx_bank_account_is_deleted ON bank_account(is_deleted);

-- Add foreign key constraint to chart_of_accounts_custom
-- ALTER TABLE bank_account 
-- ADD CONSTRAINT fk_bank_account_chart_account 
-- FOREIGN KEY (account_id) REFERENCES chart_of_accounts_custom(id);
-- Add comment
COMMENT ON TABLE bank_account IS 'Quản lý tài khoản ngân hàng';

COMMENT ON COLUMN bank_account.bank_name IS 'Tên ngân hàng';

COMMENT ON COLUMN bank_account.account_number IS 'Số tài khoản';

COMMENT ON COLUMN bank_account.initial_balance IS 'Số dư ban đầu';

COMMENT ON COLUMN bank_account.account_id IS 'ID của tài khoản trong Chart of Accounts custom (112x)';