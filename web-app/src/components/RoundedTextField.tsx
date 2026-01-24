import React from 'react';
import { TextField, Box, InputAdornment } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface RoundedTextFieldProps extends Omit<React.ComponentProps<typeof TextField>, 'variant'> {
  // Keep an optional picker prop for backward-compatibility with screens
  picker?: any;
  // Allow top-level readOnly shorthand (mapped to inputProps)
  readOnly?: boolean;
  // optional convenience prop used by several screens
  endAdornmentIcon?: string;
  // optional explicit endAdornment
  endAdornment?: React.ReactNode;
}

const RoundedTextField: React.FC<RoundedTextFieldProps> = ({ sx, InputLabelProps, InputProps, onClick, inputProps, readOnly, endAdornment, endAdornmentIcon, ...props }) => {
  const hasStartAdornment = !!InputProps?.startAdornment;
  
  // Calculate right padding based on what adornments exist:
  // - If chip (endAdornment) exists: reserve enough space for chip + arrow
  // - If only arrow icon: reserve minimal padding so arrow sits near edge
  // - Otherwise: default padding
  // Note: adornment will be absolutely positioned at the right edge of the input
  // so padding only needs to prevent text overlap with the adornment.
  const rightPadding = endAdornment ? '56px' : (endAdornmentIcon ? '36px' : '16px');

  // Attach clicks to the native input element instead of the outer wrapper.
  const mergedInputProps = {
    ...(inputProps || {}),
    onClick: (e: React.MouseEvent<HTMLInputElement>) => {
      if (typeof inputProps?.onClick === 'function') inputProps?.onClick(e as any);
      if (onClick) onClick(e as any);
    },
    readOnly: readOnly || inputProps?.readOnly,
  } as typeof inputProps;

  // Build the end adornment combining any provided node and an optional icon
  const builtEndAdornment = endAdornment || undefined;
  const builtIcon = endAdornmentIcon ? (
    <ArrowForwardIosIcon sx={{ fontSize: 14, color: '#9AA0A6' }} />
  ) : null;

  // Build endAdornment differently depending on whether a chip (node) exists
  const builtAdornmentNode = (() => {
    if (builtEndAdornment && builtIcon) {
      return (
        <InputAdornment position="end">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{builtEndAdornment}{builtIcon}</Box>
        </InputAdornment>
      );
    }
    if (builtIcon) {
      return (
        <InputAdornment position="end">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>{builtIcon}</Box>
        </InputAdornment>
      );
    }
    if (builtEndAdornment) {
      return (
        <InputAdornment position="end">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{builtEndAdornment}</Box>
        </InputAdornment>
      );
    }
    return InputProps?.endAdornment;
  })();

  const mergedInputComponentProps = {
    ...InputProps,
    endAdornment: builtAdornmentNode,
  } as typeof InputProps;

  return (
    <Box sx={{ pointerEvents: 'none' }}>
      <TextField
        variant="outlined"
        {...props}
        InputProps={{
          ...mergedInputComponentProps,
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
            paddingRight: rightPadding,
            position: 'relative',
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
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            height: 'auto',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'auto',
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