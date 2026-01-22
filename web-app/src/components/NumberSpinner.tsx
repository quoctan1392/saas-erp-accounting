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

const NumberSpinner: React.FC<NumberSpinnerProps> = ({ value, min = 1, max = Infinity, step = 1, onChange, size = 'md' }) => {
  const handleDec = () => onChange(Math.max(min, value - step));
  const handleInc = () => onChange(Math.min(max, value + step));

  const dims = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 15;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#FFFFFF', borderRadius: '999px', px: 1.25, py: 0.5, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}>
        <IconButton
          onClick={handleDec}
          size="small"
          sx={{ width: dims, height: dims, bgcolor: '#F5F5F5', '&:hover': { bgcolor: '#EFEFEF' }, borderRadius: '50%', p: 0 }}
          aria-label="decrease"
        >
          <RemoveIcon sx={{ fontSize: fontSize, color: '#4E4E4E' }} />
        </IconButton>

        <Typography sx={{ fontSize, fontWeight: 500, minWidth: 28, textAlign: 'center', px: 0.75 }}>{value}</Typography>

        <IconButton
          onClick={handleInc}
          size="small"
          sx={{ width: dims, height: dims, bgcolor: '#F5F5F5', '&:hover': { bgcolor: '#EFEFEF' }, borderRadius: '50%', p: 0 }}
          aria-label="increase"
        >
          <AddIcon sx={{ fontSize: fontSize, color: '#4E4E4E' }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default NumberSpinner;
