-- Create tenant_advanced_setup table for e-invoice configuration
CREATE TABLE IF NOT EXISTS tenant_advanced_setup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    e_invoice_enabled BOOLEAN DEFAULT FALSE,
    e_invoice_provider VARCHAR(100),
    e_invoice_provider_name VARCHAR(255),
    e_invoice_tax_code VARCHAR(20),
    e_invoice_username VARCHAR(255),
    e_invoice_auto_issue BOOLEAN DEFAULT FALSE,
    e_invoice_connected_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tenant_advanced_setup FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tenant_advanced_setup_tenant_id ON tenant_advanced_setup(tenant_id);

-- Add comment
COMMENT ON TABLE tenant_advanced_setup IS 'Stores advanced setup configuration (e-invoice) for each tenant';
