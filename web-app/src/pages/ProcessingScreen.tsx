import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config/constants';

const steps = ['Tạo không gian làm việc', 'Cấu hình dữ liệu', 'Hoàn tất'];

export const ProcessingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, setTenants } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string>('');
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const createTenant = async () => {
      // Prevent duplicate execution (React StrictMode)
      if (isProcessingRef.current) {
        return;
      }
      isProcessingRef.current = true;

      try {
        if (!user) {
          navigate(ROUTES.LOGIN);
          return;
        }

        // Wait a moment to ensure token is saved to localStorage
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Verify token exists before proceeding
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.error('No access token found in localStorage');
          setError('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
          setTimeout(() => navigate(ROUTES.LOGIN), 2000);
          return;
        }

        // Step 1: Check existing tenants first
        setActiveStep(0);

        const existingTenantsResponse = await apiService.getMyTenants();
        const existingTenants = existingTenantsResponse.data?.tenants || [];

        if (existingTenants.length > 0) {
          // User already has tenant(s)
          setTenants(existingTenants);

          if (existingTenants.length === 1) {
            // Auto-select the only tenant
            const selectResponse = await apiService.selectTenant(existingTenants[0].id);
            const selectedTenant = selectResponse.data.tenant;

            localStorage.setItem('tenantAccessToken', selectResponse.data.tenantAccessToken);
            localStorage.setItem('currentTenant', JSON.stringify(selectedTenant));

            // Check if onboarding is completed from selectTenant response
            if (selectedTenant.onboardingCompleted) {
              navigate(ROUTES.HOME);
            } else {
              navigate(ROUTES.ONBOARDING_WELCOME);
            }
          } else {
            // Multiple tenants - show selection screen
            navigate(ROUTES.TENANT_SELECTION);
          }
          return;
        }

        // Step 2: Create new workspace (no existing tenant)
        setActiveStep(1);

        const userName = user.firstName || user.lastName || user.email.split('@')[0];
        const tenantName = `Công ty của ${userName}`;
        const createResponse = await apiService.createTenant(tenantName);

        if (createResponse.success && createResponse.data?.tenant) {
          const newTenant = createResponse.data.tenant;

          // Step 3: Select the new tenant
          setActiveStep(2);

          setTenants([newTenant]);
          const selectResponse = await apiService.selectTenant(newTenant.id);
          const selectedTenant = selectResponse.data.tenant;

          localStorage.setItem('tenantAccessToken', selectResponse.data.tenantAccessToken);
          localStorage.setItem('currentTenant', JSON.stringify(selectedTenant));

          // Navigate to onboarding for new tenant
          await new Promise((resolve) => setTimeout(resolve, 500));
          navigate(ROUTES.ONBOARDING_WELCOME);
        }
      } catch (err) {
        console.error('Tenant creation error:', err);
        const error = err as { response?: { data?: { message?: string; error?: string } } };
        const errorMessage = error.response?.data?.message || error.response?.data?.error;
        setError(errorMessage || 'Không thể tạo tài khoản. Vui lòng thử lại.');
      }
    };

    createTenant();
  }, [user, navigate, setTenants]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            textAlign="center"
            sx={{ mb: 4, fontWeight: 600 }}
          >
            Đang thiết lập tài khoản của bạn...
          </Typography>

          {error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <CircularProgress size={60} />
              </Box>

              <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Typography variant="body2" color="text.secondary" textAlign="center">
                Vui lòng đợi trong giây lát...
              </Typography>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ProcessingScreen;
