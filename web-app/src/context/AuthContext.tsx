import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { STORAGE_KEYS } from '../config/constants';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

interface Tenant {
  id: string;
  name: string;
  role: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, tokens: { accessToken: string; refreshToken: string }, tenants?: Tenant[]) => void;
  logout: () => void;
  setTenants: (tenants: Tenant[]) => void;
  selectTenant: (tenant: Tenant) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenants, setTenantsState] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const storedTenant = localStorage.getItem(STORAGE_KEYS.SELECTED_TENANT);
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedTenant) {
      setSelectedTenant(JSON.parse(storedTenant));
    }
    
    setIsLoading(false);
  }, []);

  const login = (
    userData: User,
    tokens: { accessToken: string; refreshToken: string },
    userTenants: Tenant[] = []
  ) => {
    setUser(userData);
    setTenantsState(userTenants);
    
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  };

  const logout = () => {
    setUser(null);
    setTenantsState([]);
    setSelectedTenant(null);
    
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_TENANT);
  };

  const setTenants = (userTenants: Tenant[]) => {
    setTenantsState(userTenants);
  };

  const selectTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    localStorage.setItem(STORAGE_KEYS.SELECTED_TENANT, JSON.stringify(tenant));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenants,
        selectedTenant,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setTenants,
        selectTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
