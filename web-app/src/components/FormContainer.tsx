import { Container, Box } from '@mui/material';
import tokens from '../styles/tokens';

interface FormContainerProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  backgroundColor?: string;
  variant?: 'default' | 'panel'; // panel = rounded panel over page bg
  panelBackgroundColor?: string;
}

const FormContainer: React.FC<FormContainerProps> = ({
  children,
  maxWidth = 'md',
  backgroundColor = tokens.colors.background.page,
  variant = 'default',
  panelBackgroundColor = tokens.colors.background.white,
}) => {
  if (variant === 'panel') {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor, position: 'relative' }}>
        <Container maxWidth={maxWidth} sx={{ position: 'relative', zIndex: 1, pt: { xs: '120px', sm: '96px' }, pb: 2 }}>
          <Box
            sx={{
              borderRadius: {
                xs: '16px 16px 0 0',
                sm: '16px',
              },
              bgcolor: panelBackgroundColor,
              px: 1,
              py: { xs: 2, sm: 6 },
              pb: { xs: `calc(100px + env(safe-area-inset-bottom, 0px))`, sm: 6 },
              position: { xs: 'fixed', sm: 'relative' },
              top: { xs: '100px', sm: 'auto' },
              bottom: { xs: 0, sm: 'auto' },
              left: '16px',
              right: '16px',
              maxWidth: 'calc(100% - 32px)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: { xs: 'auto', sm: 'visible' },
            }}
          >
            {children}
          </Box>
        </Container>
      </Box>
    );
  }

  // Default container with safe-area padding
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: backgroundColor,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ flex: 1, overflowY: 'auto', pb: 12 }}>
        <Container maxWidth={maxWidth} sx={{ pt: 2, pb: 4 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default FormContainer;
