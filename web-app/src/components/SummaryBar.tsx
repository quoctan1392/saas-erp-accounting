import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { Close, ArrowForwardIos } from '@mui/icons-material';

interface SummaryBarProps {
  count: number;
  total: string;
  onClear?: () => void;
  onConfirm?: () => void;
}

const SummaryBar: React.FC<SummaryBarProps> = ({ count, total, onClear, onConfirm }) => {
  // eslint-disable-next-line no-console
  console.log('[SummaryBar] render', { count, total });

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 52,
        px: 1.5,
        gap: 2,
        borderRadius: '40px',
        background: 'var(--Scheme-Primary, #FB7E00)',
        color: '#FFF',
        width: '100%',
        boxSizing: 'border-box',
        minWidth: 320,
        maxWidth: 980,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        <IconButton
          onClick={onClear}
          aria-label="clear-selection"
          title="Bỏ chọn"
          sx={{
            width: 40,
            height: 40,
            bgcolor: '#FFF',
            '&:hover': { bgcolor: '#FFF' },
            borderRadius: '50%',
            p: 0,
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
          }}
        >
          <Close sx={{ color: 'var(--Scheme-Primary, #FB7E00)', fontSize: 18 }} />
        </IconButton>

        <Typography sx={{ fontSize: 15, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{`Đã chọn ${count} sản phẩm`}</Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, whiteSpace: 'nowrap' }}>{total}</Typography>
        <IconButton
          onClick={onConfirm}
          aria-label="confirm-selection"
          title="Xác nhận"
          sx={{ width: 40, height: 40, bgcolor: 'transparent', color: '#FFF', p: 0 }}
        >
          <ArrowForwardIos sx={{ color: '#FFF' }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default SummaryBar;
