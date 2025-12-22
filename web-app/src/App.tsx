import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { OnboardingProvider } from './context/OnboardingContextSafe';
import { GOOGLE_CONFIG } from './config/constants';
import SplashScreen from './pages/SplashScreen';
import LoginDemoScreenSimple from './pages/LoginDemoScreenSimple';
import LoginScreen from './pages/LoginScreen';
import SignupScreen from './pages/SignupScreen';
import { ForgotPasswordScreen } from './pages/ForgotPasswordScreen';
import { ResetPasswordScreen } from './pages/ResetPasswordScreen';
import ProcessingScreen from './pages/ProcessingScreen';
import { DashboardScreen } from './pages/DashboardScreen';
import HomeScreen from './pages/HomeScreen';
import MoreScreen from './pages/MoreScreen';
import SelectTenantScreen from './pages/SelectTenantScreen';
import { TenantSelectionScreen } from './pages/TenantSelectionScreen';
import WelcomeScreen from './pages/onboarding/WelcomeScreen';
import BusinessTypeScreen from './pages/onboarding/BusinessTypeScreen';
import BusinessInfoScreen from './pages/onboarding/BusinessInfoScreen';
import BusinessInfoScreenDNTN from './pages/onboarding/BusinessInfoScreenDNTN';
import BusinessSectorScreen from './pages/onboarding/BusinessSectorScreen';
import AccountingSetupScreen from './pages/onboarding/AccountingSetupScreen';
import MainLayout from './components/MainLayout';

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
              
              {/* Routes with persistent bottom navigation */}
              <Route element={<MainLayout />}>
                <Route path="/home" element={<HomeScreen />} />
                <Route path="/more" element={<MoreScreen />} />
              </Route>
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </OnboardingProvider>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
