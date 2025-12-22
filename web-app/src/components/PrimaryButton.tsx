import React from 'react';
import { Button, CircularProgress } from '@mui/material';

interface PrimaryButtonProps extends Omit<React.ComponentProps<typeof Button>, 'variant' | 'size'> {
  loading?: boolean;
  loadingText?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  loading = false, 
  loadingText,
  children, 
  disabled,
  ...props 
}) => {
  return (
    <Button
      fullWidth
      variant="contained"
      size="large"
      disabled={loading || disabled}
      {...props}
      sx={{
        py: 1.75,
        textTransform: 'none',
        fontSize: '16px',
        fontWeight: 500,
        backgroundColor: loading || disabled ? '#E0E0E0' : '#FB7E00',
        borderRadius: '100px',
        color: '#fff',
        boxShadow: 'none',
        '&:hover': { 
          backgroundColor: loading || disabled ? '#E0E0E0' : '#C96400', 
          boxShadow: 'none' 
        },
        ...props.sx,
      }}
    >
      {loading ? (
        <>
          <CircularProgress size={20} sx={{ mr: 1, color: '#fff' }} />
          {loadingText || 'Đang xử lý...'}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default PrimaryButton;
