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
  size?: 'sm' | 'md' | 'lg' | 'expand';
  variant?: 'compact' | 'expand' | 'default';
  allowEdit?: boolean;
  // optional styling overrides for decrement/increment buttons
  decrementButtonBorderColor?: string;
  incrementButtonBorderColor?: string;
  decrementIconColor?: string;
  incrementIconColor?: string;
  buttonBackgroundColor?: string;
}

export default function NumberSpinner({
  value,
  min = 0,
  max = Infinity,
  step = 1,
  onChange,
  size = 'sm',
  variant = 'default',
  allowEdit = false,
  decrementButtonBorderColor,
  incrementButtonBorderColor,
  decrementIconColor,
  incrementIconColor,
  buttonBackgroundColor,
}: NumberSpinnerProps) {
  const handleDec = () => onChange(Math.max(min, value - step));
  const handleInc = () => onChange(Math.min(max, value + step));

  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(String(value));

  React.useEffect(() => {
    if (!isEditing) setEditValue(String(value));
  }, [value, isEditing]);

  const commitEdit = () => {
    const parsed = parseInt(editValue, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditValue(String(value));
    setIsEditing(false);
  };

  const dims = size === 'sm' ? 24 : size === 'lg' || size === 'expand' ? 44 : 36;
  const fontSize = size === 'sm' ? 14 : size === 'lg' || size === 'expand' ? 16 : 15;

  // variant overrides size when provided. compact variant shows minimal number
  const isCompact = variant === 'compact' || size === 'sm';
  const isExpand = variant === 'expand' || size === 'expand' || size === 'lg';

  const containerSx = isCompact
    ? {
        display: 'flex',
        padding: '2px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2px',
        borderRadius: '32px',
        background: 'var(--Greyscale-50, #ECEFF3)',
      }
    : isExpand
    ? { display: 'flex', alignItems: 'center', gap: 3, width: '100%', justifyContent: 'center' }
    : { display: 'flex', alignItems: 'center', gap: 3 };

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
      <IconButton
        disableRipple
        onClick={handleDec}
        size="small"
        sx={{
          ...buttonSx,
          ...(buttonBackgroundColor ? { background: buttonBackgroundColor } : {}),
          ...(decrementButtonBorderColor ? { border: `1px solid ${decrementButtonBorderColor}` } : {}),
        }}
        aria-label="decrease"
      >
        <RemoveIcon sx={{ fontSize: fontSize, color: decrementIconColor || '#4E4E4E' }} />
      </IconButton>

      {allowEdit ? (
        isEditing ? (
          // editing UI: keep large input for non-compact, but compact shows a smaller input
          isCompact ? (
            <Box sx={{ display: 'flex', minWidth: 48, height: dims, padding: '2px 6px', justifyContent: 'center', alignItems: 'center', gap: '4px', borderRadius: '8px', border: 'none', background: 'transparent', boxSizing: 'border-box' }}>
              {React.createElement('input', {
                autoFocus: true,
                inputMode: 'numeric' as const,
                pattern: '[0-9]*',
                value: editValue,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value),
                onBlur: commitEdit,
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') cancelEdit();
                },
                style: {
                  fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
                  fontSize: String(fontSize),
                  fontWeight: 600,
                  color: 'var(--Scheme-Primary, #FB7E00)',
                  textAlign: 'center' as const,
                  width: '40px',
                  height: '100%',
                  lineHeight: `${dims}px`,
                  boxSizing: 'border-box' as const,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  WebkitFontSmoothing: 'antialiased' as const,
                }
              })}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', width: '140px', minWidth: '140px', height: '56px', padding: '4px 12px', justifyContent: 'center', alignItems: 'center', gap: '8px', borderRadius: '8px', border: '1px solid var(--Scheme-OutlineVariant, #C5C5C5)', background: 'var(--Scheme-Surface, #FFF)', boxSizing: 'border-box' }}>
              {React.createElement('input', {
                autoFocus: true,
                inputMode: 'numeric' as const,
                pattern: '[0-9]*',
                value: editValue,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEditValue(e.target.value),
                onBlur: commitEdit,
                onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') cancelEdit();
                },
                style: {
                  fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
                  fontSize: '32px',
                  fontWeight: 500,
                  color: 'var(--Scheme-Primary, #FB7E00)',
                  textAlign: 'center' as const,
                  width: '100%',
                  height: '100%',
                  lineHeight: '56px',
                  boxSizing: 'border-box' as const,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  WebkitFontSmoothing: 'antialiased' as const,
                }
              })}
            </Box>
          )
        ) : (
          isCompact ? (
            <Box onClick={() => setIsEditing(true)} sx={{ display: 'flex', minWidth: 30, height: dims, padding: '2px', justifyContent: 'center', alignItems: 'center', gap: '2px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'text', boxSizing: 'border-box' }}>
              <Typography sx={{ color: 'var(--Scheme-On-Surface, #090909)', textAlign: 'center', fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial', fontSize: fontSize, fontStyle: 'normal', fontWeight: 600, lineHeight: `${dims}px` }}>{value}</Typography>
            </Box>
          ) : (
            <Box onClick={() => setIsEditing(true)} sx={{ display: 'flex', width: '140px', minWidth: '140px', height: '56px', padding: '4px 12px', justifyContent: 'center', alignItems: 'center', gap: '4px', borderRadius: '8px', border: '1px solid var(--Scheme-OutlineVariant, #C5C5C5)', background: 'var(--Scheme-Surface, #FFF)', cursor: 'text', boxSizing: 'border-box' }}>
              <Typography sx={{ color: 'var(--Scheme-Primary, #FB7E00)', textAlign: 'center', fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial', fontSize: '32px', fontStyle: 'normal', fontWeight: 500, lineHeight: '56px' }}>{value}</Typography>
            </Box>
          )
        )
      ) : (
        isCompact ? (
          <Box sx={{ display: 'flex', minWidth: 30, height: dims, padding: '2px', justifyContent: 'center', alignItems: 'center', gap: '2px', borderRadius: '8px', border: 'none', background: 'transparent', boxSizing: 'border-box' }}>
            <Typography sx={{ color: 'var(--Scheme-On-Surface, #090909)', textAlign: 'center', fontFamily: 'Inter, Bricolage Grotesque, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial', fontSize: fontSize, fontStyle: 'normal', fontWeight: 600, lineHeight: `${dims}px` }}>{value}</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', width: '140px', minWidth: '140px', height: '56px', padding: '4px 12px', justifyContent: 'center', alignItems: 'center', gap: '4px', borderRadius: '8px', border: '1px solid var(--Scheme-OutlineVariant, #C5C5C5)', background: 'var(--Scheme-Surface, #FFF)', boxSizing: 'border-box' }}>
            <Typography sx={{ color: 'var(--Scheme-On-Surface, #FB7E00))', textAlign: 'center', fontFamily: 'Inter, Bricolage Grotesque, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial', fontSize: '32px', fontStyle: 'normal', fontWeight: 500, lineHeight: '56px' }}>{value}</Typography>
          </Box>
        )
      )}

      <IconButton
        disableRipple
        onClick={handleInc}
        size="small"
        sx={{
          ...buttonSx,
          ...(buttonBackgroundColor ? { background: buttonBackgroundColor } : {}),
          ...(incrementButtonBorderColor ? { border: `1px solid ${incrementButtonBorderColor}` } : {}),
        }}
        aria-label="increase"
      >
        <AddIcon sx={{ fontSize: fontSize, color: incrementIconColor || '#4E4E4E' }} />
      </IconButton>
    </Box>
  );
}
