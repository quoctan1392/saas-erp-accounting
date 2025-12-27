import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Switch, Alert } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import RoundedTextField from '../../components/RoundedTextField';
import headerDay from '../../assets/Header_day.png';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (u: { value: string; label: string }) => void;
}

const UnitCreateScreen: React.FC<Props> = ({ open, onClose, onCreate }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);
  const ANIM_MS = 260;

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Tên đơn vị là bắt buộc');
      return;
    }
    setError(null);
    const unit = { value: (code.trim() || name.trim().toLowerCase().replace(/\s+/g, '_')), label: name.trim() };
    setExiting(true);
    setTimeout(() => {
      onCreate(unit);
      setCode('');
      setName('');
      setIsActive(true);
      setExiting(false);
    }, 260);
  };

  const triggerClose = () => {
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      onClose();
    }, ANIM_MS);
  };

  return (
    <>
      <Box onClick={triggerClose} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', zIndex: 1250 }} />
      <Box sx={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1251, bgcolor: '#fff', display: 'flex', flexDirection: 'column', animation: exiting ? 'slideOutToRight 0.26s ease' : 'slideInFromRight 0.26s ease', '@keyframes slideInFromRight': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } }, '@keyframes slideOutToRight': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } } }}>
        <Box sx={{ height: { xs: 160, sm: 120 }, width: '100%', backgroundImage: `url(${headerDay})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

        <Box sx={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 1252, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 'sm', mx: 'auto', py: 0.5 }}>
            <IconButton onClick={triggerClose} sx={{ position: 'absolute', left: 0, top: 6, width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <ArrowBack />
            </IconButton>
            <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
              <Typography sx={{ color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '20px', fontWeight: 500 }}>Thêm đơn vị tính</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ borderRadius: { xs: '16px 16px 0 0', sm: '16px' }, px: 1, py: { xs: 2, sm: 6 }, pb: { xs: `calc(100px + env(safe-area-inset-bottom, 0px))`, sm: 6 }, position: { xs: 'fixed', sm: 'relative' }, top: { xs: '80px', sm: 'auto' }, bottom: { xs: 0, sm: 'auto' }, left: '16px', right: '16px', maxWidth: 'calc(100% - 32px)', display: 'flex', flexDirection: 'column', overflowY: { xs: 'auto', sm: 'visible' }, bgcolor: 'transparent' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Thông tin đơn vị tính</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <RoundedTextField fullWidth label="Mã đơn vị" placeholder="Nhập mã (tuỳ chọn)" value={code} onChange={(e) => setCode(e.target.value)} />
            <RoundedTextField required fullWidth label="Tên đơn vị" placeholder="Nhập tên đơn vị" value={name} onChange={(e) => setName(e.target.value)} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 500 }}>Đang sử dụng</Typography>
              <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#FB7E00' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#FB7E00' } }} />
            </Box>
          </Box>
        </Box>

        <Box sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1253, px: 2, py: 2, pb: 'calc(16px + env(safe-area-inset-bottom, 0px))', bgcolor: '#fff', boxShadow: '0 -8px 16px rgba(0,0,0,0.06)' }}>
          <Button fullWidth variant="contained" onClick={handleSubmit} disabled={!name.trim() || exiting} sx={{ borderRadius: '100px', bgcolor: !name.trim() || exiting ? '#DEE2E6' : '#FB7E00', color: !name.trim() || exiting ? '#ADB5BD' : '#fff', textTransform: 'none', fontWeight: 600, height: 56 }}>Hoàn tất</Button>
        </Box>
      </Box>
    </>
  );
};

export default UnitCreateScreen;
