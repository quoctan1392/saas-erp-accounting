import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
import Icon from '../components/Icon';
import { apiService } from '../services/api';
import { ROUTES } from '../config/constants';

export const ForgotPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await apiService.forgotPassword(email);
      
      setSuccess('Nếu email tồn tại trong hệ thống, link đặt lại mật khẩu đã được gửi đến email của bạn.');
      setEmail('');
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
            <IconButton
              onClick={() => navigate(ROUTES.LOGIN)}
              sx={{ mb: 2 }}
            >
              <Icon name="ArrowLeft2" size={20} variant="Outline" color="#333" />
            </IconButton>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: '#333',
              }}
            >
              Quên mật khẩu?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#666',
                mb: 3,
              }}
            >
              Nhập email của bạn và chúng tôi sẽ gửi link để đặt lại mật khẩu.
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
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: email && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setEmail('')}
                      edge="end"
                      size="small"
                    >
                      <Icon name="CloseSquare" size={16} color="rgba(0,0,0,0.6)" variant="Outline" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
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
                'Gửi link đặt lại mật khẩu'
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
