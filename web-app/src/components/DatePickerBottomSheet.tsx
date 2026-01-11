import React, { useState, useMemo } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import BottomSheet from './BottomSheet';
import Icon from './Icon';
import { formatDate } from '../utils/dashboardUtils';

interface Props {
  open: boolean;
  onClose: () => void;
  initial?: Date | null;
  onConfirm: (d: Date) => void;
  title?: string;
}

type ViewMode = 'day' | 'month' | 'year';

const weekLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

const DatePickerBottomSheet: React.FC<Props> = ({ open, onClose, initial = null, onConfirm, title = 'Chọn ngày' }) => {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState<Date>(initial || today);
  const [selected, setSelected] = useState<Date | null>(initial || today);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [, setAnimating] = useState(false);

  const monthLabel = useMemo(() => {
    const m = visibleMonth.getMonth() + 1;
    return `Tháng ${m}`;
  }, [visibleMonth]);

  // fixed view height so switching between day/month/year doesn't resize bottom sheet
  const viewHeight = 300;

  // when opening the bottom sheet from the text field, always show the day picker first
  React.useEffect(() => {
    if (open) {
      setViewMode('day');
    }
  }, [open]);

  const yearLabel = useMemo(() => {
    return visibleMonth.getFullYear().toString();
  }, [visibleMonth]);

  const firstOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();

  const gridDates = useMemo(() => {
    // Build a full calendar grid including previous/next month days so they
    // remain visible but are marked as disabled when outside the current month.
    const arr: Date[] = [];

    // Previous month's trailing days
    const prevMonthLastDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
      arr.push(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, prevMonthLastDay - i));
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), d));
    }

    // Next month's leading days to fill the last week
    const remainder = arr.length % 7;
    if (remainder !== 0) {
      const needed = 7 - remainder;
      for (let i = 1; i <= needed; i++) {
        arr.push(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, i));
      }
    }

    return arr;
  }, [visibleMonth, startWeekday, daysInMonth]);

  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const handleDayClick = (d: Date) => {
    setSelected(d);
  };

  const handleMonthClick = (monthIndex: number) => {
    const newDate = new Date(visibleMonth.getFullYear(), monthIndex, 1);
    setVisibleMonth(newDate);
    setAnimating(true);
    setTimeout(() => {
      setViewMode('day');
      setAnimating(false);
    }, 150);
  };

  const handleYearClick = (year: number) => {
    const newDate = new Date(year, visibleMonth.getMonth(), 1);
    setVisibleMonth(newDate);
    setAnimating(true);
    setTimeout(() => {
      setViewMode('month');
      setAnimating(false);
    }, 150);
  };

  const handleConfirm = () => {
    const pick = selected || today;
    onConfirm(pick);
    onClose();
  };

  const handleHeaderClick = () => {
    if (viewMode === 'day') {
      setAnimating(true);
      setTimeout(() => {
        setViewMode('month');
        setAnimating(false);
      }, 150);
    } else if (viewMode === 'month') {
      setAnimating(true);
      setTimeout(() => {
        setViewMode('year');
        setAnimating(false);
      }, 150);
    }
  };

  // Generate year range (current year ± 10)
  const yearRange = useMemo(() => {
    const currentYear = visibleMonth.getFullYear();
    const offset = ((currentYear - 2019) % 12 + 12) % 12; // anchor ranges at 2019
    const startYear = currentYear - offset;
    const years: number[] = [];
    for (let y = startYear; y <= startYear + 11; y++) {
      years.push(y);
    }
    return years;
  }, [visibleMonth]);

  return (
    <BottomSheet open={open} onClose={onClose} closeIconName="CloseCircle" title={title} zIndexBase={1450} maxHeight="calc(var(--vh, 1vh) * 100 - 120px)">
      <Box sx={{ px: 1, minHeight: '420px' }}>
        <Box sx={{ mb: 2, px: 0 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 500, color: '#FB7E00' }}>{selected ? formatDate(selected) : 'Chọn ngày'}</Typography>
          <Box sx={{ height: 1, bgcolor: '#F1F3F5', mt: 1, mb: 2 }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {viewMode === 'day' && (
              <>
                <IconButton size="small" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}>
                  <Icon name="ArrowLeft2" size={20} color="#6C757D" variant="Outline" />
                </IconButton>
                <Box
                  onClick={handleHeaderClick}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    cursor: 'pointer',
                    px: 1,
                    py: 0.5,
                    borderRadius: '8px',
                    '&:hover': { bgcolor: '#F5F5F5' },
                  }}
                >
                  <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#007DFB' }}>{monthLabel}</Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#007DFB' }}>, {yearLabel}</Typography>
                </Box>
                <IconButton size="small" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}>
                  <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Outline" />
                </IconButton>
              </>
            )}
            {viewMode === 'month' && (
              <>
                <IconButton size="small" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear() - 1, visibleMonth.getMonth(), 1))}>
                  <Icon name="ArrowLeft2" size={20} color="#6C757D" variant="Outline" />
                </IconButton>
                <Box
                  onClick={handleHeaderClick}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', px: 1, py: 0.5, borderRadius: '8px', '&:hover': { bgcolor: '#F5F5F5' } }}
                >
                  <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#007DFB' }}>Năm {yearLabel}</Typography>
                </Box>
                <IconButton size="small" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear() + 1, visibleMonth.getMonth(), 1))}>
                  <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Outline" />
                </IconButton>
              </>
            )}
            {viewMode === 'year' && (
              <>
                <IconButton size="small" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear() - 12, visibleMonth.getMonth(), 1))}>
                  <Icon name="ArrowLeft2" size={20} color="#6C757D" variant="Outline" />
                </IconButton>
                <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#007DFB' }}>{yearRange[0]} - {yearRange[yearRange.length - 1]}</Typography>
                <IconButton size="small" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear() + 12, visibleMonth.getMonth(), 1))}>
                  <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Outline" />
                </IconButton>
              </>
            )}
          </Box>
          {(viewMode === 'day' || viewMode === 'month' || viewMode === 'year') && (
            <Button
              variant="outlined"
              onClick={() => {
                setVisibleMonth(today);
                const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                setSelected(t);
                setViewMode('day');
              }}
              sx={{ textTransform: 'none', color: '#000', borderRadius: '100px', borderColor: 'transparent', backgroundColor: '#F5F5F5' }}
            >
              Hôm nay
            </Button>
          )}
        </Box>

        {/* View container with fixed height so bottom sheet doesn't resize */}
        <Box sx={{ position: 'relative', minHeight: 'auto', overflow: 'visible', height: `${viewHeight}px` }}>
          {/* Day view (rendered in flow to reserve space) */}
          <Box sx={{ display: viewMode === 'day' ? 'block' : 'none', minHeight: `${viewHeight}px` }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', color: '#4E4E4E', mb: 1 }}>
                {weekLabels.map((w) => (
                <Typography key={w} sx={{ fontSize: 14, fontWeight: 500, color: '#4E4E4E' }}>{w}</Typography>
              ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
              {gridDates.map((d, idx) => {
                const isOtherMonth = d.getMonth() !== visibleMonth.getMonth();
                const isToday = isSameDay(new Date(), d);
                const isSelected = selected && isSameDay(selected, d);

                return (
                  <Box
                    key={idx}
                    onClick={() => {
                      if (!isOtherMonth) handleDayClick(d);
                    }}
                    sx={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isOtherMonth ? 'default' : 'pointer' }}
                    aria-disabled={isOtherMonth}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isSelected ? '#FB7E00' : 'transparent',
                        color: isSelected ? 'white' : isOtherMonth ? '#ADB5BD' : 'black',
                        border: isToday && !isSelected ? '2px solid #FB7E00' : 'none',
                        opacity: isOtherMonth ? 0.5 : 1,
                        pointerEvents: isOtherMonth ? 'none' : 'auto',
                      }}
                    >
                      <Typography sx={{ fontSize: 16, fontWeight: 400 }}>{d.getDate()}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Month view (rendered in flow to reserve space) */}
          <Box sx={{ display: viewMode === 'month' ? 'block' : 'none', minHeight: `${viewHeight}px` }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px 16px', py: 2, justifyContent: 'center' }}>
              {monthNames.map((month, idx) => {
                const isSelectedMonth = idx === visibleMonth.getMonth();
                return (
                  <Box
                    key={idx}
                    onClick={() => handleMonthClick(idx)}
                    sx={{
                      width: '100%',
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      borderRadius: '100px',
                      bgcolor: isSelectedMonth ? '#FB7E00' : 'transparent',
                      color: isSelectedMonth ? '#FFFFFF' : '#090909',
                      '&:hover': {
                        bgcolor: isSelectedMonth ? '#FB7E00' : '#F0F8FF',
                      },
                      transition: 'background-color 0.12s ease',
                    }}
                  >
                    <Typography sx={{ fontSize: 16, fontWeight: 400 }}>{month}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Year view (rendered in flow to reserve space) */}
          <Box sx={{ display: viewMode === 'year' ? 'block' : 'none', minHeight: `${viewHeight}px` }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px 16px',
                py: 2,
                justifyContent: 'center',
                maxHeight: '260px',
                overflowY: 'auto',
                px: 1,
              }}
            >
              {yearRange.map((year) => {
                const isCurrentYear = year === visibleMonth.getFullYear();
                return (
                  <Box
                    key={year}
                    onClick={() => handleYearClick(year)}
                    sx={{
                      width: '100%',
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      borderRadius: '100px',
                      bgcolor: isCurrentYear ? '#FB7E00' : 'transparent',
                      color: isCurrentYear ? '#FFFFFF' : '#090909',
                      '&:hover': {
                        bgcolor: isCurrentYear ? '#FB7E00' : '#F0F8FF',
                      },
                      transition: 'background-color 0.12s ease',
                    }}
                  >
                    <Typography sx={{ fontSize: 16, fontWeight: 400 }}>{year}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

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

export default DatePickerBottomSheet;
