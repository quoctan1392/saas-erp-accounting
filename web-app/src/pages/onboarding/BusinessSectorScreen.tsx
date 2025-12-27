import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Autocomplete,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import { BusinessType, BusinessSector } from '../../types/onboarding';
import industries from '../../data/industries';
import type { IndustryOption } from '../../data/industries';
import PrimaryButton from '../../components/PrimaryButton';
import OnboardingHeader from '../../components/OnboardingHeader';
import welcomeBg from '../../assets/Welcome screen.png';
import ConfirmDialog from '../../components/ConfirmDialog';

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
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
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
    industry: IndustryOption | null;
  } | null>(null);

  const handleCloseSnack = () => setSnack((s) => ({ ...s, open: false }));

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
    const loadOnboardingData = () => {
      setIsDataLoading(true);
      try {
        const onboardingData = localStorage.getItem('onboardingData');
        if (onboardingData) {
          try {
            const data = JSON.parse(onboardingData);
            setBusinessType(data.businessType || null);

            if (data.businessSector) {
              setSelectedSector(data.businessSector.sector || BusinessSector.THUONG_MAI);
              if (data.businessSector.industryCode) {
                const industry = industries.find(
                  (i) => i.code === data.businessSector.industryCode
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

                <Autocomplete
                  options={industries}
                  getOptionLabel={(option) => option.displayText}
                  value={selectedIndustry}
                  onChange={(_, newValue) => setSelectedIndustry(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Chọn ngành nghề kinh doanh"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '48px',
                          paddingLeft: '16px',
                          paddingRight: '16px',
                          '& fieldset': {
                            borderColor: '#D8D8D8',
                          },
                          '&:hover fieldset': {
                            borderColor: '#FB7E00',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#FB7E00',
                          },
                        },
                        '& .MuiInputBase-input': {
                          fontSize: '16px',
                          color: '#000000',
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {option.displayText}
                    </li>
                  )}
                  sx={{ mb: 4 }}
                />
              </Box>

              {/* Fixed button at bottom - Desktop */}
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <PrimaryButton
                  onClick={handleSubmit}
                  disabled={!selectedIndustry}
                  loading={isLoading}
                  loadingText="Đang lưu..."
                >
                  Tiếp tục
                </PrimaryButton>
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
        <Box sx={{ width: '100%', maxWidth: 'calc(100% - 32px)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <PrimaryButton
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
            </PrimaryButton>
          </Box>
        </Box>
      </Box>

      {/* Confirm dialog for unsaved changes */}
      <ConfirmDialog
        open={showConfirmDialog}
        title="Xác nhận rời trang"
        description="Thông tin trên biểu mẫu chưa được lưu. Nếu bạn rời trang, các thay đổi sẽ bị mất. Bạn có chắc muốn thoát?"
        cancelText="Hủy"
        confirmText="Rời đi"
        confirmColor="error"
        onCancel={handleCancelLeave}
        onConfirm={handleConfirmLeave}
      />

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
