// Entity exports for TypeORM configuration
// This file centralizes all entity imports to avoid entity discovery issues

// Business Profile
export { BusinessProfile } from './modules/business-profile/entities/business-profile.entity';
export { EInvoiceProvider } from './modules/business-profile/entities/einvoice-provider.entity';

// Chart of Accounts
export { ChartOfAccountsGeneral } from './modules/chart-of-accounts/entities/chart-of-accounts-general.entity';
export { ChartOfAccountsCustom } from './modules/chart-of-accounts/entities/chart-of-accounts-custom.entity';

// Accounting Objects
export { AccountingObject } from './modules/accounting-objects/entities/accounting-object.entity';
export { SubjectGroup } from './modules/accounting-objects/entities/subject-group.entity';

// Items
export { Item } from './modules/items/entities/item.entity';
export { ItemCategory } from './modules/items/entities/item-category.entity';
export { Unit } from './modules/items/entities/unit.entity';

// Warehouses
export { Warehouse } from './modules/warehouses/entities/warehouse.entity';

// Sales
export { SaleVoucher } from './modules/sales/entities/sale-voucher.entity';
export { SaleVoucherDetail } from './modules/sales/entities/sale-voucher-detail.entity';
export { OutwardVoucher } from './modules/sales/entities/outward-voucher.entity';
export { OutwardVoucherDetail } from './modules/sales/entities/outward-voucher-detail.entity';
export { ReceiptVoucher } from './modules/sales/entities/receipt-voucher.entity';
export { ReceiptVoucherDetail } from './modules/sales/entities/receipt-voucher-detail.entity';

// Invoices
export { Invoice } from './modules/invoices/entities/invoice.entity';
export { InvoiceDetail } from './modules/invoices/entities/invoice-detail.entity';

// Inventory
export { InventoryTransaction } from './modules/inventory/entities/inventory-transaction.entity';

// Bank Accounts
export { BankAccount } from './modules/bank-accounts/entities/bank-account.entity';

// Opening Balance
export { OpeningPeriod } from './modules/opening-balance/entities/opening-period.entity';
export { OpeningBalance } from './modules/opening-balance/entities/opening-balance.entity';
export { OpeningBalanceDetail } from './modules/opening-balance/entities/opening-balance-detail.entity';
