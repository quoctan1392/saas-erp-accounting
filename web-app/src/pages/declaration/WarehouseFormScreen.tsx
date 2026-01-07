import { Box, Container, Typography, Button, IconButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { ROUTES } from '../../config/constants';
import { useEffect, useState } from 'react';
import WarehouseForm from './WarehouseForm';
import AlertDialog from '../../components/AlertDialog';
import SuccessSnackbar from '../../components/SuccessSnackbar';
import { apiService } from '../../services/api';
import headerDay from '../../assets/Header_day.png';

const WarehouseFormScreen = () => {
  const navigate = useNavigate();
  const location: any = useLocation();
  const returnTo: string | null = (location && location.state && location.state.returnTo) || null;

  const [visible, setVisible] = useState(false);
  const ANIM_MS = 280;

  useEffect(() => {
    // slide-in on mount
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [isPerformingConfirmAction, setIsPerformingConfirmAction] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const fetchNextCode = async () => {
      try {
        const nextCode = await apiService.getNextWarehouseCode();
        setCode(nextCode);
      } catch (error) {
        console.error('Error fetching next warehouse code:', error);
        // Fallback to localStorage
        const last = parseInt(localStorage.getItem('lastWarehouseNumber') || '0', 10);
        const next = last + 1;
        setCode(`KHO${next.toString().padStart(3, '0')}`);
      }
    };

    fetchNextCode();
  }, []);

  const handleFieldChange = (setter: any) => (value: any) => {
    setHasChanges(true);
    setter(value);
  };

  const handleBack = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
      return;
    }
    // slide-out then navigate back to caller (returnTo) or categories
    setVisible(false);
    setTimeout(() => {
      if (returnTo) {
        navigate(returnTo, { state: { openWarehouseSelection: true } });
      } else {
        navigate(ROUTES.DECLARATION_CATEGORIES);
      }
    }, ANIM_MS);
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
        code: code,
        name: name,
        address: address || undefined,
        isActive,
      };

      const res = await apiService.createWarehouse(payload);
      // infer created warehouse name
      const createdName = res?.data?.name || res?.name || name;

      setShowSuccessSnackbar(true);
      setHasChanges(false);
      
      setTimeout(() => {
        if (returnTo) {
          navigate(returnTo, { state: { selectedWarehouse: createdName } });
        } else {
          navigate(ROUTES.DECLARATION_CATEGORIES);
        }
      }, 1500);
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
        code: code,
        name: name,
        address: address || undefined,
        isActive,
      };

      await apiService.createWarehouse(payload);

      setShowSuccessSnackbar(true);

      // Persist last number to localStorage (fallback)
      const currentNumber = parseInt(code.replace('KHO', ''), 10);
      localStorage.setItem('lastWarehouseNumber', currentNumber.toString());

      // Fetch next code from API
      try {
        const nextCode = await apiService.getNextWarehouseCode();
        setCode(nextCode);
      } catch (error) {
        console.error('Error fetching next warehouse code:', error);
        // Fallback to localStorage
        const nextNumber = (currentNumber + 1).toString().padStart(3, '0');
        setCode(`KHO${nextNumber}`);
      }
      setName('');
      setAddress('');
      setIsActive(true);
      setHasChanges(false);
      // if opened from selection, after save-and-add-new we stay on the same screen
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
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: `transform ${ANIM_MS}ms ease`,
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

          <WarehouseForm
            code={code}
            setCode={(v: string) => handleFieldChange(setCode)(v)}
            name={name}
            setName={(v: string) => handleFieldChange(setName)(v)}
            address={address}
            setAddress={(v: string) => handleFieldChange(setAddress)(v)}
            isActive={isActive}
            setIsActive={(v: boolean) => handleFieldChange(setIsActive)(v)}
          />

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

      <AlertDialog
        variant="confirm"
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Thay đổi chưa được lưu"
        description="Bạn có muốn thoát mà không lưu lại các thay đổi?"
        cancelText="Huỷ"
        confirmText="Đồng ý"
        onConfirm={handleConfirmLeave}
      />

      {/* Success Snackbar */}
      <SuccessSnackbar
        open={showSuccessSnackbar}
        message="Thêm kho hàng mới thành công"
        onClose={() => setShowSuccessSnackbar(false)}
      />
    </Box>
  );
};

export default WarehouseFormScreen;
