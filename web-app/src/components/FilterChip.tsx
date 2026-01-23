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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 20px',
        borderRadius: '40px',
        fontWeight: 500,
        minHeight: '40px',
        fontSize: '14px',
        // Selected styles
        background: selected ? tokens.colors.primary : '#FFFFFF',
        bgcolor: selected ? tokens.colors.primary : '#FFFFFF',
        color: selected ? '#FFFFFF' : tokens.colors.text.primary,
        border: selected ? `1px solid ${tokens.colors.primary}` : '1px solid #C5C5C5',
        boxShadow: 'none',
        '&:hover': {
          background: selected ? tokens.colors.primaryHover : '#F5F7FB',
        },
        ...sx,
      }}
      size="small"
    />
  );
};

export default FilterChip;
