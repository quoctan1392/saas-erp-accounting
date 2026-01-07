import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
} from '@mui/material';
import * as Iconsax from 'iconsax-react';

// Icon wrapper component for dynamic icon loading
const Icon = ({ name, size = 24, color = 'currentColor', variant = 'Outline' }: any) => {
  const Comp = (Iconsax as any)[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} variant={variant} />;
};

type AlertVariant = 'info' | 'confirm' | 'error' | 'warning' | 'success';

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  variant?: AlertVariant;
  title: string;
  description?: string;
  
  // For confirm variant
  onConfirm?: () => void;
  confirmText?: string;
  confirmColor?: 'primary' | 'error' | 'warning' | 'success';
  cancelText?: string;
  
  // For info/error/success variants (single action)
  actionText?: string;
  actionColor?: 'primary' | 'error' | 'warning' | 'success';
  
  // Optional icon override
  icon?: React.ReactNode;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  onClose,
  variant = 'info',
  title,
  description,
  onConfirm,
  confirmText = 'Xác nhận',
  confirmColor = 'primary',
  cancelText = 'Hủy',
  actionText = 'Đã hiểu',
  actionColor = 'primary',
  icon,
}) => {
  const dialogBorderRadius = '20px';

  const getVariantConfig = () => {
    switch (variant) {
      case 'confirm':
        return {
          iconName: 'InfoCircle',
          iconColor: '#0D6EFD',
          iconBg: '#D6E9FF',
        };
      case 'error':
        return {
          iconName: 'CloseCircle',
          iconColor: '#DC3545',
          iconBg: '#FFEBEE',
        };
      case 'warning':
        return {
          iconName: 'Warning2',
          iconColor: '#FFC107',
          iconBg: '#FFF3CD',
        };
      case 'success':
        return {
          iconName: 'TickCircle',
          iconColor: '#28A745',
          iconBg: '#E8F5E9',
        };
      case 'info':
      default:
        return {
          iconName: 'InfoCircle',
          iconColor: '#0D6EFD',
          iconBg: '#D6E9FF',
        };
    }
  };

  const config = getVariantConfig();

  const getActionButtonColor = () => {
    switch (actionColor) {
      case 'error':
        return { bgcolor: '#DC3545', hoverBg: '#C82333' };
      case 'warning':
        return { bgcolor: '#FFC107', hoverBg: '#E0A800' };
      case 'success':
        return { bgcolor: '#28A745', hoverBg: '#218838' };
      case 'primary':
      default:
        return { bgcolor: '#0D6EFD', hoverBg: '#0B5ED7' };
    }
  };

  const getConfirmButtonColor = () => {
    switch (confirmColor) {
      case 'error':
        return { bgcolor: '#DC3545', hoverBg: '#C82333' };
      case 'warning':
        return { bgcolor: '#FFC107', hoverBg: '#E0A800' };
      case 'success':
        return { bgcolor: '#28A745', hoverBg: '#218838' };
      case 'primary':
      default:
        return { bgcolor: '#0D6EFD', hoverBg: '#0B5ED7' };
    }
  };

  const actionBtnColor = getActionButtonColor();
  const confirmBtnColor = getConfirmButtonColor();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: dialogBorderRadius } }}
    >
      <DialogContent sx={{ pt: 4, pb: 2, px: 3, textAlign: 'center' }}>
        {/* Icon */}
        {icon || (
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: config.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Icon name={config.iconName} size={28} color={config.iconColor} variant="Bold" />
          </Box>
        )}

        {/* Title */}
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 600,
            color: '#212529',
            mb: description ? 1.5 : 0,
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        {description && (
          <Typography
            sx={{
              fontSize: '15px',
              color: '#6C757D',
              lineHeight: 1.6,
            }}
          >
            {description}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
        {variant === 'confirm' ? (
          // Confirm variant: Cancel + Confirm buttons
          <>
            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              sx={{
                borderRadius: '12px',
                fontSize: '16px',
                textTransform: 'none',
                fontWeight: 500,
                color: '#6C757D',
                borderColor: '#DEE2E6',
                py: 1.25,
                '&:hover': {
                  borderColor: '#ADB5BD',
                  bgcolor: 'rgba(0,0,0,0.02)',
                },
              }}
            >
              {cancelText}
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                onConfirm?.();
                onClose();
              }}
              sx={{
                borderRadius: '12px',
                fontSize: '16px',
                textTransform: 'none',
                fontWeight: 500,
                py: 1.25,
                bgcolor: confirmBtnColor.bgcolor,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: confirmBtnColor.hoverBg,
                  boxShadow: 'none',
                },
              }}
            >
              {confirmText}
            </Button>
          </>
        ) : (
          // Info/Error/Warning/Success: Single action button
          <Button
            fullWidth
            variant="contained"
            onClick={onClose}
            sx={{
              borderRadius: '12px',
              fontSize: '16px',
              textTransform: 'none',
              fontWeight: 500,
              py: 1.25,
              bgcolor: actionBtnColor.bgcolor,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: actionBtnColor.hoverBg,
                boxShadow: 'none',
              },
            }}
          >
            {actionText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialog;
