import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Fade,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import { ROUTES } from '../config/constants';
import { apiService } from '../services/api';

const HomeScreen = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<any>(null);
  const [currentTenant, setCurrentTenant] = useState<any>(null);
  const [isLoadingTenant, setIsLoadingTenant] = useState(false);
  const hasFetchedTenant = useRef(false);

  useEffect(() => {
    // Prevent duplicate runs
    if (hasFetchedTenant.current) {
      return;
    }
    
    // Check authentication - first check if user has basic access token
    const accessToken = localStorage.getItem('accessToken');
    const tenantAccessToken = localStorage.getItem('tenantAccessToken');
    
    console.log('🔑 accessToken:', accessToken ? 'EXISTS' : 'NOT FOUND');
    console.log('🔑 tenantAccessToken:', tenantAccessToken ? 'EXISTS' : 'NOT FOUND');
    
    if (!accessToken) {
      console.log('❌ No accessToken, redirecting to login');
      navigate('/login');
      return;
    }
    
    // If no tenant access token, redirect to tenant selection
    if (!tenantAccessToken) {
      console.log('❌ No tenantAccessToken, redirecting to tenant selection');
      navigate('/select-tenant');
      return;
    }

    // Load user and tenant data
    const userData = localStorage.getItem('user');
    const tenantData = localStorage.getItem('currentTenant');
    
    console.log('👤 userData:', userData ? 'EXISTS' : 'NOT FOUND');
    console.log('🏢 tenantData:', tenantData ? 'EXISTS' : 'NOT FOUND');

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
    
    if (tenantData) {
      const parsedTenant = JSON.parse(tenantData);
      console.log('Setting currentTenant:', parsedTenant);
      setCurrentTenant(parsedTenant);
      hasFetchedTenant.current = true;
    } else if (tenantAccessToken) {
      // Has tenant access token but no current tenant data
      console.log('Has tenantAccessToken but no currentTenant data');
      console.log('Checking how many tenants user has...');
      
      // Mark as fetching to prevent duplicate calls
      hasFetchedTenant.current = true;
      setIsLoadingTenant(true);
      
      // Get user's tenants and auto-select if only one
      const handleMissingTenant = async () => {
        try {
          console.log('Calling getMyTenants API...');
          const tenantsResponse = await apiService.getMyTenants();
          console.log('getMyTenants response:', tenantsResponse);
          
          const userTenants = tenantsResponse.data?.tenants || tenantsResponse.data || [];
          
          console.log('User has', userTenants.length, 'tenant(s):', userTenants);
          
          if (userTenants.length === 0) {
            console.log('No tenants found, redirecting to processing');
            navigate('/processing');
          } else if (userTenants.length === 1) {
            console.log('User has 1 tenant, auto-selecting:', userTenants[0]);
            // Auto-select the single tenant
            const tenant = userTenants[0];
            localStorage.setItem('currentTenant', JSON.stringify(tenant));
            setCurrentTenant(tenant);
            console.log('Auto-selected tenant and saved to localStorage');
          } else {
            console.log('User has multiple tenants, redirecting to tenant selection');
            navigate('/select-tenant');
          }
        } catch (error) {
          console.error('Error fetching tenants:', error);
          // Reset flag so user can retry
          hasFetchedTenant.current = false;
          navigate('/select-tenant');
        } finally {
          setIsLoadingTenant(false);
        }
      };
      
      handleMissingTenant();
    }
  }, [navigate]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
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
    console.log('🔄 handleBusinessSetup called');
    console.log('🏢 currentTenant state:', currentTenant);
    
    if (!currentTenant) {
      console.log('❌ No currentTenant in state');
      
      // Check if we have tenant in localStorage but not in state
      const tenantFromStorage = localStorage.getItem('currentTenant');
      console.log('🏢 tenantFromStorage:', tenantFromStorage);
      
      if (tenantFromStorage) {
        const parsedTenant = JSON.parse(tenantFromStorage);
        console.log('✅ Found tenant in localStorage, updating state:', parsedTenant);
        setCurrentTenant(parsedTenant);
        // Don't retry automatically, wait for next user action
        return;
      }
      
      // No tenant data found - need to select tenant first
      console.log('➡️ No tenant found, redirecting to tenant selection');
      navigate('/select-tenant');
      return;
    }

    console.log('✅ currentTenant exists, proceeding with API call');
    try {
      // Get onboarding status from database
      const response = await apiService.getOnboardingStatus(currentTenant.id);
      
      if (response.success && response.data) {
        const { onboardingCompleted, businessType, businessInfo } = response.data;
        
        console.log('📊 Onboarding data:', {
          onboardingCompleted,
          businessType,
          businessInfo: businessInfo ? 'exists' : 'null'
        });
        
        // Store only edit mode flag in localStorage, not the actual data
        // Data will be fetched fresh by each screen via API
        const onboardingData = {
          isEdit: !!(onboardingCompleted || businessType || businessInfo)
        };
        
        localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
        
        if (onboardingCompleted || businessType || businessInfo) {
          // User has existing onboarding data, navigate based on current step
          if (businessInfo) {
            // Has business info, go to business info screen for editing
            navigate(ROUTES.ONBOARDING_BUSINESS_INFO);
          } else if (businessType) {
            // Has business type only, go to business info screen
            navigate(ROUTES.ONBOARDING_BUSINESS_INFO);
          } else {
            // Has partial data, start from business type
            navigate(ROUTES.ONBOARDING_BUSINESS_TYPE);
          }
        } else {
          // No existing data, start from welcome screen
          navigate(ROUTES.ONBOARDING_WELCOME);
        }
      } else {
        // No onboarding data found, start fresh
        localStorage.removeItem('onboardingData');
        navigate(ROUTES.ONBOARDING_WELCOME);
      }
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      // On API error, still allow user to start onboarding
      localStorage.removeItem('onboardingData');
      navigate(ROUTES.ONBOARDING_WELCOME);
    }
  };

  return (
    <Fade in timeout={800}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* AppBar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'white',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="primary"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Symper
            </Typography>

            {currentTenant && (
              <Chip
                label={currentTenant.name}
                size="small"
                sx={{
                  mr: 2,
                  display: { xs: 'none', sm: 'flex' },
                }}
              />
            )}

            <IconButton onClick={handleMenuOpen}>
              <Avatar
                src={user?.picture}
                sx={{ width: 36, height: 36 }}
              >
                {user?.name ? user.name.charAt(0) : 'U'}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: { mt: 1.5, minWidth: 200 },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
                {currentTenant && (
                  <Chip
                    label={currentTenant.name}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
              <MenuItem onClick={handleSwitchWorkspace}>
                <SwitchAccountIcon sx={{ mr: 1.5 }} />
                Đổi workspace
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 1.5 }} />
                Đăng xuất
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box
            sx={{
              minHeight: 'calc(100vh - 200px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DashboardIcon
              sx={{
                fontSize: 120,
                color: 'text.disabled',
                mb: 3,
              }}
            />
            <Typography
              variant="h3"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: 'text.primary',
                textAlign: 'center',
              }}
            >
              Chào mừng đến với Symper
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, textAlign: 'center' }}
            >
              Trang chủ đang được phát triển
            </Typography>

            {/* Onboarding Button */}
            <Button
              variant="outlined"
              size="large"
              startIcon={<SettingsIcon />}
              onClick={handleBusinessSetup}
              sx={{
                mb: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Thiết lập doanh nghiệp
            </Button>

            {/* Placeholder Cards */}
            <Box sx={{ maxWidth: 900, mt: 4, display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Box sx={{ flex: '1 1 250px', maxWidth: 300 }}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Tổng quan
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Xem tổng quan tài chính
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 250px', maxWidth: 300 }}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Hóa đơn
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quản lý hóa đơn
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 250px', maxWidth: 300 }}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Báo cáo
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Xem báo cáo chi tiết
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Fade>
  );
};

export default HomeScreen;
