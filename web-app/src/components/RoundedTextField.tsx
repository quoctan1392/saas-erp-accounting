import React from 'react';
import { TextField } from '@mui/material';

interface RoundedTextFieldProps extends Omit<React.ComponentProps<typeof TextField>, 'variant'> {
  // Add any custom props here if needed
}

const RoundedTextField: React.FC<RoundedTextFieldProps> = ({ sx, ...props }) => {
  return (
    <TextField
      variant="outlined"
      {...props}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#FFF',
          borderRadius: '48px',
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
          paddingLeft: '16px', 
          paddingRight: '16px' 
        },
        ...sx,
      }}
    />
  );
};

export default RoundedTextField;
