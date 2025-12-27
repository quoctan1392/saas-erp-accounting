import React, { useState } from 'react';
import { Box, Typography, IconButton, Divider, Button, InputAdornment, Switch, Alert } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import RoundedTextField from '../../components/RoundedTextField';
import BottomSheet from '../../components/BottomSheet';
import Icon from '../../components/Icon';
import headerDay from '../../assets/Header_day.png';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (group: { value: string; label: string }) => void;
}

const PRODUCT_TYPE_OPTIONS = [
  { value: 'goods', label: 'Hàng hoá' },
  { value: 'service', label: 'Dịch vụ' },
  { value: 'material', label: 'Nguyên vật liệu' },
  { value: 'finished', label: 'Thành phẩm' },
];

const ProductGroupCreateScreen: React.FC<Props> = ({ open, onClose, onCreate }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [productType, setProductType] = useState('goods');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);
  const ANIM_MS = 280;

  const productTypeLabel = PRODUCT_TYPE_OPTIONS.find((o) => o.value === productType)?.label || '';

  const handleSubmit = () => {
    if (!code || !name) {
      setError('Mã nhóm và Tên nhóm là bắt buộc');
      return;
    }

    setError(null);
    const newGroup = { value: code.trim(), label: name.trim() };
    // animate slide-out then notify parent
    setExiting(true);
    setTimeout(() => {
      onCreate(newGroup);
      // reset local state
      setCode('');
      setName('');
      setProductType('goods');
      setIsActive(true);
      setExiting(false);
    }, ANIM_MS);
  };

  if (!open) return null;

  const triggerClose = () => {
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      onClose();
    }, ANIM_MS);
  };

  return (
    <>
      <Box onClick={triggerClose} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', zIndex: 1400 }} />

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
          '@keyframes slideInFromRight': {
            from: { transform: 'translateX(100%)' },
            to: { transform: 'translateX(0)' },
          },
          '@keyframes slideOutToRight': {
            from: { transform: 'translateX(0)' },
            to: { transform: 'translateX(100%)' },
          },
        }}
      >
        <Box sx={{ height: { xs: 160, sm: 120 }, width: '100%', backgroundImage: `url(${headerDay})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

        <Box sx={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 1402, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 'sm', mx: 'auto', py: 0.5 }}>
            <IconButton onClick={triggerClose} sx={{ position: 'absolute', left: 0, top: 6, width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <ArrowBack />
            </IconButton>

            <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
              <Typography sx={{ color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '20px', fontStyle: 'normal', fontWeight: 500 }}>Thêm nhóm HHDV</Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            borderRadius: { xs: '16px 16px 0 0', sm: '16px' },
            px: 1,
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#090909', mb: 1 }}>Thông tin nhóm hàng hoá dịch vụ</Typography>
            {error && <Alert severity="error">{error}</Alert>}

            <RoundedTextField
              fullWidth
              required
              label="Mã nhóm HHDV"
              placeholder="Nhập mã nhóm"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <RoundedTextField
              fullWidth
              required
              label="Tên nhóm HHDV"
              placeholder="Nhập tên nhóm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <RoundedTextField
              fullWidth
              label="Tính chất"
              placeholder="Chọn tính chất"
              value={productTypeLabel}
              onClick={() => setSheetOpen(true)}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Icon name="ArrowDown2" size={18} color="#6C757D" variant="Outline" />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0 }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#212529' }}>Đang sử dụng</Typography>
              <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#FB7E00' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#FB7E00' } }} />
            </Box>
          </Box>
        </Box>

        {/* Mobile sticky primary button */}
        <Box sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1403, px: 2, py: 2, pb: 'calc(16px + env(safe-area-inset-bottom, 0px))', bgcolor: '#ffffff', boxShadow: '0 -8px 16px rgba(0,0,0,0.06)' }}>
          <Button
            fullWidth
            variant="text"
            onClick={handleSubmit}
            disabled={!code.trim() || !name.trim() || exiting}
            sx={{
              borderRadius: '100px',
              bgcolor: !code.trim() || !name.trim() || exiting ? '#DEE2E6' : '#FB7E00',
              color: !code.trim() || !name.trim() || exiting ? '#ADB5BD' : '#fff',
              textTransform: 'none',
              fontWeight: 500,
              height: 56,
              fontSize: 16,
            }}
          >
            Hoàn tất
          </Button>
        </Box>

        <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Chọn tính chất" hideClose zIndexBase={1500}>
          <Box sx={{ px: 0 }}>
            {PRODUCT_TYPE_OPTIONS.map((opt, idx) => (
              <Box key={opt.value}>
                <Box onClick={() => { setProductType(opt.value); setSheetOpen(false); }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.75, px: 0, cursor: 'pointer' }}>
                  <Typography sx={{ fontSize: 16, color: '#090909' }}>{opt.label}</Typography>
                </Box>
                {idx < PRODUCT_TYPE_OPTIONS.length - 1 && <Divider sx={{ borderColor: '#F1F3F5' }} />}
              </Box>
            ))}
          </Box>
        </BottomSheet>
      </Box>
    </>
  );
};

export default ProductGroupCreateScreen;
