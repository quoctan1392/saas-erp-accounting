import React, { useState } from 'react';
import { Box, Typography, IconButton, Divider, TextField, InputAdornment } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import * as Iconsax from 'iconsax-react';
import UnitCreateScreen from './UnitCreateScreen.tsx';
import headerDay from '../../assets/Header_day.png';

const Icon = ({ name, size = 20, color = 'currentColor', variant = 'Outline' }: any) => {
  const Comp = (Iconsax as any)[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} variant={variant} />;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (label: string) => void;
}

const DEFAULT_UNITS = [
  { value: 'cai', label: 'Cái' },
  { value: 'chiec', label: 'Chiếc' },
  { value: 'bo', label: 'Bộ' },
  { value: 'kg', label: 'Kg' },
  { value: 'g', label: 'Gam' },
  { value: 'lit', label: 'Lít' },
  { value: 'hop', label: 'Hộp' },
  { value: 'thung', label: 'Thùng' },
  { value: 'met', label: 'Mét' },
  { value: 'pack', label: 'Pack' },
];

const UnitSelectionScreen: React.FC<Props> = ({ open, onClose, onSelect }) => {
  const [units, setUnits] = useState(DEFAULT_UNITS.slice());
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const ANIM_MS = 280;

  if (!open) return null;

  const triggerClose = (cb?: () => void) => {
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      cb && cb();
      onClose();
    }, ANIM_MS);
  };

  const handleAdd = () => setCreateOpen(true);

  const handleCreate = (u: { value: string; label: string }) => {
    setUnits((s) => [u, ...s]);
  };

  return (
    <>
      <Box onClick={() => triggerClose()} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', zIndex: 1200 }} />

      <Box sx={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1201, bgcolor: '#fff', display: 'flex', flexDirection: 'column', animation: exiting ? 'slideOutToRight 0.28s ease' : 'slideInFromRight 0.28s ease', '@keyframes slideInFromRight': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } }, '@keyframes slideOutToRight': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } } }}>
        <Box sx={{ height: { xs: 160, sm: 120 }, width: '100%', backgroundImage: `url(${headerDay})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

        <Box sx={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 1202, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 'sm', mx: 'auto', py: 0.5 }}>
            <IconButton onClick={() => triggerClose()} sx={{ position: 'absolute', left: 0, top: 6, width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <ArrowBack />
            </IconButton>

            <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
              <Typography sx={{ color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '20px', fontWeight: 500 }}>Chọn đơn vị tính</Typography>
            </Box>

            <Box sx={{ position: 'absolute', right: 0, top: 6 }}>
              <IconButton onClick={handleAdd} sx={{ width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}>
                <Icon name="Add" size={24} color="#4E4E4E" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Box sx={{ borderRadius: { xs: '16px 16px 0 0', sm: '16px' }, px: 0.5, py: { xs: 2, sm: 6 }, pb: { xs: `calc(100px + env(safe-area-inset-bottom, 0px))`, sm: 6 }, position: { xs: 'fixed', sm: 'relative' }, top: { xs: '80px', sm: 'auto' }, bottom: { xs: 0, sm: 'auto' }, left: '16px', right: '16px', maxWidth: 'calc(100% - 32px)', display: 'flex', flexDirection: 'column', overflowY: { xs: 'auto', sm: 'visible' }, bgcolor: 'transparent' }}>
          <Box sx={{ px: 0, width: '100%' }}>
            <Box sx={{ mb: 2 }}>
              <TextField fullWidth placeholder="Tìm đơn vị tính..." value={query} onChange={(e) => setQuery(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: '24px', height: '48px', '& fieldset': { borderColor: '#DEE2E6' }, '& .MuiOutlinedInput-input': { paddingLeft: '12px', paddingRight: '8px' } } }} InputProps={{ startAdornment: (<InputAdornment position="start"><Icon name="SearchNormal" size={20} color="#6C757D" variant="Outline" /></InputAdornment>) }} />
            </Box>

            {units.filter(u => u.label.toLowerCase().includes(query.toLowerCase())).map((u, idx) => (
              <Box key={u.value}>
                <Box onClick={() => { onSelect(u.label); onClose(); }} sx={{ display: 'flex', alignItems: 'center', py: 1.75, px: 1, cursor: 'pointer', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 16 }}>{u.label}</Typography>
                </Box>
                {idx < units.length - 1 && <Divider sx={{ borderColor: '#F1F3F5' }} />}
              </Box>
            ))}
          </Box>
        </Box>

        <UnitCreateScreen open={createOpen} onClose={() => setCreateOpen(false)} onCreate={(u) => { handleCreate(u); onSelect(u.label); setCreateOpen(false); onClose(); }} />
      </Box>
    </>
  );
};

export default UnitSelectionScreen;
