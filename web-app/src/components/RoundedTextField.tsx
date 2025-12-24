import React from 'react';
import { TextField } from '@mui/material';

interface RoundedTextFieldProps extends Omit<React.ComponentProps<typeof TextField>, 'variant'> {
  // Add any custom props here if needed
}

const RoundedTextField: React.FC<RoundedTextFieldProps> = ({ sx, InputLabelProps, InputProps, ...props }) => {
  // Check if there's a start adornment
  const hasStartAdornment = !!InputProps?.startAdornment;
  
  return (
    <TextField
      variant="outlined"
      {...props}
      InputProps={InputProps}
      InputLabelProps={{
        shrink: true,
        ...InputLabelProps,
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#FFF',
          borderRadius: '48px',
          paddingLeft: hasStartAdornment ? '16px' : '24px',
          paddingRight: '16px',
          height: '48px',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          '& fieldset': { 
            borderColor: '#D8D8D8', 
            borderWidth: '1px' 
          },
          '&:hover fieldset': { 
            borderColor: '#FB7E00' 
          },
          '&.Mui-focused fieldset': { 
            borderColor: '#FB7E00', 
            borderWidth: '1px' 
          },
        },
        '& .MuiOutlinedInput-input': { 
          paddingLeft: 0,
          paddingRight: 0,
          color: '#000000', // Black input text
          paddingTop: '10px',
          paddingBottom: '10px',
          boxSizing: 'border-box',
          height: '100%',
        },
        // Gap between adornments and input/placeholder
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
        // Label styling: add left offset and white background so outline doesn't show under label
        '& .MuiInputLabel-root': {
          left: '8px',
          padding: '0 8px',
          backgroundColor: 'transparent',
          transformOrigin: 'left top',
          '&.MuiInputLabel-shrink': {
            left: '8pxß',
            backgroundColor: '#ffffff',
          },
        },
        ...sx,
      }}
    />
  );
};

export default RoundedTextField;
