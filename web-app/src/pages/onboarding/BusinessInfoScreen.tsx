import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { 
  Refresh, 
  ReceiptOutlined, 
  BusinessOutlined, 
  LocationOnOutlined, 
  PersonOutlined, 
  BadgeOutlined,
  CalendarTodayOutlined,
  PeopleOutlined 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import { BusinessType } from '../../types/onboarding';
import RoundedTextField from '../../components/RoundedTextField';
import PrimaryButton from '../../components/PrimaryButton';
import OnboardingHeader from '../../components/OnboardingHeader';
import { apiService } from '../../services/api';

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

  // Load existing data on component mount
  useEffect(() => {
    const loadOnboardingData = async () => {
      setIsDataLoading(true);
      try {
        // Get current tenant
        const currentTenantStr = localStorage.getItem('currentTenant');
        if (!currentTenantStr) return;
        
        const currentTenant = JSON.parse(currentTenantStr);
        
        // Call API to get latest onboarding data
        const response = await apiService.getOnboardingStatus(currentTenant.id);
        
        if (response.success && response.data) {
          const { businessType, businessInfo } = response.data;
          
          // Set business type if available
          if (businessType) {
            setFormData(prev => ({ ...prev, businessType: businessType as BusinessType }));
          }
          
          // Set business info if available
          if (businessInfo) {
            // Format establishmentDate for input field (YYYY-MM-DD format)
            const formattedBusinessInfo = { ...businessInfo };
            if (formattedBusinessInfo.establishmentDate) {
              const date = new Date(formattedBusinessInfo.establishmentDate);
              if (!isNaN(date.getTime())) {
                formattedBusinessInfo.establishmentDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
              }
            }
            
            setFormData(prev => ({ 
              ...prev, 
              ...formattedBusinessInfo,
              // Ensure businessType is also set from businessInfo if not already set
              businessType: businessType || formattedBusinessInfo.businessType || prev.businessType
            }));
          }
        }
        
        // Check if this is edit mode from localStorage (user clicked "Thiết lập doanh nghiệp")
        const onboardingData = localStorage.getItem('onboardingData');
        if (onboardingData) {
          try {
            const data = JSON.parse(onboardingData);
            setIsEditMode(data.isEdit || false);
          } catch (error) {
            console.error('Error parsing onboarding data:', error);
          }
        }
      } catch (error) {
        console.error('Error loading onboarding data:', error);
        // On API error, fallback to localStorage data
        const onboardingData = localStorage.getItem('onboardingData');
        if (onboardingData) {
          try {
            const data = JSON.parse(onboardingData);
            if (data.businessType) {
              setFormData(prev => ({ ...prev, businessType: data.businessType }));
            }
            if (data.businessInfo) {
              // Format establishmentDate for input field (YYYY-MM-DD format)
              const businessInfo = { ...data.businessInfo };
              if (businessInfo.establishmentDate) {
                const date = new Date(businessInfo.establishmentDate);
                if (!isNaN(date.getTime())) {
                  businessInfo.establishmentDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
                }
              }
              setFormData(prev => ({ ...prev, ...businessInfo }));
            }
            setIsEditMode(data.isEdit || false);
          } catch (err) {
            console.error('Error parsing localStorage onboarding data:', err);
          }
        }
      } finally {
        setIsDataLoading(false);
      }
    };

    loadOnboardingData();
  }, []);

  const handleBack = () => {
    if (isEditMode) {
      // If in edit mode and form has changes, warn user
      if (window.confirm('Bạn có chắc muốn quay lại? Thông tin chưa lưu sẽ bị mất.')) {
        navigate(ROUTES.ONBOARDING_BUSINESS_TYPE);
      }
    } else {
      if (window.confirm('Bạn có chắc muốn quay lại? Thông tin đã nhập sẽ bị mất.')) {
        navigate(ROUTES.ONBOARDING_BUSINESS_TYPE);
      }
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

    // Establishment date validation (must be valid date format if provided)
    if (formData.establishmentDate) {
      const dateStr = formData.establishmentDate;
      // Check if it's a valid date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        newErrors.establishmentDate = 'Ngày thành lập phải có định dạng YYYY-MM-DD (VD: 2020-01-15)';
      } else {
        // Validate that it's a real date
        const date = new Date(dateStr);
        const [year, month, day] = dateStr.split('-').map(Number);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
          newErrors.establishmentDate = 'Ngày thành lập không hợp lệ';
        }
      }
    }

    // Employee count validation (must be positive integer if provided)
    if (formData.employeeCount !== undefined && formData.employeeCount !== null) {
      if (!Number.isInteger(formData.employeeCount) || formData.employeeCount < 1) {
        newErrors.employeeCount = 'Số lượng nhân viên phải là số nguyên dương';
      }
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
                role: payload.tenantRole || 'unknown'
              };
              console.log('Extracted tenant from JWT:', currentTenant);
            }
          }
        }
      } catch (error) {
        console.error('Error parsing tenant data:', error);
      }
      
      if (!currentTenant || !currentTenant.id) {
        alert('Không tìm thấy thông tin tenant. Bạn sẽ được chuyển về màn hình chọn tenant.');
        navigate('/select-tenant');
        return;
      }

      // First save business type if it's from localStorage
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      if (onboardingData.businessType && formData.businessType) {
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
      
      if (formData.businessCode && formData.businessCode.trim()) {
        businessInfoPayload.businessCode = formData.businessCode.trim();
      }
      
      if (formData.establishmentDate && formData.establishmentDate.trim()) {
        const dateStr = formData.establishmentDate.trim();
        // Ensure ISO format - if it's just YYYY-MM-DD, convert to full ISO
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          businessInfoPayload.establishmentDate = `${dateStr}T00:00:00.000Z`;
        } else {
          businessInfoPayload.establishmentDate = dateStr;
        }
      }
      
      if (formData.employeeCount && formData.employeeCount > 0) {
        businessInfoPayload.employeeCount = formData.employeeCount;
      }
      
      if (formData.taxInfoAutoFilled !== undefined) {
        businessInfoPayload.taxInfoAutoFilled = formData.taxInfoAutoFilled;
      }

      console.log('Sending business info payload:', businessInfoPayload);
      
      const response = await apiService.saveBusinessInfo(currentTenant.id, businessInfoPayload);

      if (response.success) {
        // Clean up localStorage
        localStorage.removeItem('onboardingData');
        
        if (isEditMode) {
          alert('Thông tin doanh nghiệp đã được cập nhật thành công!');
        } else {
          // Complete onboarding for new setup
          await apiService.completeOnboarding(currentTenant.id);
        }
        navigate(ROUTES.HOME);
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra khi lưu thông tin');
      }
    } catch (error: any) {
      console.error('Failed to save business info:', error);
      
      // Better error handling
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
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isHKD = formData.businessType === BusinessType.HOUSEHOLD_BUSINESS;
  const isDNTN = formData.businessType === BusinessType.PRIVATE_ENTERPRISE;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#F5EBE0',
        position: 'relative',
        pt: 8,
      }}
    >
      <OnboardingHeader
        onBack={handleBack}
        progress={66}
      />

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
            mb: 2,
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
            mb: 3,
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
            px: { xs: 3, sm: 4 },
            py: { xs: 4, sm: 6 },
            position: { xs: 'fixed', sm: 'relative' },
            top: { xs: 'auto', sm: 'auto' },
            bottom: { xs: 0, sm: 'auto' },
            left: { xs: '12px', sm: 'auto' },
            right: { xs: '12px', sm: 'auto' },
            maxWidth: { xs: 'calc(100% - 24px)', sm: '100%' },
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
              {/* Auto-fill Message */}
              {autoFillMessage && (
                <Alert severity={autoFillMessage.type} sx={{ mb: 3 }} onClose={() => setAutoFillMessage(null)}>
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ReceiptOutlined sx={{ color: '#4E4E4E' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <Button
                    size="small"
                    disabled={isAutoFilling || !formData.taxId}
                    onClick={handleAutoFill}
                    sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
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
            placeholder={isHKD ? 'VD: Cửa hàng tạp hóa Minh An' : 'VD: Doanh nghiệp tư nhân ABC'}
            value={formData.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            error={!!errors.businessName}
            helperText={errors.businessName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BusinessOutlined sx={{ color: '#4E4E4E' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Registered Address */}
          <RoundedTextField
            fullWidth
            required
            label="Địa chỉ đăng ký"
            placeholder="Nhập địa chỉ đầy đủ"
            value={formData.registeredAddress}
            onChange={(e) => handleChange('registeredAddress', e.target.value)}
            error={!!errors.registeredAddress}
            helperText={errors.registeredAddress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnOutlined sx={{ color: '#4E4E4E' }} />
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
                  <PersonOutlined sx={{ color: '#4E4E4E' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* National ID */}
          <RoundedTextField
            fullWidth
            label="CCCD"
            placeholder="Nhập số CCCD"
            value={formData.nationalId}
            onChange={(e) => handleChange('nationalId', e.target.value)}
            error={!!errors.nationalId}
            helperText={errors.nationalId}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeOutlined sx={{ color: '#4E4E4E' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* DNTN specific fields */}
          {isDNTN && (
            <>
              <RoundedTextField
                fullWidth
                label="Mã doanh nghiệp"
                placeholder="Nhập mã doanh nghiệp"
                value={formData.businessCode}
                onChange={(e) => handleChange('businessCode', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessOutlined sx={{ color: '#4E4E4E' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <RoundedTextField
                fullWidth
                type="date"
                label="Ngày thành lập"
                InputLabelProps={{ shrink: true }}
                value={formData.establishmentDate}
                onChange={(e) => handleChange('establishmentDate', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayOutlined sx={{ color: '#4E4E4E' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <RoundedTextField
                fullWidth
                type="number"
                label="Số lượng nhân sự"
                placeholder="Nhập số lượng nhân sự"
                value={formData.employeeCount || ''}
                onChange={(e) => handleChange('employeeCount', parseInt(e.target.value) || undefined)}
                inputProps={{ min: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PeopleOutlined sx={{ color: '#4E4E4E' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}
        </Box>

          {/* Continue Button */}
          <PrimaryButton
            onClick={handleSubmit}
            loading={isLoading}
            loadingText={isEditMode ? "Đang cập nhật..." : "Đang lưu..."}
          >
            {isEditMode ? "Cập nhật" : "Tiếp tục"}
          </PrimaryButton>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default BusinessInfoScreen;
