import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import type { SxProps } from '@mui/system';
import * as Iconsax from 'iconsax-react';

interface SearchBoxProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  sx?: SxProps;
  inputProps?: any;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholder,
  startIcon,
  endIcon,
  disabled,
  fullWidth = false,
  sx,
  inputProps,
}) => {
  const DefaultIconComp = (Iconsax as any)['SearchNormal'];
  const defaultStart = DefaultIconComp ? <DefaultIconComp size={20} color="#6C757D" variant="Outline" /> : null;

  return (
    <TextField
      fullWidth={fullWidth}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      inputProps={inputProps}
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: disabled ? '#F8F9FA' : 'white',
          borderRadius: '24px',
          height: '48px',
          '& fieldset': { borderColor: '#DEE2E6' },
          '&:hover fieldset': { borderColor: '#CFCFCF' },
          '&.Mui-focused fieldset': { borderColor: '#FB7E00', boxShadow: '0 0 0 4px rgba(251,126,0,0.08)' },
          '&.Mui-disabled': { bgcolor: '#F8F9FA', color: '#ADB5BD' },
          '& .MuiOutlinedInput-input': { paddingLeft: '12px', paddingRight: '8px' },
        },
        ...(sx as any),
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">{startIcon || defaultStart}</InputAdornment>
        ),
        endAdornment: endIcon ? <InputAdornment position="end">{endIcon}</InputAdornment> : undefined,
      }}
    />
  );
};

export default SearchBox;
