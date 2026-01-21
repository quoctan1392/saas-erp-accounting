import { Box, Button, CircularProgress } from '@mui/material';
import tokens from '../styles/tokens';

interface FooterAction {
  label: string;
  onClick: () => void;
  variant?: 'outlined' | 'contained';
  disabled?: boolean;
  loading?: boolean;
  color?: 'primary' | 'secondary';
}

interface StickyFooterActionsProps {
  actions: FooterAction[];
  show?: boolean;
  zIndex?: number;
}

const StickyFooterActions: React.FC<StickyFooterActionsProps> = ({ actions, show = true, zIndex }) => {
  if (!show) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: zIndex ?? 1400,
        display: 'flex',
        gap: 1.5,
        px: 2,
        py: 2,
        pb: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        bgcolor: tokens.colors.background.white,
        boxShadow: tokens.shadows.footer,
      }}
    >
      {actions.map((action, index) => {
        const isPrimary = action.color === 'primary' || action.variant === 'contained';
        
        return (
          <Button
            key={index}
            fullWidth
            variant={action.variant || 'contained'}
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            sx={{
              flex: 1,
              borderRadius: tokens.radius.full,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '16px',
              height: 56,
              boxShadow: 'none',
              ...(action.variant === 'outlined'
                ? {
                    borderColor: tokens.colors.border.dashed,
                    bgcolor: tokens.colors.background.light,
                    color: tokens.colors.text.primary,
                    '&:hover': {
                      borderColor: tokens.colors.primary,
                      bgcolor: tokens.colors.background.white,
                      boxShadow: 'none',
                    },
                  }
                : {
                    bgcolor: isPrimary ? tokens.colors.primary : tokens.colors.secondary,
                    color: 'white',
                    '&:hover': {
                      bgcolor: isPrimary ? tokens.colors.primaryHover : tokens.colors.secondaryHover,
                      boxShadow: 'none',
                    },
                  }),
              '&:disabled': {
                bgcolor: tokens.colors.border.dashed,
                color: tokens.colors.text.disabled,
              },
            }}
          >
            {action.loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : action.label}
          </Button>
        );
      })}
    </Box>
  );
};

export default StickyFooterActions;
