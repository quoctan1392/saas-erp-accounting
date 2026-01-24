import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import FilterChip from '../../components/FilterChip';
import { ArrowBack } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import SummaryBar from '../../components/SummaryBar';
import ProductFormScreen from '../declaration/ProductFormScreen';
import ProductDetailScreen from './ProductDetailScreen';
import SearchBox from '../../components/SearchBox';
import ProductCard from '../../components/ProductCard';
import tokens from '../../styles/tokens';
import { apiService } from '../../services/api';
import { API_CONFIG } from '../../config/constants';
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
  const [apiErrorMsg, setApiErrorMsg] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);
  // navigate removed (unused in this screen)
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [selectedItemsMap, setSelectedItemsMap] = useState<Record<string, { quantity: number; item: Item }>>({});
  const [detailItem, setDetailItem] = useState<Item | null>(null);
  const ANIM_MS = 280;

  const selectedCount = Object.keys(selectedItemsMap).length;
  const selectedTotal = Object.values(selectedItemsMap).reduce((s, e) => s + ((e.item.sellPrice ?? e.item.unitPrice ?? e.item.price ?? 0) * (e.quantity || 0)), 0);

  const loadItems = useCallback(async () => {
    startLoading();
    setApiErrorMsg(null);
    
    // DEBUG: Log localStorage state
    console.log('=== ItemSelection Debug ===');
    console.log('accessToken:', localStorage.getItem('accessToken') ? 'EXISTS' : 'MISSING');
    console.log('tenantAccessToken:', localStorage.getItem('tenantAccessToken') ? 'EXISTS' : 'MISSING');
    console.log('selectedTenantId:', localStorage.getItem('selectedTenantId'));
    console.log('currentTenant:', localStorage.getItem('currentTenant'));
    console.log('===========================');
    
    try {
      const response = await withTimeout(apiService.getItems(), 8000);
      const raw = response?.data ?? response;

      // Normalize various API shapes into an array
      let itemsData: Record<string, unknown>[] = [];
      if (Array.isArray(raw)) {
        itemsData = raw;
      } else if (raw && Array.isArray(raw.data)) {
        itemsData = raw.data as Record<string, unknown>[];
      } else if (raw && Array.isArray(raw.items)) {
        itemsData = raw.items as Record<string, unknown>[];
      } else if (raw && raw.success === false) {
        // API returned an error object
        console.warn('[ItemSelection] API returned error:', raw);
        if (raw.statusCode === 401) {
          setApiErrorMsg('Phiên hoặc token tenant không hợp lệ. Vui lòng đăng nhập lại hoặc chọn tenant.');
        } else {
          setApiErrorMsg(raw.message || raw.error || 'Lỗi khi tải danh sách sản phẩm');
        }
        itemsData = [];
      } else {
        itemsData = [];
      }
      
      // Fetch stock levels from inventory endpoint
      let stockLevels: Record<string, unknown>[] = [];
      try {
        const stockResponse = await withTimeout(apiService.getStockLevels(), 8000);
        stockLevels = (stockResponse?.data || stockResponse || []) as Record<string, unknown>[];
      } catch (err: unknown) {
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
      if (Array.isArray(itemsData) && itemsData.length > 0) {
        console.log('[ItemSelection] RAW item from API:', JSON.stringify(itemsData[0], null, 2));
        if (stockLevels.length > 0) {
          console.log('[ItemSelection] First stock level:', JSON.stringify(stockLevels[0], null, 2));
        }
      }

      // Try to fetch item categories independently so filter chips can be shown even
      // when item list doesn't contain category data (or when items cannot be fetched).
      let categoriesFromApiArr: { id: string; name: string }[] = [];
      try {
        const catResp = await withTimeout(apiService.getItemCategories(), 5000);
        const catRaw = catResp?.data ?? catResp;
        if (Array.isArray(catRaw)) {
          categoriesFromApiArr = catRaw
            .map((c: Record<string, unknown>) => ({ id: String(c.id), name: String(c.name || c.code || c.id) }))
            .filter((c: { id: string; name: string }) => c.name);
        } else if (catRaw && Array.isArray(catRaw.data)) {
          categoriesFromApiArr = catRaw.data
            .map((c: Record<string, unknown>) => ({ id: String(c.id), name: String(c.name || c.code || c.id) }))
            .filter((c: { id: string; name: string }) => c.name);
        }
      } catch (err: unknown) {
        console.warn('[ItemSelection] getItemCategories failed:', err);
      }

      // Normalize stock fields: merge stock data from inventory endpoint
      // build category id->name map for normalization
      const categoryIdToName = (categoriesFromApiArr || []).reduce((acc: Record<string, string>, c) => {
        if (c && c.id) acc[c.id] = c.name;
        return acc;
      }, {} as Record<string, string>);

      const normalized = (itemsData || []).map((it: Record<string, unknown>) => {
          // Backend now returns totalStock and stockByWarehouse directly
          const totalStock = Number(it['totalStock'] ?? 0);
          const stockByWarehouse = it['stockByWarehouse'] as Record<string, number> | undefined;

          // Normalize image field: prefer explicit `image`, then common DB/API fields
          const imageCandidate = (it['image'] as string) || (it['defaultImageUrl'] as string) || (it['default_image_url'] as string) || (it['listImageUrl'] as string) || (it['list_image_url'] as string) || (it['imageUrl'] as string) || (it['image_url'] as string) || undefined;
          // Normalize image URL: if backend returned a relative path, prefix with CORE service URL
          let normalizedImage: string | undefined = undefined;
          try {
          if (imageCandidate && typeof imageCandidate === 'string') {
            const trimmed = imageCandidate.trim();
            if (/^(https?:)?\/\//i.test(trimmed) || /^data:|^blob:/i.test(trimmed)) {
              // absolute URL (http(s) or protocol-relative) or data/blob URI — use as-is
              normalizedImage = trimmed;
            } else {
              // ensure leading slash for relative paths
              const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
              normalizedImage = `${API_CONFIG.CORE_SERVICE_URL}${path}`;
            }
          }
          } catch {
            normalizedImage = typeof imageCandidate === 'string' ? imageCandidate : undefined;
          }

          // Resolve category name: prefer explicit category field, else map from listItemCategoryId
          let categoryName: string | undefined = (it['category'] as string) || (it['categoryName'] as string) || undefined;
          try {
            if (!categoryName) {
              const listIds = (it['listItemCategoryId'] ?? it['listItemCategoryIds'] ?? it['categoryIds'] ?? it['category_id'] ?? it['categories']) as unknown;
              if (Array.isArray(listIds) && listIds.length > 0) {
                const first = String(listIds[0]);
                categoryName = categoryIdToName[first] || first;
              } else if (typeof listIds === 'string' && listIds) {
                categoryName = categoryIdToName[String(listIds)] || String(listIds);
              }
            }
          } catch {
            // ignore errors in category resolution
          }

          const result = {
            ...(it as Record<string, unknown>),
            image: normalizedImage || imageCandidate,
            stockByWarehouse: stockByWarehouse,
            stock: totalStock,
            category: categoryName,
          } as unknown as Item;

          return result;
        });
      
      // DEBUG: Log first normalized item to verify stock calculation
      if (normalized && normalized.length > 0) {
        console.log('[ItemSelection] NORMALIZED item (stock should be computed):', JSON.stringify(normalized[0], null, 2));
      }
      
      // Ensure stock normalization covers additional possible field names (e.g. initialStock)
      const postProcessed = (normalized as Item[]).map((it) => {
        const itRecord = it as unknown as Record<string, unknown>;
        const possibleStock = itRecord.stock ?? itRecord.initialStock ?? itRecord.initial_stock ?? itRecord.quantity ?? itRecord.onHand ?? itRecord.available ?? 0;
        const finalStock = Number(possibleStock) || 0;

        let finalStockByWarehouse = it.stockByWarehouse;
        if (!finalStockByWarehouse) {
          const warehouses = itRecord.warehouses || itRecord.warehouseStocks || itRecord.stocks;
          if (Array.isArray(warehouses) && warehouses.length > 0) {
            finalStockByWarehouse = warehouses.reduce((acc: Record<string, number>, w: Record<string, unknown>, idx: number) => {
              const key = String(w.name || w.warehouseName || w.warehouseId || idx);
              const val = Number(w.stock ?? w.quantity ?? w.onHand ?? w.available) || 0;
              acc[key] = val;
              return acc;
            }, {} as Record<string, number>);
          }
        }

        const out = { ...it, stock: finalStock, stockByWarehouse: finalStockByWarehouse } as Item;
        // Debug: log Matcha item stock for verification
        try { if ((out.name || '').toLowerCase().includes('matcha')) console.debug('[ItemSelection] Matcha item normalized:', out); } catch {
          // ignore matcha log error
        }
        return out;
      });

      setItems(postProcessed as Item[]);
      const inferred = Array.from(new Set((normalized || []).map((it: Item) => it.category).filter(Boolean)));
      const apiCategoryNames = (categoriesFromApiArr || []).map(c => c.name).filter(Boolean);
      const uniqueCategories = (apiCategoryNames.length > 0) ? apiCategoryNames : inferred;
      setCategories(uniqueCategories as string[]);
    } catch (err: unknown) {
      console.error('Error loading items:', err);
      // Do not fall back to mock/demo items for selection UI.
      // Show empty list so the UI reflects the actual database state and surfaces the error.
      const errObj = err as { message?: string };
      setApiErrorMsg(errObj?.message ? String(errObj.message) : 'Lỗi khi tải sản phẩm');
      setItems([]);
      setCategories([]);
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
      // if item not present, ignore
      if (!prev[itemId]) return prev;
      // if quantity is zero or less, remove item from selection
      if ((q ?? 0) <= 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
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
      } catch {
        // ignore selection errors
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

            <IconButton onClick={() => { setShowNewProduct(true); }} sx={{ width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <AddIcon sx={{ color: '#4E4E4E' }} />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ position: { xs: 'fixed', sm: 'relative' }, top: { xs: '100px', sm: 'auto' }, bottom: { xs: 0, sm: 'auto' }, left: 0, right: 0, px: 2, py: 2, pb: `calc(100px + env(safe-area-inset-bottom, 0px))`, overflowY: 'auto', bgcolor: 'transparent' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 'sm', mx: 'auto' }}>
            <SearchBox fullWidth placeholder="Tìm kiếm bằng mã, tên sản phẩm hoặc mô tả" value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} />

            <Box
              sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                overflowY: 'hidden',
                // hide scrollbar in most browsers
                scrollbarWidth: 'none', // Firefox
                '-ms-overflow-style': 'none', // IE 10+
                '&::-webkit-scrollbar': {
                  height: 0,
                },
              }}
            >
              <FilterChip label="Tất cả" selected={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')} />
              {categories.map(cat => (
                <FilterChip key={cat} label={cat} selected={selectedCategory === cat} onClick={() => setSelectedCategory(cat)} />
              ))}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
              ) : filteredItems.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ fontSize: 14, color: tokens.colors.text.disabled }}>
                    {apiErrorMsg ? apiErrorMsg : 'Không tìm thấy sản phẩm nào'}
                  </Typography>
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
                      onCardClick={() => setDetailItem(item)}
                    />
                  );
                })
              )}
            </Box>
            {/* Floating sticky toolbar for selected items */}
            {selectedCount > 0 && (
              <Box sx={{ position: 'fixed', left: 16, right: 16, bottom: 48, zIndex: 12000, display: 'flex', justifyContent: 'center' }}>
                <SummaryBar
                  count={selectedCount}
                  total={formatVND(selectedTotal)}
                  onClear={clearSelection}
                  onConfirm={confirmSelection}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );

  // Product form overlay (slide-in) when adding from selection
  const productFormOverlay = showNewProduct ? (
    <>
      <Box onClick={() => setShowNewProduct(false)} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', zIndex: 11000 }} />
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: { xs: '100%', sm: '520px' },
          zIndex: 11001,
          bgcolor: 'transparent',
          animation: 'slideInFromRight 0.28s ease',
          '@keyframes slideInFromRight': {
            from: { transform: 'translateX(100%)' },
            to: { transform: 'translateX(0)' },
          },
        }}
      >
        <ProductFormScreen
          overlay
          singleSave
          onSaved={(created: Record<string, unknown>) => {
            try {
              console.debug('[ItemSelection] onSaved created item from overlay:', created);
            } catch {
              // ignore debug log error
            }
            // normalize id
            const id = String(created?.id || created?._id || Date.now());
            // Normalize stock from created item using many possible field names
            const createdObj = (created || {}) as Record<string, unknown>;
            const candidateNumber = (v: unknown) => {
              if (typeof v === 'number') return v;
              if (typeof v === 'string') return Number(v.toString().replace(/,/g, '')) || 0;
              return 0;
            };
            let finalStock = candidateNumber(createdObj.stock ?? createdObj.quantity ?? createdObj.onHand ?? createdObj.on_hand ?? createdObj.available ?? createdObj.minimumStock ?? createdObj.initialStock ?? createdObj.initial_stock ?? 0);
            const finalStockByWarehouse = createdObj.stockByWarehouse || createdObj.warehouseStock || createdObj.stocks || createdObj.stocksByWarehouse || createdObj.warehouse_stocks;
            if ((!finalStock || finalStock === 0) && finalStockByWarehouse && typeof finalStockByWarehouse === 'object') {
              try {
                finalStock = Object.values(finalStockByWarehouse as Record<string, unknown>).reduce((s: number, v: unknown) => s + (candidateNumber(v) || 0), 0);
              } catch {
                finalStock = finalStock || 0;
              }
            }
            const item = { ...(created || {}), id, stock: finalStock || 0, stockByWarehouse: finalStockByWarehouse } as Item;
            // add to items and auto-select
            setItems(prev => [item, ...prev]);
            setFilteredItems(prev => [item, ...prev]);
            setSelectedItemsMap(prev => ({ ...prev, [id]: { quantity: 1, item } }));
          }}
          onClose={() => setShowNewProduct(false)}
        />
      </Box>
    </>
  ) : null;

  if (typeof document !== 'undefined') {
    return createPortal(
      <>
        {overlay}
        {productFormOverlay}
        {detailItem && (
          <ProductDetailScreen
            open={Boolean(detailItem)}
            item={{
              id: detailItem.id,
              code: detailItem.code || '',
              name: detailItem.name || detailItem.itemName || '',
              unitPrice: detailItem.sellPrice ?? detailItem.unitPrice ?? detailItem.price ?? 0,
              unit: detailItem.unit,
              stock: detailItem.stock,
              stockByWarehouse: detailItem.stockByWarehouse,
              // Backend now returns defaultWarehouse object with { id, code, name }
              defaultWarehouse: (detailItem as any).defaultWarehouse,
              quantity: selectedItemsMap[detailItem.id]?.quantity || 1,
            }}
            onClose={() => setDetailItem(null)}
            onSave={(updatedItem) => {
              const id = updatedItem.id;
              setSelectedItemsMap(prev => ({
                ...prev,
                [id]: {
                  quantity: updatedItem.quantity,
                  item: {
                    ...detailItem,
                    unitPrice: updatedItem.unitPrice,
                    sellPrice: updatedItem.unitPrice,
                    unit: updatedItem.unit || detailItem.unit,
                  },
                },
              }));
              setDetailItem(null);
            }}
          />
        )}
      </>,
      document.body,
    );
  }
  return (
    <>
      {overlay}
      {productFormOverlay}
      {detailItem && (
        <ProductDetailScreen
          open={Boolean(detailItem)}
          item={{
            id: detailItem.id,
            code: detailItem.code || '',
            name: detailItem.name || detailItem.itemName || '',
            unitPrice: detailItem.sellPrice ?? detailItem.unitPrice ?? detailItem.price ?? 0,
            unit: detailItem.unit,
            stock: detailItem.stock,
            stockByWarehouse: detailItem.stockByWarehouse,
            // Backend now returns defaultWarehouse object with { id, code, name }
            defaultWarehouse: (detailItem as any).defaultWarehouse,
            quantity: selectedItemsMap[detailItem.id]?.quantity || 1,
          }}
          onClose={() => setDetailItem(null)}
          onSave={(updatedItem) => {
            const id = updatedItem.id;
            setSelectedItemsMap(prev => ({
              ...prev,
              [id]: {
                quantity: updatedItem.quantity,
                item: {
                  ...detailItem,
                  unitPrice: updatedItem.unitPrice,
                  sellPrice: updatedItem.unitPrice,
                  unit: updatedItem.unit || detailItem.unit,
                },
              },
            }));
            setDetailItem(null);
          }}
        />
      )}
    </>
  );
};

// (Removed unused mock data)

export default ItemSelectionScreen;
