import React from 'react';
import { Button, SxProps } from '@mui/material';

type VariantType = 'primary' | 'secondary' | 'text';

interface Props {
  children: React.ReactNode;
  variantType?: VariantType;
  fullWidth?: boolean;
  onClick?: (e: any) => void;
  disabled?: boolean;
  sx?: SxProps;
  type?: 'button' | 'submit' | 'reset';
}

const AppButton: React.FC<Props> = ({
  children,
  variantType = 'primary',
  fullWidth = false,
  onClick,
  disabled = false,
  sx,
  type = 'button',
}) => {
  const common = {
    textTransform: 'none',
    borderRadius: '12px',
    fontSize: 16,
    fontWeight: variantType === 'primary' ? 600 : 500,
  } as any;

  if (variantType === 'primary') {
    return (
      <Button
        variant="contained"
        onClick={onClick}
        disabled={disabled}
        fullWidth={fullWidth}
        type={type}
        sx={{
          ...common,
          bgcolor: disabled ? '#DEE2E6' : '#FB7E00',
          color: disabled ? '#ADB5BD' : '#ffffff',
          boxShadow: 'none',
          '&:hover': { bgcolor: disabled ? '#DEE2E6' : '#FB7E00', boxShadow: 'none' },
          ...sx,
        }}
      >
        {children}
      </Button>
    );
  }

  if (variantType === 'secondary') {
    return (
      <Button
        variant="outlined"
        onClick={onClick}
        disabled={disabled}
        fullWidth={fullWidth}
        type={type}
        sx={{
          ...common,
          borderColor: disabled ? '#DEE2E6' : '#FB7E00',
          color: disabled ? '#ADB5BD' : '#FB7E00',
          bgcolor: disabled ? '#F5F5F5' : 'transparent',
          '&:hover': { bgcolor: disabled ? '#F5F5F5' : '#FFF4E6' },
          ...sx,
        }}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button variant="text" onClick={onClick} disabled={disabled} fullWidth={fullWidth} type={type} sx={{ ...common, ...sx }}>
      {children}
    </Button>
  );
};

export default AppButton;
