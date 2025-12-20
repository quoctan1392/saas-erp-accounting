import React, { useEffect, useState } from 'react';
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

const steps = [
  'Tạo không gian làm việc',
  'Cấu hình dữ liệu',
  'Hoàn tất',
];

export const ProcessingScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, setTenants } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const createTenant = async () => {
      try {
        if (!user) {
          navigate(ROUTES.LOGIN);
          return;
        }

        // Step 1: Check existing tenants first
        setActiveStep(0);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const existingTenantsResponse = await apiService.getMyTenants();
        if (existingTenantsResponse.success && existingTenantsResponse.data.tenants?.length > 0) {
          // User already has tenant(s), navigate to selection or dashboard
          const userTenants = existingTenantsResponse.data.tenants;
          setTenants(userTenants);

          if (userTenants.length === 1) {
            // Auto-select the only tenant and go to dashboard
            const selectResponse = await apiService.selectTenant(userTenants[0].id);
            localStorage.setItem('tenantAccessToken', selectResponse.data.tenantAccessToken);
            navigate(ROUTES.HOME);
          } else {
            // Multiple tenants - show selection screen
            navigate(ROUTES.TENANT_SELECTION);
          }
          return;
        }

        // Step 2: Create new workspace if no tenant exists
        setActiveStep(1);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const userName = user.firstName || user.lastName || user.email.split('@')[0];
        const tenantName = `Công ty của ${userName}`;
        const response = await apiService.createTenant(tenantName);

        // Step 3: Configure data
        setActiveStep(2);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (response.success) {
          // Fetch updated tenant list
          const tenantsResponse = await apiService.getMyTenants();
          if (tenantsResponse.success && tenantsResponse.data.tenants) {
            setTenants(tenantsResponse.data.tenants);

            // Auto-select the newly created tenant
            const newTenant = tenantsResponse.data.tenants[0];
            if (newTenant) {
              const selectResponse = await apiService.selectTenant(newTenant.id);
              localStorage.setItem('tenantAccessToken', selectResponse.data.tenantAccessToken);
            }
          }

          // Navigate to onboarding for new tenant
          setTimeout(() => {
            navigate(ROUTES.ONBOARDING_WELCOME);
          }, 500);
        }
      } catch (err) {
        console.error('Tenant creation error:', err);
        const error = err as { response?: { data?: { message?: string; error?: string } } };
        const errorMessage = error.response?.data?.message || error.response?.data?.error;

        // If tenant already exists, fetch and navigate
        if (errorMessage?.includes('already exists')) {
          try {
            const tenantsResponse = await apiService.getMyTenants();
            if (tenantsResponse.success && tenantsResponse.data.tenants?.length > 0) {
              const userTenants = tenantsResponse.data.tenants;
              setTenants(userTenants);
              
              const selectResponse = await apiService.selectTenant(userTenants[0].id);
              localStorage.setItem('tenantAccessToken', selectResponse.data.tenantAccessToken);
              navigate(ROUTES.HOME);
              return;
            }
          } catch (fetchError) {
            console.error('Error fetching existing tenants:', fetchError);
          }
        }

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

              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
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
