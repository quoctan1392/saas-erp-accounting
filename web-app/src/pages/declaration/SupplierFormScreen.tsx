import { Box, Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import OnboardingHeader from '../../components/OnboardingHeader';
import welcomeBg from '../../assets/Welcome screen.png';
import * as Iconsax from 'iconsax-react';

const Icon = ({ name, size = 24, color = 'currentColor', variant = 'Outline' }: any) => {
  const Comp = (Iconsax as any)[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} variant={variant} />;
};

const SupplierFormScreen = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F5F5F5',
        backgroundImage: `url(${welcomeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        pt: 8,
      }}
    >
      <OnboardingHeader onBack={() => navigate(ROUTES.DECLARATION_CATEGORIES)} progress={50} />
      <Container maxWidth="sm" sx={{ py: 2 }}>
        <Typography variant="h4" sx={{ color: '#BA5C00', mb: 2 }}>
          Thêm nhà cung cấp
        </Typography>
        <Box sx={{ bgcolor: 'white', p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Icon name="Truck" size={64} color="#FB7E00" variant="Bold" />
          <Typography sx={{ mt: 2, color: '#6C757D' }}>
            Form nhà cung cấp đang được phát triển...
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(ROUTES.DECLARATION_CATEGORIES)}
            sx={{ mt: 3, bgcolor: '#FB7E00' }}
          >
            Quay lại
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default SupplierFormScreen;
