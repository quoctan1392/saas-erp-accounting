import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config/constants';

export const LoginDemoScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setLoading(true);
      setError('');

      if (!credentialResponse.credential) {
        setError('Không nhận được thông tin từ Google');
        return;
      }

      const response = await apiService.googleLogin(credentialResponse.credential);

      if (response.success) {
        const { user, tokens, tenants: userTenants } = response.data;
        login(user, tokens, userTenants || []);

        if (response.isNewUser) {
          navigate(ROUTES.PROCESSING);
        } else {
          if (userTenants && userTenants.length > 0) {
            if (userTenants.length === 1) {
              const tenantResponse = await apiService.selectTenant(userTenants[0].id);
              localStorage.setItem('tenantAccessToken', tenantResponse.data.tenantAccessToken);
              navigate(ROUTES.DASHBOARD);
            } else {
              navigate(ROUTES.TENANT_SELECTION);
            }
          } else {
            navigate(ROUTES.PROCESSING);
          }
        }
      } else {
        setError(response.message || 'Đăng nhập thất bại');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Demo user data for testing UI without Google OAuth
    const demoUser = {
      id: 'demo-user-1',
      email: 'demo@symper.vn',
      name: 'Demo User',
      picture: 'https://ui-avatars.com/api/?name=Demo+User&background=667eea&color=fff',
    };

    const demoTokens = {
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
    };

    const demoTenants = [
      {
        id: 'demo-tenant-1',
        name: 'Demo Company',
        role: 'owner',
        createdAt: new Date().toISOString(),
      },
    ];

    login(demoUser, demoTokens, demoTenants);
    
    // Navigate to home since we have one tenant
    localStorage.setItem('tenantAccessToken', 'demo-tenant-token');
    navigate(ROUTES.DASHBOARD);
  };

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
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Symper ERP
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Hệ thống quản lý doanh nghiệp toàn diện
          </Typography>

          <Stack spacing={2}>
            {/* Demo Login Button */}
            <Button
              variant="contained"
              size="large"
              startIcon={<PersonIcon />}
              onClick={handleDemoLogin}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #5e3c82 100%)',
                },
              }}
            >
              Đăng nhập Demo (Không cần Google)
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                HOẶC
              </Typography>
            </Divider>

            {/* Google Login */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Đăng nhập Google thất bại. Vui lòng thử lại.')}
                text="continue_with"
                size="large"
                width="100%"
              />
            </Box>

            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}

            {loading && (
              <Typography color="primary" variant="body2">
                Đang xử lý...
              </Typography>
            )}
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Hoặc sử dụng tài khoản email
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                component={RouterLink}
                to={ROUTES.LOGIN}
                variant="outlined"
                size="medium"
              >
                Đăng nhập
              </Button>
              <Button
                component={RouterLink}
                to={ROUTES.SIGNUP}
                variant="contained"
                size="medium"
              >
                Đăng ký
              </Button>
            </Stack>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
            Bằng cách đăng nhập, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginDemoScreen;
