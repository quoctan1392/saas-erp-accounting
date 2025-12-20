import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config/constants';

const getRoleIcon = (role: string) => {
  switch (role.toLowerCase()) {
    case 'owner':
      return <AdminIcon color="primary" />;
    case 'admin':
      return <AdminIcon color="secondary" />;
    default:
      return <PersonIcon />;
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

const getRoleColor = (role: string): 'primary' | 'secondary' | 'default' => {
  switch (role.toLowerCase()) {
    case 'owner':
      return 'primary';
    case 'admin':
      return 'secondary';
    default:
      return 'default';
  }
};

export const TenantSelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { tenants, selectTenant } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleTenantSelect = async (tenant: any) => {
    try {
      setLoading(true);
      setError('');

      // Call API to select tenant
      const response = await apiService.selectTenant(tenant.id);

      if (response.success) {
        // Save tenant access token
        localStorage.setItem('tenantAccessToken', response.data.tenantAccessToken);

        // Update selected tenant in context
        selectTenant(tenant);

        // Navigate to dashboard
        navigate(ROUTES.HOME);
      }
    } catch (err: any) {
      console.error('Tenant selection error:', err);
      setError(
        err.response?.data?.error?.message ||
          'Không thể chọn không gian làm việc. Vui lòng thử lại.'
      );
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            textAlign="center"
            sx={{ mb: 3, fontWeight: 600 }}
          >
            Chọn Không Gian Làm Việc
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: 4 }}
          >
            Bạn là thành viên của {tenants.length} không gian làm việc
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {tenants.map((tenant) => (
                <ListItem key={tenant.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => handleTenantSelect(tenant)}
                    sx={{
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>{getRoleIcon(tenant.role)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight={500}>
                            {tenant.name}
                          </Typography>
                          <Chip
                            label={getRoleLabel(tenant.role)}
                            size="small"
                            color={getRoleColor(tenant.role)}
                          />
                        </Box>
                      }
                      secondary={tenant.createdAt ? `Tham gia từ ${new Date(tenant.createdAt).toLocaleDateString('vi-VN')}` : 'Ngày tham gia không rõ'}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
};
