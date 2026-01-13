-- Create tenant_business_sector table
CREATE TABLE IF NOT EXISTS tenant_business_sector (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    sector VARCHAR(100) NOT NULL,
    industry_code VARCHAR(50),
    industry_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant_business_sector FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tenant_business_sector_tenant_id ON tenant_business_sector(tenant_id);

-- Create tenant_accounting_setup table
CREATE TABLE IF NOT EXISTS tenant_accounting_setup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    data_start_date DATE,
    -- HKD fields
    tax_filing_frequency VARCHAR(50),
    use_pos_device BOOLEAN DEFAULT FALSE,
    tax_industry_group VARCHAR(100),
    -- DNTN fields
    accounting_regime VARCHAR(50),
    tax_calculation_method VARCHAR(50),
    base_currency VARCHAR(10),
    has_foreign_currency BOOLEAN DEFAULT FALSE,
    inventory_valuation_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant_accounting_setup FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tenant_accounting_setup_tenant_id ON tenant_accounting_setup(tenant_id);

-- Add comments
COMMENT ON TABLE tenant_business_sector IS 'Stores business sector and industry information for each tenant';
COMMENT ON TABLE tenant_accounting_setup IS 'Stores accounting setup configuration for each tenant';
