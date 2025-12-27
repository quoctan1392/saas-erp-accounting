import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, Divider, Radio, RadioGroup, FormControlLabel, Button, InputAdornment } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import taxIndustryGroups, { type TaxIndustryGroup } from '../../data/taxIndustryGroups';
import headerDay from '../../assets/Header_day.png';
import Icon from '../../components/Icon';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
  value?: string;
}

const ANIM_MS = 280;

const TaxIndustrySelectionScreen: React.FC<Props> = ({ open, onClose, onSelect, value }) => {
  const [searchText, setSearchText] = useState('');
  const [exiting, setExiting] = useState(false);
  const [selectedCode, setSelectedCode] = useState(value || '');

  useEffect(() => {
    setSelectedCode(value || '');
  }, [value, open]);
  const filtered = useMemo(() => {
    const f = taxIndustryGroups.filter((item) =>
      item.code.toLowerCase().includes(searchText.toLowerCase()) ||
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.groupName.toLowerCase().includes(searchText.toLowerCase())
    );
    const grouped = f.reduce((acc: Record<string, TaxIndustryGroup[]>, item) => {
      (acc[item.groupName] ||= []).push(item);
      return acc;
    }, {} as Record<string, TaxIndustryGroup[]>);
    return grouped;
  }, [searchText]);

  if (!open) return null;

  const triggerClose = (cb?: () => void) => {
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      cb && cb();
      onClose();
    }, ANIM_MS);
  };

  return (
    <>
      <Box onClick={() => triggerClose()} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', zIndex: 1400 }} />

      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 1401,
          bgcolor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          animation: exiting ? 'slideOutToRight 0.28s ease' : 'slideInFromRight 0.28s ease',
          '@keyframes slideInFromRight': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
          '@keyframes slideOutToRight': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } },
        }}
      >
        <Box sx={{ height: { xs: 160, sm: 120 }, width: '100%', backgroundImage: `url(${headerDay})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

          <Box sx={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 1402, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 'sm', mx: 'auto', py: 0.5 }}>
            <IconButton onClick={() => triggerClose()} sx={{ position: 'absolute', left: 0, top: 6, width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <ArrowBack />
            </IconButton>

            <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
              <Typography sx={{ color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '20px', fontWeight: 500 }}>Chọn nhóm ngành nghề<br></br>tính thuế GTGT, TNCN</Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            borderRadius: { xs: '16px 16px 0 0', sm: '16px' },
            px: 0.5,
            py: { xs: 2, sm: 6 },
            pb: { xs: `calc(100px + env(safe-area-inset-bottom, 0px))`, sm: 6 },
            position: { xs: 'fixed', sm: 'relative' },
            top: { xs: '80px', sm: 'auto' },
            bottom: { xs: 0, sm: 'auto' },
            left: '16px',
            right: '16px',
            maxWidth: 'calc(100% - 32px)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: { xs: 'auto', sm: 'visible' },
            bgcolor: 'transparent',
          }}
        >
          <Box sx={{ px: 0, width: '100%' }}>
            <Box sx={{ mb: 2 }}>
              <Box component="input" placeholder="Tìm ngành nghề" value={searchText} onChange={(e: any) => setSearchText(e.target.value)} sx={{ display: 'none' }} />
              {/* Reuse Tax list UI: grouped list with radio selection */}
            </Box>

            <RadioGroup
              value={selectedCode}
              onChange={(e) => {
                const code = e.target.value;
                setSelectedCode(code);
                // propagate then close
                onSelect(code);
                triggerClose();
              }}
            >
              {Object.entries(filtered).map(([groupName, items]) => (
                <Box key={groupName} sx={{ mb: 3 }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 2 }}>{groupName}</Typography>
                  {items.map((item) => (
                    <Box key={item.code} sx={{ mb: 2, pb: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
                      <Box
                        role="button"
                        onClick={(e: React.MouseEvent) => {
                          // if the radio input itself was clicked, let RadioGroup's onChange handle it
                          const target = e.target as HTMLElement;
                          if (target.closest && target.closest('input[type="radio"]')) return;
                          setSelectedCode(item.code);
                          onSelect(item.code);
                          triggerClose();
                        }}
                        sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, cursor: 'pointer' }}
                      >
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, minWidth: '40px' }}>{item.code}</Typography>
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Box sx={{ fontSize: '16px', lineHeight: '20px', mb: 0.5 }}>{item.name}</Box>
                          <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
                            {item.vatRate !== undefined && (
                              <Typography sx={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>% thuế GTGT: {item.vatRate.toFixed(2)}</Typography>
                            )}
                            <Typography sx={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.6)' }}>% thuế TNCN: {item.pitRate.toFixed(2)}</Typography>
                          </Box>
                        </Box>
                        <FormControlLabel
                          value={item.code}
                          control={<Radio sx={{ color: 'rgba(0, 0, 0, 0.38)', '&.Mui-checked': { color: '#FB7E00' }, padding: 0 }} />}
                          label=""
                          sx={{ margin: 0, mt: 0.5 }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ))}
            </RadioGroup>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default TaxIndustrySelectionScreen;
