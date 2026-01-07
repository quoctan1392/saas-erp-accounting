import { Box, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import mascotImage from '../../assets/Mascot 1.png';
import welcomeBg from '../../assets/Welcome screen.png';
import AppButton from '../../components/AppButton';

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
        backgroundColor: '#F5EBE0',
        backgroundImage: `url(${welcomeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Box 
          sx={{ 
            borderRadius: { 
              xs: '16px 16px 0 0',
              sm: '16px',
            },
            px: 2,
            py: { xs: 4, sm: 6 },
            position: { xs: 'fixed', sm: 'relative' },
            /* moved up by 80px to free space above fixed CTA */
            top: { xs: '200px', sm: 'auto' },
            bottom: { xs: 0, sm: 'auto' },
            left: { xs: '12px', sm: 'auto' },
            right: { xs: '12px', sm: 'auto' },
            maxWidth: { xs: 'calc(100% - 24px)', sm: '100%' },
            display: 'flex',
            flexDirection: 'column',
            /* increase visible white panel height by 60px */
            minHeight: { xs: 'calc(100vh - 220px)', sm: 'auto' },
            /* add extra bottom padding so sticky footer won't overlap content */
            pb: { xs: `calc(94px + env(safe-area-inset-bottom, 0px) + 16px)`, sm: 'auto' },
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
              mb: 1,
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
              mb: 1,
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
              mb: '24px',
            }}
          >
            Thiết lập giúp ứng dụng hỗ trợ tối đa nghiệp vụ hàng ngày và cá nhân hóa trải
            nghiệm của bạn
          </Typography>

          <Box sx={{ flex: 1 }} />

          {/* Desktop / tablet: in-flow CTA */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, position: 'relative', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: { xs: 'calc(100% - 24px)', sm: '480px' } }}>
              <AppButton variantType="primary" fullWidth onClick={handleGetStarted} sx={{ height: 48, borderRadius: '100px', width: '100%' }}>
                Bắt đầu thiết lập
              </AppButton>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Mobile sticky footer bar: white strip (94px) with neutral upward shadow and pill CTA */}
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
          minHeight: 'calc(80px + env(safe-area-inset-bottom, 0px))',
          bgcolor: '#ffffff',
          boxShadow: '0 -8px 16px rgba(0,0,0,0.12)',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 'calc(100%)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <AppButton variantType="primary"
                fullWidth
                onClick={handleGetStarted}
                disabled={false}
                loading={false}
                sx={{
                  height: 56,
                  fontWeight: 500,
                  borderRadius: '100px',
                  backgroundColor: '#FB7E00',
                  '&:hover': { backgroundColor: '#C96400' },
                  boxShadow: 'none',
                }}
              >
                Bắt đầu thiết lập
              </AppButton>
            </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default WelcomeScreen;
