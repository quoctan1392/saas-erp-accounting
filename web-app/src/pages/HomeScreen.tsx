import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  Fade,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import DashboardHeader from '../components/DashboardHeader';
import { ROUTES } from '../config/constants';
import { apiService } from '../services/api';
import { formatCurrency, getTimeFilterOptions } from '../utils/dashboardUtils';
import * as Iconsax from 'iconsax-react';

// Icon wrapper component for dynamic icon loading
const Icon = ({ name, size = 24, color = 'currentColor', variant = 'Outline' }: any) => {
  const Comp = (Iconsax as any)[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} variant={variant} />;
};

const HomeScreen = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { user: authUser } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<any>(null);
  const hasFetchedTenant = useRef(false);
  
  // Dashboard states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('this_month');
  const [unreadNotifications] = useState(3);
  const [activeTab] = useState('home');
  
  // Mock data - replace with API calls
  const [dashboardData] = useState({
    totalRevenue: { amount: 700240000, changePercent: 2.3, trend: 'up' as const },
    totalExpense: { amount: 235340000, changePercent: 5.3, trend: 'down' as const },
    remindersCount: 2,
  });

  const mockReminders = [
    {
      id: '1',
      type: 'debt',
      title: 'Công nợ quá hạn',
      description: 'Khách hàng Nguyễn Văn A chưa thanh toán',
      time: '2 giờ trước',
    },
    {
      id: '2',
      type: 'inventory',
      title: 'Tồn kho thấp',
      description: 'Sản phẩm ABC sắp hết hàng',
      time: 'Hôm nay 14:00',
    },
  ];

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
      console.log('📝 Parsed user data:', parsedUser);
      console.log('📝 User name field:', parsedUser.name);
      console.log('📝 User fullName field:', parsedUser.fullName);
      console.log('📝 User displayName field:', parsedUser.displayName);
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
        }
      };

      handleMissingTenant();
    }
  }, [navigate]);

  const handleNavigateToMore = () => {
    navigate('/more');
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
          businessInfo: businessInfo ? 'exists' : 'null',
        });

        // Store full onboarding data in localStorage for screens to use (caching)
        const onboardingData = {
          isEdit: !!(onboardingCompleted || businessType || businessInfo),
          businessType,
          businessInfo,
          onboardingCompleted,
          cachedAt: Date.now(),
        };

        localStorage.setItem('onboardingData', JSON.stringify(onboardingData));

        // Also update currentTenant with latest businessType
        const updatedTenant = { ...currentTenant, businessType, onboardingCompleted };
        localStorage.setItem('currentTenant', JSON.stringify(updatedTenant));
        setCurrentTenant(updatedTenant);

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

  const handleTimeFilterChange = (direction: 'prev' | 'next') => {
    const filters = getTimeFilterOptions();
    const currentIndex = filters.findIndex(f => f.value === selectedTimeFilter);
    
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedTimeFilter(filters[currentIndex - 1].value);
    } else if (direction === 'next' && currentIndex < filters.length - 1) {
      setSelectedTimeFilter(filters[currentIndex + 1].value);
    }
  };

  const getCurrentFilterLabel = () => {
    const filters = getTimeFilterOptions();
    return filters.find(f => f.value === selectedTimeFilter)?.label || 'Tháng này';
  };

  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#F8F9FA',
          pb: 10,
          // Use SF Pro Display across HomeScreen; header title overrides its own font
          fontFamily:
            'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        {/* Header */}
        <DashboardHeader
          userName={
            // prefer authenticated context user (signup flow) then fallback to parsed local user
            (authUser && ((authUser.firstName || authUser.lastName)
              ? `${authUser.firstName || ''}${authUser.firstName && authUser.lastName ? ' ' : ''}${authUser.lastName || ''}`
              : authUser.email)) ||
            user?.name ||
            user?.fullName ||
            user?.displayName ||
            user?.email
          }
          unreadNotifications={unreadNotifications}
        />

        {/* Main Content */}
        <Container
          maxWidth="lg"
          sx={{
            px: 2,
            // ensure content isn't hidden under fixed header on small screens
            pt: { xs: '96px', sm: '96px', md: 2 },
          }}
        >
          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Nhập sản phẩm cần tìm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                borderRadius: '24px',
                height: '48px',
                '& fieldset': {
                  borderColor: '#DEE2E6',
                },
                // reduce horizontal padding inside the input
                '& .MuiOutlinedInput-input': {
                  paddingLeft: '12px',
                  // reduced right padding per request (was 48px)
                  paddingRight: '8px',
                },
                // // override MUI adornment spacing so the end adornment sits close
                // '& .MuiInputAdornment-root.MuiInputAdornment-positionEnd': {
                //   marginLeft: 0,
                //   paddingLeft: 0,
                //   paddingRight: '2px',
                // },
                // // when the input has an end adornment, reduce default extra padding
                // '&.MuiOutlinedInput-adornedEnd': {
                //   paddingRight: '6px',
                // },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon name="SearchNormal" size={20} color="#6C757D" variant="Outline" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end" sx={{ pr: '0px' }}>
                  <IconButton
                    sx={{
                      // no background, icon only
                      bgcolor: 'transparent',
                      color: 'rgba(0, 0, 0, 0.56)',
                      width: 'auto',
                      height: 'auto',
                      mr: 0,
                      p: 0.5,
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                    }}
                    aria-label="scan-barcode"
                  >
                    <Icon name="scan-barcode" size={20} color="inherit" variant="Outline" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Insight Banner */}
          <Paper
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #08163C 50%, #47C7CE 100%)',
              borderRadius: '20px',
              p: 2.5,
              mb: 2,
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Icon name="Calendar" size={14} color="rgba(255,255,255,0.9)" variant="TwoTone" />
              <Typography sx={{ fontSize: '12px', opacity: 0.9 }}>
                30 tháng 6, 2025
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: '22px',
                fontWeight: 500,
                lineHeight: 1.3,
                mb: 2,
              }}
            >
              Doanh thu bán hàng tăng 5.9% trong 01 tuần
            </Typography>
            <Button
              endIcon={<Icon name="ArrowRight" size={16} color="white" variant="Outline" />}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                color: 'white',
                textTransform: 'none',
                fontSize: '13px',
                fontWeight: 500,
                px: 2,
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              Xem báo cáo
            </Button>
          </Paper>

          {/* Time Filter */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              mb: 2,
            }}
          >
            <IconButton
              size="small"
              onClick={() => handleTimeFilterChange('prev')}
              sx={{
                bgcolor: 'white',
                border: '1px solid #DEE2E6',
                '&:hover': { bgcolor: '#F8F9FA' },
              }}
            >
              <Icon name="ArrowLeft" size={20} color="#6C757D" variant="Outline" />
            </IconButton>
            
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Icon name="Calendar" size={16} color="#6C757D" variant="Outline" />
              <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#212529' }}>
                {getCurrentFilterLabel()}
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={() => handleTimeFilterChange('next')}
              sx={{
                bgcolor: 'white',
                border: '1px solid #DEE2E6',
                '&:hover': { bgcolor: '#F8F9FA' },
              }}
            >
              <Icon name="ArrowRight" size={20} color="#6C757D" variant="Outline" />
            </IconButton>
          </Box>

          {/* Financial Cards */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'grid' },
              gridTemplateColumns: { md: '1fr 1fr' },
              gap: 1.5,
              mb: 3,
              // allow horizontal scroll on small screens when cards wider than viewport
              overflowX: { xs: 'auto', md: 'visible' },
              WebkitOverflowScrolling: 'touch',
              '& > div': {
                flex: { xs: '0 0 180px', md: '1 1 auto' },
              },
            }}
          >
            {/* Tổng đã thu */}
            <Box>
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid #DEE2E6',
                  borderRadius: '16px',
                  p: 2,
                  bgcolor: 'white',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: '#F8F9FA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="Wallet" size={18} color="#28A745" variant="TwoTone" />
                  </Box>
                  <Typography sx={{ fontSize: '12px', color: '#6C757D', fontWeight: 500 }}>
                    Tổng đã thu
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#28A745',
                    lineHeight: 1.2,
                    mb: 1,
                  }}
                >
                  {formatCurrency(dashboardData.totalRevenue.amount)}
                </Typography>
                <Chip
                  icon={<Icon name="TrendUp" size={14} color="#28A745" variant="Outline" />}
                  label={`+${dashboardData.totalRevenue.changePercent}% so với tháng trước`}
                  size="small"
                  sx={{
                    height: 'auto',
                    py: 0.5,
                    pl: 1,
                    bgcolor: '#D4EDDA',
                    color: '#28A745',
                    fontSize: '11px',
                    fontWeight: 500,
                    '& .MuiChip-icon': { color: '#28A745' },
                  }}
                />
              </Paper>
            </Box>

            {/* Tổng đã chi */}
            <Box>
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid #DEE2E6',
                  borderRadius: '16px',
                  p: 2,
                  bgcolor: 'white',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: '#F8F9FA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="MoneyRecive" size={18} color="#DC3545" variant="TwoTone" />
                  </Box>
                  <Typography sx={{ fontSize: '12px', color: '#6C757D', fontWeight: 500 }}>
                    Tổng đã chi
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#DC3545',
                    lineHeight: 1.2,
                    mb: 1,
                  }}
                >
                  {formatCurrency(dashboardData.totalExpense.amount)}
                </Typography>
                <Chip
                  icon={<Icon name="TrendDown" size={14} color="#DC3545" variant="Outline" />}
                  label={`-${dashboardData.totalExpense.changePercent}% so với tháng trước`}
                  size="small"
                  sx={{
                    height: 'auto',
                    py: 0.5,
                    pl: 1,
                    bgcolor: '#F8D7DA',
                    color: '#DC3545',
                    fontSize: '11px',
                    fontWeight: 500,
                    '& .MuiChip-icon': { color: '#DC3545' },
                  }}
                />
              </Paper>
            </Box>
          </Box>

          {/* Quick Access */}
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#212529',
                mb: 2,
              }}
            >
              Truy cập nhanh
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '16px',
                      border: '1px solid #DEE2E6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'white',
                      '&:hover': {
                        bgcolor: '#F8F9FA',
                      },
                    }}
                  >
                    <Icon name="ShoppingCart" size={24} color="#4F46E5" variant="TwoTone" />
                  </Paper>
                  <Typography sx={{ fontSize: '12px', fontWeight: 500, textAlign: 'center' }}>
                    Bán hàng
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '16px',
                      border: '1px solid #DEE2E6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'white',
                      '&:hover': {
                        bgcolor: '#F8F9FA',
                      },
                    }}
                  >
                    <Icon name="Bag2" size={24} color="#8B5CF6" variant="TwoTone" />
                  </Paper>
                  <Typography sx={{ fontSize: '12px', fontWeight: 500, textAlign: 'center' }}>
                    Mua hàng
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '16px',
                      border: '1px solid #DEE2E6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'white',
                      '&:hover': {
                        bgcolor: '#F8F9FA',
                      },
                    }}
                  >
                    <Icon name="MoneyRecive" size={24} color="#28A745" variant="TwoTone" />
                  </Paper>
                  <Typography sx={{ fontSize: '12px', fontWeight: 500, textAlign: 'center' }}>
                    Thu tiền
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '16px',
                      border: '1px solid #DEE2E6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'white',
                      '&:hover': {
                        bgcolor: '#F8F9FA',
                      },
                    }}
                  >
                    <Icon name="MoneySend" size={24} color="#FF6B35" variant="TwoTone" />
                  </Paper>
                  <Typography sx={{ fontSize: '12px', fontWeight: 500, textAlign: 'center' }}>
                    Chi tiền
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Reminders */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#212529' }}>
                Lời nhắc hôm nay ({dashboardData.remindersCount})
              </Typography>
              <Button
                sx={{
                  textTransform: 'none',
                  color: '#FF6B35',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Xem tất cả
              </Button>
            </Box>

            {/* Reminder Items Preview */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {mockReminders.map((reminder) => (
                <Paper
                  key={reminder.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid #DEE2E6',
                    borderRadius: '12px',
                    bgcolor: 'white',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: '#F8F9FA',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: reminder.type === 'debt' ? '#FFF4F0' : '#FFF9E6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {reminder.type === 'debt' ? (
                        <Icon name="Notification" size={20} color="#FF6B35" variant="TwoTone" />
                      ) : (
                        <Icon name="Warning2" size={20} color="#FFC107" variant="TwoTone" />
                      )}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#212529', mb: 0.5 }}>
                        {reminder.title}
                      </Typography>
                      <Typography sx={{ fontSize: '13px', color: '#6C757D', mb: 0.5 }}>
                        {reminder.description}
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#9CA3AF' }}>
                        {reminder.time}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>

          {/* Business Setup Button */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<Icon name="Setting2" size={20} color="#FF6B35" variant="Outline" />}
              onClick={handleBusinessSetup}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#FF6B35',
                color: '#FF6B35',
                py: 1.5,
                '&:hover': {
                  borderColor: '#E65A2E',
                  bgcolor: '#FFF4F0',
                },
              }}
            >
              Thiết lập doanh nghiệp
            </Button>
          </Box>
        </Container>

        {/* Floating Action Button */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: '#FF6B35',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
          }}
        >
          <Icon name="Add" size={24} color="white" variant="Outline" />
        </Box>
      </Box>
    </Fade>
  );
};

export default HomeScreen;
