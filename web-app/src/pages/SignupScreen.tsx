import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import {
  Box,
  Container,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  TextField,
  Button,
  Divider,
  Link,
} from '@mui/material';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config/constants';

export const SignupScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login, setTenants } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }

    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('Calling register API with:', {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      // Call register API
      const response = await apiService.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
      });

      console.log('Register response:', response);

      if (response.user && response.accessToken) {
        const { user, accessToken, refreshToken } = response;

        // Save user and tokens to context
        login(user, { accessToken, refreshToken }, []);

        // New user - go to processing screen to create tenant
        navigate(ROUTES.PROCESSING);
      } else {
        console.error('Invalid response structure:', response);
        setError('Đăng ký thất bại. Dữ liệu trả về không đúng định dạng.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      const error = err as { response?: { data?: { message?: string; error?: string } } };
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || (err as Error).message 
        || 'Đăng ký thất bại. Vui lòng thử lại.';
      console.error('Error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setLoading(true);
      setError('');

      if (!credentialResponse.credential) {
        setError('Không nhận được thông tin từ Google');
        return;
      }

      // Call backend API
      const response = await apiService.googleLogin(credentialResponse.credential);

      if (response.success) {
        const { user, tokens, tenants: userTenants } = response.data;

        // Save user and tokens to context
        login(user, tokens, userTenants || []);

        // Navigate based on user status
        if (response.isNewUser) {
          navigate(ROUTES.PROCESSING);
        } else {
          if (userTenants && userTenants.length > 0) {
            if (userTenants.length === 1) {
              const tenantResponse = await apiService.selectTenant(userTenants[0].id);
              localStorage.setItem('tenantAccessToken', tenantResponse.data.tenantAccessToken);
              navigate(ROUTES.DASHBOARD);
            } else {
              setTenants(userTenants);
              navigate(ROUTES.TENANT_SELECTION);
            }
          } else {
            navigate(ROUTES.PROCESSING);
          }
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setError(error.response?.data?.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Đăng nhập với Google thất bại. Vui lòng thử lại.');
  };

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
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
          }}
        >
          {/* Logo/Illustration */}
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2.5rem',
                fontWeight: 700,
              }}
            >
              S
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontSize: { xs: '1.75rem', sm: '2.125rem' },
              textAlign: 'center',
            }}
          >
            Tạo tài khoản mới
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, textAlign: 'center' }}
          >
            Đăng ký để bắt đầu sử dụng Symper
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Google Sign Up */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 3,
            }}
          >
            {loading ? (
              <CircularProgress />
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="large"
                text="signup_with"
                locale="vi"
              />
            )}
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Hoặc đăng ký bằng email
            </Typography>
          </Divider>

          {/* Sign Up Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Tên"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Họ"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Box>

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Mật khẩu"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              helperText="Ít nhất 8 ký tự"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Đăng ký'}
            </Button>
          </Box>

          {/* Footer */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Đã có tài khoản?{' '}
              <Link
                component={RouterLink}
                to={ROUTES.LOGIN}
                sx={{ fontWeight: 600, textDecoration: 'none' }}
              >
                Đăng nhập ngay
              </Link>
            </Typography>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 3, display: 'block', textAlign: 'center' }}
          >
            Bằng cách đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default SignupScreen;
