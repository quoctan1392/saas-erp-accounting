# Migration Audit and Fixes - January 21, 2026

## Summary
Comprehensive audit of all migrations and database schema. Fixed multiple missing columns and entity mismatches.

## Migrations Applied

### Existing Migrations (001-012)
✅ All previously applied successfully

### New Migrations Applied

#### Migration 013: Sync Item Entity with Database
- Renamed `category_id` to `list_item_category_id`
- Added missing tax rate columns (import, export, special consumption)
- Added missing account columns (discount, sale_off, revenue)
- Added description columns (purchase_description, sale_description, note)
- Added image columns (list_image_url)
- Added dimension columns (weight, length, width, height)
- Added warranty columns (warranty_period, warranty_type)
- Renamed `sale_price` to `sell_price`

#### Migration 014: Fix Item Column Types
- Fixed `list_item_category_id` type conversion from UUID to TEXT
- Re-created column with correct type for TypeORM simple-array

#### Migration 015: Add Unit Columns
**Issue**: Unit entity expected `is_base_unit` and `conversion_rate` columns
**Fix**: Added both columns to unit table
```sql
ALTER TABLE unit ADD COLUMN IF NOT EXISTS is_base_unit BOOLEAN DEFAULT false;
ALTER TABLE unit ADD COLUMN IF NOT EXISTS conversion_rate NUMERIC(15,4) DEFAULT 1.0;
```

#### Migration 016: Add Soft Delete Columns
**Issue**: Some detail entities missing `is_deleted` and `deleted_at` columns
**Fix**: Added soft delete columns to detail tables
```sql
ALTER TABLE outward_voucher_detail ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE outward_voucher_detail ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE receipt_voucher_detail ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE receipt_voucher_detail ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE sale_voucher_detail ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE sale_voucher_detail ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
```

#### Migration 005: Create Industries Table (Re-applied)
**Issue**: Migration file existed but table was never created
**Fix**: Applied migration to create `industries` table with 55 industry records

## Entity Updates

### 1. OutwardVoucher Entity
**Change**: Extended `BaseEntity` instead of manually defining all fields
- Removed duplicate `id`, `tenantId`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`
- Now inherits `isDeleted` and `deletedAt` from BaseEntity

### 2. ReceiptVoucher Entity  
**Change**: Extended `BaseEntity` instead of manually defining all fields
- Removed duplicate fields (same as OutwardVoucher)
- Now inherits soft delete columns from BaseEntity

## Issues Fixed

### ✅ Item Entity Issues
- [x] Missing `list_item_category_id` column (was `category_id`)
- [x] Wrong column type (UUID → TEXT for simple-array)
- [x] Missing tax rate columns
- [x] Missing account ID columns
- [x] Missing description columns
- [x] Missing image URL column
- [x] Missing dimension columns
- [x] Missing warranty columns
- [x] Column name mismatch (`sale_price` vs `sell_price`)

### ✅ Item Category Issues
- [x] Missing `sort_order` column

### ✅ Unit Entity Issues
- [x] Missing `is_base_unit` column
- [x] Missing `conversion_rate` column

### ✅ Voucher Entity Issues
- [x] OutwardVoucher not extending BaseEntity
- [x] ReceiptVoucher not extending BaseEntity
- [x] Missing soft delete support

### ✅ Industries Table
- [x] Table never created despite migration file existing

## Verification

### Database Tables Status
All required tables verified to exist:
- ✅ accounting_object
- ✅ bank_account
- ✅ business_profile
- ✅ chart_of_accounts_custom
- ✅ chart_of_accounts_general
- ✅ currency
- ✅ einvoice_provider
- ✅ industries (newly created)
- ✅ inventory_transaction
- ✅ invoice
- ✅ invoice_detail
- ✅ item
- ✅ item_category
- ✅ opening_balance
- ✅ opening_balance_detail
- ✅ opening_period
- ✅ outward_voucher
- ✅ outward_voucher_detail
- ✅ receipt_voucher
- ✅ receipt_voucher_detail
- ✅ sale_voucher
- ✅ sale_voucher_detail
- ✅ subject_group
- ✅ tax_industry_groups
- ✅ unit
- ✅ warehouse

### Core Service Status
✅ No errors in startup
✅ All controllers registered
✅ All routes mapped successfully

## Migration Files Created

1. `013_sync_item_entity_with_database.sql` - Item table comprehensive sync
2. `014_fix_item_columns.sql` - Item column type fixes
3. `015_add_unit_columns.sql` - Unit table missing columns
4. `016_add_soft_delete_columns.sql` - Soft delete support for detail tables

## Testing Recommendations

Test the following features to ensure all fixes work:

1. **Product Groups (Item Categories)**
   - Create new product group
   - List product groups (should show with sort_order)

2. **Units**
   - Create new unit
   - List units
   - Set base unit flag

3. **Items/Products**
   - Create new product
   - Assign multiple categories (uses list_item_category_id)
   - Add product images
   - Set dimensions and warranty info

4. **Outward Vouchers**
   - Create outward voucher
   - Soft delete should work

5. **Receipt Vouchers**
   - Create receipt voucher
   - Soft delete should work

## Notes

- TypeORM `simple-array` type stores comma-separated values in TEXT column, not PostgreSQL array
- BaseEntity pattern provides: id, tenantId, timestamps, soft delete fields
- All voucher entities should extend BaseEntity for consistency
- Industries table now available for onboarding flow selection
