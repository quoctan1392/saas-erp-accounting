import { Box, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import mascotImage from '../../assets/Mascot 1.png';
import PrimaryButton from '../../components/PrimaryButton';

const WelcomeScreen = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(ROUTES.ONBOARDING_BUSINESS_TYPE);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F5EBE0',
        position: 'relative',
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
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
            top: { xs: '280px', sm: 'auto' },
            bottom: { xs: 0, sm: 'auto' },
            left: { xs: '12px', sm: 'auto' },
            right: { xs: '12px', sm: 'auto' },
            maxWidth: { xs: 'calc(100% - 24px)', sm: '100%' },
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: 'calc(100vh - 280px)', sm: 'auto' },
          }}
        >
          {/* Mascot image */}
          <Box
            component="img"
            src={mascotImage}
            alt="Mascot"
            sx={{
              width: { xs: 200, sm: 240 },
              height: 'auto',
              mb: 3,
              alignSelf: 'flex-start',
            }}
          />

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
            Bắt đầu thiết lập
          </Typography>

          {/* Description */}
          <Typography
            sx={{
              fontSize: '16px',
              lineHeight: '24px',
              color: 'rgba(0, 0, 0, 0.6)',
              textAlign: 'left',
              mb: '95px',
            }}
          >
            Thiết lập giúp ứng dụng hỗ trợ tối đa nghiệp vụ hàng ngày và cá nhân hóa trải
            nghiệm của bạn
          </Typography>

          <Box sx={{ flex: 1 }} />

          {/* CTA Button */}
          <PrimaryButton onClick={handleGetStarted}>
            Bắt đầu thiết lập
          </PrimaryButton>
        </Box>
      </Container>
    </Box>
  );
};

export default WelcomeScreen;
