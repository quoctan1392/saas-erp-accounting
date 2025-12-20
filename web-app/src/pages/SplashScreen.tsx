import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { ROUTES } from '../config/constants';
import { useAuth } from '../context/AuthContext';

export const SplashScreen: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          navigate(ROUTES.HOME);
        } else {
          // Navigate to demo login for easier testing
          navigate('/login-demo');
        }
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated, isLoading]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 700,
          mb: 4,
          fontSize: { xs: '2rem', sm: '3rem' },
          textAlign: 'center',
          px: 2,
        }}
      >
        Symper ERP
      </Typography>
      <CircularProgress size={60} sx={{ color: 'white', mb: 3 }} />
      
      {/* Debug button - remove in production */}
      <Button
        variant="outlined"
        onClick={() => {
          logout();
          navigate(ROUTES.LOGIN);
        }}
        sx={{
          color: 'white',
          borderColor: 'white',
          '&:hover': {
            borderColor: 'white',
            bgcolor: 'rgba(255,255,255,0.1)',
          },
        }}
      >
        Reset & Login
      </Button>
    </Box>
  );
};

export default SplashScreen;
