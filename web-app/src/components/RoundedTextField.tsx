import React from 'react';
import { TextField, Box } from '@mui/material';

interface RoundedTextFieldProps extends Omit<React.ComponentProps<typeof TextField>, 'variant'> {
  // Keep an optional picker prop for backward-compatibility with screens
  picker?: any;
}

const RoundedTextField: React.FC<RoundedTextFieldProps> = ({ sx, InputLabelProps, InputProps, onClick, inputProps, ...props }) => {
  const hasStartAdornment = !!InputProps?.startAdornment;

  // Attach clicks to the native input element instead of the outer wrapper.
  const mergedInputProps = {
    ...(inputProps || {}),
    onClick: (e: React.MouseEvent<HTMLInputElement>) => {
      if (typeof inputProps?.onClick === 'function') inputProps?.onClick(e as any);
      if (onClick) onClick(e as any);
    },
  } as typeof inputProps;

  return (
    <Box sx={{ pointerEvents: 'none' }}>
      <TextField
        variant="outlined"
        {...props}
        InputProps={{
          ...InputProps,
          inputProps: mergedInputProps,
        }}
        inputProps={mergedInputProps}
        InputLabelProps={{
          shrink: true,
          ...InputLabelProps,
        }}
        sx={{
          pointerEvents: 'auto',
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#transparent',
            borderRadius: '48px',
            paddingLeft: hasStartAdornment ? '12px' : '16px',
            paddingRight: '16px',
            height: '48px',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            '& fieldset': {
              borderColor: '#D8D8D8',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: '#FB7E00',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FB7E00',
              borderWidth: '1px',
            },
          },
          '& .MuiOutlinedInput-input': {
            paddingLeft: 0,
            paddingRight: 0,
            color: '#000000',
            paddingTop: '10px',
            paddingBottom: '10px',
            boxSizing: 'border-box',
            height: '100%',
          },
          '& .MuiInputAdornment-root.MuiInputAdornment-positionStart': {
            marginRight: '8px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiInputAdornment-root.MuiInputAdornment-positionEnd': {
            marginLeft: '8px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiInputLabel-root': {
            left: '8px',
            padding: '0px 4px',
            backgroundColor: 'transparent',
            transformOrigin: 'left top',
            '&.MuiInputLabel-shrink': {
              left: '4px',
              transform: 'translate(14px, -9px) scale(0.75)',
            },
          },
          '& .MuiOutlinedInput-notchedOutline legend': {
            maxWidth: '100%',
          },
          ...sx,
        }}
      />
    </Box>
  );
};

export default RoundedTextField;