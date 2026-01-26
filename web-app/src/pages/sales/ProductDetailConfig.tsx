import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Switch, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useUi } from '../../context/UiContext';
import { consumeCallback } from '../../utils/callbackRegistry';
import RoundedTextField from '../../components/RoundedTextField';
import NumberSpinner from '../../components/NumberSpinner';
// removed ProductCard usage to keep header composed of shared components
import WarehouseSelectionScreen from '../declaration/WarehouseSelectionScreen';
import TaxIndustrySelectionScreen from '../declaration/TaxIndustrySelectionScreen';
import UnitSelectionScreen from '../declaration/UnitSelectionScreen';
import tokens from '../../styles/tokens';
import headerDay from '../../assets/Header_day.png';
import taxIndustryGroups from '../../data/taxIndustryGroups';
import { apiService } from '../../services/api';
// BusinessType removed — not used in this screen

const ProductDetailConfig: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navState = (state || {}) as any;
  const params = useParams();
  const routeCode = params.code;
  const callbackId = navState.callbackId as string | undefined;

  // Use navigation state `item` when available, otherwise build a minimal
  // fallback item using the route `code` so the screen can render when loaded
  // directly via URL.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialItem = (navState.item as any) || {
    id: routeCode || 'unknown',
    code: routeCode || 'UNKNOWN',
    name: '',
    unitPrice: 0,
    unit: 'chiếc',
    stock: 0,
    stockByWarehouse: {},
  };

  // If navigation provided an item, use it; otherwise fall back to initialItem.
  // Keep `providedItem` as a dependency target for effects below.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providedItem = navState.item as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const item = (providedItem || initialItem) as any;

  const [quantity, setQuantity] = useState<number>(() => initialItem?.quantity || 1);
  const [selectedWarehouse, setSelectedWarehouse] = useState<{id: string; name: string} | null>(null);
  const [warehouseScreenOpen, setWarehouseScreenOpen] = useState(false);
  const [unitPrice, setUnitPrice] = useState<string>(() => String(initialItem.unitPrice || 0));
  const [unit, setUnit] = useState<{ id: string; name: string } | null>(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const it = initialItem as any;
    if (typeof it.unit === 'object' && it.unit && ('id' in it.unit) && ('name' in it.unit)) {
      const u = it.unit as { id?: string; name?: string };
      if (u.id && u.name) return { id: u.id, name: u.name };
    }
    if (typeof it.unit === 'string') return { id: 'default', name: it.unit };
    return null;
  });
  const [unitScreenOpen, setUnitScreenOpen] = useState(false);
  
  // Discount toggles
  const [isTradeDiscount, setIsTradeDiscount] = useState(false);
  const [hasLineItemDiscount, setHasLineItemDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  
  // Tax industry
  const [taxIndustry, setTaxIndustry] = useState('');
  const [taxIndustryScreenOpen, setTaxIndustryScreenOpen] = useState(false);
  const [vatRate] = useState<number>(0);
  
  // preserve exiting flag for disabling actions while navigating away
  const [exiting] = useState(false);

  const { setShowBottomNav } = useUi();

  useEffect(() => {
    setShowBottomNav(false);
    return () => setShowBottomNav(true);
  }, [setShowBottomNav]);

  // Initialize from navigation `item` and localStorage
  // Initialize from navigation `item` and localStorage
  useEffect(() => {
    if (!item) return;
    requestAnimationFrame(() => {
      setQuantity(item.quantity || 1);
      setUnitPrice(String(item.unitPrice || 0));

      if (typeof item.unit === 'object' && item.unit && ('id' in item.unit || 'name' in item.unit)) {
        const u = item.unit as { id?: string; name?: string };
        if (u.id && u.name) setUnit({ id: u.id, name: u.name });
        else if (u.name) setUnit({ id: 'default', name: u.name });
      } else if (typeof item.unit === 'string') {
        setUnit({ id: 'default', name: item.unit });
      }
    });

    try {
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      const currentTenant = JSON.parse(localStorage.getItem('currentTenant') || '{}');
      const acctSetup = onboardingData?.accountingSetup;

      const resolveTaxIndustry = (val: unknown): string | undefined => {
        if (!val) return undefined;
        if (typeof val === 'string') return val;
        if (typeof val === 'object' && val !== null) {
          const maybe = val as Record<string, unknown>;
          // common shapes: { code: '101' } or { taxIndustryCode: '101' } or { id: '101' }
          if (typeof maybe.code === 'string') return maybe.code;
          if (typeof maybe.taxIndustryCode === 'string') return maybe.taxIndustryCode;
          if (typeof maybe.id === 'string' || typeof maybe.id === 'number') return String(maybe.id);
          // some payloads nest under taxIndustryGroup
          if (maybe.taxIndustryGroup && typeof maybe.taxIndustryGroup === 'object') {
            const nested = maybe.taxIndustryGroup as Record<string, unknown>;
            if (typeof nested.code === 'string') return nested.code;
          }
        }
        return undefined;
      };

      // Try several places in order of preference:
      // 1) explicit value on the provided item (various shapes)
      // 2) onboardingData.accountingSetup.taxIndustryGroup
      // 3) currentTenant.accountingSetup.taxIndustryGroup
      // 4) currentTenant.taxIndustryGroup
      const itemObj = (item || {}) as Record<string, unknown>;
      const fromItem = resolveTaxIndustry(itemObj.taxIndustry) || resolveTaxIndustry(itemObj.taxIndustryGroup) || resolveTaxIndustry(itemObj.taxIndustryCode) || resolveTaxIndustry(itemObj.taxIndustryId);
      const chosen = fromItem || resolveTaxIndustry(acctSetup?.taxIndustryGroup) || resolveTaxIndustry(currentTenant?.accountingSetup?.taxIndustryGroup) || resolveTaxIndustry(currentTenant?.taxIndustryGroup);
      const applyChosen = (c?: string) => {
        if (c) {
          console.debug('[ProductDetailConfig] resolved taxIndustry prefill', { fromItem, chosen: c, lookup: taxIndustryGroups.find(x => x.code === c) });
          requestAnimationFrame(() => setTaxIndustry(c));
          return true;
        }
        return false;
      };

      if (applyChosen(chosen)) return;

      // If we couldn't find a prefill in localStorage or the provided item,
      // try to fetch the onboarding status from the server (in case onboarding
      // was completed and localStorage was cleared). This fetch is best-effort
      // and non-blocking for rendering.
      try {
        const currentTenantRaw = localStorage.getItem('currentTenant') || '{}';
        const currentTenant = JSON.parse(currentTenantRaw || '{}');
        const tenantId = currentTenant?.id;
        if (tenantId) {
          (async () => {
            try {
              const resp = await apiService.getOnboardingStatus(tenantId);
              const remoteAcctSetup = resp?.data?.accountingSetup || resp?.accountingSetup;
              const remoteCode = resolveTaxIndustry(remoteAcctSetup?.taxIndustryGroup);
              if (remoteCode) {
                console.debug('[ProductDetailConfig] fetched taxIndustry from server onboarding status', { remoteCode });
                requestAnimationFrame(() => setTaxIndustry(remoteCode));
              } else {
                console.debug('[ProductDetailConfig] server onboarding status had no taxIndustry');
              }
            } catch (err) {
              console.warn('[ProductDetailConfig] failed to fetch onboarding status for prefill', err);
            }
          })();
        } else {
          console.debug('[ProductDetailConfig] no currentTenant id available for server prefill');
        }
      } catch (err) {
        console.warn('[ProductDetailConfig] error reading currentTenant for server prefill', err);
      }
    } catch (err) { console.warn('Error parsing onboarding/currentTenant', err); }
  }, [item]);

  // Initialize default warehouse from `item`
  // Initialize default warehouse from `item`
  useEffect(() => {
    if (!item) return;
    if (item.defaultWarehouse) {
      const w = item.defaultWarehouse as { id?: string; name?: string; code?: string };
      // avoid synchronous setState inside effect body
      requestAnimationFrame(() => {
        setSelectedWarehouse({
          id: String(w.id || ''),
          name: String(w.name || w.code || ''),
        });
      });
    }
  }, [item]);

  // Calculate available stock at selected warehouse
  const availableStock = (() => {
    if (!selectedWarehouse || !item.stockByWarehouse) {
      return typeof item.stock === 'number' ? item.stock : 0;
    }
    
    const stock = item.stockByWarehouse[selectedWarehouse.id];
    return typeof stock === 'number' ? stock : 0;
  })();

  // Format currency
  const formatCurrency = (value: string) => {
    let num = value.replace(/\D/g, '');
    num = num.replace(/^0+(?=\d)/, '');
    if (num === '') return '';
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handlePriceChange = (value: string) => {
    setUnitPrice(formatCurrency(value));
  };

  // Calculate subtotal and discount
  const parsedUnitPrice = parseFloat(unitPrice.replace(/,/g, '')) || 0;
  const subtotal = parsedUnitPrice * quantity;
  
  let calculatedDiscountAmount = 0;
  let calculatedDiscountPercent = 0;

  // If trade discount is enabled, automatically apply 100% discount of the line subtotal
  if (isTradeDiscount) {
    calculatedDiscountAmount = subtotal;
    calculatedDiscountPercent = subtotal > 0 ? 100 : 0;
  } else if (hasLineItemDiscount) {
    if (discountPercent) {
      calculatedDiscountPercent = parseFloat(discountPercent) || 0;
      calculatedDiscountAmount = (subtotal * calculatedDiscountPercent) / 100;
    } else if (discountAmount) {
      calculatedDiscountAmount = parseFloat(discountAmount.replace(/,/g, '')) || 0;
      calculatedDiscountPercent = subtotal > 0 ? (calculatedDiscountAmount / subtotal) * 100 : 0;
    }
  }

  // Tax industry label
  const taxIndustryLabel = taxIndustry
    ? (() => {
        const g = taxIndustryGroups.find((x) => x.code === taxIndustry);
        return g ? `${g.code} - ${g.name}` : String(taxIndustry);
      })()
    : '';

  console.debug('[ProductDetailConfig] taxIndustry state', { taxIndustry, taxIndustryLabel });

  const handleClose = () => {
    navigate(-1);
  };

  const handleSave = () => {
    // Validate quantity vs stock (BR06)
    if (quantity > availableStock) {
      alert(`Số lượng không được vượt quá số lượng tồn kho (${availableStock})`);
      return;
    }

    // Validate discount percent not > 100% (CC07)
    if (!isTradeDiscount && hasLineItemDiscount && calculatedDiscountPercent > 100) {
      alert('Chiết khấu không được vượt quá 100%');
      return;
    }

    if (callbackId) {
      const cb = consumeCallback(callbackId);
      if (cb) {
        cb({
          id: item.id,
          code: item.code,
          name: item.name,
          image: item.image,
          quantity,
          warehouse: selectedWarehouse?.name,
          warehouseId: selectedWarehouse?.id,
          unitPrice: parsedUnitPrice,
          discount: calculatedDiscountPercent,
          discountAmount: calculatedDiscountAmount,
          isTradeDiscount,
          hasLineItemDiscount,
          discountPercent: calculatedDiscountPercent,
          taxIndustry,
          vatRate,
          unit: unit || undefined,
          stock: item.stock,
          stockByWarehouse: item.stockByWarehouse,
        });
      }
    }

    handleClose();
  };

  // Determine whether Save should be enabled
  const canSave = (() => {
    if (quantity < 1) return false;
    if (parsedUnitPrice <= 0) return false;
    // When trade-discount is enabled the system auto-applies 100% discount
    if (!isTradeDiscount && hasLineItemDiscount) {
      const hasPercent = discountPercent.trim() !== '';
      const hasAmount = discountAmount.trim() !== '';
      if (!hasPercent && !hasAmount) return false;
      if (calculatedDiscountPercent > 100) return false;
    }
    return true;
  })();

  

  

  // Render as a normal route-backed page (no overlay/backdrop)
  const page = (
    <Box sx={{ position: 'relative', minHeight: '100vh', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* Header - match other selection screens: header image + overlay (back, title, save) */}
      <Box sx={{ height: { xs: 160, sm: 120 }, width: '100%', backgroundImage: `url(${headerDay})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

      <Box sx={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 2, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 'sm', mx: 'auto', py: 0.5 }}>
            <IconButton onClick={handleClose} sx={{ position: 'absolute', left: 0, top: 6, width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <ArrowBack />
            </IconButton>

            <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
              <Typography sx={{ color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '20px', fontWeight: 500 }}>
                {item.code}
              </Typography>
            </Box>

            <Box sx={{ position: 'absolute', right: 0, top: 6 }}>
              <Button
                onClick={handleSave}
                disabled={!canSave}
                sx={{
                  textTransform: 'none',
                  fontSize: 15,
                  fontWeight: 500,
                  color: canSave ? tokens.colors.secondary : tokens.colors.text.disabled,
                  minWidth: 'auto',
                  p: 0.5,
                }}
              >
                Lưu
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Content (quantity + form) */}
        <Box sx={{ borderRadius: { xs: '16px 16px 0 0', sm: '16px' }, px: 0.5, py: { xs: 2, sm: 6 }, pb: { xs: `calc(100px + env(safe-area-inset-bottom, 0px))`, sm: 6 }, position: { xs: 'fixed', sm: 'relative' }, top: { xs: '80px', sm: 'auto' }, bottom: { xs: 0, sm: 'auto' }, left: '16px', right: '16px', maxWidth: 'calc(100% - 32px)', display: 'flex', flexDirection: 'column', overflowY: { xs: 'auto', sm: 'visible' }, bgcolor: 'transparent', flex: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, px: 0, maxWidth: '100%', mx: 'auto' }}>
            {/* Quantity box */}
            <Box sx={{ width: '100%', maxWidth: 560 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, mb: 2, borderRadius: '16px', border: '1px solid #FB7E00', bgcolor: 'rgba(254, 246, 232, 0.40)' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#090909', textAlign: 'center' }}>
                  Số lượng
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <NumberSpinner
                    value={quantity}
                    size="lg"
                    allowEdit
                    decrementButtonBorderColor={tokens.colors.border.default}
                    incrementButtonBorderColor={tokens.colors.border.default}
                    decrementIconColor="#E53935"
                    incrementIconColor="#00A152"
                    buttonBackgroundColor={tokens.colors.background.white}
                    onChange={(v) => setQuantity(Math.max(1, v))}
                  />
                </Box>
              </Box>
            </Box>

            {/* Product Name */}
            <Box sx={{ mb: 0.5 }}>
              <RoundedTextField
                fullWidth
                label="Tên sản phẩm"
                value={item.name}
                disabled
                sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#212529' } }}
              />
            </Box>

            {/* Unit */}
            <Box sx={{ mb: 0.5 }}>
              <RoundedTextField
                  fullWidth
                  label="Đơn vị tính"
                  value={unit?.name || (typeof item.unit === 'string' ? item.unit : 'chiếc')}
                  readOnly
                  inputProps={{ readOnly: true, style: { cursor: 'default' } }}
                />
            </Box>

            {/* Warehouse */}
            <Box sx={{ mb: 0.5 }}>
              <RoundedTextField
                  fullWidth
                  label="Kho ngầm định"
                  value={selectedWarehouse?.name || ''}
                  onClick={() => setWarehouseScreenOpen(true)}
                  placeholder="Chọn kho"
                  readOnly
                  endAdornmentIcon="ArrowRight2"
                  endAdornment={
                    // Always render a stock chip when we have a numeric stock value (even 0).
                    typeof availableStock === 'number' ? (
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: '12px',
                          bgcolor: '#EFF8EF',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#009F00' }}>
                          Tồn: {availableStock}
                        </Typography>
                      </Box>
                    ) : null
                  }
                />
            </Box>

            {/* Unit Price */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <RoundedTextField
                  fullWidth
                  label="Đơn giá"
                  value={unitPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  type="text"
                  inputMode="numeric"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <RoundedTextField
                  fullWidth
                  label="Thành tiền"
                  // Show simple subtotal (đơn giá * số lượng) only in detail view.
                  value={formatCurrency(String(subtotal.toFixed(0)))}
                  disabled
                  sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#212529', fontWeight: 600 } }}
                />
              </Box>
            </Box>


            {/* Trade Discount Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pl: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#090909' }}>
                Là hàng hóa chiết khấu thương mại
              </Typography>
              <Switch
                checked={isTradeDiscount}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsTradeDiscount(checked);
                  if (checked) {
                    // When enabling trade-discount: force line-item discount
                    // toggle OFF and disabled, clear manual discount inputs.
                    setHasLineItemDiscount(false);
                    setDiscountPercent('');
                    setDiscountAmount('');
                  } else {
                    // When disabling trade-discount: remove disabled state
                    // and keep the line-item toggle OFF (but enabled).
                    setHasLineItemDiscount(false);
                    setDiscountPercent('');
                    setDiscountAmount('');
                  }
                }}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: tokens.colors.primary },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: tokens.colors.primary },
                }}
              />
            </Box>

            {/* Line Item Discount Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pl: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#090909' }}>
                Chiết khấu trên mặt hàng
              </Typography>
              <Switch
                // When trade-discount is active, the line-item toggle should be
                // visually OFF and disabled.
                checked={isTradeDiscount ? false : hasLineItemDiscount}
                onChange={(e) => {
                  if (isTradeDiscount) return;
                  setHasLineItemDiscount(e.target.checked);
                  if (!e.target.checked) {
                    setDiscountPercent('');
                    setDiscountAmount('');
                  }
                }}
                disabled={isTradeDiscount}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: tokens.colors.primary },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: tokens.colors.primary },
                }}
              />
            </Box>

            {/* Discount Fields (AC06) */}
            {hasLineItemDiscount && (
              <Box sx={{ display: 'flex', gap: 2, pl: 0 }}>
                <RoundedTextField
                  fullWidth
                  label="% Chiết khấu"
                  value={isTradeDiscount ? String(Math.round(calculatedDiscountPercent)) + '%' : discountPercent}
                  onChange={(e) => {
                    if (isTradeDiscount) return;
                    // Normalize input: allow digits and decimal separator
                    const raw = e.target.value;
                    const norm = raw.replace(',', '.').replace(/[^0-9.]/g, '');
                    const pct = norm === '' ? 0 : parseFloat(norm) || 0;
                    // Display percent with '%' suffix when not empty
                    setDiscountPercent(norm === '' ? '' : `${pct}%`);
                    // Calculate discount amount from percent and update amount field
                    const amt = subtotal * (pct / 100);
                    setDiscountAmount(norm === '' ? '' : formatCurrency(String(Math.round(amt))));
                  }}
                  disabled={isTradeDiscount}
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                />
                <RoundedTextField
                  fullWidth
                  label="Tiền chiết khấu"
                  value={isTradeDiscount ? formatCurrency(String(calculatedDiscountAmount.toFixed(0))) : discountAmount}
                  onChange={(e) => {
                    if (isTradeDiscount) return;
                    const raw = e.target.value;
                    // Extract numeric digits only for currency
                    const digits = raw.replace(/\D/g, '');
                    if (digits === '') {
                      setDiscountAmount('');
                      setDiscountPercent('');
                      return;
                    }
                    const amtNum = parseFloat(digits) || 0;
                    setDiscountAmount(formatCurrency(String(amtNum)));
                    // Calculate percent from amount / subtotal
                    const pct = subtotal > 0 ? (amtNum / subtotal) * 100 : 0;
                    setDiscountPercent(`${Number(pct.toFixed(2))}%`);
                  }}
                  disabled={isTradeDiscount}
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                />
              </Box>
            )}

            {/* Tax Industry (AC07) */}
            <Box onClick={() => setTaxIndustryScreenOpen(true)} sx={{ cursor: 'pointer' }}>
              <RoundedTextField
                fullWidth
                label="Nhóm ngành nghề tính thuế GTGT, TNCN"
                value={taxIndustryLabel}
                placeholder="Chọn nhóm ngành nghề"
                readOnly
                endAdornmentIcon="ArrowRight2"
                inputProps={{ readOnly: true }}
              />
            </Box>

            {/* Footer placeholder removed - using fixed save bar instead */}
          </Box>
        </Box>

        {/* Fixed save action bar - use sticky footer container style for consistent shadow */}
        <Box sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1400, display: 'flex', gap: 1.5, px: 2, py: 2, pb: 'calc(16px + env(safe-area-inset-bottom, 0px))', bgcolor: tokens.colors.background.white, boxShadow: tokens.shadows.footer }}>
          <Box sx={{ maxWidth: 'sm', mx: 'auto', width: '100%' }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSave}
              disabled={!canSave || exiting}
              sx={{
                borderRadius: tokens.radius.full,
                bgcolor: !canSave || exiting ? '#DEE2E6' : tokens.colors.primary,
                boxShadow: 'none',
                color: !canSave || exiting ? '#ADB5BD' : '#fff',
                textTransform: 'none',
                fontWeight: 500,
                height: 56,
                fontSize: '16px'
              }}
            >
              Lưu
            </Button>
          </Box>
        </Box>

      {/* Warehouse Selection */}
      <WarehouseSelectionScreen
        open={warehouseScreenOpen}
        onClose={() => setWarehouseScreenOpen(false)}
        onSelect={(warehouse) => {
          setSelectedWarehouse(warehouse);
          setWarehouseScreenOpen(false);
        }}
      />

      {/* Unit Selection */}
      <UnitSelectionScreen
        open={unitScreenOpen}
        onClose={() => setUnitScreenOpen(false)}
        onSelect={(selectedUnit) => {
          setUnit(selectedUnit);
          setUnitScreenOpen(false);
        }}
      />

      {/* Tax Industry Selection */}
      <TaxIndustrySelectionScreen
        open={taxIndustryScreenOpen}
        value={taxIndustry}
        onClose={() => setTaxIndustryScreenOpen(false)}
        onSelect={(code) => {
          setTaxIndustry(code);
          setTaxIndustryScreenOpen(false);
        }}
      />
    </Box>
  );

  return page;
};

export default ProductDetailConfig;
