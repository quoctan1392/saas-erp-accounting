import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Divider, TextField, InputAdornment, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import * as Iconsax from 'iconsax-react';
import ItemCategoryCreateScreen from './ItemCategoryCreateScreen';
import { apiService } from '../../services/api';
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

const DEFAULT_CATEGORIES = [
  { value: 'hanghoa', label: 'Hàng hoá' },
  { value: 'dichvu', label: 'Dịch vụ' },
  { value: 'vattu', label: 'Vật tư' },
  { value: 'thanhpham', label: 'Thành phẩm' },
  { value: 'nguyen_vat_lieu', label: 'Nguyên vật liệu' },
];

const ItemCategorySelectionScreen: React.FC<Props> = ({ open, onClose, onSelect }) => {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES.slice());
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const ANIM_MS = 280;

  // Load categories from API when screen opens
  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const apiCategories = await apiService.getItemCategories();
      if (apiCategories && apiCategories.length > 0) {
        const formattedCategories = apiCategories.map((c: any) => ({
          value: c.id || c.code,
          label: c.name,
        }));
        setCategories(formattedCategories);
      } else {
        // Keep default categories if no API data
        setCategories(DEFAULT_CATEGORIES.slice());
      }
    } catch (error) {
      console.error('Error loading item categories:', error);
      // Keep default categories on error
      setCategories(DEFAULT_CATEGORIES.slice());
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleCreate = () => {
    // Reload categories from API to get the newly created one
    loadCategories();
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
              <Typography sx={{ color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '20px', fontWeight: 500 }}>Chọn nhóm hàng hoá</Typography>
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
              <TextField fullWidth placeholder="Tìm nhóm hàng hoá..." value={query} onChange={(e) => setQuery(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: '24px', height: '48px', '& fieldset': { borderColor: '#DEE2E6' }, '& .MuiOutlinedInput-input': { paddingLeft: '12px', paddingRight: '8px' } } }} InputProps={{ startAdornment: (<InputAdornment position="start"><Icon name="SearchNormal" size={20} color="#6C757D" variant="Outline" /></InputAdornment>) }} />
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} sx={{ color: '#FB7E00' }} />
              </Box>
            ) : (
              categories.filter(c => c.label.toLowerCase().includes(query.toLowerCase())).map((c, idx) => (
                <Box key={c.value}>
                  <Box onClick={() => { onSelect(c.label); onClose(); }} sx={{ display: 'flex', alignItems: 'center', py: 1.75, px: 1, cursor: 'pointer', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 16 }}>{c.label}</Typography>
                  </Box>
                  {idx < categories.length - 1 && <Divider sx={{ borderColor: '#F1F3F5' }} />}
                </Box>
              ))
            )}
          </Box>
        </Box>

        <ItemCategoryCreateScreen open={createOpen} onClose={() => setCreateOpen(false)} onCreate={(c) => { handleCreate(); onSelect(c.label); setCreateOpen(false); onClose(); }} />
      </Box>
    </>
  );
};

export default ItemCategorySelectionScreen;
