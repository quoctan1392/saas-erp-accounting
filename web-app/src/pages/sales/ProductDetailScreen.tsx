import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Switch, Divider } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { createPortal } from 'react-dom';
import RoundedTextField from '../../components/RoundedTextField';
import NumberSpinner from '../../components/NumberSpinner';
// removed ProductCard usage to keep header composed of shared components
import WarehouseSelectionScreen from '../declaration/WarehouseSelectionScreen';
import TaxIndustrySelectionScreen from '../declaration/TaxIndustrySelectionScreen';
import UnitSelectionScreen from '../declaration/UnitSelectionScreen';
import tokens from '../../styles/tokens';
import taxIndustryGroups from '../../data/taxIndustryGroups';
import { BusinessType } from '../../types/onboarding';

interface ProductDetailScreenProps {
  open: boolean;
  onClose: () => void;
  item: {
    id: string;
    code: string;
    name: string;
    unitPrice: number;
    unit?: string | { id: string; name: string };
    stock?: number;
    stockByWarehouse?: Record<string, number>;
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
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [selectedWarehouse, setSelectedWarehouse] = useState<{ id: string; name: string } | null>(null);
  const [warehouseScreenOpen, setWarehouseScreenOpen] = useState(false);
  const [unitPrice, setUnitPrice] = useState(String(item.unitPrice || 0));
  const [unit, setUnit] = useState<{ id: string; name: string } | null>(null);
  const [unitScreenOpen, setUnitScreenOpen] = useState(false);
  
  // Discount toggles
  const [isTradeDiscount, setIsTradeDiscount] = useState(false);
  const [hasLineItemDiscount, setHasLineItemDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  
  // Tax industry
  const [taxIndustry, setTaxIndustry] = useState('');
  const [taxIndustryScreenOpen, setTaxIndustryScreenOpen] = useState(false);
  const [vatRate, setVatRate] = useState<number>(0);
  const [businessType, setBusinessType] = useState<keyof typeof BusinessType>(BusinessType.HOUSEHOLD_BUSINESS);
  
  const [exiting, setExiting] = useState(false);
  const ANIM_MS = 280;

  // Initialize from item and localStorage
  useEffect(() => {
    if (open) {
      setQuantity(item.quantity || 1);
      setUnitPrice(String(item.unitPrice || 0));
      
      // Initialize unit
      if (typeof item.unit === 'object' && item.unit) {
        setUnit(item.unit);
      } else if (typeof item.unit === 'string') {
        setUnit({ id: 'default', name: item.unit });
      }
      
      // Initialize warehouse if provided
      if (item.warehouse) {
        setSelectedWarehouse({ id: item.warehouse, name: item.warehouse });
      }

      // Get business type from localStorage
      try {
        const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
        const currentTenant = JSON.parse(localStorage.getItem('currentTenant') || '{}');
        if (onboardingData?.businessType) {
          setBusinessType(onboardingData.businessType);
        } else if (currentTenant?.businessType) {
          setBusinessType(currentTenant.businessType);
        }

        // Prefill tax industry
        const acctSetup = onboardingData?.accountingSetup;
        const resolveTaxIndustry = (val: any) => {
          if (!val) return undefined;
          if (typeof val === 'string') return val;
          if (typeof val === 'object' && val !== null) {
            if (val.code) return val.code;
          }
          return undefined;
        };
        const chosen = resolveTaxIndustry(acctSetup?.taxIndustryGroup) || 
                       resolveTaxIndustry(currentTenant?.accountingSetup?.taxIndustryGroup) ||
                       resolveTaxIndustry(currentTenant?.taxIndustryGroup);
        if (chosen) setTaxIndustry(chosen);
      } catch {}
    }
  }, [open, item]);

  // Calculate available stock at selected warehouse
  const availableStock = selectedWarehouse && item.stockByWarehouse
    ? item.stockByWarehouse[selectedWarehouse.name] || item.stockByWarehouse[selectedWarehouse.id] || item.stock || 0
    : item.stock || 0;

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

  if (!open) return null;

  const overlay = (
    <>
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
        {/* Header - use shared simple layout (thumbnail + title + code) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2, py: 2, borderBottom: `1px solid ${tokens.colors.surfaceContainer}` }}>
          <IconButton onClick={handleClose} sx={{ width: 40, height: 40 }}>
            <ArrowBack />
          </IconButton>
          <Typography sx={{ flex: 1, fontSize: 18, fontWeight: 600, color: '#212529' }}>
            {item.code}
          </Typography>
          <Typography
            sx={{ fontSize: 14, fontWeight: 500, color: tokens.colors.primary, cursor: 'pointer' }}
            onClick={handleSave}
          >
            Lưu
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Quantity */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2, borderRadius: '16px', border: '1px solid #FB7E00', bgcolor: '#FFF' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#6C757D', textAlign: 'center' }}>
                Số lượng
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <NumberSpinner
                  value={quantity}
                  size="lg"
                  onChange={(v) => setQuantity(Math.max(1, v))}
                />
              </Box>
            </Box>

            {/* Product Name */}
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#6C757D', mb: 1 }}>
                Tên sản phẩm
              </Typography>
              <RoundedTextField
                fullWidth
                value={item.name}
                disabled
                sx={{ '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#212529' } }}
              />
            </Box>

            {/* Unit */}
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#6C757D', mb: 1 }}>
                Đơn vị tính
              </Typography>
              <RoundedTextField
                fullWidth
                value={unit?.name || (typeof item.unit === 'string' ? item.unit : 'chiếc')}
                onClick={() => setUnitScreenOpen(true)}
                placeholder="Chọn đơn vị tính"
                readOnly
                endAdornmentIcon="ArrowRight2"
              />
            </Box>

            {/* Warehouse */}
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#6C757D', mb: 1 }}>
                Kho ngắm định
              </Typography>
              <RoundedTextField
                fullWidth
                value={selectedWarehouse?.name || ''}
                onClick={() => setWarehouseScreenOpen(true)}
                placeholder="Chọn kho"
                readOnly
                endAdornmentIcon="ArrowRight2"
                endAdornment={
                  selectedWarehouse ? (
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
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#6C757D', mb: 1 }}>
                  Đơn giá
                </Typography>
                <RoundedTextField
                  fullWidth
                  value={unitPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  type="text"
                  inputMode="numeric"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#6C757D', mb: 1 }}>
                  Thành tiền
                </Typography>
                <RoundedTextField
                  fullWidth
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
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#6C757D', mb: 1 }}>
                    % Chiết khấu
                  </Typography>
                  <RoundedTextField
                    fullWidth
                    value={discountPercent}
                    onChange={(e) => {
                      setDiscountPercent(e.target.value);
                      setDiscountAmount(''); // Clear amount when percent changes
                    }}
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#6C757D', mb: 1 }}>
                    Tiền chiết khấu
                  </Typography>
                  <RoundedTextField
                    fullWidth
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
              </Box>
            )}

            <Divider />

            {/* Tax Industry (AC07) */}
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#6C757D', mb: 1 }}>
                Nhóm ngành nghề tính thuế GTGT, TNCN
              </Typography>
              <RoundedTextField
                fullWidth
                value={taxIndustryLabel}
                onClick={() => setTaxIndustryScreenOpen(true)}
                placeholder="Chọn nhóm ngành nghề"
                readOnly
                endAdornmentIcon="ArrowRight2"
                multiline
                rows={2}
              />
            </Box>
          </Box>
        </Box>

        {/* Complete Button */}
        <Box sx={{ p: 2, borderTop: '1px solid #F1F3F5' }}>
          <Box
            onClick={handleSave}
            sx={{
              width: '100%',
              height: 56,
              borderRadius: '16px',
              bgcolor: tokens.colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': { bgcolor: tokens.colors.primaryHover },
            }}
          >
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#FFF' }}>
              Hoàn tất
            </Typography>
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
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(overlay, document.body);
  }
  return overlay;
};

export default ProductDetailScreen;
