import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import { BusinessType, BusinessSector } from '../../types/onboarding';
import AppButton from '../../components/AppButton';
import OnboardingHeader from '../../components/OnboardingHeader';
import welcomeBg from '../../assets/Welcome screen.png';
import AlertDialog from '../../components/AlertDialog';
import BottomSheet from '../../components/BottomSheet';
import RoundedTextField from '../../components/RoundedTextField';
import Icon from '../../components/Icon';
import apiService from '../../services/api';

interface Industry {
  id: number;
  code: string;
  name: string;
  displayText: string;
}

interface SectorOption {
  value: BusinessSector;
  label: string;
  description: string;
  icon: string;
}

/* IndustryOption type is defined in src/data/industries.ts */

const BusinessSectorScreen = () => {
  const navigate = useNavigate();
  const [selectedSector, setSelectedSector] = useState<BusinessSector>(BusinessSector.THUONG_MAI);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [snack, setSnack] = useState<{
    open: boolean;
    severity: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }>({
    open: false,
    severity: 'success',
    message: '',
  });
  const initialFormRef = useRef<{
    sector: BusinessSector;
    industry: Industry | null;
  } | null>(null);

  const handleCloseSnack = () => setSnack((s) => ({ ...s, open: false }));

  const filteredIndustries = useMemo(() => {
    if (!searchTerm.trim()) return industries;
    
    const searchLower = searchTerm.toLowerCase();
    const results = industries.filter(industry =>
      industry.name.toLowerCase().includes(searchLower) ||
      industry.code.includes(searchTerm)
    );

    // Ensure numeric ordering by `code` (1..9 then 10..)
    return results.slice().sort((a: Industry, b: Industry) => {
      const na = parseInt(String(a.code).trim(), 10);
      const nb = parseInt(String(b.code).trim(), 10);
      const naValid = !Number.isNaN(na);
      const nbValid = !Number.isNaN(nb);
      if (naValid && nbValid) return na - nb;
      if (naValid) return -1;
      if (nbValid) return 1;
      return String(a.code || '').localeCompare(String(b.code || ''));
    });
  }, [industries, searchTerm]);

  const handleSelectIndustry = (industry: Industry) => {
    setSelectedIndustry(industry);
    setSearchTerm('');
    setShowBottomSheet(false);
  };

  const sectorOptions: SectorOption[] = [
    {
      value: BusinessSector.THUONG_MAI,
      label: 'Thương mại',
      description: 'Mua bán, phân phối hàng hóa',
      icon: 'Shop',
    },
    {
      value: BusinessSector.DICH_VU,
      label: 'Dịch vụ',
      description: 'Cung cấp dịch vụ, tư vấn',
      icon: 'Setting2',
    },
    {
      value: BusinessSector.SAN_XUAT,
      label: 'Sản xuất',
      description: 'Sản xuất, chế biến sản phẩm',
      icon: 'Chart',
    },
    {
      value: BusinessSector.XAY_LAP,
      label: 'Xây lắp',
      description: 'Thi công xây dựng, lắp đặt',
      icon: 'Buildings',
    },
  ];

  useEffect(() => {
    const loadOnboardingData = async () => {
      setIsDataLoading(true);
      try {
        // Fetch industries from API and sort by numeric code
        const industriesData = await apiService.getIndustries();
        const sorted = (industriesData || []).slice().sort((a: Industry, b: Industry) => {
          const na = parseInt(String(a.code).trim(), 10);
          const nb = parseInt(String(b.code).trim(), 10);
          const naValid = !Number.isNaN(na);
          const nbValid = !Number.isNaN(nb);
          if (naValid && nbValid) return na - nb;
          if (naValid) return -1;
          if (nbValid) return 1;
          return String(a.code || '').localeCompare(String(b.code || ''));
        });
        setIndustries(sorted);

        const onboardingData = localStorage.getItem('onboardingData');
        if (onboardingData) {
          try {
            const data = JSON.parse(onboardingData);
            setBusinessType(data.businessType || null);

            if (data.businessSector) {
              setSelectedSector(data.businessSector.sector || BusinessSector.THUONG_MAI);
              if (data.businessSector.industryCode) {
                const industry = industriesData.find(
                  (i: Industry) => i.code === data.businessSector.industryCode
                );
                if (industry) {
                  setSelectedIndustry(industry);
                }
              }
            }
          } catch (error) {
            console.error('Error parsing onboarding data:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load industries:', error);
        // Fallback: use a small built-in list so UI remains usable when backend is down
        const FALLBACK_INDUSTRIES: Industry[] = [
          { id: 1, code: '101', name: 'Hoạt động bán buôn, bán lẻ', displayText: '101 - Bán buôn, bán lẻ' },
          { id: 2, code: '201', name: 'Dịch vụ tư vấn, hỗ trợ', displayText: '201 - Dịch vụ, tư vấn' },
          { id: 3, code: '301', name: 'Sản xuất và chế biến', displayText: '301 - Sản xuất' },
        ];
        setIndustries(FALLBACK_INDUSTRIES);
        setSnack({
          open: true,
          severity: 'warning',
          message: 'Không thể tải danh sách ngành nghề từ server — đang sử dụng dữ liệu cục bộ.',
        });
      } finally {
        setIsDataLoading(false);
      }
    };

    loadOnboardingData();
  }, []);

  // Set initial snapshot after states are updated
  useEffect(() => {
    if (!isDataLoading) {
      initialFormRef.current = {
        sector: selectedSector,
        industry: selectedIndustry,
      };
    }
  }, [isDataLoading, selectedSector, selectedIndustry]);

  const handleBack = () => {
    try {
      const initial = initialFormRef.current;
      const changed =
        initial &&
        (initial.sector !== selectedSector ||
          initial.industry?.code !== selectedIndustry?.code);
      if (changed) {
        setShowConfirmDialog(true);
      } else {
        navigateBack();
      }
    } catch (err) {
      setShowConfirmDialog(true);
    }
  };

  const navigateBack = () => {
    if (businessType === BusinessType.HOUSEHOLD_BUSINESS) {
      navigate(ROUTES.ONBOARDING_BUSINESS_INFO);
    } else if (businessType === BusinessType.PRIVATE_ENTERPRISE) {
      navigate(ROUTES.ONBOARDING_BUSINESS_INFO_DNTN);
    } else {
      navigate(ROUTES.ONBOARDING_BUSINESS_TYPE);
    }
  };

  const handleConfirmLeave = () => {
    setShowConfirmDialog(false);
    navigateBack();
  };

  const handleCancelLeave = () => setShowConfirmDialog(false);

  const handleSubmit = async () => {
    // Validation
    if (!selectedIndustry) {
      setSnack({
        open: true,
        severity: 'error',
        message: 'Vui lòng chọn ngành nghề kinh doanh chính',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get current tenant
      const currentTenantStr = localStorage.getItem('currentTenant');
      if (!currentTenantStr) {
        setSnack({
          open: true,
          severity: 'error',
          message: 'Không tìm thấy thông tin tenant. Vui lòng đăng nhập lại.',
        });
        setTimeout(() => navigate('/login'), 1200);
        return;
      }

      // Parse tenant for future API calls
      JSON.parse(currentTenantStr); // Validate JSON format

      // Save to localStorage
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      const updatedData = {
        ...onboardingData,
        businessSector: {
          sector: selectedSector,
          industryCode: selectedIndustry.code,
          industryName: selectedIndustry.name,
        },
        cachedAt: Date.now(),
      };
      localStorage.setItem('onboardingData', JSON.stringify(updatedData));

      // TODO: Call API to save business sector
      // await apiService.saveBusinessSector(currentTenant.id, {
      //   sector: selectedSector,
      //   industryCode: selectedIndustry.code,
      // });

      console.log('[BusinessSectorScreen] Saved business sector:', {
        sector: selectedSector,
        industry: selectedIndustry,
      });

      setTimeout(() => {
        navigate(ROUTES.ONBOARDING_ACCOUNTING_SETUP);
      }, 800);
    } catch (error: any) {
      console.error('Failed to save business sector:', error);
      setSnack({
        open: true,
        severity: 'error',
        message: error.message || 'Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F5EBE0',
        backgroundImage: `url(${welcomeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        pt: 8,
      }}
    >
      <OnboardingHeader onBack={handleBack} progress={75} />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, py: 2 }}>
        {/* Title */}
        <Typography
          sx={{
            fontFamily: '"Bricolage Grotesque", sans-serif',
            fontSize: '28px',
            fontWeight: 600,
            lineHeight: '28px',
            letterSpacing: '0.25px',
            color: '#BA5C00',
            mb: 1,
            textAlign: 'left',
          }}
        >
          Lĩnh vực hoạt động
        </Typography>

        {/* Description */}
        <Typography
          sx={{
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgba(0, 0, 0, 0.6)',
            textAlign: 'left',
            mb: 3,
          }}
        >
          Chọn lĩnh vực và ngành nghề kinh doanh chính
        </Typography>

        <Box
          sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: {
              xs: '16px 16px 0 0',
              sm: '16px',
            },
            // Match padding/positioning with other onboarding screens
            px: 2,
            py: { xs: 2, sm: 6 },
            position: { xs: 'fixed', sm: 'relative' },
            top: { xs: '160px', sm: 'auto' },
            bottom: { xs: 0, sm: 'auto' },
            left: { xs: '24px', sm: 'auto' },
            right: { xs: '24px', sm: 'auto' },
            maxWidth: { xs: 'calc(100% - 48px)', sm: '100%' },
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: 'auto', sm: 'auto' },
          }}
        >
          {isDataLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '300px',
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Scrollable content area */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: { xs: 'auto', sm: 'visible' },
                  pr: 0,
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {/* Sector Selection */}
                <Typography
                  sx={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#000',
                    mb: 2,
                  }}
                >
                  Lĩnh vực hoạt động <span style={{ color: '#D32F2F' }}>*</span>
                </Typography>

                <RadioGroup
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value as BusinessSector)}
                  sx={{ mb: 4 }}
                >
                  {sectorOptions.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      value={option.value}
                      control={
                        <Radio
                          sx={{
                            color: '#E0E0E0',
                            '&.Mui-checked': { color: '#FB7E00' },
                            mr: '8px',
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <Typography sx={{ fontSize: '16px', fontWeight: 700, mb: '6px', lineHeight: 1.1 }}>
                            {option.label}
                          </Typography>
                          <Typography sx={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', lineHeight: 1.1 }}>
                            {option.description}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        alignItems: 'center',
                        py: 1,
                        px: 0,
                        mb: 0.5,
                        '& .MuiFormControlLabel-label': { marginLeft: '0px' },
                      }}
                    />
                  ))}
                </RadioGroup>

                {/* Industry Selection */}
                <Typography
                  sx={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#000',
                    mb: 2,
                  }}
                >
                  Ngành nghề kinh doanh chính <span style={{ color: '#D32F2F' }}>*</span>
                </Typography>

                <RoundedTextField
                  fullWidth
                  placeholder="Chọn ngành nghề kinh doanh"
                  value={selectedIndustry?.name || ''}
                  onClick={() => setShowBottomSheet(true)}
                  inputProps={{ readOnly: true }}
                  sx={{ mb: 4, cursor: 'pointer' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Icon name="ArrowDown2" size={20} color="#4E4E4E" variant="Outline" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Fixed button at bottom - Desktop */}
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <AppButton variantType="primary" fullWidth
                  onClick={handleSubmit}
                  disabled={!selectedIndustry}
                  loading={isLoading}
                  loadingText="Đang lưu..."
                >
                  Tiếp tục
                </AppButton>
              </Box>
            </>
          )}
        </Box>
      </Container>

      {/* Mobile sticky footer */}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1400,
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          bgcolor: '#ffffff',
          boxShadow: '0 -8px 16px rgba(0,0,0,0.12)',
          minHeight: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <AppButton variantType="primary"
              fullWidth
              onClick={handleSubmit}
              disabled={!selectedIndustry}
              loading={isLoading}
              loadingText="Đang lưu..."
              sx={{
                height: 56,
                borderRadius: '100px',
                backgroundColor: '#FB7E00',
                '&:hover': { backgroundColor: '#C96400' },
                boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
              }}
            >
              Tiếp tục
            </AppButton>
          </Box>
        </Box>
      </Box>

      {/* Confirm dialog for unsaved changes */}
      <AlertDialog
        variant="confirm"
        open={showConfirmDialog}
        onClose={handleCancelLeave}
        title="Thay đổi chưa được lưu"
        description="Bạn có muốn thoát mà không lưu lại các thay đổi?"
        cancelText="Huỷ"
        confirmText="Đồng ý"
        onConfirm={handleConfirmLeave}
      />

      {/* Industry Bottom Sheet */}
      <BottomSheet
        open={showBottomSheet}
        onClose={() => {
          setShowBottomSheet(false);
          setSearchTerm('');
        }}
        title="Chọn ngành nghề kinh doanh"
        maxHeight="calc(var(--vh, 1vh) * 100 - 24px)"
        zIndexBase={1501}
      >
        {/* Search Field */}
        <Box sx={{ mb: 2 }}>
          <RoundedTextField
            fullWidth
            placeholder="Tìm kiếm ngành nghề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Icon name="SearchNormal1" size={20} color="#4E4E4E" variant="Outline" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Industries List */}
        <Box sx={{ maxHeight: 'calc(80vh - 48px)', overflowY: 'auto' }}>
          {isDataLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
              }}
            >
              <CircularProgress />
            </Box>
          ) : filteredIndustries.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
                color: 'rgba(0,0,0,0.6)',
              }}
            >
              <Icon name="SearchStatus" size={48} color="rgba(0,0,0,0.3)" variant="Outline" />
              <Typography sx={{ mt: 2 }}>Không tìm thấy ngành nghề</Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {filteredIndustries.map((industry, _idx) => (
                <ListItem key={industry.id} disablePadding divider>
                  <ListItemButton
                    onClick={() => handleSelectIndustry(industry)}
                    selected={selectedIndustry?.id === industry.id}
                    sx={{
                      px: 0,
                      py: 1.25,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Radio
                        checked={selectedIndustry?.id === industry.id}
                        size="small"
                        sx={{
                          color: 'rgba(0,0,0,0.38)',
                          '&.Mui-checked': {
                            color: '#FB7E00',
                          },
                        }}
                      />
                    </ListItemIcon>

                    <ListItemText
                      primary={industry.name}
                      primaryTypographyProps={{
                        sx: {
                          fontSize: '16px',
                          fontWeight: selectedIndustry?.id === industry.id ? 600 : 400,
                          color: selectedIndustry?.id === industry.id ? '#FB7E00' : '#000',
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </BottomSheet>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnack} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BusinessSectorScreen;
