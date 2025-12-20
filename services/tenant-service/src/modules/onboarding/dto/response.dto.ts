export class OnboardingStatusResponseDto {
  tenantId: string;
  onboardingCompleted: boolean;
  currentStep: number;
  totalSteps: number;
  businessType: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
}

export class BusinessTypeResponseDto {
  tenantId: string;
  businessType: string;
  onboardingStep: number;
}

export class BusinessInfoResponseDto {
  id: string;
  tenantId: string;
  businessType: string;
  taxId: string;
  businessName: string;
  onboardingStep: number;
  onboardingCompleted: boolean;
  createdAt: Date;
}

export class TaxInfoResponseDto {
  taxId: string;
  businessName: string;
  registeredAddress: string;
  ownerName: string;
  businessType: string;
  status: string;
  registrationDate: string;
}

export class CompleteOnboardingResponseDto {
  tenantId: string;
  onboardingCompleted: boolean;
  completedAt: Date;
}
