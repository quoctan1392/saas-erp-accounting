export enum BusinessType {
  HOUSEHOLD_BUSINESS = 'HOUSEHOLD_BUSINESS',
  PRIVATE_ENTERPRISE = 'PRIVATE_ENTERPRISE',
  LIMITED_COMPANY = 'LIMITED_COMPANY',
}

export enum BusinessSector {
  THUONG_MAI = 'THUONG_MAI', // Thương mại
  DICH_VU = 'DICH_VU', // Dịch vụ
  SAN_XUAT = 'SAN_XUAT', // Sản xuất
  XAY_LAP = 'XAY_LAP', // Xây lắp
}

export enum TaxFilingFrequency {
  MONTHLY = 'MONTHLY', // Hàng tháng
  QUARTERLY = 'QUARTERLY', // Hàng quý
}

export enum AccountingRegime {
  TT88_2021 = 'TT88_2021', // Thông tư 88/2021 (HKD)
  TT200_2014 = 'TT200_2014', // Thông tư 200/2014 (DNTN - lớn)
  TT133_2016 = 'TT133_2016', // Thông tư 133/2016 (DNTN - vừa và nhỏ)
}

export enum TaxCalculationMethod {
  DEDUCTION = 'DEDUCTION', // Phương pháp khấu trừ
  DIRECT = 'DIRECT', // Phương pháp trực tiếp trên doanh thu
}

export enum Currency {
  VND = 'VND', // Việt Nam Đồng
  USD = 'USD', // Đô-la Mỹ
}

export enum InventoryValuationMethod {
  WEIGHTED_AVERAGE = 'WEIGHTED_AVERAGE', // Bình quân cuối kỳ
  INSTANT_WEIGHTED_AVERAGE = 'INSTANT_WEIGHTED_AVERAGE', // Bình quân tức thời
  SPECIFIC_IDENTIFICATION = 'SPECIFIC_IDENTIFICATION', // Giá đích danh
  FIFO = 'FIFO', // Nhập trước xuất trước
}

export interface OnboardingStatus {
  tenantId: string;
  onboardingCompleted: boolean;
  currentStep: number;
  totalSteps: number;
  businessType: BusinessType | null;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface BusinessInfoForm {
  businessType: BusinessType;
  taxId: string;
  businessName: string;
  registeredAddress: string;
  ownerName?: string;
  nationalId?: string;
  businessCode?: string;
  establishmentDate?: string;
  employeeCount?: number;
  taxInfoAutoFilled?: boolean;
}

export interface BusinessSectorForm {
  sector: BusinessSector;
  industryCode: string; // Format: "4711 - Bán lẻ hàng hóa trong các siêu thị..."
  industryName: string;
}

// For HKD (Household Business)
export interface AccountingSetupFormHKD {
  accountingRegime: AccountingRegime.TT88_2021;
  dataStartDate: string; // ISO date string
  taxFilingFrequency: TaxFilingFrequency;
  usePOSDevice: boolean;
  inventoryValuationMethod: InventoryValuationMethod.WEIGHTED_AVERAGE;
  taxIndustryGroup: string; // "101", "102", "103", "104"
}

// For DNTN (Private Enterprise)
export interface AccountingSetupFormDNTN {
  accountingRegime: AccountingRegime.TT200_2014 | AccountingRegime.TT133_2016;
  dataStartDate: string; // ISO date string
  taxCalculationMethod: TaxCalculationMethod;
  baseCurrency: Currency;
  hasForeignCurrency: boolean;
  inventoryValuationMethod: InventoryValuationMethod;
}

export type AccountingSetupForm = AccountingSetupFormHKD | AccountingSetupFormDNTN;


export interface TaxInfoResult {
  taxId: string;
  businessName: string;
  registeredAddress: string;
  ownerName: string;
  businessType: string;
  status: string;
  registrationDate: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
