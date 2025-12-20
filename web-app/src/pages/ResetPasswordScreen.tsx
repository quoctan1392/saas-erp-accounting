import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Alert,
  CircularProgress,
  TextField,
  Button,
  Link,
  IconButton,
  InputAdornment,
  Paper,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { apiService } from '../services/api';
import { ROUTES } from '../config/constants';

export const ResetPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Link đặt lại mật khẩu không hợp lệ');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!token) {
      setError('Token không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await apiService.resetPassword(token, password);
      
      setSuccess('Mật khẩu đã được đặt lại thành công! Đang chuyển đến trang đăng nhập...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F5EBE0',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            padding: 4,
            borderRadius: 2,
            background: 'white',
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: '#333',
              }}
            >
              Đặt lại mật khẩu
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#666',
                mb: 3,
              }}
            >
              Nhập mật khẩu mới cho tài khoản của bạn.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Mật khẩu mới"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || !token}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {password && (
                      <IconButton
                        onClick={() => setPassword('')}
                        edge="end"
                        size="small"
                        sx={{ mr: 0.5 }}
                      >
                        <CloseRounded fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Xác nhận mật khẩu"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || !token}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {confirmPassword && (
                      <IconButton
                        onClick={() => setConfirmPassword('')}
                        edge="end"
                        size="small"
                        sx={{ mr: 0.5 }}
                      >
                        <CloseRounded fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !token}
              sx={{
                mb: 2,
                py: 1.5,
                background: '#FB7E00',
                '&:hover': {
                  background: '#E06D00',
                },
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 600,
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Đặt lại mật khẩu'
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link
                component={RouterLink}
                to={ROUTES.LOGIN}
                sx={{
                  color: '#FB7E00',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Quay lại đăng nhập
              </Link>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};
