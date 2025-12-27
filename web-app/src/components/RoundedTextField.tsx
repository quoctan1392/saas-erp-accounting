import React from 'react';
import { TextField, Box } from '@mui/material';

interface RoundedTextFieldProps extends Omit<React.ComponentProps<typeof TextField>, 'variant'> {
  // Keep an optional picker prop for backward-compatibility with screens
  picker?: any;
}

const RoundedTextField: React.FC<RoundedTextFieldProps> = ({ sx, InputLabelProps, InputProps, onClick, ...props }) => {
  const hasStartAdornment = !!InputProps?.startAdornment;

  return (
    <Box onClick={(e: any) => {
      if (onClick) onClick(e);
    }}>
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
                left: '0px',
                backgroundColor: '#ffffff',
              },
            },
            ...sx,
          }}
        />
    </Box>
  );
};

export default RoundedTextField;