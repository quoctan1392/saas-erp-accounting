import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import SplashScreen from './pages/SplashScreen';
import LoginScreen from './pages/LoginScreen';
import SignupScreen from './pages/SignupScreen';
import LoginDemoScreen from './pages/LoginDemoScreen';
import ProcessingScreen from './pages/ProcessingScreen';
import SelectTenantScreen from './pages/SelectTenantScreen';
import HomeScreen from './pages/HomeScreen';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '943531761045-3j98h5682cbcgoku7gh1d1ureuvac2db.apps.googleusercontent.com';

// Create Material-UI theme
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
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<SplashScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/login-demo" element={<LoginDemoScreen />} />
              <Route path="/processing" element={<ProcessingScreen />} />
              <Route path="/select-tenant" element={<SelectTenantScreen />} />
              <Route path="/dashboard" element={<HomeScreen />} />
              <Route path="/home" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
