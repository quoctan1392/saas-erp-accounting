import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Dialog,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  IconButton,
  Button,
  Slide,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import Icon from './Icon';
import CloseIcon from '@mui/icons-material/Close';
import taxIndustryGroups, { type TaxIndustryGroup } from '../data/taxIndustryGroups';
import React from 'react';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface TaxIndustryGroupSelectorProps {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (code: string) => void;
}

const TaxIndustryGroupSelector: React.FC<TaxIndustryGroupSelectorProps> = ({
  open,
  onClose,
  value,
  onChange,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCode, setSelectedCode] = useState(value);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const nameRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [overflowMap, setOverflowMap] = useState<Record<string, boolean>>({});

  // Filter and group items
  const filteredGroups = useMemo(() => {
    const filtered = taxIndustryGroups.filter(
      (item) =>
        item.code.toLowerCase().includes(searchText.toLowerCase()) ||
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.groupName.toLowerCase().includes(searchText.toLowerCase())
    );

    // Group by groupName
    const grouped = filtered.reduce((acc, item) => {
      if (!acc[item.groupName]) {
        acc[item.groupName] = [];
      }
      acc[item.groupName].push(item);
      return acc;
    }, {} as Record<string, TaxIndustryGroup[]>);

    return grouped;
  }, [searchText]);

  const toggleExpand = (code: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(code)) {
        newSet.delete(code);
      } else {
        newSet.add(code);
      }
      return newSet;
    });
  };

  // Recompute which items overflow (more than 2 lines) so we can show "Xem thêm"
  useEffect(() => {
    const compute = () => {
      const items = Object.values(filteredGroups).flat();
      const next: Record<string, boolean> = {};
      items.forEach((item) => {
        const el = nameRefs.current[item.code];
        if (el) {
          const style = window.getComputedStyle(el);
          const lineH = parseFloat(style.lineHeight || '20') || 20;
          const totalLines = Math.round(el.scrollHeight / lineH);
          // Only show "Xem thêm" when full content is significantly longer (>= 3 lines)
          next[item.code] = totalLines >= 3;
        }
      });
      setOverflowMap(next);
    };

    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [filteredGroups, searchText, open]);



  // (truncateText removed — not used)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullScreen
      sx={{
        zIndex: 1600,
        '& .MuiDialog-paper': {
          borderRadius: { xs: '16px 16px 0 0', sm: '16px' },
          margin: 0,
          maxHeight: '90vh',
          position: 'fixed',
          bottom: 0,
          width: '100%',
          zIndex: 1600,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        }}
      >
        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 600,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          Chọn ngành nghề tính thuế GTGT, TNCN
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Search */}
      <Box sx={{ px: 2, py: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm ngành nghề"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon name="SearchNormal1" size={20} color="#9E9E9E" variant="Outline" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              backgroundColor: '#FFFFFF',
              '& fieldset': {
                borderColor: 'rgba(0,0,0,0.12)'
              },
            },
          }}
        />
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          pb: `calc(80px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <RadioGroup
          value={selectedCode}
          onChange={(e) => {
            const code = e.target.value;
            setSelectedCode(code);
            // Immediately propagate selection and close modal
            onChange(code);
            onClose();
          }}
        >
          {Object.entries(filteredGroups).map(([groupName, items]) => (
            <Box key={groupName} sx={{ mb: 3 }}>
              {/* Group Header */}
              <Typography
                sx={{
                  fontSize: '16px',
                  fontWeight: 600,
                  mb: 2,
                  color: '#000',
                }}
              >
                {groupName}
              </Typography>

              {/* Group Items */}
              {items.map((item) => {
                const isExpanded = expandedItems.has(item.code);
                const isOverflowing = !!overflowMap[item.code];

                return (
                  <Box
                    key={item.code}
                    sx={{
                      mb: 2,
                      pb: 2,
                      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      {/* Code */}
                      <Typography
                        sx={{
                          fontSize: '14px',
                          fontWeight: 600,
                          minWidth: '40px',
                        }}
                      >
                        {item.code}
                      </Typography>

                      {/* Content */}
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        {/* Name: clamp to 2 lines when not expanded */}
                        <Box
                          ref={(el) => { nameRefs.current[item.code] = el as HTMLDivElement | null; }}
                          sx={{
                            fontSize: '16px',
                            lineHeight: '20px',
                            mb: 0.5,
                            display: isExpanded ? 'block' : '-webkit-box',
                            WebkitLineClamp: isExpanded ? 'none' : 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.name}
                        </Box>

                        {/* Expand/Collapse Button (only show if overflowing to >=3 lines) */}
                        {isOverflowing && (
                          <Box sx={{ mt: 0.5, width: '100%', display: 'flex' }}>
                            <Button
                              size="small"
                              onClick={() => toggleExpand(item.code)}
                              sx={{
                                textTransform: 'none',
                                p: 0,
                                color: '#007DFB',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                              }}
                            >
                              {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                            </Button>
                          </Box>
                        )}

                        {/* Tax Rates */}
                        <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                          {item.vatRate !== undefined && (
                            <Typography sx={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>
                              % thuế GTGT: {item.vatRate.toFixed(2)}
                            </Typography>
                          )}
                          <Typography sx={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>
                            % thuế TNCN: {item.pitRate.toFixed(2)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Radio */}
                      <FormControlLabel
                        value={item.code}
                        control={
                          <Radio
                            sx={{
                              color: 'rgba(0, 0, 0, 0.38)',
                              '&.Mui-checked': { color: '#FB7E00' },
                              padding: 0,
                            }}
                          />
                        }
                        label=""
                        sx={{ margin: 0, mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ))}
        </RadioGroup>
      </Box>

      {/* No footer - selection applies immediately on radio change */}
    </Dialog>
  );
};

export default TaxIndustryGroupSelector;
