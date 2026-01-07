import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import AlertDialog from '../../components/AlertDialog';
import Icon from '../../components/Icon';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import { BusinessType } from '../../types/onboarding';
import type { BusinessInfoForm } from '../../types/onboarding';
import RoundedTextField from '../../components/RoundedTextField';
import AppButton from '../../components/AppButton';
import OnboardingHeader from '../../components/OnboardingHeader';
import { apiService } from '../../services/api';
import welcomeBg from '../../assets/Welcome screen.png';

// ==================== HỘ KINH DOANH (HKD) ====================
const BusinessInfoScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<BusinessInfoForm>>({
    businessType: BusinessType.HOUSEHOLD_BUSINESS,
    taxId: '',
    businessName: '',
    registeredAddress: '',
    ownerName: '',
    nationalId: '',
    businessCode: '',
    establishmentDate: '',
    employeeCount: undefined,
    taxInfoAutoFilled: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillMessage, setAutoFillMessage] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
  } | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error' | 'warning' | 'info'; message: string }>({
    open: false,
    severity: 'success',
    message: '',
  });

  // initial form snapshot used to detect unsaved changes
  const initialFormRef = useRef<Partial<BusinessInfoForm> | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleConfirmLeave = () => {
    setShowConfirmDialog(false);
    navigate(ROUTES.ONBOARDING_BUSINESS_TYPE);
  };

  const handleCancelLeave = () => setShowConfirmDialog(false);

  const handleCloseSnack = () => setSnack((s) => ({ ...s, open: false }));

  // Load existing data on component mount - use cached data from localStorage
  useEffect(() => {
    const loadOnboardingData = () => {
      setIsDataLoading(true);
      try {
        // Check if this is a new account registration (no previous tenant)
        const currentTenantStr = localStorage.getItem('currentTenant');
        let isNewAccount = false;
        
        if (currentTenantStr) {
          try {
            const currentTenant = JSON.parse(currentTenantStr);
            // If tenant has no onboarding data or is brand new, treat as new account
            isNewAccount = !currentTenant.onboardingCompleted;
          } catch (e) {
            console.error('Error parsing currentTenant:', e);
          }
        } else {
          isNewAccount = true;
        }
        
        // For new accounts, clear any old onboarding data to prevent prefill
        if (isNewAccount) {
          const onboardingData = localStorage.getItem('onboardingData');
          if (onboardingData) {
            try {
              const data = JSON.parse(onboardingData);
              // Only keep businessType, clear everything else
              const cleanData = {
                businessType: data.businessType || BusinessType.HOUSEHOLD_BUSINESS,
                isEdit: false,
                cachedAt: Date.now(),
              };
              localStorage.setItem('onboardingData', JSON.stringify(cleanData));
              console.log('[BusinessInfoScreen-HKD] Cleared old data for new account');
            } catch (error) {
              console.error('Error cleaning onboardingData:', error);
            }
          }
        }
        
        // Check localStorage for existing onboarding data (cached from context/previous API calls)
        const onboardingData = localStorage.getItem('onboardingData');
        if (onboardingData) {
          try {
            const data = JSON.parse(onboardingData);

            // Prepare updates object
            const updates: Partial<BusinessInfoForm> = {};

            // Set business info if available (but exclude businessType)
            if (data.businessInfo) {
              // Format establishmentDate for input field (YYYY-MM-DD format)
              const businessInfo = { ...data.businessInfo };
              if (businessInfo.establishmentDate) {
                const date = new Date(businessInfo.establishmentDate);
                if (!isNaN(date.getTime())) {
                  businessInfo.establishmentDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
                }
              }
              // Remove businessType from businessInfo - we'll use the top-level one
              delete businessInfo.businessType;
              Object.assign(updates, businessInfo);
            }

            // Set business type from top-level (this is the correct/current value)
            // This MUST come after businessInfo to ensure it takes priority
            if (data.businessType) {
              updates.businessType = data.businessType as BusinessType;
            }

            // Apply all updates in a single setState call and record initial snapshot
            if (Object.keys(updates).length > 0) {
              console.log('[BusinessInfoScreen] Loading form data:', updates);
              const merged = { ...formData, ...updates };
              setFormData(merged);
              initialFormRef.current = merged;
            } else {
              // ensure initial snapshot is set even if there are no updates
              if (!initialFormRef.current) {
                initialFormRef.current = formData;
              }
            }

            setIsEditMode(data.isEdit || false);
          } catch (error) {
            console.error('Error parsing onboarding data:', error);
          }
        }
      } catch (e) {
        console.error('Error in loadOnboardingData:', e);
      } finally {
        // Ensure initial snapshot exists
        if (!initialFormRef.current) {
          initialFormRef.current = formData;
        }
        setIsDataLoading(false);
      }
    };

    loadOnboardingData();
  }, []);

  const handleBack = () => {
    try {
      const initial = initialFormRef.current;
      const changed = initial && JSON.stringify(initial) !== JSON.stringify(formData);
      if (changed) {
        setShowConfirmDialog(true);
      } else {
        navigate(ROUTES.ONBOARDING_BUSINESS_TYPE);
      }
    } catch (err) {
      // If any error comparing, be conservative and ask confirmation
      setShowConfirmDialog(true);
    }
  };

  const handleChange = (field: keyof BusinessInfoForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAutoFill = async () => {
    const taxId = formData.taxId || '';

    // Validate tax ID format
    const taxIdRegex = /^[0-9]{10}$|^[0-9]{13}$/;
    if (!taxIdRegex.test(taxId)) {
      setErrors((prev) => ({ ...prev, taxId: 'Mã số thuế phải là 10 hoặc 13 chữ số' }));
      return;
    }

    setIsAutoFilling(true);
    setAutoFillMessage(null);

    try {
      // TODO: Call API to get tax info
      // For now, just show a message
      setAutoFillMessage({
        type: 'warning',
        text: 'Chức năng tự động điền đang được phát triển',
      });
    } catch (error: any) {
      setAutoFillMessage({
        type: 'warning',
        text: error.message || 'Không tìm thấy thông tin. Vui lòng kiểm tra lại mã số thuế',
      });
    } finally {
      setIsAutoFilling(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // BusinessType is required
    if (!formData.businessType) {
      newErrors.businessType = 'Vui lòng chọn loại hình kinh doanh';
    }

    // Tax ID
    const taxIdRegex = /^[0-9]{10}$|^[0-9]{13}$/;
    if (!formData.taxId) {
      newErrors.taxId = 'Vui lòng nhập mã số thuế';
    } else if (!taxIdRegex.test(formData.taxId)) {
      newErrors.taxId = 'Mã số thuế phải là 10 hoặc 13 chữ số';
    }

    // Business Name
    if (!formData.businessName) {
      newErrors.businessName = 'Vui lòng nhập tên doanh nghiệp';
    } else if (formData.businessName.length < 2) {
      newErrors.businessName = 'Tên doanh nghiệp phải có ít nhất 2 ký tự';
    }

    // Registered Address
    if (!formData.registeredAddress) {
      newErrors.registeredAddress = 'Vui lòng nhập địa chỉ đăng ký';
    } else if (formData.registeredAddress.length < 10) {
      newErrors.registeredAddress = 'Địa chỉ phải có ít nhất 10 ký tự';
    }

    // National ID (optional but must be valid if provided)
    if (formData.nationalId && !/^[0-9]{12}$/.test(formData.nationalId)) {
      newErrors.nationalId = 'CCCD phải là 12 chữ số';
    }

    // (HKD) No establishment date / employee count validation here —
    // those fields are not part of the Hộ kinh doanh form.

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // Get current tenant - check multiple possible keys
      let currentTenant = null;
      const currentTenantStr = localStorage.getItem('currentTenant');
      const selectedTenantStr = localStorage.getItem('selectedTenant');
      const tenantAccessToken = localStorage.getItem('tenantAccessToken');

      try {
        if (currentTenantStr) {
          currentTenant = JSON.parse(currentTenantStr);
        } else if (selectedTenantStr) {
          currentTenant = JSON.parse(selectedTenantStr);
        } else if (tenantAccessToken) {
          // Decode JWT token to get tenant info
          const tokenParts = tenantAccessToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            if (payload.tenantId) {
              currentTenant = {
                id: payload.tenantId,
                role: payload.tenantRole || 'unknown',
              };
              console.log('Extracted tenant from JWT:', currentTenant);
            }
          }
        }
      } catch (error) {
        console.error('Error parsing tenant data:', error);
      }

      if (!currentTenant || !currentTenant.id) {
        setSnack({ open: true, severity: 'error', message: 'Không tìm thấy thông tin tenant. Bạn sẽ được chuyển về màn hình chọn tenant.' });
        setTimeout(() => navigate('/select-tenant'), 1200);
        return;
      }

      // Get onboarding data
      const existingOnboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');

      // First save business type if it's from localStorage
      if (existingOnboardingData.businessType && formData.businessType) {
        await apiService.updateBusinessType(currentTenant.id, formData.businessType);
      }

      // Then save business info
      const businessInfoPayload: any = {
        businessType: formData.businessType!, // API requires this field
        taxId: formData.taxId!,
        businessName: formData.businessName!,
        registeredAddress: formData.registeredAddress!,
      };

      // Add optional fields only if they have values
      if (formData.ownerName && formData.ownerName.trim()) {
        businessInfoPayload.ownerName = formData.ownerName.trim();
      }

      if (formData.nationalId && formData.nationalId.trim()) {
        businessInfoPayload.nationalId = formData.nationalId.trim();
      }

      // (HKD) businessCode / establishmentDate / employeeCount are not included
      // in the Hộ kinh doanh payload — those fields belong to the
      // Doanh nghiệp tư nhân (DNTN) form.

      if (formData.taxInfoAutoFilled !== undefined) {
        businessInfoPayload.taxInfoAutoFilled = formData.taxInfoAutoFilled;
      }

      console.log('[BusinessInfoScreen-HKD] Sending business info payload:', businessInfoPayload);

      // Try to call API but fallback to local storage if it fails
      let apiSucceeded = false;
      try {
        const response = await apiService.saveBusinessInfo(currentTenant.id, businessInfoPayload);
        
        if (response.success) {
          apiSucceeded = true;
          console.log('[BusinessInfoScreen-HKD] API call succeeded:', response);
        } else {
          console.warn('[BusinessInfoScreen-HKD] API returned non-success response:', response);
          // Continue with localStorage fallback
        }
      } catch (apiError: any) {
        console.warn('[BusinessInfoScreen-HKD] API call failed, using localStorage fallback:', apiError);
        // Continue with localStorage fallback instead of throwing error
      }

      // Always save to localStorage and navigate (regardless of API success/failure)
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      const updatedOnboardingData = {
        ...onboardingData,
        businessInfo: formData,
        cachedAt: Date.now(),
      };
      localStorage.setItem('onboardingData', JSON.stringify(updatedOnboardingData));

      if (isEditMode) {
        const message = apiSucceeded 
          ? 'Thông tin doanh nghiệp đã được cập nhật thành công!' 
          : 'Thông tin đã được lưu cục bộ. Sẽ đồng bộ khi kết nối ổn định.';
        setSnack({ open: true, severity: 'success', message });
        setTimeout(() => navigate(ROUTES.HOME), 1200);
        return;
      } else {
        // Always continue to next step
        const message = apiSucceeded 
          ? 'Đã lưu thông tin hộ kinh doanh!' 
          : 'Đã lưu thông tin cục bộ. Tiếp tục thiết lập...';
        setSnack({ open: true, severity: 'success', message });
        setTimeout(() => navigate(ROUTES.ONBOARDING_BUSINESS_SECTOR), 800);
        return;
      }
    } catch (error: any) {
      console.error('Failed to save business info:', error);

      let errorMessage = 'Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.';

      if (error.response) {
        console.error('Error response:', error.response.data);

        if (error.response.status === 400) {
          const validationErrors = error.response.data?.message;
          if (Array.isArray(validationErrors)) {
            errorMessage = 'Lỗi validation:\n' + validationErrors.join('\n');
          } else if (typeof validationErrors === 'string') {
            errorMessage = `Lỗi validation: ${validationErrors}`;
          } else {
            errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.';
          }
        } else if (error.response.status === 401) {
          errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
        } else if (error.response.status === 404) {
          errorMessage = 'Không tìm thấy tenant. Vui lòng thử lại.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSnack({ open: true, severity: 'error', message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const isHKD = formData.businessType === BusinessType.HOUSEHOLD_BUSINESS;

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
      <OnboardingHeader onBack={handleBack} progress={66} />

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
          {isHKD ? 'Thông tin Hộ kinh doanh' : 'Thông tin Doanh nghiệp'}
        </Typography>

        {/* Description */}
        <Typography
          sx={{
              fontSize: '16px',
              lineHeight: '24px',
              color: 'rgba(0, 0, 0, 0.6)',
              textAlign: 'left',
              mb: 1,
            }}
        >
          Nhập thông tin xác thực và lĩnh vực hoạt động.
        </Typography>

        <Box
          sx={{
            background: '#fff',
            borderRadius: {
              xs: '16px 16px 0 0',
              sm: '16px',
            },
            // Panel horizontal padding set to 16px for consistency
            px: 2,
            py: { xs: 2, sm: 6 },
            position: { xs: 'fixed', sm: 'relative' },
            top: { xs: '160px', sm: 'auto' },
            bottom: { xs: 0, sm: 'auto' },
            // outer margins on mobile (acts as the 'half' margin)
            left: { xs: '16px', sm: 'auto' },
            right: { xs: '16px', sm: 'auto' },
            // account for larger left/right margin when calculating max width
            maxWidth: { xs: 'calc(100% - 32px)', sm: '100%' },
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
                {/* Auto-fill Message */}
                {autoFillMessage && (
                  <Alert
                    severity={autoFillMessage.type}
                    sx={{ mb: 3 }}
                    onClose={() => setAutoFillMessage(null)}
                  >
                    {autoFillMessage.text}
                  </Alert>
                )}

                {/* Form */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                {/* Tax ID with Auto-fill button */}
                <Box>
                  <RoundedTextField
                    fullWidth
                    required
                    label="Mã số thuế"
                    placeholder="Nhập mã số thuế"
                    value={formData.taxId}
                    onChange={(e) => handleChange('taxId', e.target.value)}
                    error={!!errors.taxId}
                    helperText={errors.taxId}
                    sx={{ mt: '12px' }}
                    InputProps={{
                      startAdornment: (
                            <InputAdornment position="start">
                            <Icon name="ReceiptText" size={20} color="#4E4E4E" variant="Outline" />
                          </InputAdornment>
                      ),
                        endAdornment: (
                        <Button
                          size="small"
                          disabled={isAutoFilling || !formData.taxId}
                          onClick={handleAutoFill}
                          sx={{ textTransform: 'none', whiteSpace: 'nowrap', mr: '8px' }}
                        >
                          Lấy thông tin
                        </Button>
                      ),
                    }}
                  />
                </Box>

                {/* Business Name */}
                <RoundedTextField
                  fullWidth
                  required
                  label={isHKD ? 'Tên Hộ kinh doanh' : 'Tên doanh nghiệp'}
                  placeholder={
                    isHKD ? 'VD: Cửa hàng tạp hóa Minh An' : 'VD: Doanh nghiệp tư nhân ABC'
                  }
                  value={formData.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  error={!!errors.businessName}
                  helperText={errors.businessName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon name="Building" size={20} color="#4E4E4E" variant="Outline" />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Registered Address */}
                <RoundedTextField
                  fullWidth
                  required
                  label="Địa chỉ đăng ký"
                  placeholder="Nhập địa chỉ đăng ký"
                  value={formData.registeredAddress}
                  onChange={(e) => handleChange('registeredAddress', e.target.value)}
                  error={!!errors.registeredAddress}
                  helperText={errors.registeredAddress}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon name="Location" size={20} color="#4E4E4E" variant="Outline" />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Owner Name */}
                <RoundedTextField
                  fullWidth
                  label={isHKD ? 'Tên chủ hộ kinh doanh' : 'Tên giám đốc'}
                  placeholder="Nhập họ và tên"
                  value={formData.ownerName}
                  onChange={(e) => handleChange('ownerName', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon name="User" size={20} color="#4E4E4E" variant="Outline" />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* National ID */}
                <RoundedTextField
                  fullWidth
                  label="CCCD"
                  placeholder="Nhập CCCD 12 chữ số"
                  value={formData.nationalId}
                  onChange={(e) => handleChange('nationalId', e.target.value)}
                  error={!!errors.nationalId}
                  helperText={errors.nationalId}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon name="Personalcard" size={20} color="#4E4E4E" variant="Outline" />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* No additional HKD fields. Business code / establishment / employee
                    count belong to DNTN and are rendered/validated in the DNTN form. */}
              </Box>
              </Box>

              {/* Fixed footer button so user always sees it on screen */}
              <Box
                sx={{
                  display: 'flex',
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
                      <AppButton variantType="primary" fullWidth
                        onClick={handleSubmit}
                        loading={isLoading}
                        loadingText={isEditMode ? 'Đang cập nhật...' : 'Đang lưu...'}
                        sx={{
                          height: 56,
                          borderRadius: '100px',
                          backgroundColor: '#FB7E00',
                          '&:hover': { backgroundColor: '#C96400' },
                          boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                        }}
                      >
                        {isEditMode ? 'Cập nhật' : 'Tiếp tục'}
                      </AppButton>
                    </Box>
                  </Box>
              </Box>
            </>
          )}
        </Box>
      </Container>
      {/* Reusable confirm dialog for unsaved changes */}
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

      {/* Global Snackbar for success/error notifications */}
      <Snackbar open={snack.open} autoHideDuration={4000} onClose={handleCloseSnack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnack} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// ==================== DOANH NGHIỆP TƯ NHÂN (DNTN) ====================
export const BusinessInfoScreenDNTN = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<BusinessInfoForm>>({
    businessType: BusinessType.PRIVATE_ENTERPRISE,
    taxId: '',
    businessName: '',
    registeredAddress: '',
    ownerName: '',
    nationalId: '',
    taxInfoAutoFilled: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillMessage, setAutoFillMessage] = useState<{
    type: 'success' | 'error' | 'warning';
    text: string;
  } | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; severity: 'success' | 'error' | 'warning' | 'info'; message: string }>({
    open: false,
    severity: 'success',
    message: '',
  });

  const initialFormRef = useRef<Partial<BusinessInfoForm> | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleConfirmLeave = () => {
    setShowConfirmDialog(false);
    navigate(ROUTES.ONBOARDING_BUSINESS_TYPE);
  };

  const handleCancelLeave = () => setShowConfirmDialog(false);
  const handleCloseSnack = () => setSnack((s) => ({ ...s, open: false }));

  useEffect(() => {
    const loadOnboardingData = () => {
      setIsDataLoading(true);
      try {
        // Check if this is a new account registration (no previous tenant)
        const currentTenantStr = localStorage.getItem('currentTenant');
        let isNewAccount = false;
        
        if (currentTenantStr) {
          try {
            const currentTenant = JSON.parse(currentTenantStr);
            // If tenant has no onboarding data or is brand new, treat as new account
            isNewAccount = !currentTenant.onboardingCompleted;
          } catch (e) {
            console.error('Error parsing currentTenant:', e);
          }
        } else {
          isNewAccount = true;
        }
        
        // For new accounts, clear any old onboarding data to prevent prefill
        if (isNewAccount) {
          const onboardingData = localStorage.getItem('onboardingData');
          if (onboardingData) {
            try {
              const data = JSON.parse(onboardingData);
              // Only keep businessType, clear everything else
              const cleanData = {
                businessType: data.businessType || BusinessType.PRIVATE_ENTERPRISE,
                isEdit: false,
                cachedAt: Date.now(),
              };
              localStorage.setItem('onboardingData', JSON.stringify(cleanData));
              console.log('[BusinessInfoScreenDNTN] Cleared old data for new account');
            } catch (error) {
              console.error('Error cleaning onboardingData:', error);
            }
          }
        }
        
        const onboardingData = localStorage.getItem('onboardingData');
        if (onboardingData) {
          try {
            const data = JSON.parse(onboardingData);
            const updates: Partial<BusinessInfoForm> = {};

            if (data.businessInfo) {
              const businessInfo = { ...data.businessInfo };
              if (businessInfo.establishmentDate) {
                const date = new Date(businessInfo.establishmentDate);
                if (!isNaN(date.getTime())) {
                  businessInfo.establishmentDate = date.toISOString().split('T')[0];
                }
              }
              delete businessInfo.businessType;
              Object.assign(updates, businessInfo);
            }

            if (data.businessType) {
              updates.businessType = data.businessType as BusinessType;
            }

            if (Object.keys(updates).length > 0) {
              console.log('[BusinessInfoScreenDNTN] Loading form data:', updates);
              const merged = { ...formData, ...updates };
              setFormData(merged);
              initialFormRef.current = merged;
            } else {
              if (!initialFormRef.current) {
                initialFormRef.current = formData;
              }
            }

            setIsEditMode(data.isEdit || false);
          } catch (error) {
            console.error('Error parsing onboarding data:', error);
          }
        }
      } finally {
        if (!initialFormRef.current) {
          initialFormRef.current = formData;
        }
        setIsDataLoading(false);
      }
    };

    loadOnboardingData();
  }, []);

  const handleBack = () => {
    try {
      const initial = initialFormRef.current;
      const changed = initial && JSON.stringify(initial) !== JSON.stringify(formData);
      if (changed) {
        setShowConfirmDialog(true);
      } else {
        navigate(ROUTES.ONBOARDING_BUSINESS_TYPE);
      }
    } catch (err) {
      setShowConfirmDialog(true);
    }
  };

  const handleChange = (field: keyof BusinessInfoForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAutoFill = async () => {
    const taxId = formData.taxId || '';
    const taxIdRegex = /^[0-9]{10}$|^[0-9]{13}$/;
    if (!taxIdRegex.test(taxId)) {
      setErrors((prev) => ({ ...prev, taxId: 'Mã số thuế phải là 10 hoặc 13 chữ số' }));
      return;
    }

    setIsAutoFilling(true);
    setAutoFillMessage(null);

    try {
      setAutoFillMessage({
        type: 'warning',
        text: 'Chức năng tự động điền đang được phát triển',
      });
    } catch (error: any) {
      setAutoFillMessage({
        type: 'warning',
        text: error.message || 'Không tìm thấy thông tin. Vui lòng kiểm tra lại mã số thuế',
      });
    } finally {
      setIsAutoFilling(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.businessType) {
      newErrors.businessType = 'Vui lòng chọn loại hình kinh doanh';
    }

    const taxIdRegex = /^[0-9]{10}$|^[0-9]{13}$/;
    if (!formData.taxId) {
      newErrors.taxId = 'Vui lòng nhập mã số thuế';
    } else if (!taxIdRegex.test(formData.taxId)) {
      newErrors.taxId = 'Mã số thuế phải là 10 hoặc 13 chữ số';
    }

    if (!formData.businessName) {
      newErrors.businessName = 'Vui lòng nhập tên doanh nghiệp';
    } else if (formData.businessName.length < 2) {
      newErrors.businessName = 'Tên doanh nghiệp phải có ít nhất 2 ký tự';
    }

    if (!formData.registeredAddress) {
      newErrors.registeredAddress = 'Vui lòng nhập địa chỉ đăng ký';
    } else if (formData.registeredAddress.length < 10) {
      newErrors.registeredAddress = 'Địa chỉ phải có ít nhất 10 ký tự';
    }

    if (formData.nationalId && !/^[0-9]{12}$/.test(formData.nationalId)) {
      newErrors.nationalId = 'CCCD phải là 12 chữ số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      let currentTenant = null;
      const currentTenantStr = localStorage.getItem('currentTenant');
      const selectedTenantStr = localStorage.getItem('selectedTenant');
      const tenantAccessToken = localStorage.getItem('tenantAccessToken');

      try {
        if (currentTenantStr) {
          currentTenant = JSON.parse(currentTenantStr);
        } else if (selectedTenantStr) {
          currentTenant = JSON.parse(selectedTenantStr);
        } else if (tenantAccessToken) {
          const tokenParts = tenantAccessToken.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            if (payload.tenantId) {
              currentTenant = {
                id: payload.tenantId,
                role: payload.tenantRole || 'unknown',
              };
              console.log('Extracted tenant from JWT:', currentTenant);
            }
          }
        }
      } catch (error) {
        console.error('Error parsing tenant data:', error);
      }

      if (!currentTenant || !currentTenant.id) {
        setSnack({ open: true, severity: 'error', message: 'Không tìm thấy thông tin tenant. Bạn sẽ được chuyển về màn hình chọn tenant.' });
        setTimeout(() => navigate('/select-tenant'), 1200);
        return;
      }

      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');

      // Save business type in background (non-blocking)
      if (onboardingData.businessType && formData.businessType) {
        const bt = formData.businessType as unknown as string;
        (async () => {
          try {
            const resp = await apiService.updateBusinessType(currentTenant.id, bt);
            console.log('[BusinessInfoScreenDNTN] updateBusinessType response:', resp);
          } catch (err) {
            console.error('[BusinessInfoScreenDNTN] updateBusinessType error (non-blocking):', err);
          }
        })();
      }

      // Prepare business info payload for DNTN
      const businessInfoPayload: any = {
        businessType: formData.businessType!,
        taxId: formData.taxId!,
        businessName: formData.businessName!,
        registeredAddress: formData.registeredAddress!,
      };

      if (formData.ownerName && formData.ownerName.trim()) {
        businessInfoPayload.ownerName = formData.ownerName.trim();
      }

      if (formData.nationalId && formData.nationalId.trim()) {
        businessInfoPayload.nationalId = formData.nationalId.trim();
      }

      // DNTN no longer includes businessCode/establishmentDate/employeeCount

      if (formData.taxInfoAutoFilled !== undefined) {
        businessInfoPayload.taxInfoAutoFilled = formData.taxInfoAutoFilled;
      }

      console.log('[BusinessInfoScreenDNTN] Sending business info payload (background):', businessInfoPayload);

      // Save to localStorage immediately
      const updatedOnboardingData = {
        ...onboardingData,
        businessInfo: formData,
        cachedAt: Date.now(),
      };
      localStorage.setItem('onboardingData', JSON.stringify(updatedOnboardingData));

      // Fire-and-forget API save
      (async () => {
        try {
          const response = await apiService.saveBusinessInfo(currentTenant.id, businessInfoPayload);
          console.log('[BusinessInfoScreenDNTN] saveBusinessInfo response:', response);
        } catch (err) {
          console.error('[BusinessInfoScreenDNTN] saveBusinessInfo error (non-blocking):', err);
        }
      })();

      // Navigate immediately
      if (isEditMode) {
        setSnack({ open: true, severity: 'success', message: 'Thông tin doanh nghiệp đã được cập nhật!' });
        setTimeout(() => navigate(ROUTES.HOME), 800);
        return;
      } else {
        navigate(ROUTES.ONBOARDING_BUSINESS_SECTOR);
        return;
      }
    } catch (error: any) {
      console.error('Failed to save business info:', error);

      let errorMessage = 'Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.';

      if (error.response) {
        console.error('Error response:', error.response.data);

        if (error.response.status === 400) {
          const validationErrors = error.response.data?.message;
          if (Array.isArray(validationErrors)) {
            errorMessage = 'Lỗi validation:\n' + validationErrors.join('\n');
          } else if (typeof validationErrors === 'string') {
            errorMessage = `Lỗi validation: ${validationErrors}`;
          } else {
            errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.';
          }
        } else if (error.response.status === 401) {
          errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
        } else if (error.response.status === 404) {
          errorMessage = 'Không tìm thấy tenant. Vui lòng thử lại.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSnack({ open: true, severity: 'error', message: errorMessage });
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
      <OnboardingHeader onBack={handleBack} progress={50} />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, py: 2 }}>
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
          Thông tin Doanh nghiệp
        </Typography>

        <Typography
          sx={{
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgba(0, 0, 0, 0.6)',
            textAlign: 'left',
            mb: 1,
          }}
        >
          Nhập thông tin xác thực và lĩnh vực hoạt động.
        </Typography>

        <Box
          sx={{
            background: '#fff',
            borderRadius: {
              xs: '16px 16px 0 0',
              sm: '16px',
            },
            px: 2,
            py: { xs: 2, sm: 6 },
            position: { xs: 'fixed', sm: 'relative' },
            top: { xs: '160px', sm: 'auto' },
            bottom: { xs: 0, sm: 'auto' },
            left: { xs: '16px', sm: 'auto' },
            right: { xs: '16px', sm: 'auto' },
            maxWidth: { xs: 'calc(100% - 32px)', sm: '100%' },
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
              <Box
                sx={{
                  flex: 1,
                  overflowY: { xs: 'auto', sm: 'visible' },
                  pr: 0,
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {autoFillMessage && (
                  <Alert
                    severity={autoFillMessage.type}
                    sx={{ mb: 3 }}
                    onClose={() => setAutoFillMessage(null)}
                  >
                    {autoFillMessage.text}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                  <Box>
                    <RoundedTextField
                      fullWidth
                      required
                      label="Mã số thuế"
                      placeholder="Nhập mã số thuế"
                      value={formData.taxId}
                      onChange={(e) => handleChange('taxId', e.target.value)}
                      error={!!errors.taxId}
                      helperText={errors.taxId}
                      sx={{ mt: '12px' }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Icon name="ReceiptText" size={20} color="#4E4E4E" variant="Outline" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <Button
                            size="small"
                            disabled={isAutoFilling || !formData.taxId}
                            onClick={handleAutoFill}
                            sx={{ textTransform: 'none', whiteSpace: 'nowrap', mr: '8px' }}
                          >
                            Lấy thông tin
                          </Button>
                        ),
                      }}
                    />
                  </Box>

                  <RoundedTextField
                    fullWidth
                    required
                    label="Tên doanh nghiệp"
                    placeholder="VD: Doanh nghiệp tư nhân ABC"
                    value={formData.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    error={!!errors.businessName}
                    helperText={errors.businessName}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon name="Building" size={20} color="#4E4E4E" variant="Outline" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <RoundedTextField
                    fullWidth
                    required
                    label="Địa chỉ đăng ký"
                    placeholder="Nhập địa chỉ đăng ký"
                    value={formData.registeredAddress}
                    onChange={(e) => handleChange('registeredAddress', e.target.value)}
                    error={!!errors.registeredAddress}
                    helperText={errors.registeredAddress}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon name="Location" size={20} color="#4E4E4E" variant="Outline" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <RoundedTextField
                    fullWidth
                    label="Tên chủ doanh nghiệp"
                    placeholder="Nhập họ và tên"
                    value={formData.ownerName}
                    onChange={(e) => handleChange('ownerName', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon name="User" size={20} color="#4E4E4E" variant="Outline" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <RoundedTextField
                    fullWidth
                    label="CCCD"
                    placeholder="Nhập CCCD chủ doanh nghiệp"
                    value={formData.nationalId}
                    onChange={(e) => handleChange('nationalId', e.target.value)}
                    error={!!errors.nationalId}
                    helperText={errors.nationalId}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon name="Personalcard" size={20} color="#4E4E4E" variant="Outline" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  {/* No DNTN-only fields shown here. */}
                </Box>
              </Box>

              <Box sx={{ display: { xs: 'none', sm: 'block' }, mt: 2 }}>
                <AppButton variantType="primary"
                  onClick={handleSubmit}
                  loading={isLoading}
                  loadingText={isEditMode ? 'Đang cập nhật...' : 'Đang lưu...'}
                >
                  {isEditMode ? 'Cập nhật' : 'Tiếp tục'}
                </AppButton>
              </Box>
            </>
          )}
        </Box>
      </Container>

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
            <AppButton variantType="primary" fullWidth
              onClick={handleSubmit}
              loading={isLoading}
              loadingText={isEditMode ? 'Đang cập nhật...' : 'Đang lưu...'}
              sx={{
                height: 56,
                borderRadius: '100px',
                backgroundColor: '#FB7E00',
                '&:hover': { backgroundColor: '#C96400' },
                boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
              }}
            >
              {isEditMode ? 'Cập nhật' : 'Tiếp tục'}
            </AppButton>
          </Box>
        </Box>
      </Box>

      <AlertDialog
        variant="confirm"
        open={showConfirmDialog}
        onClose={handleCancelLeave}
        title="Xác nhận rời trang"
        description="Thông tin trên biểu mẫu chưa được lưu. Nếu bạn rời trang, các thay đổi sẽ bị mất. Bạn có chắc muốn thoát?"
        cancelText="Hủy"
        confirmText="Rời đi"
        confirmColor="error"
        onConfirm={handleConfirmLeave}
      />

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={handleCloseSnack} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnack} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BusinessInfoScreen;
