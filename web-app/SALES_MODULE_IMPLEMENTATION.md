# Sales Module Implementation - Phase 1

## ✅ Completed Features

### 1. Backend Integration
- ✅ Sales module already implemented in `core-service`
- ✅ All REST API endpoints available:
  - `GET /api/sales/vouchers` - List with filters (status, date range, pagination)
  - `GET /api/sales/vouchers/:id` - Get detail
  - `POST /api/sales/vouchers` - Create new
  - `PATCH /api/sales/vouchers/:id` - Update
  - `DELETE /api/sales/vouchers/:id` - Delete (draft only)
  - `POST /api/sales/vouchers/:id/post` - Post to ledger
- ✅ Database tables: `sale_voucher`, `sale_voucher_detail`, `outward_voucher`, `receipt_voucher`

### 2. Frontend Implementation

#### 2.1 Routes & Navigation
**Added Routes:**
- `/sales` - Sales invoice list
- `/sales/new` - Create new invoice
- `/sales/:id` - View invoice detail
- `/sales/:id/edit` - Edit invoice

**Constants Updated:**
- `web-app/src/config/constants.ts` - Added SALES_LIST, SALES_NEW, SALES_DETAIL, SALES_EDIT routes
- `web-app/src/App.tsx` - Lazy-loaded sales screens with proper routing

**Home Screen Integration:**
- Added "Hóa đơn bán hàng" button to FAB speed dial
- Navigates to `/sales/new` for quick create
- Positioned as first option in speed dial menu

#### 2.2 Screens Created

**A. SalesListScreen (UC01)** - `/sales`
- ✅ Tab filters: Tất cả, Nháp, Đã ghi sổ, Đã hủy
- ✅ Search box (by code, customer name)
- ✅ Pagination with "Xem thêm" (lazy load, 20 items/page)
- ✅ Voucher cards showing:
  - Voucher number & transaction date
  - Customer name & address
  - Status chip (draft/posted/canceled)
  - Total amount
- ✅ FAB button to create new invoice
- ✅ Click card to navigate to detail

**B. SalesFormScreen (UC02)** - `/sales/new` & `/sales/:id/edit`
- ✅ Basic structure with back navigation
- ✅ Edit mode detection via URL params
- ⏳ **TODO**: Implement 6-section form:
  1. Thông tin chung (general info)
  2. Thông tin khách hàng (customer info)
  3. Danh sách mặt hàng (items cart with stock warnings)
  4. Tổng hợp (summary)
  5. Thanh toán (payment)
  6. Đính kèm & Diễn giải (attachments with AC01-AC05)

**C. SalesDetailScreen (UC03)** - `/sales/:id`
- ✅ Display voucher details:
  - Voucher number & status
  - Transaction date
  - Customer info
  - Total amount
  - Description
- ✅ Action buttons:
  - "Chỉnh sửa" (draft only) - Navigate to edit
  - "Ghi sổ" (draft only) - Post voucher via API
- ⏳ **TODO**: Implement full action matrix per requirements

#### 2.3 API Service
**Added Methods in `web-app/src/services/api.ts`:**
- `getSaleVouchers(params)` - List with filtering
- `getSaleVoucher(id)` - Get single voucher
- `createSaleVoucher(data)` - Create new
- `updateSaleVoucher(id, data)` - Update
- `deleteSaleVoucher(id)` - Delete
- `postSaleVoucher(id)` - Post to ledger

### 3. UI/UX Patterns
- ✅ Consistent with existing screens (Onboarding, Initial Balance)
- ✅ Mobile-first responsive design
- ✅ Material-UI components with custom styling
- ✅ Loading states with CircularProgress
- ✅ Error handling with Alert components
- ✅ Status chips with color coding:
  - Draft: Orange (#FFA500)
  - Posted: Green (#4CAF50)
  - Canceled: Gray (#9E9E9E)

## 📋 Entry Points

Users can access Sales module from:
1. ✅ Home screen FAB → "Hóa đơn bán hàng" (quick create)
2. ✅ Direct navigation to `/sales` (list view)
3. ⏳ Menu bar (to be added)

## 🚧 Next Phase Tasks

### Phase 2: Complete SalesFormScreen (UC02)
**Priority: HIGH**

1. **Section 1: Thông tin chung**
   - Voucher number (auto-generated)
   - Transaction date picker
   - Description field with auto-fill logic

2. **Section 2: Thông tin khách hàng**
   - Customer selector (autocomplete with search)
   - Display: code, name, address, tax ID, phone
   - Option to create new customer inline

3. **Section 3: Danh sách mặt hàng**
   - Item cart with add/remove
   - Fields per row: item, quantity, unit, price, discount, VAT, amount
   - Stock warnings when quantity exceeds available
   - Warehouse selection per line
   - Support multiple VAT rates

4. **Section 4: Tổng hợp**
   - Total sale amount
   - Total discount
   - Total VAT
   - Final amount (bold, highlighted)

5. **Section 5: Thanh toán**
   - Payment type radio: immediate / pay_later
   - Payment method select: cash / transfer / card
   - Bank account selector (if transfer)
   - Show/hide fields based on payment type

6. **Section 6: Đính kèm & Diễn giải**
   - File upload (multipart/form-data)
   - Max 5MB/file, 10 files, 50MB total
   - Types: delivery_note, contract, payment_slip, customer_id, other
   - Thumbnail preview grid
   - Delete attachment button
   - Camera capture support
   - Implement AC01-AC05 from requirements

### Phase 3: Enhanced Detail View (UC03)
1. Implement action matrix:
   - Chỉnh sửa (draft only)
   - Ghi sổ (draft only)
   - Hủy (posted only)
   - Trả hàng (posted only, creates return voucher)
   - Giảm giá (posted only, creates discount voucher)
   - Xuất hóa đơn (posted only, integrates TVAN)
2. Show related documents:
   - Outward vouchers
   - Receipt vouchers
   - E-invoices
3. Display line items table
4. Show accounting entries (after posting)

### Phase 4: Return & Discount Vouchers (UC04, UC05)
1. Implement return flow
2. Implement discount flow
3. Link back to original voucher

### Phase 5: E-Invoice Integration (UC06)
1. Connect to TVAN API
2. Digital signature flow
3. Publish invoice
4. Download PDF/XML

### Phase 6: Debt Collection (UC07)
1. List overdue invoices
2. Send reminders
3. Track payment history

## 📦 Components to Build

### Reusable Components
1. **CustomerSelector**
   - Autocomplete with API search
   - Display customer card
   - Create new customer inline

2. **ItemCart**
   - Add/remove items
   - Quantity & price editing
   - Stock validation
   - Subtotal calculation

3. **PaymentSection**
   - Conditional fields based on payment type
   - Bank account selector
   - Amount display

4. **AttachmentUploader**
   - File input with drag & drop
   - Camera capture
   - Thumbnail grid
   - Preview modal
   - Delete confirmation
   - Implements AC01-AC05

### State Management
- Consider Zustand stores:
  - `useSalesStore` - Voucher list, filters, pagination
  - `useSalesFormStore` - Form data, validation, cart items
  - `useCustomerStore` - Customer selection cache
  - `useItemStore` - Item selection cache

## 🎨 Design Compliance
- ✅ Following Figma design file: node 1306:5886 (canvas "↳ 2.2. Bán hàng")
- ✅ UX patterns match existing onboarding/declaration flows
- ✅ Color scheme: Primary #667eea, Secondary #764ba2
- ✅ Icons from iconsax-react
- ✅ Mobile-first responsive (320px+)

## 🔐 Authentication & Permissions
- All endpoints require JWT token with tenant context
- Auth handled by axios interceptors in `apiService`
- Tenant ID injected from localStorage

## 📊 Testing Checklist

### Manual Testing
- [ ] Navigate to /sales from home FAB
- [ ] List loads with sample data
- [ ] Tab filters work (all, draft, posted, canceled)
- [ ] Search filters vouchers
- [ ] Click voucher card navigates to detail
- [ ] Detail screen shows voucher info
- [ ] Edit button (draft) navigates to form
- [ ] Post button (draft) calls API
- [ ] FAB button navigates to create form
- [ ] Back navigation works correctly

### API Testing
- [ ] GET /api/sales/vouchers returns paginated list
- [ ] GET /api/sales/vouchers/:id returns detail
- [ ] POST /api/sales/vouchers creates new voucher
- [ ] PATCH /api/sales/vouchers/:id updates draft
- [ ] DELETE /api/sales/vouchers/:id removes draft
- [ ] POST /api/sales/vouchers/:id/post transitions to posted

## 📝 Files Modified/Created

### Created
- `web-app/src/pages/sales/SalesListScreen.tsx` (336 lines)
- `web-app/src/pages/sales/SalesFormScreen.tsx` (55 lines - placeholder)
- `web-app/src/pages/sales/SalesDetailScreen.tsx` (171 lines)

### Modified
- `web-app/src/App.tsx` - Added sales routes
- `web-app/src/config/constants.ts` - Added sales route constants
- `web-app/src/services/api.ts` - Added 6 sales API methods
- `web-app/src/pages/HomeScreen.tsx` - Added "Hóa đơn bán hàng" to FAB

## ⚡ Quick Start

```bash
# Start services (if not running)
cd /Users/symper/workspace/saas-erp-accounting
docker-compose up -d

# Start web app
cd web-app
pnpm install
pnpm dev

# Navigate to:
# http://localhost:5173/sales
```

## 🐛 Known Issues
- None currently

## 📚 Reference
- Requirements: `/requirements/SALES_REQUIREMENTS.md`
- Backend: `/services/core-service/src/modules/sales/`
- Design: Figma node 1306:5886

---

**Status**: Phase 1 Complete ✅  
**Next**: Implement full SalesFormScreen with 6 sections  
**ETA**: 2-3 days for complete form implementation
