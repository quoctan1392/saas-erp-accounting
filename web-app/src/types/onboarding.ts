export enum BusinessType {
  HOUSEHOLD_BUSINESS = 'HOUSEHOLD_BUSINESS',
  PRIVATE_ENTERPRISE = 'PRIVATE_ENTERPRISE',
  LIMITED_COMPANY = 'LIMITED_COMPANY',
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
