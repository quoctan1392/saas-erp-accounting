import React, { useRef, useState } from 'react';
import { Box, Typography, IconButton, Button, Radio, RadioGroup, Divider, Link } from '@mui/material';
import BottomSheet from './BottomSheet';
import Icon from './Icon';
import { formatDate } from '../utils/dashboardUtils';

interface Props {
  open: boolean;
  onClose: () => void;
  tempTimeFilter: string;
  setTempTimeFilter: (v: string) => void;
  selectedTimeFilter: string;
  setSelectedTimeFilter: (v: string) => void;
  currentRange: { startDate: Date; endDate: Date };
  setCurrentRange: (r: { startDate: Date; endDate: Date }) => void;
  customStart: string;
  customEnd: string;
  setCustomStart: (v: string) => void;
  setCustomEnd: (v: string) => void;
  previewCustomStart: string;
  previewCustomEnd: string;
  setPreviewCustomStart: (v: string) => void;
  setPreviewCustomEnd: (v: string) => void;
  setShowDateRangeSheet: (v: boolean) => void;
  setShowBottomNav: (v: boolean) => void;
}

const TimeFilterSheet: React.FC<Props> = ({
  open,
  onClose,
  tempTimeFilter,
  setTempTimeFilter,
  selectedTimeFilter,
  setSelectedTimeFilter,
  currentRange,
  setCurrentRange,
  customStart,
  customEnd,
  setCustomStart,
  setCustomEnd,
  previewCustomStart,
  previewCustomEnd,
  setPreviewCustomStart,
  setPreviewCustomEnd,
  setShowDateRangeSheet,
  setShowBottomNav,
}) => {
  const dragStartYRef = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [showCustomPicker] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartYRef.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartYRef.current === null) return;
    const currentY = e.touches[0].clientY;
    const delta = Math.max(0, currentY - dragStartYRef.current);
    setDragOffset(delta);
  };
  const handleTouchEnd = () => {
    const threshold = 80;
    if (dragOffset > threshold) {
      // discard preview and close
      setPreviewCustomStart('');
      setPreviewCustomEnd('');
      onClose();
      setShowBottomNav(true);
    }
    setDragOffset(0);
    dragStartYRef.current = null;
  };

  const handleConfirm = () => {
    if (tempTimeFilter === 'custom') {
      if (previewCustomStart && previewCustomEnd) {
        try {
          const s = new Date(previewCustomStart);
          const e = new Date(previewCustomEnd);
          setCurrentRange({ startDate: s, endDate: e });
          setSelectedTimeFilter('custom');
          setCustomStart(previewCustomStart);
          setCustomEnd(previewCustomEnd);
        } catch (err) {
          console.error('Invalid preview custom range', err);
        }
      } else if (customStart && customEnd) {
        try {
          const s = new Date(customStart);
          const e = new Date(customEnd);
          setCurrentRange({ startDate: s, endDate: e });
          setSelectedTimeFilter('custom');
        } catch (err) {
          console.error('Invalid custom range', err);
        }
      }
    } else {
      try {
        // @ts-ignore - getDateRangeForFilter is used upstream; we expect parent has updated currentRange if needed
        // This component will rely on parent's helper if needed. For safety we simply set selected filter and close.
        setSelectedTimeFilter(tempTimeFilter);
      } catch (e) {
        console.error('Error getting range for filter', e);
      }
    }

    // clear previews and close
    setPreviewCustomStart('');
    setPreviewCustomEnd('');
    onClose();
    setShowBottomNav(true);
  };

  return (
    <BottomSheet open={open} onClose={() => { setPreviewCustomStart(''); setPreviewCustomEnd(''); onClose(); setShowBottomNav(true); }} title="Bộ lọc thời gian">
      <Box onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} sx={{ px: 1 }}>
        {/* Handler bar already present in BottomSheet; keep spacing */}
        <RadioGroup value={tempTimeFilter} onChange={(e) => setTempTimeFilter(e.target.value)} sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { value: 'today', label: 'Hôm nay' },
            { value: 'this_week', label: 'Tuần này' },
            { value: 'this_month', label: 'Tháng này' },
            { value: 'this_quarter', label: 'Quý này' },
            { value: 'this_year', label: 'Năm nay' },
            { value: 'custom', label: 'Tuỳ chọn' },
          ].map((opt, idx, arr) => (
            <Box key={opt.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, px: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Radio value={opt.value} sx={{ '&.Mui-checked': { color: '#FB7E00' }, p: 0 }} />
                  <Typography sx={{ fontSize: 15, color: '#212529' }}>{opt.label}</Typography>
                </Box>

                {opt.value === 'custom' ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    { (previewCustomStart && previewCustomEnd) || (customStart && customEnd) ? (
                      <Link component="button" underline="none" onClick={() => { setShowDateRangeSheet(true); setShowBottomNav(false); setTempTimeFilter('custom'); }} sx={{ color: '#007DFB', fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Icon name="Calendar" size={16} color="#007DFB" variant="Outline" />
                        {previewCustomStart && previewCustomEnd ? `${formatDate(new Date(previewCustomStart))} - ${formatDate(new Date(previewCustomEnd))}` : `${formatDate(new Date(customStart))} - ${formatDate(new Date(customEnd))}`}
                      </Link>
                    ) : (
                      <Link component="button" underline="none" onClick={() => { setShowDateRangeSheet(true); setShowBottomNav(false); setTempTimeFilter('custom'); }} sx={{ color: '#0D6EFD', fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Icon name="Calendar" size={16} color="#0D6EFD" variant="Outline" />
                        Chọn khoảng
                      </Link>
                    )}
                  </Box>
                ) : null}
              </Box>

              {idx < arr.length - 1 && <Divider sx={{ borderColor: '#F1F3F5' }} />}
            </Box>
          ))}
        </RadioGroup>

        <Box sx={{ mt: 2 }}>
          <Button fullWidth variant="text" onClick={handleConfirm} sx={{ borderRadius: '100px', fontSize: '16px', bgcolor: '#FB7E00', color: 'white', textTransform: 'none', fontWeight: 500, py: 1.5, boxShadow: 'none', '&:hover': { bgcolor: '#E65A2E', boxShadow: 'none' } }}>
            Xác nhận
          </Button>
        </Box>
      </Box>
    </BottomSheet>
  );
};

export default TimeFilterSheet;
