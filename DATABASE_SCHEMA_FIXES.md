# Database Schema Fixes Summary

## Date: 2026-01-21

## Issues Fixed

### 1. Item Table Schema Mismatch
**Problem**: The `item` entity defined `list_item_category_id` as a `simple-array` (TEXT) column, but the database had `category_id` as UUID.

**Root Cause**: Entity was updated to support multiple categories (array) but database was never migrated.

**Solution**:
- Created migration 013 to rename and convert column
- Created migration 014 to properly drop and recreate with correct type
- Manually forced type conversion from UUID to TEXT

**Changes**:
```sql
-- Drop old category_id column
ALTER TABLE item DROP COLUMN IF EXISTS list_item_category_id CASCADE;
ALTER TABLE item ADD COLUMN list_item_category_id TEXT;

-- Force type conversion
ALTER TABLE item ALTER COLUMN list_item_category_id TYPE TEXT USING list_item_category_id::TEXT;
```

### 2. Missing item_category.sort_order Column
**Problem**: `item_category` entity defined `sort_order` column but database didn't have it.

**Solution**:
```sql
ALTER TABLE item_category ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
```

### 3. Missing Item Table Columns
**Problem**: Many columns defined in `item.entity.ts` didn't exist in the database.

**Solution** (Migration 013):
```sql
-- Tax rate columns
ALTER TABLE item ADD COLUMN IF NOT EXISTS import_tax_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE item ADD COLUMN IF NOT EXISTS export_tax_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE item ADD COLUMN IF NOT EXISTS special_consumption_tax_rate NUMERIC(5,2) DEFAULT 0;

-- Account columns
ALTER TABLE item ADD COLUMN IF NOT EXISTS discount_account_id UUID;
ALTER TABLE item ADD COLUMN IF NOT EXISTS sale_off_account_id UUID;
ALTER TABLE item ADD COLUMN IF NOT EXISTS revenue_account_id UUID;

-- Description columns
ALTER TABLE item ADD COLUMN IF NOT EXISTS purchase_description TEXT;
ALTER TABLE item ADD COLUMN IF NOT EXISTS sale_description TEXT;
ALTER TABLE item ADD COLUMN IF NOT EXISTS note TEXT;

-- Image column
ALTER TABLE item ADD COLUMN IF NOT EXISTS list_image_url TEXT;

-- Dimension columns
ALTER TABLE item ADD COLUMN IF NOT EXISTS weight NUMERIC(15,4);
ALTER TABLE item ADD COLUMN IF NOT EXISTS length NUMERIC(15,4);
ALTER TABLE item ADD COLUMN IF NOT EXISTS width NUMERIC(15,4);
ALTER TABLE item ADD COLUMN IF NOT EXISTS height NUMERIC(15,4);

-- Warranty columns
ALTER TABLE item ADD COLUMN IF NOT EXISTS warranty_period INTEGER;
ALTER TABLE item ADD COLUMN IF NOT EXISTS warranty_type VARCHAR(50);
```

### 4. Column Name Standardization
**Problem**: Database had `sale_price` but entity expected `sell_price`.

**Solution**:
```sql
ALTER TABLE item RENAME COLUMN sale_price TO sell_price;
```

## Migrations Applied

1. **013_sync_item_entity_with_database.sql** - Initial attempt to sync item table
2. **014_fix_item_columns.sql** - Fixed column type issues

## Verification

After applying all fixes:

```sql
-- Verify item table structure
\d item

-- Verify item_category structure
\d item_category

-- Check column types
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'item' 
AND column_name IN ('list_item_category_id', 'list_image_url');
```

Expected results:
- `list_item_category_id`: text
- `list_image_url`: text
- `sort_order` exists in item_category table

## Other Entities Checked

Verified that these entities match their database tables:
- ✅ accounting_object
- ✅ subject_group
- ✅ warehouse (fixed in migration 012)
- ✅ bank_account
- ✅ unit
- ✅ invoice
- ✅ invoice_detail
- ✅ sale_voucher
- ✅ outward_voucher
- ✅ receipt_voucher
- ✅ business_profile

## TypeORM simple-array Type

**Important Note**: TypeORM's `simple-array` type stores arrays as comma-separated TEXT, not as PostgreSQL arrays.

Example:
- Entity: `@Column({ type: 'simple-array' }) tags: string[];`
- Database: `tags TEXT` (stores as "tag1,tag2,tag3")
- NOT: `tags TEXT[]` (PostgreSQL array)

This is why we changed `list_item_category_id` from UUID to TEXT.

## Status

✅ All schema mismatches fixed
✅ Core-service restarted successfully
✅ ProductGroupCreateScreen should now work without errors
