import React, { useState, useMemo } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import BottomSheet from './BottomSheet';
import Icon from './Icon';
import { formatDate } from '../utils/dashboardUtils';

interface Props {
  open: boolean;
  onClose: () => void;
  initialStart?: Date | null;
  initialEnd?: Date | null;
  onConfirm: (start: Date, end: Date) => void;
}

const weekLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const DateRangeBottomSheet: React.FC<Props> = ({ open, onClose, initialStart = null, initialEnd = null, onConfirm }) => {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState<Date>(initialStart || today);
  const [start, setStart] = useState<Date | null>(initialStart || null);
  const [end, setEnd] = useState<Date | null>(initialEnd || null);

  const monthLabel = useMemo(() => {
    const m = visibleMonth.getMonth() + 1;
    const y = visibleMonth.getFullYear();
    return `Tháng ${m}, ${y}`;
  }, [visibleMonth]);

  const firstOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const startWeekday = firstOfMonth.getDay(); // 0=Sun
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();

  // Build array of dates for grid (include leading blanks)
  const gridDates = useMemo(() => {
    const arr: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), d));
    return arr;
  }, [visibleMonth, startWeekday, daysInMonth]);

  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const inRange = (d: Date) => {
    if (start && end) {
      const t = d.setHours(0,0,0,0);
      const s = start.setHours(0,0,0,0);
      const e = end.setHours(0,0,0,0);
      return t > s && t < e;
    }
    return false;
  };

  const handleDayClick = (d: Date) => {
    if (!start || (start && end)) {
      setStart(d);
      setEnd(null);
    } else if (start && !end) {
      if (d.getTime() < start.getTime()) {
        setEnd(start);
        setStart(d);
      } else {
        setEnd(d);
      }
    }
  };

  const handleConfirm = () => {
    if (start && end) {
      onConfirm(start, end);
      onClose();
    } else if (start && !end) {
      onConfirm(start, start);
      onClose();
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} closeIconName="CloseCircle" title="Chọn khoảng thời gian" zIndexBase={1200}>
      <Box sx={{ px: 1 }}>
        {/* Display Area */}
        <Box sx={{ mb: 2, px: 0 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 500, color: '#FB7E00' }}>
            {start ? (end ? `${formatDate(start)} - ${formatDate(end)}` : `${formatDate(start)} - ${formatDate(start)}`) : 'Chọn ngày'}
          </Typography>
          <Box sx={{ height: 1, bgcolor: '#F1F3F5', mt: 1, mb: 2 }} />
        </Box>

        {/* Month Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}>
              <Icon name="ArrowLeft2" size={20} color="#6C757D" variant="Outline" />
            </IconButton>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{monthLabel}</Typography>
            <IconButton size="small" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}>
              <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Outline" />
            </IconButton>
          </Box>
          <Button
            variant="outlined"
            onClick={() => {
              // Jump visible month to today and pre-select today as start & end
              setVisibleMonth(today);
              const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              setStart(t);
              setEnd(t);
            }}
            sx={{ textTransform: 'none', color: '#000', borderRadius: '100px', borderColor: 'transparent', backgroundColor: '#F5F5F5' }}
          >
            Hôm nay
          </Button>
        </Box>

        {/* Week Labels */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', color: '#ADB5BD', mb: 1 }}>
          {weekLabels.map((w) => (
            <Typography key={w} sx={{ fontSize: 14 }}>{w}</Typography>
          ))}
        </Box>

        {/* Date Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
          {gridDates.map((d, idx) => {
            if (!d) return <Box key={idx} sx={{ height: 48 }} />;
            const isToday = isSameDay(new Date(), d);
            const selectedStart = start && isSameDay(start, d);
            const selectedEnd = end && isSameDay(end, d);
            const between = inRange(new Date(d));

            return (
              <Box
                key={idx}
                onClick={() => handleDayClick(d)}
                sx={{
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: selectedStart || selectedEnd ? '#FB7E00' : between ? '#FFF4E6' : 'transparent',
                    color: selectedStart || selectedEnd ? 'white' : 'black',
                    border: isToday && !(selectedStart || selectedEnd) ? '2px solid #FB7E00' : 'none',
                  }}
                >
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{d.getDate()}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Footer Confirm */}
        <Box sx={{ mt: 2, pb: 2 }}>
          <Button
            fullWidth
            variant="text"
            onClick={handleConfirm}
            sx={{ fontSize: '16px', textTransform: 'none', height: '52px', bgcolor: '#FB7E00', color: 'white', borderRadius: '100px', boxShadow: 'none', fontWeight: 500 }}
          >
            Xác nhận
          </Button>
        </Box>
      </Box>
    </BottomSheet>
  );
};

export default DateRangeBottomSheet;
