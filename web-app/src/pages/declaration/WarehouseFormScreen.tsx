import { Box, Container, Typography, Button, Switch, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { ROUTES } from '../../config/constants';
import { useEffect, useState } from 'react';
import RoundedTextField from '../../components/RoundedTextField';
import ConfirmDialog from '../../components/ConfirmDialog';
import { apiService } from '../../services/api';
import headerDay from '../../assets/Header_day.png';

const WarehouseFormScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const generateWarehouseCode = () => {
      const last = parseInt(localStorage.getItem('lastWarehouseNumber') || '0', 10);
      const next = last + 1;
      return `KHO${next.toString().padStart(3, '0')}`;
    };

    setCode(generateWarehouseCode());
  }, []);

  const handleFieldChange = (setter: any) => (value: any) => {
    setHasChanges(true);
    setter(value);
  };

  const handleBack = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      navigate(ROUTES.DECLARATION_CATEGORIES);
    }
  };

  const handleConfirmLeave = () => {
    setShowConfirmDialog(false);
    navigate(ROUTES.DECLARATION_CATEGORIES);
  };

  const isFormValid = () => {
    return code && name;
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload: any = {
        warehouseCode: code,
        warehouseName: name,
        address: address || undefined,
        isActive,
      };

      await apiService.createWarehouse(payload);

      setHasChanges(false);
      navigate(ROUTES.DECLARATION_CATEGORIES);
    } catch (error) {
      // Minimal user feedback for now
      // eslint-disable-next-line no-alert
      alert('Không thể lưu kho. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndAddNew = async () => {
    setIsLoading(true);
    try {
      const payload: any = {
        warehouseCode: code,
        warehouseName: name,
        address: address || undefined,
        isActive,
      };

      await apiService.createWarehouse(payload);

      // Persist last number and reset form
      const currentNumber = parseInt(code.replace('KHO', ''), 10);
      localStorage.setItem('lastWarehouseNumber', currentNumber.toString());

      const nextNumber = (currentNumber + 1).toString().padStart(3, '0');
      setCode(`KHO${nextNumber}`);
      setName('');
      setAddress('');
      setIsActive(true);
      setHasChanges(false);
    } catch (error) {
      // eslint-disable-next-line no-alert
      alert('Không thể lưu kho. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        pt: 0,
      }}
    >
      {/* Top decorative image */}
      <Box sx={{ height: { xs: 160, sm: 120 }, width: '100%', backgroundImage: `url(${headerDay})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

      {/* Fixed header (matches CustomerFormScreen style) */}
      <Box sx={{ position: 'fixed', top: 36, left: 0, right: 0, zIndex: 20, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 'sm', mx: 'auto', py: 0.5 }}>
          <IconButton
            onClick={handleBack}
            sx={{ position: 'absolute', left: 0, top: 6, width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}
          >
            <ArrowBack />
          </IconButton>

          <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
            <Typography sx={{ color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '20px', fontStyle: 'normal', fontWeight: 500 }}>Thêm mới kho hàng</Typography>
          </Box>
        </Box>
      </Box>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, pt: { xs: '120px', sm: '96px' }, pb: 2 }}>
        <Box
          sx={{
            borderRadius: {
              xs: '16px 16px 0 0',
              sm: '16px',
            },
            px: 1,
            py: { xs: 2, sm: 6 },
            pb: { xs: `calc(100px + env(safe-area-inset-bottom, 0px))`, sm: 6 },
            position: { xs: 'fixed', sm: 'relative' },
            top: { xs: '100px', sm: 'auto' },
            bottom: { xs: 0, sm: 'auto' },
            left: '16px',
            right: '16px',
            maxWidth: 'calc(100% - 32px)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: { xs: 'auto', sm: 'visible' },
          }}
        >
          {/* Form Fields */}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <RoundedTextField
              fullWidth
              required
              label="Mã kho"
              placeholder="Nhập mã kho"
              value={code}
              onChange={(e) => handleFieldChange(setCode)(e.target.value)}
            />

            <RoundedTextField
              fullWidth
              required
              label="Tên kho"
              placeholder="Nhập tên kho"
              value={name}
              onChange={(e) => handleFieldChange(setName)(e.target.value)}
            />

            <RoundedTextField
              fullWidth
              label="Địa chỉ kho"
              placeholder="Nhập địa chỉ kho"
              value={address}
              onChange={(e) => handleFieldChange(setAddress)(e.target.value)}
              inputProps={{ maxLength: 255 }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0 }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#212529' }}>
                Đang sử dụng
              </Typography>
              <Switch
                checked={isActive}
                onChange={(e) => handleFieldChange(setIsActive)(e.target.checked)}
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

          {/* Desktop buttons */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, mt: 4, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleSave}
              disabled={!isFormValid() || isLoading}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 500, borderColor: '#FB7E00', color: '#FB7E00', px: 4, py: 1.5, minWidth: 120, '&:hover': { borderColor: '#E65A2E', bgcolor: '#FFF4E6' }, '&.Mui-disabled': { borderColor: '#DEE2E6', color: '#ADB5BD' } }}
            >
              Lưu
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveAndAddNew}
              disabled={!isFormValid() || isLoading}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, bgcolor: '#007DFB', color: 'white', px: 4, py: 1.5, minWidth: 120, boxShadow: 'none', '&:hover': { bgcolor: '#0056b3', boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: '#DEE2E6', color: '#ADB5BD' } }}
            >
              Lưu và thêm mới
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Mobile sticky footer */}
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1400, gap: 1.5, px: 2, py: 2, pb: 'calc(16px + env(safe-area-inset-bottom, 0px))', bgcolor: '#ffffff', boxShadow: '0 -8px 16px rgba(0,0,0,0.12)' }}>
        <Button fullWidth variant="outlined" onClick={handleSave} disabled={!isFormValid() || isLoading} sx={{ flex: 1, borderRadius: '100px', textTransform: 'none', fontWeight: 500, fontSize: '16px', borderColor: '#C5C5C5', bgcolor: '#F5F5F5', color: '#090909', height: 56, '&:hover': { borderColor: '#E65A2E', bgcolor: '#FFF' } }}>
          Lưu
        </Button>
        <Button fullWidth variant="contained" onClick={handleSaveAndAddNew} disabled={!isFormValid() || isLoading} sx={{ flex: 1, borderRadius: '100px', fontSize: '16px', textTransform: 'none', fontWeight: 500, bgcolor: '#FB7E00', color: 'white', height: 56, boxShadow: 'none', '&:hover': { bgcolor: '#FB7E00', boxShadow: 'none' } }}>
          Lưu và thêm mới
        </Button>
      </Box>

      <ConfirmDialog
        open={showConfirmDialog}
        title="Thay đổi chưa được lưu"
        description="Bạn có muốn lưu thay đổi trước khi rời khỏi trang?"
        cancelText="Hủy bỏ"
        confirmText="Lưu"
        onCancel={handleConfirmLeave}
        onConfirm={async () => {
          await handleSave();
          setShowConfirmDialog(false);
        }}
      />
    </Box>
  );
};

export default WarehouseFormScreen;
