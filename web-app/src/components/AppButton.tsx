import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import type { SxProps } from '@mui/material';

type VariantType = 'primary' | 'secondary' | 'text';

interface Props {
  children: React.ReactNode;
  variantType?: VariantType;
  fullWidth?: boolean;
  onClick?: (e: any) => void;
  onMouseEnter?: React.MouseEventHandler<HTMLButtonElement>;
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  sx?: SxProps;
  type?: 'button' | 'submit' | 'reset';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const AppButton: React.FC<Props> = ({
  children,
  variantType = 'primary',
  fullWidth = false,
  onClick,
  onMouseEnter,
  onFocus,
  disabled = false,
  loading = false,
  loadingText,
  sx,
  type = 'button',
  startIcon,
  endIcon,
}) => {
  const common = {
    textTransform: 'none',
    borderRadius: '100px',
    fontSize: 16,
    fontWeight: 500,
    height: 56,
    py: 1.75,
  } as any;

  const isDisabled = disabled || loading;

  if (variantType === 'primary') {
    return (
      <Button
        variant="contained"
        onClick={onClick}
          onMouseEnter={onMouseEnter}
          onFocus={onFocus}
        disabled={isDisabled}
        fullWidth={fullWidth}
        type={type}
        startIcon={!loading && startIcon}
        endIcon={!loading && endIcon}
        sx={{
          ...common,
          bgcolor: isDisabled ? '#E9ECEF' : '#FB7E00',
          color: isDisabled ? '#ADB5BD' : '#ffffff',
          boxShadow: 'none',
          '&:hover': { bgcolor: isDisabled ? '#E9ECEF' : '#E67000', boxShadow: 'none' },
          ...sx,
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
  }

  if (variantType === 'secondary') {
    return (
      <Button
        variant="outlined"
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
        disabled={isDisabled}
        fullWidth={fullWidth}
        type={type}
        startIcon={!loading && startIcon}
        endIcon={!loading && endIcon}
        sx={{
          ...common,
          borderRadius: '12px',
          borderColor: isDisabled ? '#DEE2E6' : '#FB7E00',
          color: isDisabled ? '#ADB5BD' : '#FB7E00',
          bgcolor: isDisabled ? '#F5F5F5' : 'transparent',
          '&:hover': { bgcolor: isDisabled ? '#F5F5F5' : '#FFF4E6' },
          ...sx,
        }}
      >
        {loading ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1, color: '#FB7E00' }} />
            {loadingText || 'Đang xử lý...'}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="text"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      disabled={isDisabled}
      fullWidth={fullWidth}
      type={type}
      startIcon={!loading && startIcon}
      endIcon={!loading && endIcon}
      sx={{ ...common, ...sx }}
    >
      {loading ? (
        <>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          {loadingText || 'Đang xử lý...'}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default AppButton;
