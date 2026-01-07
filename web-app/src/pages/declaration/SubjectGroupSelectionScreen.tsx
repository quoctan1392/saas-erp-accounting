import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Divider, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import * as Iconsax from 'iconsax-react';
import SubjectGroupCreateScreen from './SubjectGroupCreateScreen';
import SearchBox from '../../components/SearchBox';
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
  type?: 'customer' | 'vendor' | 'both';
  onNestedOpen?: (open: boolean) => void;
}

const DEFAULT_CUSTOMER_GROUPS = [
  { value: 'doanh_nghiep', label: 'Doanh nghiệp' },
  { value: 'ca_nhan', label: 'Cá nhân' },
  { value: 'khach_vip', label: 'Khách VIP' },
  { value: 'khach_le', label: 'Khách lẻ' },
];

const DEFAULT_VENDOR_GROUPS = [
  { value: 'ncc_trong_nuoc', label: 'NCC trong nước' },
  { value: 'ncc_nuoc_ngoai', label: 'NCC nước ngoài' },
  { value: 'ncc_vat_tu', label: 'NCC vật tư' },
  { value: 'ncc_dich_vu', label: 'NCC dịch vụ' },
];

const SubjectGroupSelectionScreen: React.FC<Props> = ({ open, onClose, onSelect, type = 'customer', onNestedOpen }) => {
  const defaultGroups = type === 'vendor' ? DEFAULT_VENDOR_GROUPS : DEFAULT_CUSTOMER_GROUPS;
  const [groups, setGroups] = useState(defaultGroups.slice());
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const ANIM_MS = 280;

  // Load groups from API when screen opens
  useEffect(() => {
    if (open) {
      loadGroups();
    }
  }, [open, type]);

  // notify parent when nested create screen opens/closes
  useEffect(() => {
    if (onNestedOpen) {
      onNestedOpen(createOpen);
    }
  }, [createOpen, onNestedOpen]);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const apiGroups = await apiService.getSubjectGroups();
      console.log('[SubjectGroupSelection] Loaded groups from API:', apiGroups);
      
      if (apiGroups && apiGroups.length > 0) {
        // Filter by type
        const filteredGroups = apiGroups.filter((g: any) => 
          g.type === type || g.type === 'both'
        );
        console.log('[SubjectGroupSelection] Filtered groups for type', type, ':', filteredGroups);
        
        if (filteredGroups.length > 0) {
          const formattedGroups = filteredGroups.map((g: any) => ({
            value: g.id || g.code,
            label: g.name,
          }));
          setGroups(formattedGroups);
        } else {
          setGroups(defaultGroups.slice());
        }
      } else {
        setGroups(defaultGroups.slice());
      }
    } catch (error) {
      console.error('Error loading subject groups:', error);
      setGroups(defaultGroups.slice());
    } finally {
      setIsLoading(false);
    }
  };

  const triggerClose = (cb?: () => void) => {
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      cb && cb();
      onClose();
    }, ANIM_MS);
  };

  const handleAdd = () => setCreateOpen(true);

  if (!open) return null;

  const getTitle = () => {
    if (type === 'vendor') return 'Chọn nhóm nhà cung cấp';
    return 'Chọn nhóm khách hàng';
  };

  return (
    <>
      <Box onClick={() => triggerClose()} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', zIndex: 1600 }} />

      <Box sx={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1601, bgcolor: '#fff', display: 'flex', flexDirection: 'column', animation: exiting ? 'slideOutToRight 0.28s ease' : 'slideInFromRight 0.28s ease', '@keyframes slideInFromRight': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } }, '@keyframes slideOutToRight': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } } }}>
        <Box sx={{ height: { xs: 160, sm: 120 }, width: '100%', backgroundImage: `url(${headerDay})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

        <Box sx={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 1602, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 'sm', mx: 'auto', py: 0.5 }}>
            <IconButton onClick={() => triggerClose()} sx={{ position: 'absolute', left: 0, top: 6, width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <ArrowBack />
            </IconButton>

            <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
              <Typography sx={{ color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '20px', fontWeight: 500 }}>{getTitle()}</Typography>
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
              <SearchBox
                fullWidth
                placeholder={`Tìm ${type === 'vendor' ? 'nhóm NCC' : 'nhóm khách hàng'}...`}
                value={query}
                onChange={(e: any) => setQuery(e.target.value)}
              />
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={32} sx={{ color: '#FB7E00' }} />
              </Box>
            ) : (
              groups.filter(g => g.label.toLowerCase().includes(query.toLowerCase())).map((g, idx) => (
                <Box key={g.value}>
                  <Box onClick={() => { onSelect(g.label); onClose(); }} sx={{ display: 'flex', alignItems: 'center', py: 1.75, px: 1, cursor: 'pointer', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 16 }}>{g.label}</Typography>
                  </Box>
                  {idx < groups.length - 1 && <Divider sx={{ borderColor: '#F1F3F5' }} />}
                </Box>
              ))
            )}
          </Box>
        </Box>

        <SubjectGroupCreateScreen 
          open={createOpen} 
          onClose={() => setCreateOpen(false)} 
          onCreate={async (g) => { 
            // Đóng create screen
            setCreateOpen(false);
            // Reload danh sách để hiển thị group mới
            await loadGroups();
            // Tự động chọn group vừa tạo và đóng selection screen
            onSelect(g.label); 
            onClose(); 
          }} 
          type={type}
        />
      </Box>
    </>
  );
};

export default SubjectGroupSelectionScreen;
