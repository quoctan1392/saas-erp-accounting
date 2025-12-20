import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import {
  BusinessType,
  OnboardingStatus,
  BusinessInfoForm,
  TaxInfoResult,
  ApiResponse,
} from '../types/onboarding';

interface OnboardingState {
  currentStep: number;
  businessType: BusinessType | null;
  businessInfo: BusinessInfoForm | null;
  isLoading: boolean;
  error: string | null;
  tenantId: string | null;
}

interface OnboardingContextValue extends OnboardingState {
  setTenantId: (tenantId: string) => void;
  loadOnboardingStatus: () => Promise<void>;
  setBusinessType: (type: BusinessType) => Promise<void>;
  saveBusinessInfo: (info: BusinessInfoForm) => Promise<void>;
  getTaxInfo: (taxId: string) => Promise<TaxInfoResult | null>;
  completeOnboarding: () => Promise<void>;
  goToStep: (step: number) => void;
  clearError: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    businessType: null,
    businessInfo: null,
    isLoading: false,
    error: null,
    tenantId: null,
  });

  const setTenantId = useCallback((tenantId: string) => {
    setState((prev) => ({ ...prev, tenantId }));
  }, []);

  const loadOnboardingStatus = useCallback(async () => {
    if (!state.tenantId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiService.getOnboardingStatus(state.tenantId);
      
      if (response.success) {
        const status: OnboardingStatus = response.data;
        setState((prev) => ({
          ...prev,
          currentStep: status.currentStep,
          businessType: status.businessType,
          isLoading: false,
        }));

        // Redirect if already completed
        if (status.onboardingCompleted) {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('loadOnboardingStatus error:', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to load onboarding status',
        isLoading: false,
      }));
    }
  }, [state.tenantId, navigate]);

  const setBusinessType = useCallback(
    async (type: BusinessType) => {
      if (!state.tenantId) {
        setState((prev) => ({ ...prev, error: 'No tenant selected' }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await apiService.updateBusinessType(state.tenantId, type);

        if (response.success) {
          setState((prev) => ({
            ...prev,
            businessType: type,
            currentStep: 2,
            isLoading: false,
          }));
          navigate('/onboarding/business-info');
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message || 'Failed to update business type',
          isLoading: false,
        }));
      }
    },
    [state.tenantId, navigate]
  );

  const getTaxInfo = useCallback(
    async (taxId: string): Promise<TaxInfoResult | null> => {
      try {
        const response: ApiResponse<TaxInfoResult> = await apiService.getTaxInfo(taxId);

        if (response.success && response.data) {
          return response.data;
        } else if (response.error) {
          throw new Error(response.error.message);
        }
        return null;
      } catch (error: any) {
        throw error;
      }
    },
    []
  );

  const saveBusinessInfo = useCallback(
    async (info: BusinessInfoForm) => {
      if (!state.tenantId) {
        setState((prev) => ({ ...prev, error: 'No tenant selected' }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await apiService.saveBusinessInfo(state.tenantId, info);

        if (response.success) {
          setState((prev) => ({
            ...prev,
            businessInfo: info,
            isLoading: false,
          }));
          // Navigate to next phase (Phase 2 - TBD)
          // For now, complete onboarding
          await completeOnboarding();
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message || 'Failed to save business info',
          isLoading: false,
        }));
        throw error;
      }
    },
    [state.tenantId]
  );

  const completeOnboarding = useCallback(async () => {
    if (!state.tenantId) return;

    try {
      const response = await apiService.completeOnboarding(state.tenantId);

      if (response.success) {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error);
    }
  }, [state.tenantId, navigate]);

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        setTenantId,
        loadOnboardingStatus,
        setBusinessType,
        saveBusinessInfo,
        getTaxInfo,
        completeOnboarding,
        goToStep,
        clearError,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextValue => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
