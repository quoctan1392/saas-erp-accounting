import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Switch, Divider, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { createPortal } from 'react-dom';
import RoundedTextField from '../../components/RoundedTextField';
import NumberSpinner from '../../components/NumberSpinner';
// removed ProductCard usage to keep header composed of shared components
import WarehouseSelectionScreen from '../declaration/WarehouseSelectionScreen';
import TaxIndustrySelectionScreen from '../declaration/TaxIndustrySelectionScreen';
import UnitSelectionScreen from '../declaration/UnitSelectionScreen';
import tokens from '../../styles/tokens';
import headerDay from '../../assets/Header_day.png';
import taxIndustryGroups from '../../data/taxIndustryGroups';
// BusinessType removed — not used in this screen

interface ProductDetailScreenProps {
  open: boolean;
  onClose: () => void;
  item: {
    id: string;
    code: string;
    name: string;
    unitPrice: number;
    unit?: string | { id?: string; name?: string };
    stock?: number;
    stockByWarehouse?: Record<string, number>;
    defaultWarehouse?: { id: string; name: string; code?: string };
    warehouse?: string;
    quantity?: number;
    discount?: number;
  };
  onSave: (updatedItem: {
    id: string;
    quantity: number;
    warehouse?: string;
    warehouseId?: string;
    unitPrice: number;
    discount: number;
    isTradeDiscount: boolean;
    hasLineItemDiscount: boolean;
    discountPercent?: number;
    discountAmount?: number;
    taxIndustry?: string;
    vatRate?: number;
    unit?: { id: string; name: string };
  }) => void;
}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ open, onClose, item, onSave }) => {
  const [quantity, setQuantity] = useState<number>(() => item.quantity || 1);
  const [selectedWarehouse, setSelectedWarehouse] = useState<{id: string; name: string} | null>(null);
  const [warehouseScreenOpen, setWarehouseScreenOpen] = useState(false);
  const [unitPrice, setUnitPrice] = useState<string>(() => String(item.unitPrice || 0));
  const [unit, setUnit] = useState<{ id: string; name: string } | null>(() => {
    if (typeof item.unit === 'object' && item.unit && ('id' in item.unit) && ('name' in item.unit)) {
      const u = item.unit as { id?: string; name?: string };
      if (u.id && u.name) return { id: u.id, name: u.name };
    }
    if (typeof item.unit === 'string') return { id: 'default', name: item.unit };
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
  
  const [exiting, setExiting] = useState(false);
  const ANIM_MS = 280;
  

  // Initialize from item and localStorage
  useEffect(() => {
    if (open) {
      // Defer state sync to next frame to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        setQuantity(item.quantity || 1);
        setUnitPrice(String(item.unitPrice || 0));

        // Initialize unit from item
        if (typeof item.unit === 'object' && item.unit && ('id' in item.unit || 'name' in item.unit)) {
          const u = item.unit as { id?: string; name?: string };
          if (u.id && u.name) setUnit({ id: u.id, name: u.name });
          else if (u.name) setUnit({ id: 'default', name: u.name });
        } else if (typeof item.unit === 'string') {
          setUnit({ id: 'default', name: item.unit });
        }
      });

      // Prefill tax industry from onboarding/currentTenant
      try {
        const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
        const currentTenant = JSON.parse(localStorage.getItem('currentTenant') || '{}');
        const acctSetup = onboardingData?.accountingSetup;
        const resolveTaxIndustry = (val: unknown) => {
          if (!val) return undefined;
          if (typeof val === 'string') return val;
          if (typeof val === 'object' && val !== null) {
            const maybe = val as { code?: string };
            if (maybe.code) return maybe.code;
          }
          return undefined;
        };
        const chosen = resolveTaxIndustry(acctSetup?.taxIndustryGroup) ||
                       resolveTaxIndustry(currentTenant?.accountingSetup?.taxIndustryGroup) ||
                       resolveTaxIndustry(currentTenant?.taxIndustryGroup);
        if (chosen) requestAnimationFrame(() => setTaxIndustry(chosen));
      } catch (err) { console.warn('Error parsing onboarding/currentTenant', err); }
    }
  }, [open, item]);

  // Initialize from item on open
  useEffect(() => {
    if (open && item.defaultWarehouse) {
      const w = item.defaultWarehouse as { id?: string; name?: string; code?: string };
      setSelectedWarehouse({ 
        id: String(w.id || ''), 
        name: String(w.name || w.code || '') 
      });
    }
  }, [open, item.defaultWarehouse]);

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

  if (hasLineItemDiscount) {
    if (discountPercent) {
      calculatedDiscountPercent = parseFloat(discountPercent) || 0;
      calculatedDiscountAmount = (subtotal * calculatedDiscountPercent) / 100;
    } else if (discountAmount) {
      calculatedDiscountAmount = parseFloat(discountAmount.replace(/,/g, '')) || 0;
      calculatedDiscountPercent = subtotal > 0 ? (calculatedDiscountAmount / subtotal) * 100 : 0;
    }
  }

  const total = subtotal - calculatedDiscountAmount;

  // Tax industry label
  const taxIndustryLabel = taxIndustry 
    ? taxIndustryGroups.find((g) => g.code === taxIndustry)?.name || taxIndustry
    : '';

  const handleClose = () => {
    if (exiting) return;
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      onClose();
    }, ANIM_MS);
  };

  const handleSave = () => {
    // Validate quantity vs stock (BR06)
    if (quantity > availableStock) {
      alert(`Số lượng không được vượt quá số lượng tồn kho (${availableStock})`);
      return;
    }

    // Validate discount percent not > 100% (CC07)
    if (hasLineItemDiscount && calculatedDiscountPercent > 100) {
      alert('Chiết khấu không được vượt quá 100%');
      return;
    }

    onSave({
      id: item.id,
      quantity,
      warehouse: selectedWarehouse?.name,
      warehouseId: selectedWarehouse?.id,
      unitPrice: parsedUnitPrice,
      discount: calculatedDiscountPercent,
      isTradeDiscount,
      hasLineItemDiscount,
      discountPercent: calculatedDiscountPercent,
      discountAmount: calculatedDiscountAmount,
      taxIndustry,
      vatRate,
      unit: unit || undefined,
    });

    handleClose();
  };

  // Determine whether Save should be enabled
  const canSave = (() => {
    if (quantity < 1) return false;
    if (parsedUnitPrice <= 0) return false;
    if (hasLineItemDiscount) {
      const hasPercent = discountPercent.trim() !== '';
      const hasAmount = discountAmount.trim() !== '';
      if (!hasPercent && !hasAmount) return false;
      if (calculatedDiscountPercent > 100) return false;
    }
    return true;
  })();

  if (!open) return null;

  

  const overlay = (
    <React.Fragment>
      <Box onClick={handleClose} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', zIndex: 11999 }} />

      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 12000,
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
        {/* Header - match other selection screens: header image + overlay (back, title, save) */}
        <Box sx={{ height: { xs: 160, sm: 120 }, width: '100%', backgroundImage: `url(${headerDay})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

        <Box sx={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 12002, px: { xs: 2, sm: 3 } }}>
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

        {/* Content (quantity + form) - placed inside a single scrollable container */}
        <Box sx={{ position: { xs: 'fixed', sm: 'relative' }, top: { xs: '100px', sm: 'auto' }, bottom: { xs: 0, sm: 'auto' }, left: 0, right: 0, px: 2, py: 2, pb: `calc(100px + env(safe-area-inset-bottom, 0px))`, overflowY: 'auto', bgcolor: 'transparent' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 'sm', mx: 'auto' }}>
            {/* Quantity box */}
            <Box sx={{ width: '100%', maxWidth: 560 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, borderRadius: '16px', border: '1px solid #FB7E00', bgcolor: 'rgba(254, 246, 232, 0.40)' }}>
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
                onClick={() => setUnitScreenOpen(true)}
                placeholder="Chọn đơn vị tính"
                readOnly
                endAdornmentIcon="ArrowRight2"
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
                  value={formatCurrency(String(total.toFixed(0)))}
                  disabled
                  sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#212529', fontWeight: 600 } }}
                />
              </Box>
            </Box>

            <Divider />

            {/* Trade Discount Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#212529' }}>
                Là hàng hóa chiết khấu thương mại
              </Typography>
              <Switch
                checked={isTradeDiscount}
                onChange={(e) => setIsTradeDiscount(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: tokens.colors.primary },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: tokens.colors.primary },
                }}
              />
            </Box>

            {/* Line Item Discount Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#212529' }}>
                Chiết khấu trên mặt hàng
              </Typography>
              <Switch
                checked={hasLineItemDiscount}
                onChange={(e) => {
                  setHasLineItemDiscount(e.target.checked);
                  if (!e.target.checked) {
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

            {/* Discount Fields (AC06) */}
            {hasLineItemDiscount && (
              <Box sx={{ display: 'flex', gap: 2, pl: 2 }}>
                <RoundedTextField
                  fullWidth
                  label="% Chiết khấu"
                  value={discountPercent}
                  onChange={(e) => {
                    setDiscountPercent(e.target.value);
                    setDiscountAmount(''); // Clear amount when percent changes
                  }}
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                />
                <RoundedTextField
                  fullWidth
                  label="Tiền chiết khấu"
                  value={discountAmount}
                  onChange={(e) => {
                    setDiscountAmount(formatCurrency(e.target.value));
                    setDiscountPercent(''); // Clear percent when amount changes
                  }}
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                />
              </Box>
            )}

            <Divider />

            {/* Tax Industry (AC07) */}
            <Box>
              <RoundedTextField
                fullWidth
                label="Nhóm ngành nghề tính thuế GTGT, TNCN"
                value={taxIndustryLabel}
                onClick={() => setTaxIndustryScreenOpen(true)}
                placeholder="Chọn nhóm ngành nghề"
                readOnly
                endAdornmentIcon="ArrowRight2"
                multiline
                rows={2}
              />
            </Box>

            {/* Footer placeholder to mirror sticky button area so it appears in the scroll flow */}
            <Box sx={{ p: 2, borderTop: '1px solid #F1F3F5' }}>
              <Box sx={{ maxWidth: 'sm', mx: 'auto' }}>
                <Box sx={{ width: '100%', height: 56, borderRadius: '16px', bgcolor: tokens.colors.primary, opacity: 0.08, pointerEvents: 'none' }} />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Sticky action bar (matches other forms) */}
        <Box sx={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 12003, px: 2, py: 2, pb: 'calc(16px + env(safe-area-inset-bottom, 0px))', bgcolor: '#fff', boxShadow: '0 -8px 16px rgba(0,0,0,0.06)' }}>
          <Box sx={{ maxWidth: 'sm', mx: 'auto' }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSave}
              disabled={!canSave || exiting}
              sx={{
                borderRadius: '100px',
                bgcolor: !canSave || exiting ? '#DEE2E6' : tokens.colors.primary,
                boxShadow: 'none',
                color: !canSave || exiting ? '#ADB5BD' : '#fff',
                textTransform: 'none',
                fontWeight: 500,
                height: 56,
                fontSize: '16px'
              }}
            >
              { /* Label changed to 'Lưu' to match UX */ }
              Lưu
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Warehouse Selection */}
      {warehouseScreenOpen && (
        <WarehouseSelectionScreen
          open={warehouseScreenOpen}
          onClose={() => setWarehouseScreenOpen(false)}
          onSelect={(warehouse) => {
            setSelectedWarehouse(warehouse);
            setWarehouseScreenOpen(false);
          }}
        />
      )}

      {/* Unit Selection */}
      {unitScreenOpen && (
        <UnitSelectionScreen
          open={unitScreenOpen}
          onClose={() => setUnitScreenOpen(false)}
          onSelect={(selectedUnit) => {
            setUnit(selectedUnit);
            setUnitScreenOpen(false);
          }}
        />
      )}

      {/* Tax Industry Selection */}
      {taxIndustryScreenOpen && (
        <TaxIndustrySelectionScreen
          open={taxIndustryScreenOpen}
          value={taxIndustry}
          onClose={() => setTaxIndustryScreenOpen(false)}
          onSelect={(code) => {
            setTaxIndustry(code);
            setTaxIndustryScreenOpen(false);
          }}
        />
      )}
    </React.Fragment>
  );

  if (typeof document !== 'undefined') {
    return createPortal(overlay, document.body);
  }
  return overlay;
};

export default ProductDetailScreen;
