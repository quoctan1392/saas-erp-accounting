import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Switch } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import RoundedTextField from '../../components/RoundedTextField';
import headerDay from '../../assets/Header_day.png';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (warehouse: { warehouseCode: string; warehouseName: string; address?: string; isActive: boolean }) => void;
  onSubmit?: (payload: any) => Promise<any>;
}

const WarehouseCreateScreen: React.FC<Props> = ({ open, onClose, onCreate, onSubmit }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ANIM_MS = 280;

  React.useEffect(() => {
    if (open) {
      // generate code when opened
      const last = parseInt(localStorage.getItem('lastWarehouseNumber') || '0', 10);
      const next = last + 1;
      setCode(`KHO${next.toString().padStart(3, '0')}`);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!code || !name || isSubmitting) return;

    const payload = { warehouseCode: code, warehouseName: name, address: address || undefined, isActive };
    setIsSubmitting(true);

    try {
      let created = payload;
      if (onSubmit) {
        const res = await onSubmit(payload);
        created = res || payload;
      } else {
        // persist last number locally for demo when no API
        const currentNumber = parseInt(code.replace('KHO', ''), 10);
        localStorage.setItem('lastWarehouseNumber', currentNumber.toString());
      }

      // animate slide-out then notify parent
      setExiting(true);
      setTimeout(() => {
        onCreate(created);
        // reset local state
        setCode('');
        setName('');
        setAddress('');
        setIsActive(true);
        setExiting(false);
        setIsSubmitting(false);
      }, ANIM_MS);
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert('Không thể tạo kho. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
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
      <Box onClick={triggerClose} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', zIndex: 1500 }} />

      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 1501,
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

        <Box sx={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 1502, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 'sm', mx: 'auto', py: 0.5 }}>
            <IconButton onClick={triggerClose} sx={{ position: 'absolute', left: 0, top: 6, width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <ArrowBack />
            </IconButton>

            <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
              <Typography sx={{ color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '20px', fontStyle: 'normal', fontWeight: 500 }}>Thêm mới kho hàng</Typography>
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
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#212529' }}>Thông tin kho</Typography>

            <RoundedTextField
              fullWidth
              required
              label="Mã kho"
              placeholder="Nhập mã kho"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <RoundedTextField
              fullWidth
              required
              label="Tên kho"
              placeholder="Nhập tên kho"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <RoundedTextField
              fullWidth
              label="Địa chỉ kho"
              placeholder="Nhập địa chỉ kho"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              inputProps={{ maxLength: 255 }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0 }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#212529' }}>Đang sử dụng</Typography>
              <Switch
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#FB7E00',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#FB7E00',
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Mobile sticky primary button */}
        <Box sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1503, px: 2, py: 2, pb: 'calc(16px + env(safe-area-inset-bottom, 0px))', bgcolor: '#ffffff', boxShadow: '0 -8px 16px rgba(0,0,0,0.06)' }}>
          <Button
            fullWidth
            variant="text"
            onClick={handleSubmit}
            disabled={!code || !name || isSubmitting || exiting}
            sx={{
              borderRadius: '100px',
              bgcolor: !code || !name || isSubmitting || exiting ? '#DEE2E6' : '#FB7E00',
              color: !code || !name || isSubmitting || exiting ? '#ADB5BD' : '#fff',
              textTransform: 'none',
              fontWeight: 500,
              height: 56,
              fontSize: 16,
            }}
          >
            Hoàn tất
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default WarehouseCreateScreen;
