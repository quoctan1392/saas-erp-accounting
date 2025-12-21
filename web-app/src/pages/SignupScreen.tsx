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
import Icon from '../components/Icon';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config/constants';
import loginBgMobile from '../assets/Header_day.png';

export const SignupScreen: React.FC = () => {
  const navigate = useNavigate();
  const { login, setTenants } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
              navigate(ROUTES.HOME);
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
      {/* Background image cho mobile */}
      <Box
        component="img"
        src={loginBgMobile}
        alt=""
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 'auto',
          maxHeight: '200px',
          objectFit: 'cover',
          objectPosition: 'center top',
          zIndex: 0,
          display: { xs: 'block', sm: 'none' }, // Chỉ hiển thị trên mobile
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          zIndex: 10, // Đảm bảo hiển thị trên background
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

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box 
          sx={{ 
            background: '#fff',
            borderRadius: { 
              xs: '16px 16px 0 0',  // Mobile: chỉ top-left và top-right có border radius
              sm: '16px',            // Tablet và Desktop: tất cả các góc đều có border radius
            },
            px: { xs: 3, sm: 4 }, 
            py: { xs: 4, sm: 6 },
            position: { xs: 'fixed', sm: 'relative' }, // Mobile: fixed để chạm đáy
            top: { xs: '140px', sm: 'auto' },          // Mobile: cách top 140px
            bottom: { xs: 0, sm: 'auto' },             // Mobile: chạm cạnh dưới
            left: { xs: '12px', sm: 'auto' },          // Mobile: margin left 12px
            right: { xs: '12px', sm: 'auto' },         // Mobile: margin right 12px
            maxWidth: { xs: 'calc(100% - 24px)', sm: '100%' }, // Mobile: trừ đi margin 2 bên
          }}
        >
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
            Tạo tài khoản Symper
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, backgroundColor: '#fff', border: '1px solid #f44336', borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3 }}>
            {loading ? (
              <CircularProgress sx={{ color: '#FB7E00' }} />
            ) : (
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} size="large" text="signup_with" locale="vi" width="100%" />
            )}
          </Box>

          <Divider sx={{ my: 4, borderColor: '#E0E0E0' }}>
            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>Hoặc</Typography>
          </Divider>

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Tên"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                variant="outlined"
                InputProps={{
                  endAdornment: formData.firstName ? (
                    <InputAdornment position="end" sx={{ mr: '16px' }}>
                      <IconButton
                        onClick={() => setFormData(prev => ({ ...prev, firstName: '' }))}
                        edge="end"
                        sx={{ bgcolor: 'rgba(0,0,0,0.04)', width: 32, height: 32, '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}
                      >
                        <Icon name="CloseSquare" size={16} color="rgba(0,0,0,0.6)" variant="Outline" />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                }}
                sx={{
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
                placeholder="Họ"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                variant="outlined"
                InputProps={{
                  endAdornment: formData.lastName ? (
                    <InputAdornment position="end" sx={{ mr: '16px' }}>
                      <IconButton
                        onClick={() => setFormData(prev => ({ ...prev, lastName: '' }))}
                        edge="end"
                        sx={{ bgcolor: 'rgba(0,0,0,0.04)', width: 32, height: 32, '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}
                      >
                        <Icon name="CloseSquare" size={16} color="rgba(0,0,0,0.6)" variant="Outline" />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                }}
                sx={{
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
            </Box>

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
                        <Icon name="CloseSquare" size={16} color="rgba(0,0,0,0.6)" variant="Outline" />
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
              placeholder="Mật khẩu (ít nhất 8 ký tự)"
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
                      {showPassword ? (
                        <Icon name="EyeSlash" size={16} color="rgba(0,0,0,0.6)" variant="Outline" />
                      ) : (
                        <Icon name="Eye" size={16} color="rgba(0,0,0,0.6)" variant="Outline" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
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
              placeholder="Xác nhận mật khẩu"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              variant="outlined"
              InputProps={{
                endAdornment: (
                    <InputAdornment position="end" sx={{ mr: '16px' }}>
                    <IconButton 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      edge="end" 
                      sx={{ bgcolor: 'rgba(0,0,0,0.04)', width: 32, height: 32, '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}
                    >
                      {showConfirmPassword ? (
                        <Icon name="EyeSlash" size={16} color="rgba(0,0,0,0.6)" variant="Outline" />
                      ) : (
                        <Icon name="Eye" size={16} color="rgba(0,0,0,0.6)" variant="Outline" />
                      )}
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
              {loading ? <CircularProgress size={24} sx={{ color: '#999' }} /> : 'Đăng ký'}
            </Button>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Đã có tài khoản?{' '}
              <Link
                component={RouterLink}
                to={ROUTES.LOGIN}
                sx={{ fontWeight: 600, textDecoration: 'none', color: '#FB7E00', '&:hover': { textDecoration: 'underline' } }}
              >
                Đăng nhập ngay
              </Link>
            </Typography>
          </Box>

          <Typography
            variant="caption"
            sx={{ mt: 3, display: 'block', textAlign: 'center', color: '#999', fontSize: '0.75rem' }}
          >
            Bằng cách đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default SignupScreen;
