import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Switch, Alert, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import RoundedTextField from '../../components/RoundedTextField';
import SuccessSnackbar from '../../components/SuccessSnackbar';
import { apiService } from '../../services/api';
import headerDay from '../../assets/Header_day.png';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (group: { value: string; label: string }) => void;
  type?: 'customer' | 'vendor' | 'both';
}

const SubjectGroupCreateScreen: React.FC<Props> = ({ open, onClose, onCreate, type = 'both' }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupType, setGroupType] = useState<'customer' | 'vendor' | 'both'>(type);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const ANIM_MS = 260;

  if (!open) return null;

  const getSnackbarMessage = () => {
    if (type === 'customer') return 'Thêm nhóm khách hàng thành công';
    if (type === 'vendor') return 'Thêm nhóm nhà cung cấp thành công';
    return 'Thêm nhóm thành công';
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Tên nhóm là bắt buộc');
      return;
    }
    setError(null);
    setIsLoading(true);
    
    try {
      const groupCode = code.trim() || name.trim().toUpperCase().replace(/\s+/g, '_');
      
      // Call API to save subject group to database
      const savedGroup = await apiService.createSubjectGroup({
        code: groupCode,
        name: name.trim(),
        type: groupType,
        description: description.trim() || undefined,
      });
      
      console.log('Subject group saved successfully:', savedGroup);
      
      const group = { 
        value: savedGroup.id || groupCode, 
        label: name.trim() 
      };
      
      setIsLoading(false);
      setShowSuccessSnackbar(true);
      
      // Wait for snackbar to show, then close and notify parent
      setTimeout(() => {
        setExiting(true);
        setTimeout(() => {
          onCreate(group);
          setCode('');
          setName('');
          setDescription('');
          setGroupType(type);
          setIsActive(true);
          setExiting(false);
          setShowSuccessSnackbar(false);
        }, 260);
      }, 1000);
    } catch (err: any) {
      console.error('Error saving subject group:', err);
      setError(err.response?.data?.message || 'Không thể lưu nhóm. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  const triggerClose = () => {
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      onClose();
    }, ANIM_MS);
  };

  const getTitle = () => {
    if (type === 'customer') return 'Thêm nhóm khách hàng';
    if (type === 'vendor') return 'Thêm nhóm nhà cung cấp';
    return 'Thêm nhóm đối tượng';
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
              <Typography sx={{ color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '20px', fontWeight: 500 }}>{getTitle()}</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ borderRadius: { xs: '16px 16px 0 0', sm: '16px' }, px: 1, py: { xs: 2, sm: 6 }, pb: { xs: `calc(100px + env(safe-area-inset-bottom, 0px))`, sm: 6 }, position: { xs: 'fixed', sm: 'relative' }, top: { xs: '80px', sm: 'auto' }, bottom: { xs: 0, sm: 'auto' }, left: '16px', right: '16px', maxWidth: 'calc(100% - 32px)', display: 'flex', flexDirection: 'column', overflowY: { xs: 'auto', sm: 'visible' }, bgcolor: 'transparent', zIndex: 1252 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700 }}>Thông tin nhóm</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <RoundedTextField fullWidth label="Mã nhóm" placeholder="Nhập mã (tuỳ chọn)" value={code} onChange={(e) => setCode(e.target.value)} />
            <RoundedTextField required fullWidth label="Tên nhóm" placeholder="Nhập tên nhóm" value={name} onChange={(e) => setName(e.target.value)} />
            
            {type === 'both' && (
              <FormControl fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}>
                <InputLabel>Loại nhóm</InputLabel>
                <Select
                  value={groupType}
                  label="Loại nhóm"
                  onChange={(e) => setGroupType(e.target.value as 'customer' | 'vendor' | 'both')}
                >
                  <MenuItem value="customer">Nhóm khách hàng</MenuItem>
                  <MenuItem value="vendor">Nhóm nhà cung cấp</MenuItem>
                  <MenuItem value="both">Cả hai</MenuItem>
                </Select>
              </FormControl>
            )}
            
            <RoundedTextField fullWidth label="Mô tả" placeholder="Nhập mô tả (tuỳ chọn)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 500 }}>Đang sử dụng</Typography>
              <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#FB7E00' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#FB7E00' } }} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Button box moved outside main container for proper z-index stacking */}
      <Box sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1260, px: 2, py: 2, pb: 'calc(16px + env(safe-area-inset-bottom, 0px))', bgcolor: '#fff', boxShadow: '0 -8px 16px rgba(0,0,0,0.06)', animation: exiting ? 'slideOutToRight 0.26s ease' : 'slideInFromRight 0.26s ease', '@keyframes slideInFromRight': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } }, '@keyframes slideOutToRight': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } } }}>
        <Button fullWidth variant="contained" onClick={handleSubmit} disabled={!name.trim() || exiting || isLoading} sx={{ borderRadius: '100px', bgcolor: !name.trim() || exiting || isLoading ? '#DEE2E6' : '#FB7E00', color: !name.trim() || exiting || isLoading ? '#ADB5BD' : '#fff', textTransform: 'none', fontWeight: 600, height: 56 }}>
          {isLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Hoàn tất'}
        </Button>
      </Box>
      
      <SuccessSnackbar
        open={showSuccessSnackbar}
        onClose={() => setShowSuccessSnackbar(false)}
        message={getSnackbarMessage()}
        variant="add"
      />
    </>
  );
};

export default SubjectGroupCreateScreen;
