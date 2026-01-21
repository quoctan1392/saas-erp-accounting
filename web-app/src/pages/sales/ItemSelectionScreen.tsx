import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import FilterChip from '../../components/FilterChip';
import { ArrowBack } from '@mui/icons-material';
import * as Iconsax from 'iconsax-react';
import SearchBox from '../../components/SearchBox';
import ProductCard from '../../components/ProductCard';
import tokens from '../../styles/tokens';
import { apiService } from '../../services/api';
import headerDay from '../../assets/Header_day.png';

interface Item {
  id: string;
  _id?: string;
  code?: string;
  name?: string;
  itemName?: string;
  unitPrice?: number;
  price?: number;
  unit?: string | any;
  stock?: number;
  category?: string;
  image?: string;
}

interface ItemSelectionScreenProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: Item) => void;
  excludeIds?: string[];
}

const ItemSelectionScreen: React.FC<ItemSelectionScreenProps> = ({ open, onClose, onSelect, excludeIds = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [exiting, setExiting] = useState(false);
  const ANIM_MS = 280;

  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedCategory('all');
      loadItems();
    }
  }, [open]);

  const excludeSnapshot = JSON.stringify(excludeIds || []);

  useEffect(() => {
    let result = items;
    if ((excludeIds || []).length > 0) {
      result = result.filter(item => !excludeIds.includes(item.id || item._id || ''));
    }
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => {
        const name = (item.name || item.itemName || '').toLowerCase();
        const code = (item.code || '').toLowerCase();
        return name.includes(q) || code.includes(q);
      });
    }
    setFilteredItems(result);
  }, [searchQuery, items, selectedCategory, excludeSnapshot, excludeIds]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await apiService.getItems();
      const itemsData = response?.data || response || [];
      setItems(itemsData);
      const uniqueCategories = Array.from(new Set((itemsData || []).map((it: Item) => it.category).filter(Boolean)));
      setCategories(uniqueCategories as string[]);
    } catch (err) {
      console.error('Error loading items:', err);
      setItems(mockItems);
      setCategories(['Áo khoác', 'Áo sơ mi']);
    } finally {
      setLoading(false);
    }
  };

  const triggerClose = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      onClose();
    }, ANIM_MS);
  };

  const handleSelect = (item: Item) => {
    onSelect(item);
    triggerClose();
  };

  if (!open) return null;

  const overlay = (
    <>
      <Box onClick={triggerClose} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', zIndex: 9999 }} />

      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 10000,
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

        <Box sx={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 10001, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', maxWidth: 'sm', mx: 'auto', py: 0.5 }}>
            <IconButton onClick={triggerClose} sx={{ width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <ArrowBack />
            </IconButton>

            <Typography sx={{ flex: 1, color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '20px', fontWeight: 500 }}>
              Chọn hàng hoá, dịch vụ
            </Typography>

            <IconButton onClick={() => { /* TODO: add new product flow */ }} sx={{ width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <Iconsax.Add size={24} color="#4E4E4E" variant="Outline" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ position: { xs: 'fixed', sm: 'relative' }, top: { xs: '100px', sm: 'auto' }, bottom: { xs: 0, sm: 'auto' }, left: 0, right: 0, px: 2, py: 2, pb: `calc(100px + env(safe-area-inset-bottom, 0px))`, overflowY: 'auto', bgcolor: 'transparent' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 'sm', mx: 'auto' }}>
            <SearchBox fullWidth placeholder="Tìm kiếm bằng mã, tên sản phẩm hoặc mô tả" value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} />

            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
              <FilterChip label="Tất cả sản phẩm" selected={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} />
              {categories.map(cat => (
                <FilterChip key={cat} label={cat} selected={selectedCategory === cat} onClick={() => setSelectedCategory(cat)} />
              ))}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
              ) : filteredItems.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ fontSize: 14, color: tokens.colors.text.disabled }}>Không tìm thấy sản phẩm nào</Typography>
                </Box>
              ) : (
                filteredItems.map(item => (
                  <ProductCard
                    key={item.id || item._id}
                    name={item.name || item.itemName || 'Sản phẩm'}
                    code={item.code || 'N/A'}
                    image={item.image}
                    stock={item.stock}
                    unitPrice={item.unitPrice || item.price || 0}
                    unit={item.unit}
                    mode="selection"
                    onClick={() => handleSelect(item)}
                  />
                ))
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(overlay, document.body);
  }
  return overlay;
};

// Mock data for development
const mockItems: Item[] = [
  { id: '1', code: 'VT00005', name: 'Áo khoác lông da báo Hàn Quốc cho nữ size M', unitPrice: 2000000, unit: 'chiếc', stock: 40, category: 'Áo khoác' },
  { id: '2', code: 'VT00006', name: 'Áo sơ mi công sở nam trắng size L', unitPrice: 350000, unit: 'chiếc', stock: 25, category: 'Áo sơ mi' },
  { id: '3', code: 'VT00007', name: 'Áo khoác dạ nữ cao cấp', unitPrice: 1500000, unit: 'chiếc', stock: 15, category: 'Áo khoác' },
];

export default ItemSelectionScreen;
