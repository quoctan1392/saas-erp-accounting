import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  LinearProgress,
  IconButton,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import { BusinessType } from '../../types/onboarding';

const BusinessInfoScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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

  const handleBack = () => {
    if (window.confirm('Bạn có chắc muốn quay lại? Thông tin đã nhập sẽ bị mất.')) {
      navigate(ROUTES.ONBOARDING_BUSINESS_TYPE);
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // TODO: Call API to save business info
      // For now, just navigate to HOME
      console.log('Business info to save:', formData);
      
      setTimeout(() => {
        navigate(ROUTES.HOME);
      }, 500);
    } catch (error) {
      console.error('Failed to save business info:', error);
    }
  };

  const isHKD = businessType === BusinessType.HOUSEHOLD_BUSINESS;
  const isDNTN = businessType === BusinessType.PRIVATE_ENTERPRISE;

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 3 }}>
        {/* Progress Bar */}
        <Box sx={{ mb: 3 }}>
          <LinearProgress variant="determinate" value={66} sx={{ height: 6, borderRadius: 3 }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Bước 2/3
          </Typography>
        </Box>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            {isHKD ? 'Thông tin Hộ kinh doanh' : 'Thông tin Doanh nghiệp'}
          </Typography>
        </Box>

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
            <TextField
              fullWidth
              required
              label="Mã số thuế"
              placeholder="Nhập mã số thuế"
              value={formData.taxId}
              onChange={(e) => handleChange('taxId', e.target.value)}
              error={!!errors.taxId}
              helperText={errors.taxId}
              InputProps={{
                endAdornment: (
                  <Button
                    size="small"
                    startIcon={isAutoFilling ? <CircularProgress size={16} /> : <Refresh />}
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
          <TextField
            fullWidth
            required
            label={isHKD ? 'Tên Hộ kinh doanh' : 'Tên doanh nghiệp'}
            placeholder={isHKD ? 'VD: Cửa hàng tạp hóa Minh An' : 'VD: Doanh nghiệp tư nhân ABC'}
            value={formData.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            error={!!errors.businessName}
            helperText={errors.businessName}
          />

          {/* Registered Address */}
          <TextField
            fullWidth
            required
            multiline
            rows={3}
            label="Địa chỉ đăng ký"
            placeholder="Nhập địa chỉ đầy đủ"
            value={formData.registeredAddress}
            onChange={(e) => handleChange('registeredAddress', e.target.value)}
            error={!!errors.registeredAddress}
            helperText={errors.registeredAddress}
          />

          {/* Owner Name */}
          <TextField
            fullWidth
            label={isHKD ? 'Tên chủ hộ kinh doanh' : 'Tên giám đốc'}
            placeholder="Nhập họ và tên"
            value={formData.ownerName}
            onChange={(e) => handleChange('ownerName', e.target.value)}
          />

          {/* National ID */}
          <TextField
            fullWidth
            label="CCCD"
            placeholder="Nhập số CCCD"
            value={formData.nationalId}
            onChange={(e) => handleChange('nationalId', e.target.value)}
            error={!!errors.nationalId}
            helperText={errors.nationalId}
          />

          {/* DNTN specific fields */}
          {isDNTN && (
            <>
              <TextField
                fullWidth
                label="Mã doanh nghiệp"
                placeholder="Nhập mã doanh nghiệp"
                value={formData.businessCode}
                onChange={(e) => handleChange('businessCode', e.target.value)}
              />

              <TextField
                fullWidth
                type="date"
                label="Ngày thành lập"
                InputLabelProps={{ shrink: true }}
                value={formData.establishmentDate}
                onChange={(e) => handleChange('establishmentDate', e.target.value)}
              />

              <TextField
                fullWidth
                type="number"
                label="Số lượng nhân sự"
                placeholder="Nhập số lượng nhân sự"
                value={formData.employeeCount || ''}
                onChange={(e) => handleChange('employeeCount', parseInt(e.target.value) || undefined)}
                inputProps={{ min: 1 }}
              />
            </>
          )}
        </Box>

        {/* Continue Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={isLoading}
          onClick={handleSubmit}
          sx={{
            height: 48,
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: 16,
          }}
        >
          {isLoading ? 'Đang lưu...' : 'Tiếp tục'}
        </Button>
      </Box>
    </Container>
  );
};

export default BusinessInfoScreen;
