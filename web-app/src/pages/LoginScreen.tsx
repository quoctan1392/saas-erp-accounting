import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import {
  Box,
  Container,
  Typography,
  Alert,
  CircularProgress,
  TextField,
  Button,
  Divider,
  Link,
  IconButton,
  InputAdornment,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config/constants';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login, setTenants } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Vui lòng nhập email và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await apiService.login(formData.email, formData.password);

      if (response.user && response.accessToken) {
        const { user, accessToken, refreshToken } = response;
        login(user, { accessToken, refreshToken }, []);

        try {
          const tenantsResponse = await apiService.getMyTenants();
          const userTenants = tenantsResponse.data || [];

          if (userTenants.length > 0) {
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
        } catch (err) {
          navigate(ROUTES.PROCESSING);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
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
        justifyContent: 'center',
        background: '#F5EBE0',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <Box
          component="img"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 20'%3E%3Crect width='30' height='20' fill='%23da251d'/%3E%3Cpolygon points='15,4 11.47,14.85 20.71,8.15 9.29,8.15 18.53,14.85' fill='%23ff0'/%3E%3C/svg%3E"
          alt="VN"
          sx={{ width: 24, height: 16 }}
        />
        <Typography sx={{ fontSize: '0.875rem', color: '#333', fontWeight: 500 }}>
          Tiếng Việt
        </Typography>
      </Box>

      <Container maxWidth="sm">
        <Box sx={{ px: { xs: 3, sm: 4 }, py: { xs: 4, sm: 6 } }}>
          <Typography
            sx={{
              fontFamily: '"Bricolage Grotesque", sans-serif',
              fontSize: '28px',
              fontWeight: 600,
              lineHeight: '28px',
              letterSpacing: '0.25px',
              color: '#BA5C00',
              mb: 4,
              textAlign: 'left',
            }}
          >
            Khởi đầu cùng Symper
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, backgroundColor: '#fff', border: '1px solid #f44336', borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              placeholder="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              variant="outlined"
              InputProps={{
                endAdornment: formData.email ? (
                  <InputAdornment position="end" sx={{ mr: '16px' }}>
                    <IconButton
                      onClick={() => setFormData(prev => ({ ...prev, email: '' }))}
                      edge="end"
                      sx={{ bgcolor: 'rgba(0,0,0,0.04)', width: 32, height: 32, '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}
                    >
                      <CloseRounded fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#FFF',
                  borderRadius: '48px',
                  '& fieldset': { borderColor: '#C5C5C5', borderWidth: '1px' },
                  '&:hover fieldset': { borderColor: '#FB7E00' },
                  '&.Mui-focused fieldset': { borderColor: '#FB7E00', borderWidth: '1px' },
                },
                '& .MuiOutlinedInput-input': { paddingLeft: '16px', paddingRight: '16px' },
              }}
            />

            <TextField
              fullWidth
              placeholder="Mật khẩu"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              required
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ mr: '16px' }}>
                    <IconButton 
                      onClick={() => setShowPassword(!showPassword)} 
                      edge="end" 
                      sx={{ bgcolor: 'rgba(0,0,0,0.04)', width: 32, height: 32, '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#FFF',
                  borderRadius: '48px',
                  '& fieldset': { borderColor: '#C5C5C5', borderWidth: '1px' },
                  '&:hover fieldset': { borderColor: '#FB7E00' },
                  '&.Mui-focused fieldset': { borderColor: '#FB7E00', borderWidth: '1px' },
                },
                '& .MuiOutlinedInput-input': { paddingLeft: '16px', paddingRight: '16px' },
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.75,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                backgroundColor: loading ? '#E0E0E0' : '#FB7E00',
                borderRadius: '100px',
                color: '#fff',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#C96400', boxShadow: 'none' },
                '&:disabled': { backgroundColor: '#E0E0E0', color: '#999' },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#999' }} /> : 'Tiếp tục'}
            </Button>
          </Box>

          <Divider sx={{ my: 4, borderColor: '#E0E0E0' }}>
            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>Hoặc</Typography>
          </Divider>

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
            {loading ? (
              <CircularProgress sx={{ color: '#FB7E00' }} />
            ) : (
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} size="large" text="continue_with" locale="vi" width="100%" />
            )}
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Chưa có tài khoản?{' '}
              <Link
                component={RouterLink}
                to={ROUTES.SIGNUP}
                sx={{ fontWeight: 600, textDecoration: 'none', color: '#FB7E00', '&:hover': { textDecoration: 'underline' } }}
              >
                Đăng ký ngay
              </Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginScreen;
