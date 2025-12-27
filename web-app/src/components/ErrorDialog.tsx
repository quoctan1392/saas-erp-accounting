import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from '@mui/material';

type ErrorDialogProps = {
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
};

const ErrorDialog: React.FC<ErrorDialogProps> = ({
  open,
  title = 'Lỗi',
  message = '',
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="error-dialog-title"
      BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0.35)' } }}
      PaperProps={{ sx: { borderRadius: 6, p: 3, mx: 1.5, minWidth: 320 } }}
    >
      <DialogTitle id="error-dialog-title" sx={{ textAlign: 'center', fontWeight: 700 }}>
        {title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText sx={{ color: 'rgba(0,0,0,0.8)', fontSize: '15px' }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pt: 2 }}>
        <Box sx={{ px: 2, width: '100%' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={onClose}
            sx={{
              borderRadius: '999px',
              backgroundColor: '#FB7E00',
              color: '#fff',
              textTransform: 'none',
              py: 1,
              boxShadow: 'none',
            }}
          >
            Đóng
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ErrorDialog;
