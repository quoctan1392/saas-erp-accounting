import { useState, useMemo, useEffect, useRef, useLayoutEffect } from 'react';
import {
  Dialog,
  Box,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  IconButton,
  Button,
  Slide,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import SearchBox from './SearchBox';
import CloseIcon from '@mui/icons-material/Close';
import type { TaxIndustryGroup } from '../data/taxIndustryGroups';
import localTaxIndustryGroups from '../data/taxIndustryGroups';
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
  const [groups, setGroups] = useState<TaxIndustryGroup[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const nameRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [overflowMap, setOverflowMap] = useState<Record<string, boolean>>({});

  // Load groups from backend (fall back to local data if fetch fails)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/tax-industry-groups');
        if (!res.ok) throw new Error('fetch failed');

        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          // Received HTML (index.html) or other non-JSON response — fallback
          throw new Error(`invalid content-type: ${contentType}`);
        }

        const data = await res.json();
        if (mounted && Array.isArray(data)) setGroups(data as TaxIndustryGroup[]);
      } catch (err) {
        // If the API is not available or returns non-JSON (e.g. dev server returns index.html),
        // fall back to the local dataset for now. TODO: remove this fallback once
        // `/api/tax-industry-groups` is available in your backend and remove the
        // import of `localTaxIndustryGroups`.
        console.warn('[TaxIndustryGroupSelector] failed to fetch groups from API, using local fallback', err);
        if (mounted) setGroups(localTaxIndustryGroups);
      }
    };

    if (open) load();
    return () => {
      mounted = false;
    };
  }, [open]);

  // Filter and group items
  const filteredGroups = useMemo(() => {
    const filtered = groups.filter(
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
  }, [searchText, groups]);

  // Debug: log data to help diagnose why list may be empty on localhost
  useEffect(() => {
    console.log('[TaxIndustryGroupSelector] open=', open);
    console.log('[TaxIndustryGroupSelector] total groups=', groups.length);
    console.log('[TaxIndustryGroupSelector] filtered groups keys=', Object.keys(filteredGroups));
  }, [open, searchText, filteredGroups]);

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

  // When the dialog opens, position the selected item into view immediately
  // (no smooth animation). Use layout effect to set scrollTop before paint.
  useLayoutEffect(() => {
    if (!open) return;
    const code = selectedCode;
    if (!code) return;

    const container = scrollContainerRef.current;
    const el = itemRefs.current[code];
    if (container && el) {
      // Compute desired scrollTop to center the element in the container
      const offsetTop = el.offsetTop - (container.offsetTop || 0);
      const desired = offsetTop - Math.floor(container.clientHeight / 2 - el.clientHeight / 2);
      container.scrollTop = Math.max(0, desired);
    }
  }, [open, groups, filteredGroups, selectedCode]);

  // Persist user's selection to backend and localStorage (fire-and-forget).
  const persistSelection = async (code: string) => {
    try {
      await fetch('/api/user/preferred-tax-industry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
    } catch (err) {
      console.warn('[TaxIndustryGroupSelector] failed to persist selection to API', err);
    }

    try {
      localStorage.setItem('preferredTaxIndustry', code);
    } catch (e) {
      /* ignore */
    }
  };



  // (truncateText removed — not used)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      fullScreen
        sx={{
          zIndex: 1670,
          '& .MuiDialog-paper': {
            borderRadius: { xs: '16px 16px 0 0', sm: '16px' },
            margin: 0,
            // Match BusinessSector bottom sheet height (leave ~24px top gap)
            maxHeight: 'calc(100vh - 24px)',
            position: 'fixed',
            bottom: 0,
            width: '100%',
            zIndex: 1670,
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
        <SearchBox
          fullWidth
          placeholder="Tìm kiếm ngành nghề"
          value={searchText}
          onChange={(e: any) => setSearchText(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '100px',
              height: '52px',
              backgroundColor: '#FFFFFF',
              '& fieldset': { borderColor: 'rgba(0,0,0,0.12)' },
            },
            '& .MuiOutlinedInput-input': {
              padding: '12px 16px',
            },
          }}
        />
      </Box>

      {/* Content */}
      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          // increase bottom padding to match larger sheet and safe area
          pb: `calc(80px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <RadioGroup
          value={selectedCode}
          onChange={(e) => {
            const code = e.target.value;
            setSelectedCode(code);
            // Persist selection then propagate selection and close modal
            persistSelection(code);
            onChange(code);
            onClose();
          }}
        >
          {Object.entries(filteredGroups).map(([groupName, items]) => (
            <Box key={groupName} sx={{ mb: 0 }}>
              {/* Group Header */}
              <Typography
                sx={{
                  fontSize: '16px',
                  fontWeight: 600,
                  mb: 3,
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
                    ref={(el) => { itemRefs.current[item.code] = el as HTMLDivElement | null; }}
                    sx={{
                      mb: 2,
                      pb: 2,
                      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    }}
                  >
                        <Box
                      onClick={() => {
                        setSelectedCode(item.code);
                        persistSelection(item.code);
                        onChange(item.code);
                        onClose();
                      }}
                      sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, cursor: 'pointer' }}
                    >
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
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(item.code);
                              }}
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
                              % thuế GTGT: <Box component="span" sx={{ color: '#090909' }}>{item.vatRate.toFixed(2)}</Box>
                            </Typography>
                          )}
                          <Typography sx={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>
                            % thuế TNCN: <Box component="span" sx={{ color: '#090909' }}>{item.pitRate.toFixed(2)}</Box>
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
