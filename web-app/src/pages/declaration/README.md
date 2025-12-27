# Declaration Flow - Khai báo danh mục

This directory contains screens for the initial data declaration process after onboarding.

## Flow Structure

1. **CategoryDeclarationScreen** (`/declaration/categories`)
   - First step: Declare product/service categories
   - Users can add, edit, or skip this step
   - Routes: 
     - `ROUTES.DECLARATION_CATEGORIES`

2. **Future Screens** (To be implemented):
   - **InventoryDeclarationScreen** (`/declaration/inventory`)
     - Declare initial inventory
   - **CustomerDeclarationScreen** (`/declaration/customers`)
     - Declare customer list
   - **SupplierDeclarationScreen** (`/declaration/suppliers`)
     - Declare supplier list

## Integration Points

### Trigger
- Modal appears on Home Screen after successful onboarding completion
- Triggered by `justCompletedOnboarding` flag in localStorage
- Modal title: "Khai báo danh mục"

### Routes Defined
See `web-app/src/config/constants.ts`:
```typescript
DECLARATION_CATEGORIES: '/declaration/categories',
DECLARATION_INVENTORY: '/declaration/inventory',
DECLARATION_CUSTOMERS: '/declaration/customers',
DECLARATION_SUPPLIERS: '/declaration/suppliers',
```

### Navigation Flow
```
Home Screen Modal 
  → Click "Bắt đầu thiết lập"
    → CategoryDeclarationScreen
      → (Future) InventoryDeclarationScreen
        → (Future) CustomerDeclarationScreen
          → (Future) SupplierDeclarationScreen
            → Back to Home
```

## Implementation Status

✅ **Completed:**
- Modal on Home Screen
- CategoryDeclarationScreen basic structure
- Routes configured
- Navigation wired

⏳ **Pending:**
- Full category CRUD functionality
- Inventory declaration screen
- Customer declaration screen
- Supplier declaration screen
- Data persistence to backend

## Usage

Users will see the "Khai báo danh mục" modal automatically on their first visit to Home Screen after completing onboarding. They can:
1. Click "Bắt đầu thiết lập" to start declaration process
2. Click "Bỏ qua" to skip and return to Home

The modal will only show once per account (controlled by `hasSeenSetupGuideModal` in localStorage).
