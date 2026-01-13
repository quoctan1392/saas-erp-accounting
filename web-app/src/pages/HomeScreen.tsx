import { useState, useEffect, useRef } from 'react';
import { useUi } from '../context/UiContext';
import {
  Box,
  Container,
  Typography,
  IconButton,
  Paper,
  Button,
  Fade,
  Dialog,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import * as Iconsax from 'iconsax-react';
import DashboardHeader from '../components/DashboardHeader';
import SearchBox from '../components/SearchBox';
import DateRangeBottomSheet from '../components/DateRangeBottomSheet';
import TimeFilterSheet from '../components/TimeFilterSheet';
import AlertDialog from '../components/AlertDialog';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { ROUTES } from '../config/constants';
import { formatCurrency, getTimeFilterOptions, getDateRangeForFilter, formatDate } from '../utils/dashboardUtils';

// Icon wrapper component for dynamic icon loading
const Icon = ({ name, size = 24, color = 'currentColor', variant = 'Outline' }: any) => {
  const Comp = (Iconsax as any)[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} variant={variant} />;
};

const HomeScreen = () => {
  const navigate = useNavigate();
  // Dialog customization
  const dialogBorderRadius = '20px';
  const [user, setUser] = useState<any>(null);
  const { user: authUser } = useAuth();
  const [currentTenant, setCurrentTenant] = useState<any>(null);
  const hasFetchedTenant = useRef(false);
  
  // Dashboard states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('this_month');
  const [currentRange, setCurrentRange] = useState<{ startDate: Date; endDate: Date }>(() =>
    getDateRangeForFilter('this_month')
  );
  const [tempTimeFilter, setTempTimeFilter] = useState<string>(selectedTimeFilter);
  
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [previewCustomStart, setPreviewCustomStart] = useState<string>('');
  const [previewCustomEnd, setPreviewCustomEnd] = useState<string>('');
  const [showDateRangeSheet, setShowDateRangeSheet] = useState(false);
  const [unreadNotifications] = useState(3);
  
  
  const [fabOpen, setFabOpen] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showTimeFilterModal, setShowTimeFilterModal] = useState(false);
  
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

    if (!accessToken) {
      navigate('/login');
      return;
    }

    // If no tenant access token, redirect to tenant selection
    if (!tenantAccessToken) {
      navigate('/select-tenant');
      return;
    }

    // Load user and tenant data
    const userData = localStorage.getItem('user');
    const tenantData = localStorage.getItem('currentTenant');

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }

    if (tenantData) {
      const parsedTenant = JSON.parse(tenantData);
      setCurrentTenant(parsedTenant);
      hasFetchedTenant.current = true;
    } else if (tenantAccessToken) {
      // Has tenant access token but no current tenant data
      hasFetchedTenant.current = true;

      // Get user's tenants and auto-select if only one
      const handleMissingTenant = async () => {
        try {
          const tenantsResponse = await apiService.getMyTenants();
          const userTenants = tenantsResponse.data?.tenants || tenantsResponse.data || [];

          if (userTenants.length === 0) {
            navigate('/processing');
          } else if (userTenants.length === 1) {
            // Auto-select the single tenant
            const tenant = userTenants[0];
            localStorage.setItem('currentTenant', JSON.stringify(tenant));
            setCurrentTenant(tenant);
          } else {
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

  const handleBusinessSetup = async () => {
    if (!currentTenant) {
      // Check if we have tenant in localStorage but not in state
      const tenantFromStorage = localStorage.getItem('currentTenant');

      if (tenantFromStorage) {
        const parsedTenant = JSON.parse(tenantFromStorage);
        setCurrentTenant(parsedTenant);
        return;
      }

      // No tenant data found - need to select tenant first
      navigate('/select-tenant');
      return;
    }

    try {
      // Get onboarding status from database
      const response = await apiService.getOnboardingStatus(currentTenant.id);

      if (response.success && response.data) {
        const { onboardingCompleted, businessType, businessInfo, businessSector, accountingSetup } = response.data;

        // Store full onboarding data in localStorage for screens to use (caching)
        const onboardingData = {
          isEdit: !!(onboardingCompleted || businessType || businessInfo),
          businessType,
          businessInfo,
          businessSector,
          accountingSetup,
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

  const shiftRange = (filter: string, range: { startDate: Date; endDate: Date }, delta: number) => {
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);

    switch (filter) {
      case 'today': {
        start.setDate(start.getDate() + delta);
        end.setDate(end.getDate() + delta);
        return { startDate: start, endDate: end };
      }

      case 'this_week': {
        const days = 7 * delta;
        start.setDate(start.getDate() + days);
        end.setDate(end.getDate() + days);
        return { startDate: start, endDate: end };
      }

      case 'this_month':
      case 'last_month': {
        const s = new Date(start);
        s.setMonth(s.getMonth() + delta);
        const newStart = new Date(s.getFullYear(), s.getMonth(), 1);
        const newEnd = new Date(s.getFullYear(), s.getMonth() + 1, 0);
        return { startDate: newStart, endDate: newEnd };
      }

      case 'this_quarter': {
        const month = start.getMonth();
        const quarterStartMonth = Math.floor(month / 3) * 3;
        const newQuarterStart = new Date(start.getFullYear(), quarterStartMonth + delta * 3, 1);
        const newQuarterEnd = new Date(newQuarterStart.getFullYear(), newQuarterStart.getMonth() + 3, 0);
        return { startDate: newQuarterStart, endDate: newQuarterEnd };
      }

      case 'this_year': {
        const newStart = new Date(start.getFullYear() + delta, 0, 1);
        const newEnd = new Date(start.getFullYear() + delta, 11, 31);
        return { startDate: newStart, endDate: newEnd };
      }

      default: {
        // custom range or unknown: shift by range length
        const len = end.getTime() - start.getTime();
        const newStart = new Date(start.getTime() + delta * (len + 1));
        const newEnd = new Date(newStart.getTime() + len);
        return { startDate: newStart, endDate: newEnd };
      }
    }
  };

  const handleTimeFilterChange = (direction: 'prev' | 'next') => {
    const delta = direction === 'prev' ? -1 : 1;
    const newRange = shiftRange(selectedTimeFilter, currentRange, delta);
    setCurrentRange(newRange);
    // keep currentRange updated
    // TODO: trigger API reload for the new date range
  };

  const getCurrentFilterLabel = () => {
    if (selectedTimeFilter === 'custom') {
      // Prefer persisted custom values, fall back to currentRange
      if (customStart && customEnd) {
        try {
          const s = new Date(customStart);
          const e = new Date(customEnd);
          return `${formatDate(s)} - ${formatDate(e)}`;
        } catch (err) {
          // fall through
        }
      }
      if (currentRange && currentRange.startDate && currentRange.endDate) {
        return `${formatDate(currentRange.startDate)} - ${formatDate(currentRange.endDate)}`;
      }
      return 'Chọn khoảng';
    }
    if (selectedTimeFilter === 'this_month' || selectedTimeFilter === 'last_month') {
      const m = currentRange.startDate.getMonth() + 1;
      const y = currentRange.startDate.getFullYear();
      return `Tháng ${m}/${y}`;
    }

    if (selectedTimeFilter === 'this_week') {
      return `${formatDate(currentRange.startDate)} - ${formatDate(currentRange.endDate)}`;
    }

    if (selectedTimeFilter === 'today') {
      return formatDate(currentRange.startDate);
    }

    if (selectedTimeFilter === 'this_quarter') {
      const q = Math.floor(currentRange.startDate.getMonth() / 3) + 1;
      return `Quý ${q}/${currentRange.startDate.getFullYear()}`;
    }

    if (selectedTimeFilter === 'this_year') {
      return `Năm ${currentRange.startDate.getFullYear()}`;
    }

    const filters = getTimeFilterOptions();
    return filters.find((f: { value: string; label: string }) => f.value === selectedTimeFilter)?.label || 'Tháng này';
  };

  const { setShowBottomNav } = useUi();

  const handleTimeFilterClick = () => {
    // initialize temporary selection so user can cancel with X
    setTempTimeFilter(selectedTimeFilter);
    setShowTimeFilterModal(true);
    // hide app-level bottom nav while sheet is open
    setShowBottomNav(false);
  };

  

  

  const handleFabClick = () => {
    setFabOpen(!fabOpen);
  };

  const handleSpeedDialAction = (action: string) => {
    setFabOpen(false);
    switch (action) {
      case 'invoice':
        navigate('/invoices/new');
        break;
      case 'receipt':
        navigate('/receipts/new');
        break;
      case 'payment':
        navigate('/payments/new');
        break;
      case 'product':
        navigate('/products/new');
        break;
      case 'customer':
        navigate('/customers/new');
        break;
    }
  };

  // Check if setup guide modal should be shown for new accounts
  useEffect(() => {
    const hasSeenModal = localStorage.getItem('hasSeenSetupGuideModal');
    const justCompletedOnboarding = localStorage.getItem('justCompletedOnboarding');
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Show modal for first-time users who just completed onboarding
    if (!hasSeenModal && justCompletedOnboarding === 'true') {
      // Show modal after 500ms delay
      timer = setTimeout(() => {
        setShowSetupModal(true);
        // Clear the flag after showing modal
        localStorage.removeItem('justCompletedOnboarding');
      }, 500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleSkipSetup = () => {
    localStorage.setItem('hasSeenSetupGuideModal', 'true');
    setShowSetupModal(false);
    setShowInfoModal(true);
  };

  

  // Extract first name (last word) from full name per requirements
  const getFirstName = (fullName: string): string => {
    if (!fullName) return 'Người dùng';
    const parts = fullName.trim().split(/\s+/);
    return parts[parts.length - 1]; // Get last word as first name (Vietnamese naming convention)
  };

  // Get display name for header
  const getDisplayName = (): string => {
    let fullName = '';
    
    // Priority 1: Auth user from context
    if (authUser) {
      if (authUser.firstName || authUser.lastName) {
        fullName = `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim();
      } else if (authUser.email) {
        return authUser.email;
      }
    }
    
    // Priority 2: User from localStorage
    if (!fullName && user) {
      fullName = user.name || user.fullName || user.displayName || user.email || '';
    }
    
    // Extract first name from full name
    if (fullName && !fullName.includes('@')) {
      return getFirstName(fullName);
    }
    
    return fullName || 'Người dùng';
  };

  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#F8F9FA',
          pb: 10,
        }}
      >
        {/* Header */}
        <DashboardHeader
          userName={getDisplayName()}
          unreadNotifications={unreadNotifications}
        />

        {/* Main Content */}
        <Container
          maxWidth="lg"
          sx={{
            px: 2,
            pt: { xs: '124px', sm: '96px', md: 2 },
          }}
        >
          {/* Search Bar with Barcode Scanner */}
          <SearchBox
            fullWidth
            placeholder="Nhập sản phẩm cần tìm..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
            endIcon={
              <IconButton
                sx={{
                  bgcolor: '#FB7E00',
                  color: 'white',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  mr: -0.5,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: '#E65A2E' },
                }}
                aria-label="scan-barcode"
              >
                <Icon name="ScanBarcode" size={20} color="white" variant="Outline" />
              </IconButton>
            }
          />

          {/* Insight Banner */}
          <Paper
            elevation={0}
            sx={{
              backgroundImage: "url('src/assets/banner-background.png')",
              borderRadius: '24px',
              p: 2,
              mb: 2,
              color: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Icon name="Calendar" size={20} color="white" variant="Bold" />
              <Typography sx={{ fontSize: '13px', fontWeight: 500, opacity: 0.9 }}>
                24 tháng 12, 2025
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: '20px',
                fontWeight: 500,
                lineHeight: 1.4,
                mb: 2,
              }}
            >
              Doanh thu bán hàng tăng 23% trong trong tháng này
            </Typography>
            <Button
              endIcon={<Icon name="ArrowRight2" size={16} color="white" variant="Outline" />}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                borderRadius: '100px',
                border:'0.5px solid white',
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 500,
                px: 2,
                py: 0.75,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
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
              backgroundColor: 'white',
              borderRadius: '100px',
              border: '1px solid #DEE2E6',
              padding: '8px 12px',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              mb: 2,
            }}
          >
            <IconButton
              size="small"
              onClick={() => handleTimeFilterChange('prev')}
              sx={{
                bgcolor: 'white',
                '&:hover': { bgcolor: '#F8F9FA' },
              }}
            >
              <Icon name="ArrowLeft2" size={20} color="#6C757D" variant="Outline" />
            </IconButton>
            
            <Box
              onClick={handleTimeFilterClick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                px: 1,
                py: 0.5,
                borderRadius: '8px',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.03)',
                },
              }}
            >
              <Icon name="Calendar1" size={16} color="#4E4E4E" variant="Outline" />
              <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#000' }}>
                {getCurrentFilterLabel()}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => handleTimeFilterChange('next')}
              sx={{
                bgcolor: 'transparent',
                '&:hover': { bgcolor: '#F8F9FA' },
              }}
            >
              <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Linear" />
            </IconButton>
          </Box>

          {/* Financial Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr' },
              gap: 1,
              mb: 3,
              overflowX: 'visible',
              WebkitOverflowScrolling: 'touch',
              maxWidth: { md: '960px' },
              mx: { md: 'auto' },
              '& > div': {
                flex: '1 1 auto',
                minWidth: 0,
              },
            }}
          >
            {/* Revenue Card */}
            <Box>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '24px',
                  border: '1px solid #DFE1E7',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => navigate('/reports/revenue')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: '#F5F5F5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="MoneyRecive" size={20} color="#28A745" variant="Bold" />
                  </Box>
                  <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#6C757D' }}>
                    Tổng đã thu
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#28A745',
                    mb: 1,
                  }}
                >
                  {formatCurrency(dashboardData.totalRevenue.amount)}
                </Typography>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ bgcolor: '#28A745', color: 'white', px: 1, py: '2px', borderRadius: '100px', minWidth: 48, textAlign: 'center', fontWeight: 600, fontSize: 12 }}>
                    +{dashboardData.totalRevenue.changePercent}%
                  </Box>
                  <Typography sx={{ fontSize: '10px', fontWeight: 500, color: '#495057' }}>
                    so với tháng trước
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {/* Expense Card */}
            <Box>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '24px',
                  border: '1px solid #DFE1E7',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => navigate('/reports/expense')}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: '#F5F5F5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="MoneySend" size={20} color="#DC3545" variant="Bold" />
                  </Box>
                  <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#6C757D' }}>
                    Tổng đã chi
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#DC3545',
                    mb: 1,
                  }}
                >
                  {formatCurrency(dashboardData.totalExpense.amount)}
                </Typography>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ bgcolor: '#DC3545', color: 'white', px: 1, py: '2px', borderRadius: '100px', minWidth: 48, textAlign: 'center', fontWeight: 600, fontSize: 12 }}>
                    -{dashboardData.totalExpense.changePercent}%
                  </Box>
                  <Typography sx={{ fontSize: '10px', fontWeight: 500, color: '#495057' }}>
                    so với tháng trước
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Quick Access - 4 items as per requirements */}
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#212529',
                mb: 2,
                ml: 0.5,
              }}
            >
              Truy cập nhanh
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 2,
              }}
            >
              {/* 1. Lên đơn (Bán hàng) */}
              <Box
                onClick={() => navigate('/invoices/new')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(0px)',
                  },
                  '&:active': {
                    transform: 'scale(1)',
                    opacity: 0.7,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 0,
                  }}
                >
                  <Icon name="Receipt" size={36} color="#007DFB" variant="Outline" />
                </Box>
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#090909',
                    textAlign: 'center',
                  }}
                >
                  Bán hàng
                </Typography>
              </Box>

              {/* 2. Mua hàng */}
              <Box
                onClick={() => navigate('/purchases/new')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(0px)',
                  },
                  '&:active': {
                    transform: 'scale(1)',
                    opacity: 0.7,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 0,
                  }}
                >
                  <Icon name="ShoppingCart" size={36} color="#007DFB" variant="Outline" />
                </Box>
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#090909',
                    textAlign: 'center',
                  }}
                >
                  Mua hàng
                </Typography>
              </Box>

              {/* 3. Thu tiền */}
              <Box
                onClick={() => navigate('/receipts/new')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(0px)',
                  },
                  '&:active': {
                    transform: 'scale(1)',
                    opacity: 0.7,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 0,
                  }}
                >
                  <Icon name="MoneyRecive" size={36} color="#007DFB" variant="outline" />
                </Box>
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#090909',
                    textAlign: 'center',
                  }}
                >
                  Thu tiền
                </Typography>
              </Box>

              {/* 4. Chi tiền */}
              <Box
                onClick={() => navigate('/payments/new')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(0px)',
                  },
                  '&:active': {
                    transform: 'scale(1)',
                    opacity: 0.7,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 0,
                  }}
                >
                  <Icon name="MoneySend" size={36} color="#007DFB" variant="Outline" />
                </Box>
                <Typography
                  sx={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#090909',
                    textAlign: 'center',
                  }}
                >
                  Chi tiền
                </Typography>
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
              <Typography
                sx={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#212529',
                }}
              >
                Lời nhắc hôm nay ({dashboardData.remindersCount})
              </Typography>
              <Button
                sx={{
                  textTransform: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0D6EFD',
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                }}
              >
                Xem tất cả
              </Button>
            </Box>

            {/* Show only 1 reminder in compact view */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {mockReminders.slice(0, 1).map((reminder) => (
                <Paper
                  key={reminder.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: 'white',
                    border: '1px solid #E9ECEF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: reminder.type === 'debt' ? '#FFF3CD' : '#D6E9FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      name={reminder.type === 'debt' ? 'Warning2' : 'Box'}
                      size={20}
                      color={reminder.type === 'debt' ? '#FFC107' : '#0D6EFD'}
                      variant="Bold"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#212529',
                        mb: 0.5,
                      }}
                    >
                      {reminder.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '13px',
                        color: '#6C757D',
                        mb: 0.5,
                      }}
                    >
                      {reminder.description}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '12px',
                        color: '#ADB5BD',
                      }}
                    >
                      {reminder.time}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: '#0D6EFD',
                      color: 'white',
                      textTransform: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      px: 2,
                      '&:hover': { bgcolor: '#0B5ED7' },
                    }}
                  >
                    Xem ngay
                  </Button>
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
              startIcon={<Icon name="Setting2" size={20} color="#FB7E00" variant="Outline" />}
              onClick={handleBusinessSetup}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#FB7E00',
                color: '#FB7E00',
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

        {/* Speed Dial Backdrop */}
        {fabOpen && (
          <Box
            onClick={() => setFabOpen(false)}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
              zIndex: 999,
              animation: 'fadeIn 0.25s ease',
              '@keyframes fadeIn': {
                from: { opacity: 0 },
                to: { opacity: 1 },
              },
            }}
          />
        )}

        {/* Speed Dial Menu Items */}
        {fabOpen && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 150,
              right: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              zIndex: 1000,
            }}
          >
            {/* Lên đơn */}
            <Box
              onClick={() => handleSpeedDialAction('invoice')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                animation: 'slideIn 0.2s ease',
                '@keyframes slideIn': {
                  from: { opacity: 0, transform: 'translateY(10px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              <Typography
                sx={{
                  bgcolor: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#212529',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                Lên đơn
              </Typography>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: '#FB7E00',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(251, 126, 0, 0.4)',
                }}
              >
                <Icon name="ReceiptText" size={24} color="white" variant="Outline" />
              </Box>
            </Box>

            {/* Thu tiền */}
            <Box
              onClick={() => handleSpeedDialAction('receipt')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                animation: 'slideIn 0.25s ease',
              }}
            >
              <Typography
                sx={{
                  bgcolor: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#212529',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                Thu tiền
              </Typography>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: '#28A745',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(40, 167, 69, 0.4)',
                }}
              >
                <Icon name="MoneyReceive" size={24} color="white" variant="Outline" />
              </Box>
            </Box>

            {/* Chi tiền */}
            <Box
              onClick={() => handleSpeedDialAction('payment')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                animation: 'slideIn 0.3s ease',
              }}
            >
              <Typography
                sx={{
                  bgcolor: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#212529',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                Chi tiền
              </Typography>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: '#DC3545',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.4)',
                }}
              >
                <Icon name="MoneySend" size={24} color="white" variant="Outline" />
              </Box>
            </Box>

            {/* Thêm hàng hoá */}
            <Box
              onClick={() => handleSpeedDialAction('product')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                animation: 'slideIn 0.35s ease',
              }}
            >
              <Typography
                sx={{
                  bgcolor: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#212529',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                Thêm hàng hoá
              </Typography>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: '#6F42C1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(111, 66, 193, 0.4)',
                }}
              >
                <Icon name="Box" size={24} color="white" variant="Outline" />
              </Box>
            </Box>

            {/* Thêm khách hàng */}
            <Box
              onClick={() => handleSpeedDialAction('customer')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                animation: 'slideIn 0.4s ease',
              }}
            >
              <Typography
                sx={{
                  bgcolor: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#212529',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                Thêm khách hàng
              </Typography>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: '#0D6EFD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(13, 110, 253, 0.4)',
                }}
              >
                <Icon name="Profile" size={24} color="white" variant="Outline" />
              </Box>
            </Box>
          </Box>
        )}

        {/* Floating Action Button */}
        <Box
          onClick={handleFabClick}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 16,
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: '#FB7E00',
            boxShadow: '0 4px 12px rgba(251, 126, 0, 0.38)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1001,
            transition: 'transform 0.2s ease',
            transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            '&:hover': {
              transform: fabOpen ? 'rotate(45deg) scale(1.05)' : 'scale(1.05)',
            },
            '&:active': {
              transform: fabOpen ? 'rotate(45deg) scale(0.95)' : 'scale(0.95)',
            },
          }}
        >
          <Icon name="Add" size={28} color="white" variant="Outline" />
        </Box>

        {/* Custom Time Filter Bottom Sheet (customized for HomeScreen) */}
        <TimeFilterSheet
          open={showTimeFilterModal}
          onClose={() => {
            setPreviewCustomStart('');
            setPreviewCustomEnd('');
            setShowTimeFilterModal(false);
            setShowBottomNav(true);
            setShowDateRangeSheet(false);
          }}
          tempTimeFilter={tempTimeFilter}
          setTempTimeFilter={setTempTimeFilter}
          selectedTimeFilter={selectedTimeFilter}
          setSelectedTimeFilter={setSelectedTimeFilter}
          currentRange={currentRange}
          setCurrentRange={setCurrentRange}
          customStart={customStart}
          customEnd={customEnd}
          setCustomStart={setCustomStart}
          setCustomEnd={setCustomEnd}
          previewCustomStart={previewCustomStart}
          previewCustomEnd={previewCustomEnd}
          setPreviewCustomStart={setPreviewCustomStart}
          setPreviewCustomEnd={setPreviewCustomEnd}
          setShowDateRangeSheet={setShowDateRangeSheet}
          setShowBottomNav={setShowBottomNav}
        />

        {/* Date Range Bottom Sheet (opens when user chooses custom range) */}
        <DateRangeBottomSheet
          open={showDateRangeSheet}
          onClose={() => {
            // closing date sheet without confirming -> keep parent open, discard any transient selection
            setShowDateRangeSheet(false);
            setShowBottomNav(false);
          }}
          initialStart={previewCustomStart ? new Date(previewCustomStart) : customStart ? new Date(customStart) : null}
          initialEnd={previewCustomEnd ? new Date(previewCustomEnd) : customEnd ? new Date(customEnd) : null}
          onConfirm={(s, e) => {
            // set preview values only; final persistence happens when user confirms parent sheet
            const sIso = s.toISOString().slice(0, 10);
            const eIso = e.toISOString().slice(0, 10);
            setPreviewCustomStart(sIso);
            setPreviewCustomEnd(eIso);
            setShowDateRangeSheet(false);
            // keep parent filter sheet open
            setShowBottomNav(false);
            setShowTimeFilterModal(true);
          }}
        />

        {/* Setup Guide Modal (centered dialog with blanket) */}
        <Dialog
          open={showSetupModal}
          onClose={handleSkipSetup}
          fullWidth
          maxWidth="xs"
          PaperProps={{ sx: { borderRadius: dialogBorderRadius } }}
        >
          <DialogContent sx={{ pt: 4, pb: 1, px: 2, textAlign: 'center'}}>
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '22px', fontWeight: 600, color: '#212529', mb: 1 }}>
                Bắt đầu sử dụng
              </Typography>
              <Typography sx={{ fontSize: '15px', color: '#4e4e4e', lineHeight: 1.6, mx: 2 }}>
                Để bắt đầu sử dụng, bạn hãy hoàn thành các bước dưới đây!
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2,  }}>
              <Box
                onClick={() => navigate(ROUTES.DECLARATION_CATEGORIES)}
                sx={{ display: 'flex', alignItems: 'center', gap: 2, p: ' 12px 4px 12px 12px', borderRadius: '12px', bgcolor: '#F9F9F9', cursor: 'pointer' }}
              >
                <Box sx={{ width: 28, height: 28, borderRadius: '100px', bgcolor: '#FB7E00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>1</Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'left' }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#212529', textAlign: 'left' }}>Khai báo danh mục</Typography>
                </Box>
                <IconButton aria-label="go-to-categories" onClick={() => navigate(ROUTES.DECLARATION_CATEGORIES)} sx={{ ml: 0, color: '#6C757D' }}>
                  <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Outline" />
                </IconButton>
              </Box>

              <Box
                onClick={() => navigate(ROUTES.DECLARATION_INITIAL_BALANCE)}
                sx={{ display: 'flex', alignItems: 'center', gap: 2, p: ' 12px 4px 12px 12px', borderRadius: '12px', bgcolor: '#F9F9F9', cursor: 'pointer' }}
              >
                <Box sx={{ width: 28, height: 28, borderRadius: '100px', bgcolor: '#FB7E00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>2</Typography>
                </Box>
                <Box sx={{ flex: 1, textAlign: 'left' }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#212529', textAlign: 'left' }}>Khai báo số dư ban đầu</Typography>
                </Box>
                <IconButton aria-label="go-to-initial-balance" onClick={() => navigate(ROUTES.DECLARATION_INITIAL_BALANCE)} sx={{ ml: 0, color: '#6C757D' }}>
                  <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Outline" />
                </IconButton>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 3 }}>
            <Button
              fullWidth
              variant="text"
              onClick={handleSkipSetup}
              sx={{
                borderRadius: '12px',
                fontSize: '16px',
                textTransform: 'none',
                fontWeight: 500,
                color: '#000',
                py: 0.5,
                mr: 0,
              }}
            >
              Bỏ qua
            </Button>
          </DialogActions>
        </Dialog>

        {/* Info Modal - Setup can be completed later */}
        <AlertDialog
          open={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          variant="info"
          title="Bạn có thể thiết lập sau"
          description="Bạn có thể hoàn tất Khai báo danh mục và số dư ban đầu sau hoặc xem lại tại mục Hướng dẫn sử dụng > Xem lại hướng dẫn"
          actionText="Đã hiểu"
          actionColor="primary"
        />
      </Box>
    </Fade>
  );
};

export default HomeScreen;
