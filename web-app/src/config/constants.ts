export const API_CONFIG = {
  AUTH_SERVICE_URL: import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001',
  TENANT_SERVICE_URL: import.meta.env.VITE_TENANT_SERVICE_URL || 'http://localhost:3002',
};

export const GOOGLE_CONFIG = {
  CLIENT_ID: '943531761045-3j98h5682cbcgoku7gh1d1ureuvac2db.apps.googleusercontent.com',
};

export const ROUTES = {
  HOME: '/home',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  SPLASH: '/splash',
  TENANT_SELECTION: '/select-tenant',
  PROCESSING: '/processing',
  DASHBOARD: '/dashboard',
  ONBOARDING_WELCOME: '/onboarding/welcome',
  ONBOARDING_BUSINESS_TYPE: '/onboarding/business-type',
  ONBOARDING_BUSINESS_INFO: '/onboarding/business-info',
  ONBOARDING_BUSINESS_INFO_DNTN: '/onboarding/business-info-dntn',
  ONBOARDING_BUSINESS_SECTOR: '/onboarding/business-sector',
  ONBOARDING_ACCOUNTING_SETUP: '/onboarding/accounting-setup',
  ONBOARDING_ADVANCED_SETUP: '/onboarding/advanced-setup',
  // Declaration routes
  DECLARATION_CATEGORIES: '/declaration/categories',
  DECLARATION_CUSTOMERS: '/declaration/customers',
  DECLARATION_SUPPLIERS: '/declaration/suppliers',
  DECLARATION_WAREHOUSES: '/declaration/warehouses',
  DECLARATION_PRODUCTS: '/declaration/products',
  DECLARATION_INITIAL_BALANCE: '/declaration/initial-balance',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  SELECTED_TENANT: 'selectedTenant',
};
