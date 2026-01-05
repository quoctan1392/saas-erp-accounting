-- ==================================================================================
-- Migration: 007_create_opening_balance_tables.sql
-- Description: Create tables for Opening Balance Declaration module
-- Author: Core Service Team
-- Date: 2026-01-04
-- ==================================================================================
-- Table 1: opening_period - Quản lý các kỳ khởi tạo số dư ban đầu
CREATE TABLE IF NOT EXISTS opening_period (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    period_name VARCHAR(255) NOT NULL,
    opening_date DATE NOT NULL,
    description TEXT,
    is_locked BOOLEAN DEFAULT false,
    locked_at TIMESTAMP,
    locked_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID,
    CONSTRAINT unique_opening_period_name UNIQUE(tenant_id, period_name)
);

CREATE INDEX idx_opening_period_tenant ON opening_period(tenant_id);

CREATE INDEX idx_opening_period_date ON opening_period(tenant_id, opening_date);

CREATE INDEX idx_opening_period_locked ON opening_period(tenant_id, is_locked);

COMMENT ON TABLE opening_period IS 'Quản lý các kỳ khởi tạo số dư ban đầu';

COMMENT ON COLUMN opening_period.period_name IS 'Tên kỳ khởi tạo (VD: "Kỳ đầu năm 2024")';

COMMENT ON COLUMN opening_period.opening_date IS 'Ngày khởi tạo số dư';

COMMENT ON COLUMN opening_period.is_locked IS 'Đã chốt kỳ - không cho phép sửa/xóa số dư';

COMMENT ON COLUMN opening_period.locked_at IS 'Thời gian chốt kỳ';

COMMENT ON COLUMN opening_period.locked_by IS 'User thực hiện chốt kỳ';

-- ==================================================================================
-- Table 2: opening_balance - Số dư tài khoản ban đầu
CREATE TABLE IF NOT EXISTS opening_balance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    period_id UUID NOT NULL REFERENCES opening_period(id) ON DELETE CASCADE,
    currency_id UUID NOT NULL,
    -- Reference to currency table (to be created)
    account_id UUID NOT NULL,
    -- Reference to chart_of_accounts
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    debit_balance DECIMAL(19, 4) DEFAULT 0 CHECK (debit_balance >= 0),
    credit_balance DECIMAL(19, 4) DEFAULT 0 CHECK (credit_balance >= 0),
    has_details BOOLEAN DEFAULT false,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID,
    CONSTRAINT unique_opening_balance UNIQUE(tenant_id, period_id, account_id, currency_id),
    CONSTRAINT check_not_both_debit_credit CHECK (
        NOT (
            debit_balance > 0
            AND credit_balance > 0
        )
    )
);

CREATE INDEX idx_opening_balance_tenant ON opening_balance(tenant_id);

CREATE INDEX idx_opening_balance_period ON opening_balance(period_id);

CREATE INDEX idx_opening_balance_account ON opening_balance(account_id);

CREATE INDEX idx_opening_balance_currency ON opening_balance(currency_id);

CREATE INDEX idx_opening_balance_has_details ON opening_balance(tenant_id, has_details);

CREATE INDEX idx_opening_balance_account_number ON opening_balance(tenant_id, account_number);

COMMENT ON TABLE opening_balance IS 'Số dư ban đầu theo tài khoản kế toán';

COMMENT ON COLUMN opening_balance.period_id IS 'ID kỳ khởi tạo';

COMMENT ON COLUMN opening_balance.currency_id IS 'Loại tiền (VND, USD, ...)';

COMMENT ON COLUMN opening_balance.account_id IS 'ID tài khoản kế toán';

COMMENT ON COLUMN opening_balance.account_number IS 'Số tài khoản (VD: 111, 112, 131)';

COMMENT ON COLUMN opening_balance.account_name IS 'Tên tài khoản (cached for performance)';

COMMENT ON COLUMN opening_balance.debit_balance IS 'Dư Nợ (>= 0)';

COMMENT ON COLUMN opening_balance.credit_balance IS 'Dư Có (>= 0)';

COMMENT ON COLUMN opening_balance.has_details IS 'true: có chi tiết phân tích, false: chỉ nhập tổng';

COMMENT ON CONSTRAINT check_not_both_debit_credit ON opening_balance IS 'Không cho phép Dư Nợ và Dư Có cùng > 0';

-- ==================================================================================
-- Table 3: opening_balance_detail - Chi tiết số dư theo các chiều phân tích
CREATE TABLE IF NOT EXISTS opening_balance_detail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    balance_id UUID NOT NULL REFERENCES opening_balance(id) ON DELETE CASCADE,
    -- Các chiều phân tích nghiệp vụ (optional - flexible design)
    department_id UUID,
    -- Đơn vị
    cost_item_id UUID,
    -- Khoản mục chi phí
    cost_object_id UUID,
    -- Đối tượng tổng hợp chi phí
    project_id UUID,
    -- Công trình
    sales_order_id UUID,
    -- Đơn đặt hàng
    purchase_order_id UUID,
    -- Đơn mua hàng
    sales_contract_id UUID,
    -- Hợp đồng bán
    purchase_contract_id UUID,
    -- Hợp đồng mua
    statistical_code_id UUID,
    -- Mã thống kê
    account_object_id UUID,
    -- Đối tượng (Khách hàng, Nhà cung cấp, Nhân viên)
    -- Giá trị kế toán
    debit_balance DECIMAL(19, 4) DEFAULT 0 CHECK (debit_balance >= 0),
    credit_balance DECIMAL(19, 4) DEFAULT 0 CHECK (credit_balance >= 0),
    description TEXT,
    -- Diễn giải chi tiết
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID,
    CONSTRAINT check_detail_not_both_debit_credit CHECK (
        NOT (
            debit_balance > 0
            AND credit_balance > 0
        )
    ),
    CONSTRAINT check_at_least_one_dimension CHECK (
        department_id IS NOT NULL
        OR cost_item_id IS NOT NULL
        OR cost_object_id IS NOT NULL
        OR project_id IS NOT NULL
        OR sales_order_id IS NOT NULL
        OR purchase_order_id IS NOT NULL
        OR sales_contract_id IS NOT NULL
        OR purchase_contract_id IS NOT NULL
        OR statistical_code_id IS NOT NULL
        OR account_object_id IS NOT NULL
    )
);

CREATE INDEX idx_opening_balance_detail_tenant ON opening_balance_detail(tenant_id);

CREATE INDEX idx_opening_balance_detail_balance ON opening_balance_detail(balance_id);

CREATE INDEX idx_opening_balance_detail_department ON opening_balance_detail(department_id)
WHERE
    department_id IS NOT NULL;

CREATE INDEX idx_opening_balance_detail_cost_item ON opening_balance_detail(cost_item_id)
WHERE
    cost_item_id IS NOT NULL;

CREATE INDEX idx_opening_balance_detail_cost_object ON opening_balance_detail(cost_object_id)
WHERE
    cost_object_id IS NOT NULL;

CREATE INDEX idx_opening_balance_detail_project ON opening_balance_detail(project_id)
WHERE
    project_id IS NOT NULL;

CREATE INDEX idx_opening_balance_detail_sales_order ON opening_balance_detail(sales_order_id)
WHERE
    sales_order_id IS NOT NULL;

CREATE INDEX idx_opening_balance_detail_purchase_order ON opening_balance_detail(purchase_order_id)
WHERE
    purchase_order_id IS NOT NULL;

CREATE INDEX idx_opening_balance_detail_sales_contract ON opening_balance_detail(sales_contract_id)
WHERE
    sales_contract_id IS NOT NULL;

CREATE INDEX idx_opening_balance_detail_purchase_contract ON opening_balance_detail(purchase_contract_id)
WHERE
    purchase_contract_id IS NOT NULL;

CREATE INDEX idx_opening_balance_detail_statistical_code ON opening_balance_detail(statistical_code_id)
WHERE
    statistical_code_id IS NOT NULL;

CREATE INDEX idx_opening_balance_detail_account_object ON opening_balance_detail(account_object_id)
WHERE
    account_object_id IS NOT NULL;

COMMENT ON TABLE opening_balance_detail IS 'Chi tiết số dư ban đầu theo các chiều phân tích nghiệp vụ';

COMMENT ON COLUMN opening_balance_detail.balance_id IS 'ID số dư tài khoản (FK)';

COMMENT ON COLUMN opening_balance_detail.department_id IS 'Đơn vị (optional)';

COMMENT ON COLUMN opening_balance_detail.cost_item_id IS 'Khoản mục chi phí (optional)';

COMMENT ON COLUMN opening_balance_detail.cost_object_id IS 'Đối tượng tổng hợp chi phí (optional)';

COMMENT ON COLUMN opening_balance_detail.project_id IS 'Công trình (optional)';

COMMENT ON COLUMN opening_balance_detail.sales_order_id IS 'Đơn đặt hàng (optional)';

COMMENT ON COLUMN opening_balance_detail.purchase_order_id IS 'Đơn mua hàng (optional)';

COMMENT ON COLUMN opening_balance_detail.sales_contract_id IS 'Hợp đồng bán (optional)';

COMMENT ON COLUMN opening_balance_detail.purchase_contract_id IS 'Hợp đồng mua (optional)';

COMMENT ON COLUMN opening_balance_detail.statistical_code_id IS 'Mã thống kê (optional)';

COMMENT ON COLUMN opening_balance_detail.account_object_id IS 'Đối tượng: Khách hàng, Nhà cung cấp, Nhân viên (optional)';

COMMENT ON COLUMN opening_balance_detail.debit_balance IS 'Dư Nợ chi tiết (>= 0)';

COMMENT ON COLUMN opening_balance_detail.credit_balance IS 'Dư Có chi tiết (>= 0)';

COMMENT ON CONSTRAINT check_at_least_one_dimension ON opening_balance_detail IS 'Phải có ít nhất 1 chiều phân tích nghiệp vụ';

-- ==================================================================================
-- Row Level Security (RLS) Policies
-- Ensure tenant data isolation
-- ==================================================================================
ALTER TABLE
    opening_period ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    opening_balance ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    opening_balance_detail ENABLE ROW LEVEL SECURITY;

-- Policy for opening_period
CREATE POLICY tenant_isolation_policy_opening_period ON opening_period USING (
    tenant_id = current_setting('app.current_tenant', true) :: UUID
);

-- Policy for opening_balance
CREATE POLICY tenant_isolation_policy_opening_balance ON opening_balance USING (
    tenant_id = current_setting('app.current_tenant', true) :: UUID
);

-- Policy for opening_balance_detail
CREATE POLICY tenant_isolation_policy_opening_balance_detail ON opening_balance_detail USING (
    tenant_id = current_setting('app.current_tenant', true) :: UUID
);

-- ==================================================================================
-- Trigger function: Validate opening balance before locking period
-- Ensures sum of details equals header balance
-- ==================================================================================
CREATE
OR REPLACE FUNCTION validate_opening_balance_before_lock() RETURNS TRIGGER AS $ $ DECLARE v_invalid_count INTEGER;

v_invalid_records TEXT;

BEGIN -- Only validate when locking (changing from false to true)
IF NEW.is_locked = true
AND (
    OLD.is_locked = false
    OR OLD.is_locked IS NULL
) THEN -- Check if all balances with details have matching sums
SELECT
    COUNT(*) INTO v_invalid_count
FROM
    opening_balance ob
WHERE
    ob.period_id = NEW.id
    AND ob.has_details = true
    AND (
        ABS(
            ob.debit_balance - (
                SELECT
                    COALESCE(SUM(obd.debit_balance), 0)
                FROM
                    opening_balance_detail obd
                WHERE
                    obd.balance_id = ob.id
            )
        ) > 0.01
        OR ABS(
            ob.credit_balance - (
                SELECT
                    COALESCE(SUM(obd.credit_balance), 0)
                FROM
                    opening_balance_detail obd
                WHERE
                    obd.balance_id = ob.id
            )
        ) > 0.01
    );

IF v_invalid_count > 0 THEN -- Get details of invalid records for error message
SELECT
    STRING_AGG(
        ob.account_number || ' (' || ob.account_name || ')',
        ', '
    ) INTO v_invalid_records
FROM
    opening_balance ob
WHERE
    ob.period_id = NEW.id
    AND ob.has_details = true
    AND (
        ABS(
            ob.debit_balance - (
                SELECT
                    COALESCE(SUM(obd.debit_balance), 0)
                FROM
                    opening_balance_detail obd
                WHERE
                    obd.balance_id = ob.id
            )
        ) > 0.01
        OR ABS(
            ob.credit_balance - (
                SELECT
                    COALESCE(SUM(obd.credit_balance), 0)
                FROM
                    opening_balance_detail obd
                WHERE
                    obd.balance_id = ob.id
            )
        ) > 0.01
    )
LIMIT
    5;

RAISE EXCEPTION 'Cannot lock period: % opening balance records have mismatched detail sums. Invalid accounts: %', v_invalid_count, v_invalid_records USING HINT = 'Please check and fix the detail balances before locking the period';

END IF;

-- Set lock timestamp and user
NEW.locked_at := CURRENT_TIMESTAMP;

END IF;

RETURN NEW;

END;

$ $ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_opening_balance_before_lock BEFORE
UPDATE
    ON opening_period FOR EACH ROW EXECUTE FUNCTION validate_opening_balance_before_lock();

COMMENT ON FUNCTION validate_opening_balance_before_lock IS 'Validate opening balance sums before locking period';

-- ==================================================================================
-- Trigger function: Prevent updates when period is locked
-- ==================================================================================
CREATE
OR REPLACE FUNCTION prevent_update_when_locked() RETURNS TRIGGER AS $ $ DECLARE v_is_locked BOOLEAN;

BEGIN -- Check if period is locked
SELECT
    is_locked INTO v_is_locked
FROM
    opening_period
WHERE
    id = NEW.period_id;

IF v_is_locked = true THEN RAISE EXCEPTION 'Cannot modify opening balance: Period is locked' USING HINT = 'Please unlock the period first if you need to make changes';

END IF;

RETURN NEW;

END;

$ $ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_opening_balance_update_when_locked BEFORE
UPDATE
    ON opening_balance FOR EACH ROW EXECUTE FUNCTION prevent_update_when_locked();

CREATE TRIGGER trg_prevent_opening_balance_detail_update_when_locked BEFORE
UPDATE
    OR
INSERT
    OR DELETE ON opening_balance_detail FOR EACH ROW EXECUTE FUNCTION prevent_update_when_locked();

COMMENT ON FUNCTION prevent_update_when_locked IS 'Prevent modifications when period is locked';

-- ==================================================================================
-- Function: Generate journal entries from opening balances
-- Called when locking period to create opening balance entries in general ledger
-- ==================================================================================
CREATE
OR REPLACE FUNCTION generate_opening_entries(p_period_id UUID) RETURNS TABLE (
    journal_entry_id UUID,
    lines_created INTEGER
) AS $ $ DECLARE v_tenant_id UUID;

v_opening_date DATE;

v_journal_entry_id UUID;

v_lines_count INTEGER;

v_entry_number VARCHAR(50);

BEGIN -- Get period info
SELECT
    op.tenant_id,
    op.opening_date INTO v_tenant_id,
    v_opening_date
FROM
    opening_period op
WHERE
    op.id = p_period_id;

IF v_tenant_id IS NULL THEN RAISE EXCEPTION 'Opening period not found: %',
p_period_id;

END IF;

-- Generate entry number
v_entry_number := 'OB-' || TO_CHAR(v_opening_date, 'YYYYMMDD') || '-' || SUBSTRING(
    p_period_id :: TEXT
    FROM
        1 FOR 8
);

-- Note: This function assumes journal_entries table exists
-- Uncomment and modify when journal_entries table is implemented
/*
 -- Create journal entry header
 INSERT INTO journal_entries (
 tenant_id, 
 entry_number, 
 entry_date, 
 description, 
 status, 
 entry_type,
 created_by
 )
 VALUES (
 v_tenant_id,
 v_entry_number,
 v_opening_date,
 'Opening Balance Entries - ' || (SELECT period_name FROM opening_period WHERE id = p_period_id),
 'Posted',
 'opening_balance',
 current_setting('app.current_user', true)::UUID
 )
 RETURNING id INTO v_journal_entry_id;
 
 -- Create journal entry lines from opening balances
 WITH inserted AS (
 INSERT INTO journal_entry_lines (
 journal_entry_id, 
 account_id, 
 debit_amount, 
 credit_amount, 
 description, 
 line_number
 )
 SELECT
 v_journal_entry_id,
 ob.account_id,
 ob.debit_balance,
 ob.credit_balance,
 COALESCE(ob.note, 'Opening Balance - ' || ob.account_name),
 ROW_NUMBER() OVER (ORDER BY ob.account_number)::INTEGER
 FROM opening_balance ob
 WHERE ob.period_id = p_period_id
 AND (ob.debit_balance > 0 OR ob.credit_balance > 0)
 RETURNING 1
 )
 SELECT COUNT(*) INTO v_lines_count FROM inserted;
 */
-- Temporary return until journal_entries table is implemented
v_journal_entry_id := p_period_id;

v_lines_count := 0;

RETURN QUERY
SELECT
    v_journal_entry_id,
    v_lines_count;

END;

$ $ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_opening_entries IS 'Generate journal entries from opening balances when locking period';

-- ==================================================================================
-- Function: Validate opening balance consistency
-- Can be called manually to check data integrity
-- ==================================================================================
CREATE
OR REPLACE FUNCTION validate_opening_balance_consistency(p_period_id UUID) RETURNS TABLE (
    account_number VARCHAR,
    account_name VARCHAR,
    error_type VARCHAR,
    expected_debit DECIMAL,
    actual_debit DECIMAL,
    expected_credit DECIMAL,
    actual_credit DECIMAL,
    difference DECIMAL
) AS $ $ BEGIN RETURN QUERY
SELECT
    ob.account_number,
    ob.account_name,
    CASE
        WHEN ob.has_details = true
        AND ABS(
            ob.debit_balance - COALESCE(detail_sums.sum_debit, 0)
        ) > 0.01 THEN 'DEBIT_MISMATCH'
        WHEN ob.has_details = true
        AND ABS(
            ob.credit_balance - COALESCE(detail_sums.sum_credit, 0)
        ) > 0.01 THEN 'CREDIT_MISMATCH'
        WHEN ob.debit_balance > 0
        AND ob.credit_balance > 0 THEN 'BOTH_DEBIT_CREDIT'
        WHEN ob.has_details = true
        AND detail_sums.detail_count = 0 THEN 'MISSING_DETAILS'
        ELSE 'UNKNOWN'
    END AS error_type,
    ob.debit_balance AS expected_debit,
    COALESCE(detail_sums.sum_debit, 0) AS actual_debit,
    ob.credit_balance AS expected_credit,
    COALESCE(detail_sums.sum_credit, 0) AS actual_credit,
    ABS(
        ob.debit_balance - COALESCE(detail_sums.sum_debit, 0)
    ) + ABS(
        ob.credit_balance - COALESCE(detail_sums.sum_credit, 0)
    ) AS difference
FROM
    opening_balance ob
    LEFT JOIN (
        SELECT
            obd.balance_id,
            SUM(obd.debit_balance) AS sum_debit,
            SUM(obd.credit_balance) AS sum_credit,
            COUNT(*) AS detail_count
        FROM
            opening_balance_detail obd
        GROUP BY
            obd.balance_id
    ) detail_sums ON ob.id = detail_sums.balance_id
WHERE
    ob.period_id = p_period_id
    AND (
        (
            ob.has_details = true
            AND ABS(
                ob.debit_balance - COALESCE(detail_sums.sum_debit, 0)
            ) > 0.01
        )
        OR (
            ob.has_details = true
            AND ABS(
                ob.credit_balance - COALESCE(detail_sums.sum_credit, 0)
            ) > 0.01
        )
        OR (
            ob.debit_balance > 0
            AND ob.credit_balance > 0
        )
        OR (
            ob.has_details = true
            AND detail_sums.detail_count = 0
        )
    );

END;

$ $ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_opening_balance_consistency IS 'Validate opening balance data consistency and return errors';

-- ==================================================================================
-- Success message
-- ==================================================================================
DO $ $ BEGIN RAISE NOTICE 'Migration 007_create_opening_balance_tables.sql completed successfully';

RAISE NOTICE 'Created tables: opening_period, opening_balance, opening_balance_detail';

RAISE NOTICE 'Created functions: validate_opening_balance_before_lock, prevent_update_when_locked, generate_opening_entries, validate_opening_balance_consistency';

END $ $;