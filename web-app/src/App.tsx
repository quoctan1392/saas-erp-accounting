import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { OnboardingProvider } from './context/OnboardingContextSafe';
import { GOOGLE_CONFIG } from './config/constants';
import { CircularProgress, Box } from '@mui/material';

// Lazy load pages for better performance
const LoginDemoScreenSimple = lazy(() => import('./pages/LoginDemoScreenSimple'));
const LoginScreen = lazy(() => import('./pages/LoginScreen'));
const SignupScreen = lazy(() => import('./pages/SignupScreen'));
const ForgotPasswordScreen = lazy(() => import('./pages/ForgotPasswordScreen').then(m => ({ default: m.ForgotPasswordScreen })));
const ResetPasswordScreen = lazy(() => import('./pages/ResetPasswordScreen').then(m => ({ default: m.ResetPasswordScreen })));
const ProcessingScreen = lazy(() => import('./pages/ProcessingScreen'));
const DashboardScreen = lazy(() => import('./pages/DashboardScreen').then(m => ({ default: m.DashboardScreen })));
const HomeScreen = lazy(() => import('./pages/HomeScreen'));
const MoreScreen = lazy(() => import('./pages/MoreScreen'));
const SelectTenantScreen = lazy(() => import('./pages/SelectTenantScreen'));
const TenantSelectionScreen = lazy(() => import('./pages/TenantSelectionScreen').then(m => ({ default: m.TenantSelectionScreen })));

// Onboarding screens
const WelcomeScreen = lazy(() => import('./pages/onboarding/WelcomeScreen'));
const BusinessTypeScreen = lazy(() => import('./pages/onboarding/BusinessTypeScreen'));
const BusinessInfoScreen = lazy(() => import('./pages/onboarding/BusinessInfoScreen'));
const BusinessInfoScreenDNTN = lazy(() => import('./pages/onboarding/BusinessInfoScreen').then(m => ({ default: m.BusinessInfoScreenDNTN })));
const BusinessSectorScreen = lazy(() => import('./pages/onboarding/BusinessSectorScreen'));
const AccountingSetupScreen = lazy(() => import('./pages/onboarding/AccountingSetupScreen'));
const AdvancedSetupScreen = lazy(() => import('./pages/onboarding/AdvancedSetupScreen'));

// Declaration screens
const CategoryDeclarationScreen = lazy(() => import('./pages/declaration/CategoryDeclarationScreen'));
const CustomerFormScreen = lazy(() => import('./pages/declaration/CustomerFormScreen'));
const SupplierFormScreen = lazy(() => import('./pages/declaration/SupplierFormScreen'));
const WarehouseFormScreen = lazy(() => import('./pages/declaration/WarehouseFormScreen'));
const ProductFormScreen = lazy(() => import('./pages/declaration/ProductFormScreen'));

// Initial Balance flow (contains step1/2/3)
const InitialBalanceFlow = lazy(() => import('./pages/declaration/initial-balance/InitialBalanceFlow'));

const MainLayout = lazy(() => import('./components/MainLayout'));

// Loading component for lazy loaded pages
const PageLoader = () => {
  console.log('PageLoader is rendering');
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <CircularProgress sx={{ color: 'white' }} />
    </Box>
  );
};

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#8599ed',
      dark: '#5568d3',
    },
    secondary: {
      main: '#764ba2',
      light: '#9069b5',
      dark: '#5e3c82',
    },
  },
});

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CONFIG.CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <OnboardingProvider>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/login-demo" element={<LoginDemoScreenSimple />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
              <Route path="/reset-password" element={<ResetPasswordScreen />} />
              <Route path="/processing" element={<ProcessingScreen />} />
              <Route path="/select-tenant" element={<SelectTenantScreen />} />
              <Route path="/tenant-selection" element={<TenantSelectionScreen />} />
              <Route path="/dashboard" element={<DashboardScreen />} />
              <Route path="/onboarding/welcome" element={<WelcomeScreen />} />
              <Route path="/onboarding/business-type" element={<BusinessTypeScreen />} />
              <Route path="/onboarding/business-info" element={<BusinessInfoScreen />} />
              <Route path="/onboarding/business-info-dntn" element={<BusinessInfoScreenDNTN />} />
              <Route path="/onboarding/business-sector" element={<BusinessSectorScreen />} />
              <Route path="/onboarding/accounting-setup" element={<AccountingSetupScreen />} />
              <Route path="/onboarding/advanced-setup" element={<AdvancedSetupScreen />} />
              
              {/* Declaration routes */}
              <Route path="/declaration/categories" element={<CategoryDeclarationScreen />} />
              <Route path="/declaration/customers" element={<CustomerFormScreen />} />
              <Route path="/declaration/suppliers" element={<SupplierFormScreen />} />
              <Route path="/declaration/warehouses" element={<WarehouseFormScreen />} />
              {/* Warehouse create now uses inline overlay pattern */}
              <Route path="/declaration/products" element={<ProductFormScreen />} />
              <Route path="/declaration/products/new" element={<ProductFormScreen />} />
              <Route path="/declaration/products/:id/edit" element={<ProductFormScreen />} />
              
              {/* Initial Balance flow (handles step transitions internally) */}
              <Route path="/declaration/initial-balance/*" element={<InitialBalanceFlow />} />
              
              {/* Routes with persistent bottom navigation */}
              <Route element={<MainLayout />}>
                <Route path="/home" element={<HomeScreen />} />
                <Route path="/more" element={<MoreScreen />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </Suspense>
            </OnboardingProvider>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
