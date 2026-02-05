import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  InputAdornment,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  
  Switch,
} from '@mui/material';
import { useUi } from '../../context/UiContext';
import * as Iconsax from 'iconsax-react';
import { formatCurrency } from '../../utils/dashboardUtils';
import { apiService } from '../../services/api';
import { registerCallback } from '../../utils/callbackRegistry';
import DatePickerBottomSheet from '../../components/DatePickerBottomSheet';
import CustomerSelectionScreen from '../declaration/initial-balance/CustomerSelectionScreen';
import PageHeader from '../../components/PageHeader';
import AppButton from '../../components/AppButton';
import ProductCard from '../../components/ProductCard';
import headerDay from '../../assets/Header_day.png';
import emptyCart from '../../assets/empty_cart.png';
import FormContainer from '../../components/FormContainer';
import RoundedTextField from '../../components/RoundedTextField';
import AttachmentPicker from '../../components/AttachmentPicker';
import StickyFooterActions from '../../components/StickyFooterActions';
import tokens from '../../styles/tokens';

interface SaleItem {
  id: string;
  itemId: string;
  itemName: string;
  itemCode?: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  unit?: string | { name?: string };
  discount: number;
  discountType: 'percent' | 'amount';
  total: number;
  stock?: number;
  warehouseName?: string;
  sellPrice?: number;
  price?: number;
  stockByWarehouse?: Record<string, number>;
  discountAmount?: number;
  isTradeDiscount?: boolean;
  taxIndustry?: string;
  vatRate?: number;
}

interface SelectedProduct {
  id?: string;
  _id?: string;
  name?: string;
  itemName?: string;
  code?: string;
  image?: string;
  unitPrice?: number;
  price?: number;
  unit?: string | { name?: string };
  stock?: number;
  warehouseName?: string;
  warehouseId?: string;
  stockByWarehouse?: Record<string, number>;
  quantity?: number;
  discount?: number;
  discountAmount?: number;
  isTradeDiscount?: boolean;
  taxIndustry?: string;
  vatRate?: number;
}

function safeNumber(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const t = v.trim();
    return t === '' ? NaN : Number(t);
  }
  return NaN;
}

const SalesFormScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exiting, setExiting] = useState(false);
  const ANIM_MS = 280;

  const isEditMode = !!id;

  const { setShowBottomNav } = useUi();

  // Generate voucher number
  const [voucherNumber, setVoucherNumber] = useState<string>('');

  const padSeq = (n: number) => String(n).padStart(5, '0');

  const getLastSeqForYear = (prefix: string, year: number) => {
    try {
      const key = `last_seq_${prefix}_${year}`;
      const raw = localStorage.getItem(key);
      const val = raw ? parseInt(raw, 10) : 0;
      return Number.isFinite(val) ? val : 0;
    } catch {
      return 0;
    }
  };

  const generatePreviewVoucher = useCallback((prefix = 'BH') => {
    const year = new Date().getFullYear();
    const last = getLastSeqForYear(prefix, year);
    const next = last + 1;
    return `#${prefix}/${year}/${padSeq(next)}`;
  }, []);

  // Section 1: General Info
  // businessType is currently read-only; use a plain constant to avoid unused setter warnings
  const businessType = 'domestic_sale';
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  // Section 2: Customer
  const [selectedCustomer, setSelectedCustomer] = useState<{id?: string; code?: string; name: string; phone?: string; address?: string} | null>(null);
  const [customerSelectorOpen, setCustomerSelectorOpen] = useState(false);

  // Section 3: Items
  const ITEMS_SESSION_KEY = 'salesForm_items';
  const [items, setItems] = useState<SaleItem[]>(() => {
    // Try to restore from sessionStorage first
    try {
      const saved = sessionStorage.getItem(ITEMS_SESSION_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Persist items to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(ITEMS_SESSION_KEY, JSON.stringify(items));
      
      // Also update ItemSelection's sessionStorage so when user goes back,
      // quantities are synced correctly
      const SESSION_KEY = 'itemSelection_selectedItems';
      const itemSelectionMap: Record<string, any> = {};
      items.forEach(it => {
        const configId = it.id; // use item's id as config id
        itemSelectionMap[configId] = {
          quantity: it.quantity,
          item: {
            id: it.itemId,
            _id: it.itemId,
            code: it.itemCode,
            name: it.itemName,
            itemName: it.itemName,
            unitPrice: it.unitPrice,
            sellPrice: it.unitPrice,
            price: it.unitPrice,
            unit: it.unit,
            stock: it.stock,
            image: it.image,
            stockByWarehouse: it.stockByWarehouse,
          },
          warehouse: it.warehouseName,
          warehouseId: undefined,
          discount: it.discount || 0,
          discountAmount: it.discountAmount || 0,
          isTradeDiscount: it.isTradeDiscount || false,
          taxIndustry: it.taxIndustry,
          vatRate: it.vatRate || 0,
          configId: configId,
        };
      });
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(itemSelectionMap));
      console.log('[SalesForm] Synced items to ItemSelection sessionStorage:', itemSelectionMap);
    } catch (err) {
      console.warn('Failed to persist items to sessionStorage', err);
    }
  }, [items]);

  // Section 4: Summary
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalDiscount = items.reduce((sum, item) => {
    // Use pre-calculated discountAmount if available, otherwise compute from discount percentage
    if (item.discountAmount && item.discountAmount > 0) {
      return sum + item.discountAmount;
    }
    if (item.discountType === 'percent' && item.discount > 0) {
      return sum + (item.unitPrice * item.quantity * item.discount / 100);
    }
    return sum;
  }, 0);
  const vatAmount = 0; // Will be calculated based on items
  const finalAmount = totalAmount - totalDiscount + vatAmount;

  // Section 5: Payment
  const [paymentType, setPaymentType] = useState<'paid' | 'pay_later'>('pay_later');
  const [createOutward, setCreateOutward] = useState(true);
  const [isPosInvoice, setIsPosInvoice] = useState(false);

  // Section 6: Notes & Attachments
  const [description, setDescription] = useState('Bán hàng');
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (isEditMode && id) {
      loadVoucherData(id);
    }
    if (!isEditMode) {
      // For new vouchers, show preview next sequence based on local last_seq
      setVoucherNumber(generatePreviewVoucher('BH'));
    }
  }, [id, isEditMode, generatePreviewVoucher]);

  // Restore items from navigation state if coming from ItemSelectionScreen
  const location = useLocation();
  const processedStateRef = React.useRef(false);
  
  useEffect(() => {
    // Prevent double-processing in React StrictMode
    if (processedStateRef.current) return;
    
    let navState = location.state as { selectedItems?: SaleItem[]; fromItemSelection?: boolean } | null;
    console.log('[SalesForm] useEffect - navState from location.state:', navState);
    
    // Fallback: if navState is null, try to read from sessionStorage
    if (!navState || !navState.selectedItems) {
      try {
        const pendingItems = sessionStorage.getItem('pendingSelectedItems');
        if (pendingItems) {
          const parsed = JSON.parse(pendingItems);
          console.log('[SalesForm] Recovered selectedItems from sessionStorage:', parsed);
          navState = { selectedItems: parsed, fromItemSelection: true };
          // Clear sessionStorage after reading
          sessionStorage.removeItem('pendingSelectedItems');
        }
      } catch (err) {
        console.warn('[SalesForm] Failed to read from sessionStorage', err);
      }
    }
    
    if (navState?.fromItemSelection && navState.selectedItems && navState.selectedItems.length > 0) {
      console.log('[SalesForm] Processing selectedItems:', navState.selectedItems);
      processedStateRef.current = true;

      // Transform selectedItems to SaleItem format (support multiple source shapes)
      const incoming: SaleItem[] = (navState.selectedItems as unknown[]).map((item: unknown) => {
        const it = item as Record<string, unknown>;
        const resolvedName = (it.itemName as string) || (it.name as string) || '';
        const resolvedCode = (it.itemCode as string) || (it.code as string) || '';
        const resolvedUnitPrice = (it.unitPrice as number) ?? (it.sellPrice as number) ?? (it.price as number) ?? 0;
        const resolvedQuantity = (it.quantity as number) || 1;
        const resolvedDiscountAmount = (it.discountAmount as number ?? it.discountAmt as number ?? it.discount_amount as number) ?? 0;
        const resolvedDiscount = (typeof it.discount === 'number' ? (it.discount as number) : ((it.discountPercent as number) ?? (it.discount_percent as number) ?? 0)) || 0;
        const defaultWh = it.defaultWarehouse as Record<string, unknown> | undefined;
        const defaultWhName = defaultWh ? String(defaultWh.name ?? defaultWh.code ?? '') : undefined;
        const resolvedWarehouseName = (it.warehouseName as string) ?? (it.warehouse as string) ?? (defaultWhName || undefined);
        const resolvedStock = (it.stock as number) ?? ((it.stockByWarehouse && Object.values(it.stockByWarehouse as Record<string, unknown>).reduce((s: number, v: unknown) => s + (safeNumber(v) || 0), 0)) as number) ?? undefined;

        return {
          id: (it.id as string) || `${Date.now()}-${Math.random()}`,
          itemId: (it.itemId as string) || (it.id as string) || '',
          itemName: resolvedName,
          itemCode: resolvedCode,
          image: it.image as string | undefined,
          unit: it.unit as string | { name?: string } | undefined,
          quantity: resolvedQuantity,
          unitPrice: resolvedUnitPrice,
          discount: resolvedDiscount,
          // Prefer 'percent' if discount percentage is provided, else infer 'amount' if discountAmount exists
          discountType: (resolvedDiscount > 0 ? 'percent' : (resolvedDiscountAmount > 0 ? 'amount' : 'percent')) as 'percent' | 'amount',
          total: (resolvedUnitPrice * resolvedQuantity) - (resolvedDiscountAmount || 0),
          stock: resolvedStock,
          warehouseName: resolvedWarehouseName,
          stockByWarehouse: it.stockByWarehouse as Record<string, number> | undefined,
          discountAmount: resolvedDiscountAmount || undefined,
          isTradeDiscount: it.isTradeDiscount as boolean | undefined,
          taxIndustry: it.taxIndustry as string | undefined,
          vatRate: it.vatRate as number | undefined,
        } as SaleItem;
      });

      console.log('[SalesForm] Transformed incoming items:', incoming);

      // Replace existing items with incoming items (by config id)
      // When user returns to ItemSelection and modifies quantity, the new quantity
      // should REPLACE the old one, not add to it. Use incoming `id` (config id)
      // as primary key so different configs for the same product remain as separate lines.
      setItems(prev => {
        const map = new Map<string, SaleItem>();
        // Seed with previous items keyed by their unique `id`
        prev.forEach(it => map.set(it.id, { ...it }));
        // Replace (not add) incoming items - this ensures quantity modifications
        // replace the old quantity instead of summing.
        incoming.forEach(it => {
          const key = it.id || it.itemId;
          // Simply replace the item with the new one from ItemSelection
          map.set(key, { ...it });
        });
        return Array.from(map.values());
      });

      // Clear navigation/session backup to prevent re-applying
      try { sessionStorage.removeItem('pendingSelectedItems'); } catch (err) { console.warn('[SalesForm] Failed to remove pendingSelectedItems', err); }
      setTimeout(() => { window.history.replaceState({}, ''); }, 0);
    }
  }, [location]);

  // Hide the main BottomNavigation while on the Sales form and restore on exit
  useEffect(() => {
    setShowBottomNav(false);
    return () => setShowBottomNav(true);
  }, [setShowBottomNav]);

  const loadVoucherData = async (voucherId: string) => {
    setLoading(true);
    try {
      // Load voucher data from API if available
      const data = await apiService.getSaleVoucher(voucherId);
      if (data) {
        // assume API returns voucherNumber as `voucherNumber` or `code`
        const num = data.voucherNumber || data.code || data.number || '';
        if (num) setVoucherNumber(num);
        // populate other fields as needed (not implemented yet)
      }
    } catch (error) {
      console.error('Error loading voucher:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItems = () => {
    handleOpenItemSelection();
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleItemChange = (itemId: string, field: keyof SaleItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        // Recalculate total
        let itemTotal = updated.unitPrice * updated.quantity;
        if (updated.discountType === 'percent') {
          itemTotal = itemTotal * (1 - updated.discount / 100);
        } else {
          itemTotal = itemTotal - updated.discount;
        }
        updated.total = itemTotal;
        return updated;
      }
      return item;
    }));
  };

  const handleSelectCustomer = (e?: React.MouseEvent) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    setCustomerSelectorOpen(true);
  };

  const handleAddItem = (selectedItems: SelectedProduct[]) => {
    // Create new sale items from the selected products with full config
    const newItems: SaleItem[] = selectedItems.map(item => {
      const unitPrice = item.unitPrice || item.price || 0;
      const quantity = item.quantity || 1;
      const discount = item.discount || 0;
      const subtotal = unitPrice * quantity;
      const discountAmt = item.discountAmount ?? (subtotal * discount / 100);
      const total = subtotal - (Number.isFinite(discountAmt) ? discountAmt : 0);

      return {
        id: `${Date.now()}-${Math.random()}`,
        itemId: item.id || item._id || '',
        itemName: item.name || item.itemName || 'Sản phẩm',
        itemCode: item.code,
        image: item.image,
        unit: item.unit,
        quantity,
        unitPrice,
        discount,
        discountType: (item.discountAmount || item.discountAmount === 0) ? 'amount' : 'percent',
        total,
        stock: item.stock ?? (item.stockByWarehouse ? Object.values(item.stockByWarehouse).reduce((s: number, v: unknown) => s + (Number.isNaN(safeNumber(v)) ? 0 : safeNumber(v)), 0) : undefined),
        warehouseName: item.warehouseName,
        stockByWarehouse: item.stockByWarehouse,
        // preserve additional tax/discount fields so ProductCard and summary can show them
        discountAmount: Number.isFinite(discountAmt) ? discountAmt : undefined,
        isTradeDiscount: item.isTradeDiscount,
        taxIndustry: item.taxIndustry,
        vatRate: item.vatRate,
      };
    });
    setItems([...items, ...newItems]);
  };

  const handleOpenItemSelection = () => {
    const callbackId = registerCallback((selectedItems: SelectedProduct[]) => {
      handleAddItem(selectedItems);
    });

    // Prepare current items to send to the Item Selection screen so it can
    // prefill quantities for already-selected products.
    const preselected: SelectedProduct[] = items.map((it) => ({
      id: it.itemId || it.id,
      _id: it.itemId || it.id,
      name: it.itemName,
      itemName: it.itemName,
      code: it.itemCode,
      image: it.image,
      unitPrice: it.unitPrice,
      price: it.unitPrice,
      unit: typeof it.unit === 'string' ? it.unit : (it.unit && (it.unit as any).name) || undefined,
      stock: it.stock,
      warehouseName: it.warehouseName,
      warehouseId: undefined,
      stockByWarehouse: it.stockByWarehouse,
      quantity: it.quantity,
      discount: it.discount,
      discountAmount: it.discountAmount,
      isTradeDiscount: it.isTradeDiscount,
      taxIndustry: it.taxIndustry,
      vatRate: it.vatRate,
    }));

    navigate('/sales/select-items', { state: { callbackId, fromSalesForm: true, selectedItems: preselected } });
  };

  const handleAddAttachment = () => {
    // TODO: Open file picker
    console.log('Add attachment');
  };

  const handleSave = async () => {
    // Validation
    if (!selectedCustomer) {
      alert('Vui lòng chọn khách hàng');
      return;
    }
    if (items.length === 0) {
      alert('Vui lòng thêm ít nhất một mặt hàng');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        businessType,
        transactionDate,
        customer: selectedCustomer,
        items,
        totalAmount,
        totalDiscount,
        vatAmount,
        finalAmount,
        paymentType,
        createOutward,
        isPosInvoice,
        description,
      };

      // Call backend to create voucher if API is available
      await apiService.createSaleVoucher(payload);

      // On success, persist last sequence locally so preview advances next time
      try {
        const year = new Date().getFullYear();
        const prefix = 'BH';
        const key = `last_seq_${prefix}_${year}`;
        // extract sequence from our voucherNumber preview (if any)
        const parts = (voucherNumber || '').split('/');
        const seqStr = parts[parts.length - 1] || '';
        const seq = parseInt(seqStr, 10) || getLastSeqForYear(prefix, year);
        localStorage.setItem(key, String(seq));
      } catch {
        // ignore localStorage errors
      }

      // Navigate back to list
      navigate('/sales/orders');
    } catch (error) {
      console.error('Error saving voucher:', error);
      alert('Có lỗi xảy ra khi lưu hóa đơn');
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = !!selectedCustomer && items.length > 0;

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Format date for display (DD/MM/YYYY)
  const formatDisplayDate = (dateStr: string) => {
    // Parse YYYY-MM-DD into a local Date to avoid timezone shifts when using Date constructor
    const parts = dateStr.split('-').map((p) => Number(p));
    if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
    const [y, m, d] = parts;
    const date = new Date(y, m - 1, d);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const parseIsoToLocalDate = (iso: string) => {
    const parts = iso.split('-').map((p) => Number(p));
    if (parts.length !== 3 || parts.some(isNaN)) return new Date();
    const [y, m, d] = parts;
    return new Date(y, m - 1, d);
  };

  // Input types
  interface CustomerRaw {
    id?: string;
    _id?: string;
    code?: string;
    name?: string;
    accountObjectName?: string;
    phone?: string;
    mobile?: string;
    phoneNumber?: string;
    address?: string;
    location?: string;
  }

  return (
    <>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: tokens.colors.background.white,
          position: 'relative',
          pt: 0,
          transform: exiting ? 'translateX(100%)' : 'none',
          transition: `transform ${ANIM_MS}ms ease`,
        }}
      >
      <PageHeader
        title={`Hoá đơn ${voucherNumber}`}
        onBack={() => {
          setExiting(true);
          setTimeout(() => navigate('/sales/orders'), ANIM_MS);
        }}
        backgroundImage={headerDay}
        variant="decorative"
        rightAction={
          <Button
            onClick={handleSave}
            disabled={!canSubmit || saving}
            sx={{
              textTransform: 'none',
              fontSize: 15,
              fontWeight: 500,
              color: saving
                ? tokens.colors.text.disabled
                : (canSubmit ? tokens.colors.status.success : tokens.colors.text.disabled),
              minWidth: 'auto',
              p: 0.5,
            }}
          >
            {saving ? <CircularProgress size={20} /> : 'Lưu'}
          </Button>
        }
      />

      <FormContainer maxWidth="sm" variant="panel" backgroundColor="transparent" panelBackgroundColor="transparent">
          {/* Business Type Field (temporarily read-only; dropdown disabled) */}
          <RoundedTextField
            fullWidth
            label="Loại nghiệp vụ"
            value={businessType === 'domestic_sale' ? 'Bán hàng hoá trong nước' : businessType}
            onClick={() => { /* intentionally disabled */ }}
            InputProps={{ readOnly: true }}
            size="small"
            sx={{ mb: 2 }}
          />

          {/* Transaction Date Field (uses RoundedTextField + DatePicker bottom sheet) */}
          <RoundedTextField
            fullWidth
            label="Ngày chứng từ"
            value={formatDisplayDate(transactionDate)}
            onClick={() => { setDatePickerOpen(true); setBottomSheetOpen(true); }}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={(e) => { e.stopPropagation(); setDatePickerOpen(true); setBottomSheetOpen(true); }} size="small">
                    <Iconsax.Calendar size={20} color="rgba(0,0,0,0.54)" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{ mb: 2 }}
          />

          <DatePickerBottomSheet
            open={datePickerOpen}
            onClose={() => { setDatePickerOpen(false); setBottomSheetOpen(false); }}
            initial={parseIsoToLocalDate(transactionDate)}
            onConfirm={(d: Date) => {
              // Build YYYY-MM-DD from local date parts to avoid timezone offset
              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              const iso = `${y}-${m}-${day}`;
              setTransactionDate(iso);
              // ensure bottom sheet state is closed after confirm
              setDatePickerOpen(false);
              setBottomSheetOpen(false);
            }}
          />

          {/* Customer selection screen (slide-in) */}
          <CustomerSelectionScreen
            open={customerSelectorOpen}
            onClose={() => setCustomerSelectorOpen(false)}
            onSelect={(c: CustomerRaw) => {
              // Normalize selected customer shape (include code)
              const cust = {
                id: c.id || c._id || c.code || undefined,
                code: c.code || undefined,
                name: c.name || c.accountObjectName || '',
                phone: c.phone || c.mobile || c.phoneNumber || undefined,
                address: c.address || c.location || undefined,
              };
              try {
                setSelectedCustomer(cust);
                // Auto-update description to include customer name
                setDescription(`Bán hàng ${cust.name || ''}`);
              } catch (err) {
                console.warn('Failed to set selected customer', err);
                const fallbackName = c.name || c.accountObjectName || '';
                setSelectedCustomer({ name: fallbackName });
                setDescription(`Bán hàng ${fallbackName}`);
              }
            }}
          />

          {/* Customer Field (use RoundedTextField) */}
          <RoundedTextField
            fullWidth
            label="Khách hàng"
            value={selectedCustomer ? (selectedCustomer.code ? `${selectedCustomer.code} - ${selectedCustomer.name}` : selectedCustomer.name) : ''}
            placeholder={selectedCustomer ? '' : 'Chọn khách hàng'}
            InputProps={{
              onClick: (e: React.MouseEvent) => handleSelectCustomer(e),
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={(e) => handleSelectCustomer(e)} size="small">
                    <Iconsax.ArrowRight2 size={20} color="rgba(0,0,0,0.54)" />
                  </IconButton>
                </InputAdornment>
              ),
              inputProps: {
                onClick: (e: React.MouseEvent<HTMLInputElement>) => handleSelectCustomer(e),
              }
            }}
            size="small"
            sx={{ mb: 3 }}
          />

          {/* Order Details Section */}
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#212529', mb: 2 }}>
            Chi tiết đơn hàng
          </Typography>

          {items.length === 0 ? (
            // Empty State
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box
                component="img"
                src={emptyCart}
                alt="Empty cart"
                sx={{ width: 140, height: 140, mb: 2, opacity: 0.95 }}
              />
              <Typography sx={{ fontSize: 14, color: 'rgba(0,0,0,0.5)', mb: 1 }}>
                Đơn hàng của bạn chưa có sản phẩm nào!
              </Typography>
            </Box>
          ) : (
            // Items List
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2, width: '100%' }}>
              {items.map((item) => (
                <ProductCard
                  key={item.id}
                  variant="selected-complete"
                  name={item.itemName}
                  code={item.itemCode || 'N/A'}
                  image={item.image}
                  unitPrice={item.sellPrice ?? item.unitPrice ?? item.price ?? 0}
                  unit={item.unit}
                  mode="order"
                  selected={true}
                  quantity={item.quantity}
                  warehouse={item.warehouseName}
                  stock={item.stock}
                  // pass per-warehouse stock if present on the item, and selected warehouse
                  stockByWarehouse={item.stockByWarehouse}
                  selectedWarehouse={item.warehouseName}
                  // Pass discount percentage from item state
                  discount={item.discount}
                  // Pass computed discountAmount (already calculated in config)
                  discountAmount={item.discountAmount}
                  // Indicate which type the discount represents so ProductCard displays correctly
                  discountType={item.discountType}
                  isTradeDiscount={item.isTradeDiscount}
                  vatRate={item.vatRate}
                  taxIndustry={item.taxIndustry}
                  onQuantityChange={(newQuantity) => handleItemChange(item.id, 'quantity', newQuantity)}
                  onDelete={() => handleRemoveItem(item.id)}
                />
              ))}
            </Box>
          )}

          {/* Add Items Button */}
          <AppButton
            fullWidth
            onClick={handleSelectItems}
            variantType="secondary"
            startIcon={<Iconsax.Add size={20} color={tokens.colors.primary} />}
            sx={{
              textTransform: 'none',
              fontSize: 14,
              fontWeight: 500,
              color: tokens.colors.primary,
              border: `1px solid ${tokens.colors.primary}`,
              borderRadius: tokens.radius.round,
              py: 1.25,
              mb: 3,
              '&:hover': {
                bgcolor: tokens.colors.primaryLight,
                border: `1px solid ${tokens.colors.primary}`,
              },
            }}
          >
            Chọn hàng hoá dịch vụ
          </AppButton>

          {/* Summary Section */}
          <Box
            sx={{
              mb: 3,
              borderRadius: '12px',
              background: '#F9F9F9',
              display: 'flex',
              padding: '12px',
              flexDirection: 'column',
              alignItems: 'flex-start',
              alignSelf: 'stretch',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, width: '100%' }}>
              <Typography sx={{ fontSize: 14, color: '#090909' }}>Số lượng hàng hoá</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{totalQuantity}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, width: '100%' }}>
              <Typography sx={{ fontSize: 14, color: '#090909' }}>Tổng tiền hàng</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{totalAmount === 0 ? '0' : formatCurrency(totalAmount)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography sx={{ fontSize: 14, color: '#090909' }}>Chiết khấu</Typography>
              <IconButton
                size="small"
                sx={{
                  p: 0,
                  width: 24,
                  height: 24,
                  minWidth: 24,
                  bgcolor: 'var(--Scheme-SuccessContainer, #D6EDD4)',
                  borderRadius: '48px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': { bgcolor: tokens.colors.primaryHover },
                }}
              >
                <Iconsax.Add size={14} color="#0B6623" />
              </IconButton>
              </Box>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{totalDiscount === 0 ? '0' : formatCurrency(totalDiscount)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, width: '100%' }}>
              <Typography sx={{ fontSize: 14, color: '#090909' }}>Thuế GTGT</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{vatAmount === 0 ? '0' : formatCurrency(vatAmount)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, width: '100%' }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#090909'}}>Tổng tiền thanh toán</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: tokens.colors.primary }}>
                {finalAmount === 0 ? '0' : formatCurrency(finalAmount)}
              </Typography>
            </Box>
          </Box>

          {/* Payment Info Section */}
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#212529', mb: 1.5 }}>
            Thông tin thanh toán
          </Typography>

          <RadioGroup 
            value={paymentType} 
            onChange={(e) => setPaymentType(e.target.value as 'paid' | 'pay_later')}
            sx={{ mb: 1 }}
          >
            <FormControlLabel
              value="paid"
              control={<Radio size="small" sx={{ '&.Mui-checked': { color: tokens.colors.primary } }} />}
              label={<Typography sx={{ fontSize: 14 }}>Đã thanh toán</Typography>}
              sx={{ mb: -0.5 }}
            />
            <FormControlLabel
              value="pay_later"
              control={<Radio size="small" sx={{ '&.Mui-checked': { color: tokens.colors.primary } }} />}
              label={<Typography sx={{ fontSize: 14 }}>Thanh toán sau</Typography>}
            />
          </RadioGroup>

          {/* Toggle Switches */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
            <Typography sx={{ fontSize: 14, color: tokens.colors.text.primary }}>Đơn hàng có xuất kho</Typography>
            <Switch
              checked={createOutward}
              onChange={(e) => setCreateOutward(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: tokens.colors.primary,
                  '&:hover': { bgcolor: tokens.colors.primaryLight },
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  bgcolor: tokens.colors.primary,
                },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, mb: 2 }}>
            <Typography sx={{ fontSize: 14, color: tokens.colors.text.primary }}>Là hoá đơn từ máy tính tiền</Typography>
            <Switch
              checked={isPosInvoice}
              onChange={(e) => setIsPosInvoice(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: tokens.colors.primary,
                  '&:hover': { bgcolor: tokens.colors.primaryLight },
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  bgcolor: tokens.colors.primary,
                },
              }}
            />
          </Box>

          {/* Description Field */}
          <RoundedTextField
            fullWidth
            label="Diễn giải"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Bán hàng"
            size="small"
            sx={{ mb: 2 }}
          />

          {/* Attachments Section */}
          <AttachmentPicker
            attachments={attachments}
            onAdd={handleAddAttachment}
            onRemove={(index) => {
              setAttachments(attachments.filter((_, i) => i !== index));
            }}
          />
        </FormContainer>

      </Box>

      {/* Bottom Submit Button - rendered outside transformed container so it is fixed to viewport */}
      <StickyFooterActions
        actions={[
          {
            label: 'Hoàn thành',
            onClick: handleSave,
            disabled: !canSubmit,
            loading: saving,
            variant: 'contained',
            color: 'primary',
          },
        ]}
        show={!bottomSheetOpen}
        zIndex={1600}
      />
    </>
  );
};

export default SalesFormScreen;