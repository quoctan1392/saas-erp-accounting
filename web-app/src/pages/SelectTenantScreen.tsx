import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Fade,
  Alert,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { apiService } from '../services/api';

interface Tenant {
  id: string;
  name: string;
  role: string;
  createdAt: Date;
}

const SelectTenantScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tenants: Tenant[] = location.state?.tenants || [];

  if (tenants.length === 0) {
    // Redirect to processing if no tenants
    navigate('/processing');
    return null;
  }

  const handleSelectTenant = async (tenantId: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await apiService.selectTenant(tenantId);

      localStorage.setItem('tenantAccessToken', response.data.tenantAccessToken);
      localStorage.setItem('currentTenant', JSON.stringify(response.data.tenant));

      // Check if onboarding is completed
      const statusResponse = await apiService.getOnboardingStatus(tenantId);
      
      if (statusResponse.success && !statusResponse.data.onboardingCompleted) {
        // Redirect to onboarding if not completed
        navigate('/onboarding/welcome');
      } else {
        // Go to dashboard if onboarding completed
        navigate('/home');
      }
    } catch (err) {
      console.error('Tenant selection error:', err);
      setError('Không thể đăng nhập vào workspace. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'primary';
      case 'admin':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'Chủ sở hữu';
      case 'admin':
        return 'Quản trị viên';
      case 'member':
        return 'Thành viên';
      default:
        return role;
    }
  };

  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          overflow: 'hidden',
          py: 4,
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            filter: 'blur(60px)',
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Paper
            elevation={24}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Header */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography
                variant="h4"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: 'text.primary',
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                }}
              >
                Chọn Không Gian Làm Việc
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Bạn là thành viên của {tenants.length} workspace
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Tenant List */}
            <List sx={{ width: '100%' }}>
              {tenants.map((tenant, index) => (
                <ListItem
                  key={tenant.id}
                  disablePadding
                  sx={{
                    mb: index < tenants.length - 1 ? 2 : 0,
                  }}
                >
                  <ListItemButton
                    onClick={() => handleSelectTenant(tenant.id)}
                    disabled={loading}
                    sx={{
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover',
                        transform: 'translateX(8px)',
                      },
                      py: 2,
                      px: 2,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 56,
                          height: 56,
                        }}
                      >
                        <BusinessIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: '1rem', sm: '1.25rem' },
                            }}
                          >
                            {tenant.name}
                          </Typography>
                          <Chip
                            label={getRoleLabel(tenant.role)}
                            size="small"
                            color={getRoleColor(tenant.role)}
                            sx={{ height: 24 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          Tham gia từ {new Date(tenant.createdAt).toLocaleDateString('vi-VN')}
                        </Typography>
                      }
                      sx={{ ml: 2 }}
                    />
                    <ArrowForwardIcon sx={{ color: 'text.secondary' }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {/* Footer Note */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 4, textAlign: 'center' }}
            >
              Bạn có thể chuyển đổi giữa các workspace bất cứ lúc nào
            </Typography>
          </Paper>
        </Container>
      </Box>
    </Fade>
  );
};

export default SelectTenantScreen;
