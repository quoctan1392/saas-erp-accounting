import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { useUi } from '../../context/UiContext';
import { consumeCallback } from '../../utils/callbackRegistry';
import SearchBox from '../../components/SearchBox';
import ProductCard from '../../components/ProductCard';
import ConfigChoiceBottomSheet from '../../components/ConfigChoiceBottomSheet';
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

// Convert various unknown inputs to a number safely
function safeNumber(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const t = v.trim();
    return t === '' ? NaN : Number(t);
  }
  return NaN;
}

const ItemSelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const navState = useMemo(() => (state || {}) as {
    callbackId?: string;
    updatedItem?: Record<string, unknown>;
    parentCallbackId?: string;
    fromSalesForm?: boolean;
    fromProductConfig?: boolean;
    reopenConfigForItemId?: string; // itemId to re-open ConfigChoiceBottomSheet
    // when navigating from SalesForm, the form may include already-selected items
    selectedItems?: Array<Record<string, unknown>>;
  }, [state]);
  const callbackId = navState.callbackId || navState.parentCallbackId;
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const { loading, startLoading, stopLoading } = useSafeLoading(12000);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [apiErrorMsg, setApiErrorMsg] = useState<string | null>(null);
  // route-based page: no overlay/backdrop animation state required
  const [showNewProduct, setShowNewProduct] = useState(false);
  
  // State for config choice bottom sheet
  const [showConfigChoice, setShowConfigChoice] = useState(false);
  const [configChoiceItemId, setConfigChoiceItemId] = useState<string | null>(null);
  const [currentConfigs, setCurrentConfigs] = useState<any[]>([]);
  
  // Track last quantity change time per item to prevent opening bottom sheet on rapid clicks
  const lastQuantityChangeTime = React.useRef<Record<string, number>>({});
  
  // Persist selectedItemsMap in sessionStorage to survive navigation
  // Now supports multiple configs per item with unique config IDs
  const SESSION_KEY = 'itemSelection_selectedItems';
  const [selectedItemsMap, setSelectedItemsMap] = useState<Record<string, { quantity: number; item: Item; warehouse?: string; warehouseId?: string; discount?: number; discountAmount?: number; isTradeDiscount?: boolean; taxIndustry?: string; vatRate?: number; configId?: string }>>(()=> {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const localCallbackCreatedRef = React.useRef(false);
  const { setShowBottomNav } = useUi();

  // Persist selectedItemsMap to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(selectedItemsMap));
    } catch (err) {
      console.warn('Failed to persist selectedItemsMap', err);
    }
  }, [selectedItemsMap, SESSION_KEY]);

  const selectedCount = Object.keys(selectedItemsMap).length;
  const selectedTotal = Object.values(selectedItemsMap).reduce((s, e) => {
    const unitPrice = e.item.sellPrice ?? e.item.unitPrice ?? e.item.price ?? 0;
    const quantity = e.quantity || 0;
    const discount = e.discount || 0;
    const subtotal = unitPrice * quantity;
    const discountAmt = e.discountAmount || (subtotal * discount / 100);
    return s + (subtotal - discountAmt);
  }, 0);

  // selectedItemsMap is now fully managed via sessionStorage
  // Updates from ProductDetailConfig are written directly to sessionStorage before navigation

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

  // Note: we intentionally do not clear `selectedItemsMap` on unmount so
  // that transient selections survive route navigation to product config
  // and back. Selections are cleared explicitly by `clearSelection` or
  // when the user confirms the selection via `confirmSelection`.

  useEffect(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    loadItems();
    
    // Always restore selections from sessionStorage on mount/return
    // This ensures selections persist when navigating back from ProductDetailConfig or SalesForm
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      let restored: Record<string, unknown> | null = null;
      if (saved) {
        restored = JSON.parse(saved);
        console.log('[ItemSelection] Restored selectedItemsMap from sessionStorage:', restored);
        setSelectedItemsMap(restored as any);
      }

      // If navigation state includes `selectedItems` from SalesForm, prefer those
      // so quantities already chosen in the form are reflected in the selection UI.
      if (navState.fromSalesForm && Array.isArray(navState.selectedItems) && navState.selectedItems.length > 0) {
        const fromNav = navState.selectedItems as Array<Record<string, unknown>>;
        const mapped: Record<string, any> = { ...(restored || {}) };
        fromNav.forEach(si => {
          const key = String(si.itemId || si.id || si._id || si.code || '');
          if (!key) return;
          mapped[key] = {
            quantity: Number(si.quantity) || 1,
            item: {
              id: key,
              _id: si._id || si.id || key,
              code: si.code || si.itemCode || undefined,
              name: si.name || si.itemName || si.itemName || '',
              itemName: si.itemName || si.name || '',
              unitPrice: Number(si.unitPrice ?? si.price ?? si.sellPrice) || 0,
              sellPrice: Number(si.unitPrice ?? si.price ?? si.sellPrice) || 0,
              price: Number(si.unitPrice ?? si.price ?? si.sellPrice) || 0,
              unit: si.unit || undefined,
              stock: si.stock ?? undefined,
              image: si.image ?? undefined,
              stockByWarehouse: si.stockByWarehouse ?? undefined,
            },
            warehouse: si.warehouseName || si.warehouse || undefined,
            warehouseId: si.warehouseId || undefined,
            discount: Number(si.discount) || 0,
            discountAmount: Number(si.discountAmount) || 0,
            isTradeDiscount: Boolean(si.isTradeDiscount),
            taxIndustry: si.taxIndustry,
            vatRate: Number(si.vatRate) || 0,
          };
        });
        console.log('[ItemSelection] Initialized selections from navigation state:', mapped);
        setSelectedItemsMap(mapped as any);
        try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(mapped)); } catch { /* ignore */ }
      }
    } catch (err) {
      console.warn('Failed to restore selections from sessionStorage', err);
    }
  }, [loadItems, SESSION_KEY]);

  // Re-open ConfigChoiceBottomSheet when returning from ProductDetailConfig
  useEffect(() => {
    // Only run this effect when explicitly returning from ProductDetailConfig
    if (navState.fromProductConfig && navState.reopenConfigForItemId) {
      const itemId = navState.reopenConfigForItemId;
      console.log('[ItemSelection] Re-opening ConfigChoiceBottomSheet for item:', itemId);
      
      // Re-read from sessionStorage to get the latest data (including newly added config)
      let latestMap = selectedItemsMap;
      try {
        const saved = sessionStorage.getItem(SESSION_KEY);
        if (saved) {
          latestMap = JSON.parse(saved);
          console.log('[ItemSelection] Re-read selectedItemsMap from sessionStorage:', latestMap);
          // Update state with latest from sessionStorage
          setSelectedItemsMap(latestMap);
        }
      } catch (err) {
        console.warn('[ItemSelection] Failed to read sessionStorage:', err);
      }
      
      // Find all configs for this item from the latest map
      const itemConfigs = Object.entries(latestMap)
        .filter(([key, config]) => {
          const configItemId = (config as any).item?.id || (config as any).item?._id || '';
          return configItemId === itemId;
        })
        .map(([configId, config]) => {
          const c = config as any;
          return {
            id: configId,
            itemId,
            name: c.item?.name || c.item?.itemName || '',
            code: c.item?.code,
            image: c.item?.image,
            unitPrice: c.item?.unitPrice || c.item?.sellPrice || c.item?.price || 0,
            unit: c.item?.unit,
            quantity: c.quantity,
            warehouse: c.warehouse,
            discount: c.discount,
            discountAmount: c.discountAmount,
            isTradeDiscount: c.isTradeDiscount,
            taxIndustry: c.taxIndustry,
            vatRate: c.vatRate,
          };
        });
      
      console.log('[ItemSelection] Found configs for reopen:', itemConfigs);
      
      if (itemConfigs.length > 0) {
        setConfigChoiceItemId(itemId);
        setCurrentConfigs(itemConfigs);
        setShowConfigChoice(true);
      }
      
      // Clear the navigation state to prevent re-triggering
      window.history.replaceState({}, '');
    }
  }, [navState.fromProductConfig, navState.reopenConfigForItemId, SESSION_KEY]);

  useEffect(() => {
    let result = items;
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
  }, [searchQuery, items, selectedCategory]);

  const triggerClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Hide the main BottomNavigation while on this screen and restore on exit
  useEffect(() => {
    setShowBottomNav(false);
    return () => setShowBottomNav(true);
  }, [setShowBottomNav]);

  // single-item select handler removed — selection handled via `toggleSelect` and `confirmSelection`

  const toggleSelect = useCallback((item: Item) => {
    const id = item.id || item._id || '';
    setSelectedItemsMap(prev => {
      const copy = { ...prev };
      if (copy[id]) {
        delete copy[id];
      } else {
        // Extract defaultWarehouse from item if available
        const itemWithDefaults = item as unknown as { defaultWarehouse?: { id?: string; name?: string; code?: string } };
        const defaultWh = itemWithDefaults.defaultWarehouse;
        copy[id] = { 
          quantity: 1, 
          item,
          // Use default warehouse if available
          warehouse: defaultWh?.name || defaultWh?.code,
          warehouseId: defaultWh?.id,
        };
      }
      return copy;
    });
  }, []);

  const changeQuantity = useCallback((itemId: string, q: number) => {
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
  }, []);

  // Handler when user clicks on product card - show config bottom sheet if has configs
  const handleProductCardClick = useCallback((item: Item) => {
    const itemId = item.id || item._id || '';
    
    console.log('[ItemSelection] handleProductCardClick for item:', itemId);
    console.log('[ItemSelection] Current selectedItemsMap:', selectedItemsMap);
    
    // Find all configs for this item
    const itemConfigs = Object.entries(selectedItemsMap)
      .filter(([key, config]) => {
        const configItemId = config.item.id || config.item._id || '';
        return configItemId === itemId;
      })
      .map(([configId, config]) => ({
        id: configId,
        itemId,
        name: config.item.name || config.item.itemName || '',
        code: config.item.code,
        image: config.item.image,
        unitPrice: config.item.unitPrice || config.item.sellPrice || config.item.price || 0,
        unit: config.item.unit,
        quantity: config.quantity,
        warehouse: config.warehouse,
        warehouseId: config.warehouseId,
        discount: config.discount,
        discountAmount: config.discountAmount,
        isTradeDiscount: config.isTradeDiscount,
        taxIndustry: config.taxIndustry,
        vatRate: config.vatRate,
      }));

    console.log('[ItemSelection] Found configs for item:', itemConfigs);

    if (itemConfigs.length > 0) {
      // Has configs, show bottom sheet
      setConfigChoiceItemId(itemId);
      setCurrentConfigs(itemConfigs);
      setShowConfigChoice(true);
    } else {
      // No configs yet, navigate directly to ProductDetailConfig
      handleNavigateToConfig(item);
    }
  }, [selectedItemsMap]);

  // Handler for configs change from bottom sheet
  const handleConfigsChange = useCallback((updatedConfigs: any[]) => {
    setSelectedItemsMap(prev => {
      const updated = { ...prev };
      
      // Remove all old configs for this item
      Object.keys(updated).forEach(key => {
        const config = updated[key];
        const configItemId = config.item.id || config.item._id || '';
        if (configItemId === configChoiceItemId) {
          delete updated[key];
        }
      });
      
      // Add updated configs
      updatedConfigs.forEach(config => {
        updated[config.id] = {
          quantity: config.quantity,
          item: {
            id: config.itemId,
            _id: config.itemId,
            name: config.name,
            code: config.code,
            image: config.image,
            unitPrice: config.unitPrice,
            sellPrice: config.unitPrice,
            price: config.unitPrice,
            unit: config.unit,
          } as Item,
          warehouse: config.warehouse,
          warehouseId: config.warehouseId,
          discount: config.discount,
          discountAmount: config.discountAmount,
          isTradeDiscount: config.isTradeDiscount,
          taxIndustry: config.taxIndustry,
          vatRate: config.vatRate,
          configId: config.id,
        };
      });
      
      return updated;
    });
    setCurrentConfigs(updatedConfigs);
  }, [configChoiceItemId]);

  // Handler for "Chọn thêm" button - navigate to ProductDetailConfig
  const handleNavigateToConfig = useCallback((item?: Item) => {
    const targetItem = item || (configChoiceItemId ? items.find(i => (i.id || i._id) === configChoiceItemId) : null);
    if (!targetItem) return;
    
    const payload = {
      id: targetItem.id,
      code: targetItem.code || '',
      name: targetItem.name || targetItem.itemName || '',
      unitPrice: targetItem.sellPrice ?? targetItem.unitPrice ?? targetItem.price ?? 0,
      unit: targetItem.unit,
      stock: targetItem.stock,
      stockByWarehouse: targetItem.stockByWarehouse,
      defaultWarehouse: (targetItem as any).defaultWarehouse,
      quantity: 1,
    };
    
    // Close bottom sheet before navigating
    setShowConfigChoice(false);
    
    // Navigate to ProductDetailConfig
    // ProductDetailConfig will persist the new config to sessionStorage
    // and navigate back with reopenConfigForItemId
    navigate(`/sales/product-config/${payload.code}`, {
      state: {
        item: payload,
        parentCallbackId: callbackId,
        fromItemSelection: true,
      },
    });
  }, [configChoiceItemId, items, callbackId, navigate]);

  const clearSelection = useCallback(() => {
    setSelectedItemsMap({});
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }, [SESSION_KEY]);

  const confirmSelection = useCallback(() => {
    // Save to sessionStorage before navigation so SalesForm can pick up the latest state
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(selectedItemsMap));
    } catch (err) {
      console.warn('Failed to save selectedItemsMap to sessionStorage', err);
    }
    
    // Prepare selected items in consistent format for both callback and standalone modes
    // Use the selection map keys (config ids) as the `id` so different configs for the
    // same product remain distinct when sent back to the Sales form.
    const selectedItems = Object.entries(selectedItemsMap).map(([configId, e]) => ({
      id: configId,
      configId,
      itemId: e.item.id,
      itemName: e.item.name || e.item.itemName || '',
      itemCode: e.item.code || '',
      image: e.item.image,
      quantity: e.quantity,
      unitPrice: e.item.sellPrice ?? e.item.unitPrice ?? e.item.price ?? 0,
      unit: e.item.unit,
      discount: e.discount || 0,
      discountAmount: e.discountAmount || 0,
      isTradeDiscount: e.isTradeDiscount || false,
      warehouseName: e.warehouse,
      warehouseId: e.warehouseId,
      taxIndustry: e.taxIndustry,
      vatRate: e.vatRate || 0,
      stock: e.item.stock,
      stockByWarehouse: e.item.stockByWarehouse,
    }));

    console.log('[ItemSelection] confirmSelection - selectedItems:', selectedItems);
    
    // Save to sessionStorage as backup
    try {
      sessionStorage.setItem('pendingSelectedItems', JSON.stringify(selectedItems));
    } catch (err) {
      console.warn('Failed to save selectedItems to sessionStorage', err);
    }

    // If opened from SalesForm with callbackId, invoke callback AND pass through navigation state
    if (callbackId) {
      const cb = consumeCallback(callbackId);
      if (cb) {
        console.log('[ItemSelection] Invoking callback with selectedItems');
        cb(selectedItems);
      }
      // Clear transient selection state
      clearSelection();
      // Navigate to sales form with state (so form can read from location.state OR from callback)
      navigate('/sales/orders/new', { 
        state: { 
          selectedItems,
          fromItemSelection: true 
        } 
      });
    } else {
      // Standalone mode: navigate to sales form with selected items
      clearSelection();
      navigate('/sales/orders/new', { 
        state: { 
          selectedItems,
          fromItemSelection: true 
        } 
      });
    }
  }, [callbackId, selectedItemsMap, clearSelection, navigate]);

  const page = (
    <Box sx={{ position: 'relative', minHeight: '100vh', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ height: { xs: 160, sm: 120 }, width: '100%', backgroundImage: `url(${headerDay})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

      <Box sx={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 2, px: { xs: 2, sm: 3 } }}>
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

      <Box sx={{ 
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
        pointerEvents: 'none', // Allow clicks to pass through to the summary bar below
        '& > *': { pointerEvents: 'auto' } // But allow clicks on child elements
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, px: 0, maxWidth: '100%', mx: 'auto' }}>
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
                
                // Find ALL configs for this item (not just the first one)
                const allConfigsForItem = Object.entries(selectedItemsMap)
                  .filter(([key, config]) => {
                    const configItemId = config.item.id || config.item._id || '';
                    return configItemId === id;
                  });
                
                const hasConfigs = allConfigsForItem.length > 0;
                const hasMultipleConfigs = allConfigsForItem.length > 1;
                
                // Sum total quantity from all configs
                const totalQuantity = allConfigsForItem.reduce((sum, [, config]) => sum + (config.quantity || 0), 0);
                
                // Use first config for display (price, warehouse, etc.) if available
                const firstConfig = hasConfigs ? allConfigsForItem[0][1] : null;
                const displayPrice = firstConfig?.item?.unitPrice ?? item.sellPrice ?? item.unitPrice ?? item.price ?? 0;
                const displayWarehouse = firstConfig?.warehouse || undefined;
                const displayDiscount = firstConfig?.discount || 0;
                const displayDiscountAmount = firstConfig?.discountAmount || 0;
                
                return (
                  <ProductCard
                    key={id}
                    name={item.name || item.itemName || 'Sản phẩm'}
                    code={item.code || 'N/A'}
                    image={item.image}
                    stock={item.stock}
                    // pass per-warehouse stock map if available
                    stockByWarehouse={item.stockByWarehouse}
                    // show selected warehouse if user configured one
                    selectedWarehouse={displayWarehouse}
                    unitPrice={displayPrice}
                    unit={firstConfig?.item?.unit ?? item.unit}
                    mode="selection"
                    selected={hasConfigs}
                    quantity={totalQuantity || 1}
                    discount={displayDiscount}
                    discountAmount={displayDiscountAmount}
                    warehouse={displayWarehouse}
                    // Number spinner behavior with time-based logic:
                    // - NO configs yet (first time selection):
                    //   - Rapid clicks (< 5s): change quantity directly (allow spam +/-)
                    //   - After 5s pause, click +: open bottom sheet
                    // - SINGLE config:
                    //   - decrement (-): always changes directly
                    //   - increment (+): open bottom sheet only if paused >= 5s
                    // - MULTIPLE configs (>= 2): 
                    //   - Any change (+/-): open bottom sheet only if paused >= 5s
                    onQuantityChange={(newQty: number) => {
                      const now = Date.now();
                      const lastChangeTime = lastQuantityChangeTime.current[id] || 0;
                      const timeSinceLastChange = now - lastChangeTime;
                      const THRESHOLD_MS = 5000; // 5 seconds
                      
                      // Re-check configs from current selectedItemsMap to avoid stale closure
                      const currentConfigs = Object.entries(selectedItemsMap)
                        .filter(([key, config]) => {
                          const configItemId = config.item.id || config.item._id || '';
                          return configItemId === id;
                        });
                      const currentHasConfigs = currentConfigs.length > 0;
                      
                      if (!currentHasConfigs) {
                        // No configs yet (first time selection)
                        const currentQty = totalQuantity || 0;
                        if (newQty > currentQty && timeSinceLastChange >= THRESHOLD_MS) {
                          // Increment (+) after 5s pause → open bottom sheet
                          handleProductCardClick(item);
                        } else {
                          // Rapid clicking or decrement → change quantity directly
                          changeQuantity(id, newQty);
                        }
                        lastQuantityChangeTime.current[id] = now;
                      } else if (currentConfigs.length === 1) {
                        // Single config: decrement always changes, increment opens sheet after 5s
                        const currentQty = totalQuantity || 0;
                        if (newQty > currentQty) {
                          // Increment (+)
                          if (timeSinceLastChange >= THRESHOLD_MS) {
                            // After 5s pause → open bottom sheet
                            handleProductCardClick(item);
                          } else {
                            // Rapid clicking → just increase quantity
                            const firstConfigId = currentConfigs[0][0];
                            changeQuantity(firstConfigId, newQty);
                          }
                          lastQuantityChangeTime.current[id] = now;
                        } else {
                          // Decrement (-) → always change quantity directly for single config
                          const firstConfigId = currentConfigs[0][0];
                          changeQuantity(firstConfigId, newQty);
                          lastQuantityChangeTime.current[id] = now;
                        }
                      } else {
                        // Multiple configs (>= 2): any change requires 5s pause to open bottom sheet
                        if (timeSinceLastChange >= THRESHOLD_MS) {
                          // After 5s pause → open bottom sheet (for + or -)
                          handleProductCardClick(item);
                        } else {
                          // Rapid clicking → do nothing
                          console.log('[ItemSelection] Multiple configs - need 5s pause to open bottom sheet');
                        }
                        lastQuantityChangeTime.current[id] = now;
                      }
                    }}
                    onClick={() => toggleSelect(item)}
                    // Card click behavior:
                    // - If NOT selected yet: open ProductDetailConfig to create first config
                    // - If already selected: open bottom sheet to view/add configs
                    onCardClick={() => handleProductCardClick(item)}
                  />
                );
              })
            )}
          </Box>
        </Box>
      </Box>

      {/* Floating sticky toolbar for selected items */}
      {selectedCount > 0 && !showConfigChoice && (
        <Box sx={{ position: 'fixed', left: 16, right: 16, bottom: 48, zIndex: 20000, display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
          <SummaryBar
            count={selectedCount}
            total={formatVND(selectedTotal)}
            onClear={clearSelection}
            onConfirm={confirmSelection}
          />
        </Box>
      )}

      {/* Config choice bottom sheet */}
      <ConfigChoiceBottomSheet
        open={showConfigChoice}
        onClose={() => {
          setShowConfigChoice(false);
          setConfigChoiceItemId(null);
          setCurrentConfigs([]);
        }}
        initialConfigs={currentConfigs}
        onConfigsChange={handleConfigsChange}
        onAddMore={() => handleNavigateToConfig()}
      />
    </Box>
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
          onSaved={(created: unknown) => {
            try {
              console.debug('[ItemSelection] onSaved created item from overlay:', created);
            } catch {
              // ignore debug log error
            }
            // normalize id
            const createdObj = (created as Record<string, unknown>) || {};
            const id = String(createdObj?.id || createdObj?._id || Date.now());
            // Normalize stock from created item using many possible field names
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
            const item = { ...createdObj, id, stock: finalStock || 0, stockByWarehouse: finalStockByWarehouse } as Item;
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

  return (
    <>
      {page}
      {productFormOverlay}
    </>
  );
};

// (Removed unused mock data)

export default ItemSelectionScreen;
