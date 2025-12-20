import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OnboardingContextValue {
  tenantId: string | null;
  setTenantId: (id: string) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [tenantId, setTenantId] = useState<string | null>(null);

  return (
    <OnboardingContext.Provider value={{ tenantId, setTenantId }}>
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
