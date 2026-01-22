import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import FilterChip from '../../components/FilterChip';
import { ArrowBack, Close, ArrowForwardIos } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import SearchBox from '../../components/SearchBox';
import ProductCard from '../../components/ProductCard';
import tokens from '../../styles/tokens';
import { apiService } from '../../services/api';
import headerDay from '../../assets/Header_day.png';
import { useSafeLoading } from '../../hooks/useApi';
import { withTimeout } from '../../utils/apiHelpers';
import { formatVND } from '../../utils/dashboardUtils';

interface Item {
  id: string;
  _id?: string;
  code?: string;
  name?: string;
  itemName?: string;
  unitPrice?: number;
  sellPrice?: number;
  price?: number;
  unit?: string | { name?: string };
  stock?: number;
  category?: string;
  image?: string;
  stockByWarehouse?: Record<string, number>;
}

interface ItemSelectionScreenProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: Item) => void;
  excludeIds?: string[];
}

// Convert various unknown inputs to a number safely
function safeNumber(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const t = v.trim();
    return t === '' ? NaN : Number(t);
  }
  return NaN;
}

const ItemSelectionScreen: React.FC<ItemSelectionScreenProps> = ({ open, onClose, onSelect, excludeIds = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const { loading, startLoading, stopLoading } = useSafeLoading(12000);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [exiting, setExiting] = useState(false);
  const [selectedItemsMap, setSelectedItemsMap] = useState<Record<string, { quantity: number; item: Item }>>({});
  const ANIM_MS = 280;

  const selectedCount = Object.keys(selectedItemsMap).length;
  const selectedTotal = Object.values(selectedItemsMap).reduce((s, e) => s + ((e.item.sellPrice ?? e.item.unitPrice ?? e.item.price ?? 0) * (e.quantity || 0)), 0);

  const loadItems = useCallback(async () => {
    startLoading();
    
    try {
      const response = await withTimeout(apiService.getItems(), 8000);
      const itemsData = response?.data || response || [];
      
      // Fetch stock levels from inventory endpoint
      let stockLevels: Record<string, unknown>[] = [];
      try {
        const stockResponse = await withTimeout(apiService.getStockLevels(), 8000);
        stockLevels = (stockResponse?.data || stockResponse || []) as Record<string, unknown>[];
      } catch (err: any) {
        console.warn('[ItemSelection] Failed to fetch stock levels (timeout or error):', err);
      }
      
      // Build a map: itemId -> { totalStock, stockByWarehouse }
      const stockMap: Record<string, { total: number; byWarehouse?: Record<string, number> }> = {};
      for (const level of stockLevels) {
        const itemId = level['itemId'] as string;
        const warehouseId = level['warehouseId'] as string;
        const warehouseName = level['warehouseName'] as string;
        // backend view provides `quantityOnHand` and `quantityAvailable` fields
        const qty = safeNumber(
          level['quantityOnHand'] ?? level['quantityAvailable'] ?? level['quantity'] ?? level['stock'] ?? level['currentStock'] ?? 0,
        );
        
        if (!stockMap[itemId]) {
          stockMap[itemId] = { total: 0, byWarehouse: {} };
        }
        
        if (!Number.isNaN(qty)) {
          stockMap[itemId].total += qty;
          const key = warehouseName || warehouseId || 'default';
          if (stockMap[itemId].byWarehouse) {
            stockMap[itemId].byWarehouse![key] = (stockMap[itemId].byWarehouse![key] || 0) + qty;
          }
        }
      }
      
      // DEBUG: Log first raw item from API to see actual field names
      if (itemsData && itemsData.length > 0) {
        console.log('[ItemSelection] RAW item from API:', JSON.stringify(itemsData[0], null, 2));
        if (stockLevels.length > 0) {
          console.log('[ItemSelection] First stock level:', JSON.stringify(stockLevels[0], null, 2));
        }
      }
      
         // Normalize stock fields: merge stock data from inventory endpoint
        const normalized = (itemsData || []).map((it: Record<string, unknown>) => {
          const itemId = (it['id'] as string) || '';
          const stockInfo = stockMap[itemId];
          
          // Use stock from inventory endpoint if available
          let finalStock = stockInfo ? stockInfo.total : 0;
          let finalStockByWarehouse = stockInfo ? stockInfo.byWarehouse : undefined;
          
          // Fallback: try to extract from item object (if backend adds it later)
          if (!stockInfo) {
            // possible per-warehouse structures
            const sbw = (it['stockByWarehouse'] ?? it['warehouseStock'] ?? it['stock_by_warehouse'] ?? it['stocksByWarehouse'] ?? it['stocks']) as Record<string, unknown> | undefined;

            // If there is an array of warehouses with stock info, try to extract
            let warehouseMap: Record<string, number> | undefined = undefined;
            const warehouses = it['warehouses'];
            if (Array.isArray(warehouses) && warehouses.length > 0) {
              warehouseMap = (warehouses as Array<Record<string, unknown>>).reduce((acc: Record<string, number>, w) => {
                const key = (w['id'] as string) || (w['name'] as string) || (w['warehouseId'] as string) || (w['warehouseName'] as string) || String(Object.keys(acc).length);
                const val = safeNumber(w['stock'] ?? w['quantity'] ?? w['onHand'] ?? w['available']);
                acc[key] = Number.isNaN(val) ? 0 : val;
                return acc;
              }, {} as Record<string, number>);
            }

            // prefer explicit stockByWarehouse-like object, otherwise use derived warehouseMap
            finalStockByWarehouse = (sbw && typeof sbw === 'object') ? (sbw as Record<string, number>) : warehouseMap;

            // collect candidate scalar fields for stock
            const scalarCandidates = [
              it['stock'],
              it['quantity'],
              it['initialStock'],
              it['initial_stock'],
              it['openingStock'],
              it['opening_stock'],
              it['startingStock'],
              it['starting_stock'],
              it['onHand'],
              it['on_hand'],
              it['available'],
              it['availableStock'],
              it['available_stock'],
            ];

            if (finalStockByWarehouse && typeof finalStockByWarehouse === 'object') {
              try {
                finalStock = Object.values(finalStockByWarehouse).reduce((s: number, v: unknown) => {
                  const nv = safeNumber(v);
                  return s + (Number.isNaN(nv) ? 0 : nv);
                }, 0);
              } catch {
                finalStock = 0;
              }
            } else {
              const nums = scalarCandidates.map((v) => (typeof v === 'number' ? (v as number) : safeNumber(v))).filter((n) => !Number.isNaN(n));
              if (nums.length === 1) finalStock = nums[0] || 0;
              else if (nums.length > 1) finalStock = nums.reduce((s, n) => s + (Number(n) || 0), 0);
              else finalStock = 0;
            }
          }

          // Normalize image field: prefer explicit `image`, then common DB/API fields
          const imageCandidate = (it['image'] as string) || (it['defaultImageUrl'] as string) || (it['default_image_url'] as string) || (it['listImageUrl'] as string) || (it['list_image_url'] as string) || (it['imageUrl'] as string) || (it['image_url'] as string) || undefined;

          const result = {
            ...(it as Record<string, unknown>),
            image: imageCandidate,
            stockByWarehouse: finalStockByWarehouse,
            stock: Number(finalStock) || 0,
          } as unknown as Item;

          return result;
        });
      
      // DEBUG: Log first normalized item to verify stock calculation
      if (normalized && normalized.length > 0) {
        console.log('[ItemSelection] NORMALIZED item (stock should be computed):', JSON.stringify(normalized[0], null, 2));
      }
      
      setItems(normalized as Item[]);
      const uniqueCategories = Array.from(new Set((itemsData || []).map((it: Item) => it.category).filter(Boolean)));
      setCategories(uniqueCategories as string[]);
    } catch (err: any) {
      console.error('Error loading items:', err);
      setItems(mockItems);
      setCategories(['Áo khoác', 'Áo sơ mi']);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setSelectedCategory('all');
      loadItems();
    }
  }, [open, loadItems]);

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

  const triggerClose = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      onClose();
    }, ANIM_MS);
  };

  // single-item select handler removed — selection handled via `toggleSelect` and `confirmSelection`

  const toggleSelect = (item: Item) => {
    const id = item.id || item._id || '';
    setSelectedItemsMap(prev => {
      const copy = { ...prev };
      if (copy[id]) {
        delete copy[id];
      } else {
        copy[id] = { quantity: 1, item };
      }
      return copy;
    });
  };

  const changeQuantity = (itemId: string, q: number) => {
    setSelectedItemsMap(prev => {
      if (!prev[itemId]) return prev;
      return { ...prev, [itemId]: { ...prev[itemId], quantity: q } };
    });
  };

  const clearSelection = () => setSelectedItemsMap({});

  const confirmSelection = () => {
    // pass selected items to parent onSelect (one by one with quantity attached) then close
    Object.values(selectedItemsMap).forEach(e => {
      try {
        onSelect({ ...(e.item as Item), // attach quantity field so parent can handle
          quantity: e.quantity } as unknown as Item);
      } catch (err) {
        // ignore
      }
    });
    clearSelection();
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
              <AddIcon sx={{ color: '#4E4E4E' }} />
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
                filteredItems.map(item => {
                  const id = item.id || item._id || '';
                  const selectedEntry = selectedItemsMap[id];
                  return (
                    <ProductCard
                      key={id}
                      name={item.name || item.itemName || 'Sản phẩm'}
                      code={item.code || 'N/A'}
                      image={item.image}
                      stock={item.stock}
                      // pass per-warehouse stock map if available
                      stockByWarehouse={item.stockByWarehouse}
                      // in selection mode no warehouse selected yet
                      selectedWarehouse={null}
                      unitPrice={item.sellPrice ?? item.unitPrice ?? item.price ?? 0}
                      unit={item.unit}
                      mode="selection"
                      selected={Boolean(selectedEntry)}
                      quantity={selectedEntry?.quantity ?? 1}
                      onQuantityChange={(q: number) => changeQuantity(id, q)}
                      onClick={() => toggleSelect(item)}
                    />
                  );
                })
              )}
            </Box>
            {/* Floating sticky toolbar for selected items */}
            {selectedCount > 0 && (
              <Box
                sx={{
                  position: 'fixed',
                  left: 16,
                  right: 16,
                  bottom: 48,
                  zIndex: 12000,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    height: 52,
                    padding: '12px 12px 12px 6px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    flex: '1 0 0',
                    borderRadius: 40,
                    background: 'var(--Scheme-Primary, #FB7E00)',
                    color: '#FFF',
                    minWidth: 320,
                    maxWidth: 980,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <IconButton onClick={clearSelection} sx={{ width: 40, height: 40, bgcolor: '#FFF', '&:hover': { bgcolor: '#FFF' } }}>
                      <Close sx={{ color: '#FB7E00' }} />
                    </IconButton>
                    <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                      {`Đã chọn ${selectedCount} sản phẩm`}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
                      {formatVND(selectedTotal)}
                    </Typography>
                    <IconButton onClick={confirmSelection} sx={{ width: 40, height: 40, bgcolor: 'transparent', color: '#FFF' }}>
                      <ArrowForwardIos sx={{ color: '#FFF' }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            )}
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
