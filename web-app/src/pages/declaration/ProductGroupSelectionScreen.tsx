import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Divider, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Icon from '../../components/Icon';
import SearchBox from '../../components/SearchBox';
import ProductGroupCreateScreen from './ProductGroupCreateScreen';
import { apiService } from '../../services/api';
import headerDay from '../../assets/Header_day.png';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (label: string) => void;
}

const DEFAULT_GROUPS = [
  { value: 'goods', label: 'Hàng hoá' },
  { value: 'service', label: 'Dịch vụ' },
  { value: 'material', label: 'Nguyên liệu' },
  { value: 'finished', label: 'Thành phẩm' },
];

const ProductGroupSelectionScreen: React.FC<Props> = ({ open, onClose, onSelect }) => {
  const [groups, setGroups] = useState(DEFAULT_GROUPS.slice());
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const ANIM_MS = 280;

  // Load groups from API when screen opens
  useEffect(() => {
    if (open) {
      loadGroups();
    }
  }, [open]);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const apiGroups = await apiService.getItemCategories();
      if (apiGroups && apiGroups.length > 0) {
        const formattedGroups = apiGroups.map((g: any) => ({
          value: g.id || g.code,
          label: g.name,
        }));
        setGroups(formattedGroups);
      } else {
        setGroups(DEFAULT_GROUPS.slice());
      }
    } catch (error) {
      console.error('Error loading item categories:', error);
      setGroups(DEFAULT_GROUPS.slice());
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

  const handleAddNew = () => {
    setCreateOpen(true);
  };

  return (
    <>
      <Box onClick={() => triggerClose()} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', zIndex: 1300 }} />

      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 1301,
          bgcolor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          animation: exiting ? 'slideOutToRight 0.28s ease' : 'slideInFromRight 0.28s ease',
          '@keyframes slideInFromRight': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
          '@keyframes slideOutToRight': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } },
        }}
      >
        {/* Decorative header image */}
        <Box sx={{ height: { xs: 160, sm: 120 }, width: '100%', backgroundImage: `url(${headerDay})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

        {/* Fixed header row */}
        <Box sx={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 1302, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 'sm', mx: 'auto', py: 0.5 }}>
            <IconButton onClick={() => triggerClose()} sx={{ position: 'absolute', left: 0, top: 6, width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <ArrowBack />
            </IconButton>

            <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
              <Typography sx={{ color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '20px', fontStyle: 'normal', fontWeight: 500 }}>Chọn nhóm HHDV</Typography>
            </Box>

            <Box sx={{ position: 'absolute', right: 0, top: 6 }}>
              <IconButton onClick={handleAddNew} sx={{ width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}>
                <Icon name="Add" size={24} color="#4E4E4E" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Content card (matches Add Product layout) */}
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
              <SearchBox
                fullWidth
                placeholder="Tìm nhóm hàng hoá dịch vụ..."
                value={searchText}
                onChange={(e: any) => setSearchText(e.target.value)}
              />
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} sx={{ color: '#FB7E00' }} />
              </Box>
            ) : (
              groups.filter(g => g.label.toLowerCase().includes(searchText.toLowerCase())).map((g, idx) => (
                <Box key={g.value}>
                  <Box
                    onClick={() => {
                      onSelect(g.label);
                      onClose();
                    }}
                    sx={{ display: 'flex', alignItems: 'center', py: 1.75, px: 1, cursor: 'pointer', justifyContent: 'space-between' }}
                  >
                    <Typography sx={{ fontSize: 16 }}>{g.label}</Typography>
                  </Box>
                  {idx < groups.length - 1 && <Divider sx={{ borderColor: '#F1F3F5' }} />}
                </Box>
              ))
            )}
          </Box>
        </Box>
        <ProductGroupCreateScreen
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreate={(grp) => {
            // Snackbar đã hiển thị trong CreateScreen rồi
            // Chỉ cần đóng selection screen và set giá trị về form cha
            setCreateOpen(false);
            onSelect(grp.label);
            onClose();
          }}
        />
      </Box>
    </>
  );
};

export default ProductGroupSelectionScreen;
