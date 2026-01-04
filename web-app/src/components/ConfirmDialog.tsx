import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box } from '@mui/material';

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string; // accept custom color strings for styling
  onConfirm?: () => void;
  onCancel?: () => void;
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Xác nhận',
  description = 'Bạn có chắc chắn?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmColor = '#F0781A',
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(3px)'
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: 6,
          p: 3,
          mx: 1.5,
          minWidth: 320,
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
        }
      }}
    >
      <DialogTitle
        id="confirm-dialog-title"
        sx={{
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '20px',
          fontFamily: '"Inter", sans-serif',
          pb: 1,
          pr: 0,
          pl: 0
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pt: 0 , pl: 0, pr: 0}}>
        <DialogContentText sx={{ color: 'rgba(0,0,0,0.8)', fontSize: '16px' }}>
          {description}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, pt: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, width: '100%', px: 1 }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            sx={{
              flex: 1,
              borderRadius: '999px',
              borderColor: '#E0E0E0',
              color: 'rgba(0,0,0,0.8)',
              fontSize: '16px',
              backgroundColor: '#F5F5F5',
              textTransform: 'none',
              py: 1,
              boxShadow: 'none',
              '&:hover': { backgroundColor: '#fbfbfb', borderColor: '#dcdcdc' }
            }}
          >
            {cancelText}
          </Button>

          <Button
            variant="contained"
            onClick={onConfirm}
            sx={{
              flex: 1,
              borderRadius: '999px',
              backgroundColor: '#FB7E00',
              color: '#fff',
              fontSize: '16px',
              textTransform: 'none',
              py: 1,
              boxShadow: 'none',
              '&:hover': { backgroundColor: (theme) => theme.palette.mode === 'dark' ? confirmColor : undefined }
            }}
          >
            {confirmText}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;