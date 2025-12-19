-- Create separate databases for each service
CREATE DATABASE auth_db;
CREATE DATABASE tenant_db;
CREATE DATABASE accounting_db;
CREATE DATABASE sales_db;
CREATE DATABASE inventory_db;
CREATE DATABASE purchase_db;
CREATE DATABASE hr_db;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE auth_db TO erp_admin;
GRANT ALL PRIVILEGES ON DATABASE tenant_db TO erp_admin;
GRANT ALL PRIVILEGES ON DATABASE accounting_db TO erp_admin;
GRANT ALL PRIVILEGES ON DATABASE sales_db TO erp_admin;
GRANT ALL PRIVILEGES ON DATABASE inventory_db TO erp_admin;
GRANT ALL PRIVILEGES ON DATABASE purchase_db TO erp_admin;
GRANT ALL PRIVILEGES ON DATABASE hr_db TO erp_admin;
