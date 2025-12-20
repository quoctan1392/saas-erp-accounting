import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import { BusinessType } from '../../types/onboarding';
import PrimaryButton from '../../components/PrimaryButton';
import OnboardingHeader from '../../components/OnboardingHeader';
import businessTypeImg1 from '../../assets/Business Type Image 1.png';
import businessTypeImg2 from '../../assets/Business Type Image 2.png';
import businessTypeImg3 from '../../assets/Business Type Image 3.png';

interface BusinessTypeOption {
  type: BusinessType;
  icon: React.ReactNode;
  label: string;
  description: string;
  disabled: boolean;
}

const BusinessTypeScreen = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<BusinessType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const businessTypes: BusinessTypeOption[] = [
    {
      type: BusinessType.HOUSEHOLD_BUSINESS,
      icon: <Box component="img" src={businessTypeImg1} alt="Hộ kinh doanh" sx={{ width: 64, height: 64 }} />,
      label: 'Hộ kinh doanh cá thể',
      description: 'Phù hợp cho cửa hàng, quán ăn, dịch vụ nhỏ',
      disabled: false,
    },
    {
      type: BusinessType.PRIVATE_ENTERPRISE,
      icon: <Box component="img" src={businessTypeImg2} alt="Doanh nghiệp tư nhân" sx={{ width: 64, height: 64 }} />,
      label: 'Doanh nghiệp tư nhân',
      description: 'Dành cho doanh nghiệp có quy mô vừa',
      disabled: false,
    },
    {
      type: BusinessType.LIMITED_COMPANY,
      icon: <Box component="img" src={businessTypeImg3} alt="Công ty TNHH" sx={{ width: 64, height: 64, opacity: 0.6 }} />,
      label: 'Công ty TNHH/Cổ phần',
      description: 'Dành cho công ty có pháp nhân',
      disabled: true,
    },
  ];

  const handleBack = () => {
    navigate(ROUTES.ONBOARDING_WELCOME);
  };

  const handleSelectType = (type: BusinessType, disabled: boolean) => {
    if (!disabled) {
      setSelectedType(type);
    }
  };

  const handleContinue = async () => {
    if (selectedType) {
      setIsLoading(true);
      // TODO: Call API to save business type
      // For now, just navigate to next screen
      setTimeout(() => {
        setIsLoading(false);
        navigate(ROUTES.ONBOARDING_BUSINESS_INFO);
      }, 500);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#F5EBE0',
        position: 'relative',
        pt: 10,
      }}
    >
      <OnboardingHeader
        onBack={handleBack}
        progress={33}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
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
          Thông tin Hộ kinh doanh
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
          {/* Business Type Cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
              {businessTypes.map((option) => (
                <Box
                  key={option.type}
                  onClick={() => handleSelectType(option.type, option.disabled)}
                  sx={{
                    display: 'flex',
                    padding: '12px',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    flex: '1 0 0',
                    alignSelf: 'stretch',
                    borderRadius: '12px',
                    border: selectedType === option.type 
                      ? '2px solid #FB7E00' 
                      : '2px solid #dbdadab0',
                    backgroundColor: option.disabled ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                    cursor: option.disabled ? 'not-allowed' : 'pointer',
                    opacity: option.disabled ? 0.6 : 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: option.disabled ? '#dbdadab0' : '#FB7E00',
                      borderWidth: option.disabled ? '2px' : '2px',
                    },
                  }}
                >
                  {option.icon}
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '16px', color: '#000' }}>
                        {option.label}
                      </Typography>
                      {option.disabled && (
                        <Chip 
                          label="Sắp ra mắt" 
                          size="small" 
                          sx={{ 
                            height: 20, 
                            fontSize: '12px',
                            backgroundColor: '#E0E0E0',
                            color: '#666',
                          }} 
                        />
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>
                      {option.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

          {/* Continue Button */}
          <PrimaryButton
            onClick={handleContinue}
            disabled={!selectedType}
            loading={isLoading}
            loadingText="Đang xử lý..."
          >
            Tiếp tục
          </PrimaryButton>
        </Box>
      </Container>
    </Box>
  );
};

export default BusinessTypeScreen;
