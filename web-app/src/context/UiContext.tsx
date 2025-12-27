import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type UiContextType = {
  showBottomNav: boolean;
  setShowBottomNav: (v: boolean) => void;
};

const UiContext = createContext<UiContextType | undefined>(undefined);

export const UiProvider = ({ children }: { children: ReactNode }) => {
  const [showBottomNav, setShowBottomNav] = useState(true);
  return (
    <UiContext.Provider value={{ showBottomNav, setShowBottomNav }}>
      {children}
    </UiContext.Provider>
  );
};

export const useUi = () => {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi must be used within UiProvider');
  return ctx;
};

export default UiContext;
