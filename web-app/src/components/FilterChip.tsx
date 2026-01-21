import React from 'react';
import { Chip } from '@mui/material';
import tokens from '../styles/tokens';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  sx?: any;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, selected = false, onClick, sx }) => {
  return (
    <Chip
      label={label}
      onClick={onClick}
      clickable
      sx={{
        bgcolor: selected ? tokens.colors.primary : 'transparent',
        color: selected ? '#fff' : tokens.colors.text.primary,
        border: selected ? 'none' : `1px solid ${tokens.colors.border.light}`,
        fontWeight: 500,
        '&:hover': {
          bgcolor: selected ? tokens.colors.primaryHover : 'rgba(0,0,0,0.04)',
        },
        ...sx,
      }}
      size="small"
    />
  );
};

export default FilterChip;
