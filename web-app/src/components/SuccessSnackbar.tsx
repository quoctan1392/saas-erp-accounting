import { Snackbar, Box, Typography } from '@mui/material';
import { CheckCircle, Info, Warning, Error as ErrorIcon } from '@mui/icons-material';

type SnackbarVariant = 'success' | 'info' | 'warning' | 'error';

interface AppSnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
  variant?: SnackbarVariant;
}

const variantConfig: Record<SnackbarVariant, { bgcolor: string; iconColor: string; Icon: typeof CheckCircle }> = {
  success: { bgcolor: '#E8F5E9', iconColor: '#28A745', Icon: CheckCircle },
  info: { bgcolor: '#E3F2FD', iconColor: '#2196F3', Icon: Info },
  warning: { bgcolor: '#FFF8E1', iconColor: '#FF9800', Icon: Warning },
  error: { bgcolor: '#FFEBEE', iconColor: '#F44336', Icon: ErrorIcon },
};

const AppSnackbar = ({ open, message, onClose, variant = 'success' }: AppSnackbarProps) => {
  const config = variantConfig[variant];
  const IconComponent = config.Icon;

  return (
    <Snackbar
      open={open}
      autoHideDuration={2000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ 
        top: { xs: 24, sm: 24 },
        left: { xs: 24, sm: '50%' },
        right: { xs: 24, sm: 'auto' },
        transform: { xs: 'none', sm: 'translateX(-50%)' },
        width: { xs: 'calc(100% - 48px)', sm: 'auto' },
        maxWidth: { sm: 600 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 1.5,
          width: '100%',
          bgcolor: config.bgcolor,
          borderRadius: '100px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <IconComponent sx={{ fontSize: 20, color: config.iconColor }} />
        <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#212529' }}>
          {message}
        </Typography>
      </Box>
    </Snackbar>
  );
};

// Keep backward compatibility
const SuccessSnackbar = (props: Omit<AppSnackbarProps, 'variant'>) => (
  <AppSnackbar {...props} variant="success" />
);

export { AppSnackbar };
export default SuccessSnackbar;
