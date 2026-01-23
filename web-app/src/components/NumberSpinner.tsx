import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface NumberSpinnerProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const NumberSpinner: React.FC<NumberSpinnerProps> = ({ value, min = 0, max = Infinity, step = 1, onChange, size = 'sm' }) => {
  const handleDec = () => onChange(Math.max(min, value - step));
  const handleInc = () => onChange(Math.min(max, value + step));

  const dims = size === 'sm' ? 24 : size === 'lg' ? 44 : 36;
  const fontSize = size === 'sm' ? 14 : size === 'lg' ? 16 : 15;

  const isCompact = size === 'sm';

  const containerSx = isCompact
    ? {
        display: 'flex',
        padding: '2px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        borderRadius: '32px',
        background: 'var(--Greyscale-50, #ECEFF3)',
      }
    : { display: 'flex', alignItems: 'center', gap: 1 };

  const buttonSx = isCompact
    ? {
        display: 'flex',
        width: dims,
        height: dims,
        p: '8px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        borderRadius: '32px',
        background: 'var(--Greyscale-0, #FFF)',
        minWidth: dims,
        '&:active': { background: 'var(--Greyscale-0, #FFF)' },
      }
    : {
        width: dims,
        height: dims,
        bgcolor: '#F5F5F5',
        '&:hover': { bgcolor: '#EFEFEF' },
        '&:active': { bgcolor: '#F5F5F5' },
        borderRadius: '50%',
        p: 0,
      };

  return (
    <Box sx={containerSx}>
      <IconButton disableRipple onClick={handleDec} size="small" sx={buttonSx} aria-label="decrease">
        <RemoveIcon sx={{ fontSize: fontSize, color: '#4E4E4E' }} />
      </IconButton>

      <Typography sx={{ fontSize, fontWeight: 500, minWidth: '16px', textAlign: 'center' }}>{value}</Typography>

      <IconButton disableRipple onClick={handleInc} size="small" sx={buttonSx} aria-label="increase">
        <AddIcon sx={{ fontSize: fontSize, color: '#4E4E4E' }} />
      </IconButton>
    </Box>
  );
};

export default NumberSpinner;
