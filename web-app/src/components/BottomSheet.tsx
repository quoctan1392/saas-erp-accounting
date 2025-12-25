import { Box, Typography, IconButton } from '@mui/material';
import type { ReactNode } from 'react';
import Icon from './Icon';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Optional icon name to use for the close button (defaults to "Close") */
  closeIconName?: string;
  title?: string;
  children: ReactNode;
  maxHeight?: string;
  zIndexBase?: number;
}

const BottomSheet = ({
  open,
  onClose,
  closeIconName = 'Close',
  title,
  children,
  maxHeight = '70vh',
  zIndexBase = 1100,
}: BottomSheetProps) => {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <Box
        onClick={onClose}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0,0,0,0.5)',
          zIndex: zIndexBase,
          animation: 'fadeIn 0.2s ease',
          '@keyframes fadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
        }}
      />

      {/* Modal Content */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'white',
          borderRadius: '24px 24px 0 0',
          p: 3,
          pb: 4,
          zIndex: zIndexBase + 1,
          maxHeight,
          overflowY: 'auto',
          animation: 'slideUp 0.3s ease',
          '@keyframes slideUp': {
            from: { transform: 'translateY(100%)' },
            to: { transform: 'translateY(0)' },
          },
          // Make any contained primary buttons have no shadow and rounded
          '& .MuiButton-contained': {
            boxShadow: 'none',
            borderRadius: '12px',
          },
        }}
      >
        {/* Handle bar - always shown */}
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: '#DEE2E6',
            borderRadius: '2px',
            mx: 'auto',
            mb: 2,
          }}
        />

        {/* Title + Close */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: title ? 2 : 0 }}>
          {title ? (
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#212529' }}>{title}</Typography>
          ) : (
            <Box />
          )}

          <IconButton onClick={onClose} aria-label="close">
            <Icon name="CloseCircle" size={20} color="#6C757D" variant="Outline" />
          </IconButton>
        </Box>

        {/* Content */}
        {children}
      </Box>
    </>
  );
};

export default BottomSheet;