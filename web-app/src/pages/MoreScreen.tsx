import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Fade,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import Icon from '../components/Icon';
import { apiService } from '../services/api';
import DashboardHeader from '../components/DashboardHeader';
import { ROUTES } from '../config/constants';

const MoreScreen = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeTab] = useState('more');

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentTenant = JSON.parse(localStorage.getItem('currentTenant') || '{}');

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tenantAccessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('currentTenant');
    navigate('/login');
  };

  const handleSwitchWorkspace = () => {
    localStorage.removeItem('tenantAccessToken');
    localStorage.removeItem('currentTenant');
    navigate('/login');
  };

  const handleBusinessSetup = async () => {
    try {
      let tenant = currentTenant && currentTenant.id ? currentTenant : null;

      if (!tenant) {
        const tenantStr = localStorage.getItem('currentTenant');
        if (tenantStr) {
          tenant = JSON.parse(tenantStr);
        }
      }

      if (!tenant || !tenant.id) {
        // No tenant selected — go to tenant selection
        navigate('/select-tenant');
        return;
      }

      const response = await apiService.getOnboardingStatus(tenant.id);

      if (response.success && response.data) {
        const { onboardingCompleted, businessType, businessInfo } = response.data;

        const onboardingData = {
          isEdit: !!(onboardingCompleted || businessType || businessInfo),
          businessType,
          businessInfo,
          onboardingCompleted,
          cachedAt: Date.now(),
        };

        localStorage.setItem('onboardingData', JSON.stringify(onboardingData));

        const updatedTenant = { ...tenant, businessType, onboardingCompleted };
        localStorage.setItem('currentTenant', JSON.stringify(updatedTenant));

        if (onboardingCompleted || businessType || businessInfo) {
          if (businessInfo) {
            navigate(ROUTES.ONBOARDING_BUSINESS_INFO);
          } else if (businessType) {
            navigate(ROUTES.ONBOARDING_BUSINESS_INFO);
          } else {
            navigate(ROUTES.ONBOARDING_BUSINESS_TYPE);
          }
        } else {
          localStorage.removeItem('onboardingData');
          navigate(ROUTES.ONBOARDING_WELCOME);
        }
      } else {
        localStorage.removeItem('onboardingData');
        navigate(ROUTES.ONBOARDING_WELCOME);
      }
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      localStorage.removeItem('onboardingData');
      navigate(ROUTES.ONBOARDING_WELCOME);
    }
  };

  // Fixed menu items (rendered explicitly to avoid dynamic render issues)

  return (
    <Fade in timeout={800}>
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8F9FA', pb: 10 }}>
        {/* Header */}
        <DashboardHeader
          userName={user?.name}
          userEmail={user?.email}
          userPicture={user?.picture}
          tenantName={currentTenant?.name}
          title="Thêm"
          onLogout={handleLogout}
          onSwitchWorkspace={handleSwitchWorkspace}
        />

        {/* Main Content */}
        <Container
          maxWidth="lg"
          sx={{
            px: 2,
            // Add responsive top padding to account for fixed header on small screens
            pt: { xs: '140px', sm: '140px', md: 2 },
          }}
        >
          {/* User Profile Card */}
          <Paper
            elevation={0}
            onClick={handleUserMenuOpen}
            sx={{
              p: 2,
              mb: 2,
              border: '1px solid #DEE2E6',
              borderRadius: '16px',
              bgcolor: 'white',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#F8F9FA',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={user?.picture}
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: '#FF6B35',
                }}
              >
                {user?.name ? user.name.charAt(0) : 'U'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#212529' }}>
                  {user?.name || 'Người dùng'}
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#6C757D' }}>
                  {user?.email || 'email@example.com'}
                </Typography>
                {currentTenant?.name && (
                  <Typography
                    sx={{
                      fontSize: '12px',
                      color: '#FF6B35',
                      bgcolor: '#FFF4F0',
                      display: 'inline-block',
                      px: 1,
                      py: 0.25,
                      borderRadius: '8px',
                      mt: 0.5,
                    }}
                  >
                    {currentTenant.name}
                  </Typography>
                )}
              </Box>
              <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Outline" />
            </Box>
          </Paper>

          {/* User Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            PaperProps={{
              sx: { mt: 1, minWidth: 200 },
            }}
          >
            <MenuItem onClick={handleSwitchWorkspace}>
              <Icon name="People" size={20} variant="Outline" style={{ marginRight: 12 }} />
              Đổi workspace
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <Icon name="Logout" size={20} variant="Outline" style={{ marginRight: 12 }} />
              Đăng xuất
            </MenuItem>
          </Menu>

          {/* Menu List */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #DEE2E6',
              borderRadius: '16px',
              bgcolor: 'white',
              overflow: 'hidden',
            }}
          >
            <List sx={{ p: 0 }}>
              <Box>
                <ListItem
                  onClick={() => navigate('/settings')}
                  sx={{
                    py: 2,
                    px: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F8F9FA' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: '#6C757D' }}>
                    <Icon name="Setting2" size={24} variant="Outline" />
                  </ListItemIcon>
                  <ListItemText primary="Cài đặt" primaryTypographyProps={{ fontSize: '15px', fontWeight: 500 }} />
                  <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Outline" />
                </ListItem>
                <Divider />
              </Box>

              <Box>
                <ListItem
                  onClick={() => navigate('/notifications')}
                  sx={{
                    py: 2,
                    px: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F8F9FA' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: '#6C757D' }}>
                    <Icon name="Notification" size={24} variant="Outline" />
                  </ListItemIcon>
                  <ListItemText primary="Thông báo" primaryTypographyProps={{ fontSize: '15px', fontWeight: 500 }} />
                  <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Outline" />
                </ListItem>
                <Divider />
              </Box>

              <Box>
                <ListItem
                  onClick={() => navigate('/security')}
                  sx={{
                    py: 2,
                    px: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F8F9FA' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: '#6C757D' }}>
                    <Icon name="Shield" size={24} variant="Outline" />
                  </ListItemIcon>
                  <ListItemText primary="Bảo mật" primaryTypographyProps={{ fontSize: '15px', fontWeight: 500 }} />
                  <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Outline" />
                </ListItem>
                <Divider />
              </Box>
              
              <Box>
                <ListItem
                  onClick={handleBusinessSetup}
                  sx={{
                    py: 2,
                    px: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F8F9FA' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: '#6C757D' }}>
                    <Icon name="Setting2" size={24} variant="Outline" />
                  </ListItemIcon>
                  <ListItemText primary="Thiết lập doanh nghiệp" primaryTypographyProps={{ fontSize: '15px', fontWeight: 500 }} />
                  <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Outline" />
                </ListItem>
                <Divider />
              </Box>

              <Box>
                <ListItem
                  onClick={() => navigate('/language')}
                  sx={{
                    py: 2,
                    px: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F8F9FA' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: '#6C757D' }}>
                    <Icon name="Translate" size={24} variant="Outline" />
                  </ListItemIcon>
                  <ListItemText primary="Ngôn ngữ" primaryTypographyProps={{ fontSize: '15px', fontWeight: 500 }} />
                  <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Outline" />
                </ListItem>
                <Divider />
              </Box>

              <Box>
                <ListItem
                  onClick={() => navigate('/help')}
                  sx={{
                    py: 2,
                    px: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F8F9FA' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: '#6C757D' }}>
                    <Icon name="InfoCircle" size={24} variant="Outline" />
                  </ListItemIcon>
                  <ListItemText primary="Trợ giúp" primaryTypographyProps={{ fontSize: '15px', fontWeight: 500 }} />
                  <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Outline" />
                </ListItem>
                <Divider />
              </Box>

              <Box>
                <ListItem
                  onClick={() => navigate('/about')}
                  sx={{
                    py: 2,
                    px: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F8F9FA' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: '#6C757D' }}>
                    <Icon name="InfoCircle" size={24} variant="Outline" />
                  </ListItemIcon>
                  <ListItemText primary="Về ứng dụng" primaryTypographyProps={{ fontSize: '15px', fontWeight: 500 }} />
                  <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Outline" />
                </ListItem>
              </Box>
            </List>
          </Paper>

          {/* App Version */}
          <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
            <Typography sx={{ fontSize: '13px', color: '#9CA3AF' }}>
              Phiên bản 1.0.0
            </Typography>
          </Box>
        </Container>

      </Box>
    </Fade>
  );
};

export default MoreScreen;
