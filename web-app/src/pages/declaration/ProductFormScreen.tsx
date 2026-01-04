// @ts-nocheck
import { Box, Container, Typography, Button, IconButton, Switch, InputAdornment, Snackbar, Alert, Radio, RadioGroup, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { BusinessType } from '../../types/onboarding';
import { useState, useEffect, useRef, useMemo } from 'react';
import { ROUTES } from '../../config/constants';
import { ArrowBack } from '@mui/icons-material';
import RoundedTextField from '../../components/RoundedTextField';
import BottomSheet from '../../components/BottomSheet';
import ConfirmDialog from '../../components/ConfirmDialog';
import SuccessSnackbar from '../../components/SuccessSnackbar';
import ProductGroupSelectionScreen from './ProductGroupSelectionScreen';
import UnitSelectionScreen from './UnitSelectionScreen';
import WarehouseSelectionScreen from './WarehouseSelectionScreen';
import TaxIndustrySelectionScreen from './TaxIndustrySelectionScreen';
import apiService from '../../services/api';
import taxIndustryGroups from '../../data/taxIndustryGroups';
import headerDay from '../../assets/Header_day.png';
import * as Iconsax from 'iconsax-react';

const Icon = ({ name, size = 24, color = 'currentColor', variant = 'Outline' }: any) => {
  const Comp = (Iconsax as any)[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} variant={variant} />;
};

const ProductFormScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  console.log('🔵 ProductFormScreen rendered, pathname:', location.pathname);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const ANIM_MS = 280;

  // Form state
  const [productType, setProductType] = useState('goods'); // goods, service, material, finished
  const [productTypeSheetOpen, setProductTypeSheetOpen] = useState(false);
  const PRODUCT_TYPE_OPTIONS = [
    { value: 'goods', label: 'Hàng hoá' },
    { value: 'service', label: 'Dịch vụ' },
    { value: 'material', label: 'Nguyên vật liệu' },
    { value: 'finished', label: 'Thành phẩm' },
  ];
  const [tempProductType, setTempProductType] = useState(productType);
  const productTypeLabel = PRODUCT_TYPE_OPTIONS.find((o) => o.value === productType)?.label || '';
  const dragStartYRef = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartYRef.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartYRef.current === null) return;
    const currentY = e.touches[0].clientY;
    const delta = Math.max(0, currentY - dragStartYRef.current);
    setDragOffset(delta);
  };
  const handleTouchEnd = () => {
    const threshold = 80;
    if (dragOffset > threshold) {
      setTempProductType(productType);
      setProductTypeSheetOpen(false);
    }
    setDragOffset(0);
    dragStartYRef.current = null;
  };
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [productGroup, setProductGroup] = useState('');
  const [productGroupScreenOpen, setProductGroupScreenOpen] = useState(false);
  const [unit, setUnit] = useState('');
  const [unitScreenOpen, setUnitScreenOpen] = useState(false);
  const [unitActive, setUnitActive] = useState(true);
  const [warehouseScreenOpen, setWarehouseScreenOpen] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [defaultWarehouse, setDefaultWarehouse] = useState('');
  const [initialStock, setInitialStock] = useState('0');
  const [allowNegative, setAllowNegative] = useState(false);
  const [snackNegativeOpen, setSnackNegativeOpen] = useState(false);
  const [snackImageSizeOpen, setSnackImageSizeOpen] = useState(false);
  
  // Tax fields
  const [purchaseVAT, setPurchaseVAT] = useState('');
  const [saleVAT, setSaleVAT] = useState('');
  const [businessType, setBusinessType] = useState<keyof typeof BusinessType>(BusinessType.HOUSEHOLD_BUSINESS);
  const [taxIndustry, setTaxIndustry] = useState('');
  const [taxIndustryScreenOpen, setTaxIndustryScreenOpen] = useState(false);
  const [imageSelectionSheetOpen, setImageSelectionSheetOpen] = useState(false);
  const taxIndustryLabel = useMemo(() => {
    if (!taxIndustry) return '';
    const found = taxIndustryGroups.find((g) => g.code === taxIndustry);
    return found ? `${found.code} — ${found.name}` : taxIndustry;
  }, [taxIndustry]);

  const handleOpenTaxIndustry = () => {
    setTaxIndustryScreenOpen(true);
  };
  
  // Image upload
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [barcode, setBarcode] = useState('');

  // Auto-generate product code on mount
  useEffect(() => {
    const fetchNextCode = async () => {
      try {
        const nextCode = await apiService.getNextItemCode();
        setCode(nextCode);
      } catch (error) {
        console.error('Error fetching next product code:', error);
        // Fallback to localStorage
        const lastProductNumber = parseInt(localStorage.getItem('lastProductNumber') || '0', 10);
        const nextNumber = lastProductNumber + 1;
        setCode(`VT${nextNumber.toString().padStart(5, '0')}`);
      }
    };

    fetchNextCode();
    // derive business type from onboarding/current tenant stored choice
    try {
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      if (onboardingData && onboardingData.businessType) {
        setBusinessType(onboardingData.businessType);
      } else {
        const currentTenant = JSON.parse(localStorage.getItem('currentTenant') || '{}');
        if (currentTenant && currentTenant.businessType) setBusinessType(currentTenant.businessType);
      }
    } catch (err) {
      // ignore parse errors and keep default
    }
  }, []);

  // Reset all overlay states when route changes (fix stale state issue)
  useEffect(() => {
    console.log('🟢 Resetting overlay states for pathname:', location.pathname);
    setProductTypeSheetOpen(false);
    setProductGroupScreenOpen(false);
    setUnitScreenOpen(false);
    setWarehouseScreenOpen(false);
    // If a warehouse was created via the create page, apply it then clear state
    if (location.state?.selectedWarehouse) {
      setDefaultWarehouse(location.state.selectedWarehouse);
      setHasChanges(true);
      // clear navigation state so it doesn't reapply
      navigate(location.pathname, { replace: true, state: {} });
    }

    // If navigation requested to re-open the warehouse selection overlay, do it now
    if (location.state?.openWarehouseSelection) {
      setWarehouseScreenOpen(true);
      // clear navigation state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname]);

  const handleScanBarcode = () => {
    // Simple simulation for scanning: prompt the user to enter a barcode.
    const scanned = window.prompt('Scan barcode (paste or type value)') || '';
    if (scanned) {
      setBarcode(scanned);
      setHasChanges(true);
    }
  };

  const handleFieldChange = (setter: any) => (value: any) => {
    setHasChanges(true);
    setter(value);
  };

  const handleBack = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      setExiting(true);
      setTimeout(() => navigate(ROUTES.DECLARATION_CATEGORIES), ANIM_MS);
    }
  };

  const handleConfirmLeave = () => {
    setShowConfirmDialog(false);
    setExiting(true);
    setTimeout(() => navigate(ROUTES.DECLARATION_CATEGORIES), ANIM_MS);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSnackImageSizeOpen(true);
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setHasChanges(true);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setHasChanges(true);
  };

  const formatCurrency = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handlePriceChange = (setter: any) => (e: any) => {
    const formatted = formatCurrency(e.target.value);
    handleFieldChange(setter)(formatted);
  };

  const handleAllowNegativeChange = (checked: boolean) => {
    handleFieldChange(setAllowNegative)(checked);
    if (checked) {
      setSnackNegativeOpen(true);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const effectivePurchaseVAT = businessType === BusinessType.PRIVATE_ENTERPRISE ? saleVAT : purchaseVAT;
      const effectiveSaleVAT = businessType === BusinessType.PRIVATE_ENTERPRISE ? saleVAT : '';

      // Map to backend CreateItemDto
      const itemData: any = {
        code,
        name,
        type: productType, // goods, service, material, finished
        unitId: unit || 'default-unit-id', // TODO: Get actual unit ID from selection
        sellPrice: parseFloat(salePrice.replace(/,/g, '')) || 0,
        purchasePrice: parseFloat(purchasePrice.replace(/,/g, '')) || 0,
        exportTaxRate: parseFloat(effectiveSaleVAT || '0') || 0,
        importTaxRate: parseFloat(effectivePurchaseVAT || '0') || 0,
        minimumStock: parseFloat(initialStock.replace(/,/g, '')) || 0,
        isActive: true,
        // Optional fields
        listItemCategoryId: productGroup ? [productGroup] : undefined,
      };

      console.log('Saving item with data:', itemData);
      const result = await apiService.createItem(itemData);
      console.log('Item saved successfully:', result);

      setShowSuccessSnackbar(true);
      setHasChanges(false);
      setTimeout(() => navigate(ROUTES.DECLARATION_CATEGORIES), 1500);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Không thể lưu hàng hoá. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndAddNew = async () => {
    setIsLoading(true);
    try {
      const effectivePurchaseVAT = businessType === BusinessType.PRIVATE_ENTERPRISE ? saleVAT : purchaseVAT;
      const effectiveSaleVAT = businessType === BusinessType.PRIVATE_ENTERPRISE ? saleVAT : '';

      // Map to backend CreateItemDto
      const itemData: any = {
        code,
        name,
        type: productType,
        unitId: unit || 'default-unit-id',
        sellPrice: parseFloat(salePrice.replace(/,/g, '')) || 0,
        purchasePrice: parseFloat(purchasePrice.replace(/,/g, '')) || 0,
        exportTaxRate: parseFloat(effectiveSaleVAT || '0') || 0,
        importTaxRate: parseFloat(effectivePurchaseVAT || '0') || 0,
        minimumStock: parseFloat(initialStock.replace(/,/g, '')) || 0,
        isActive: true,
        listItemCategoryId: productGroup ? [productGroup] : undefined,
      };

      console.log('Saving item with data:', itemData);
      const result = await apiService.createItem(itemData);
      console.log('Item saved successfully:', result);

      setShowSuccessSnackbar(true);

      // Save the product number to localStorage for sequential numbering (fallback)
      const currentNumber = parseInt(code.replace('VT', ''), 10);
      localStorage.setItem('lastProductNumber', currentNumber.toString());

      // Reset form and fetch new product code from API
      try {
        const nextCode = await apiService.getNextItemCode();
        setCode(nextCode);
      } catch (error) {
        console.error('Error fetching next product code:', error);
        // Fallback to localStorage
        const lastProductNumber = parseInt(localStorage.getItem('lastProductNumber') || '0', 10);
        const nextNumber = lastProductNumber + 1;
        setCode(`VT${nextNumber.toString().padStart(5, '0')}`);
      }
      setProductType('goods');
      setName('');
      setProductGroup('');
      setUnit('');
      setSalePrice('');
      setPurchasePrice('');
      setDefaultWarehouse('');
      setInitialStock('0');
      setAllowNegative(false);
      setPurchaseVAT('');
      setSaleVAT('');
      setBusinessType(BusinessType.HOUSEHOLD_BUSINESS);
      setTaxIndustry('');
      setImagePreview(null);
      setImageFile(null);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Không thể lưu hàng hoá. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (!(code && name && unit && productType)) return false;
    if (businessType === BusinessType.HOUSEHOLD_BUSINESS) {
      return purchaseVAT !== '' && taxIndustry !== '';
    }
    // doanh nghiệp tư nhân
    return saleVAT !== '';
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        pt: 0,
        transform: exiting ? 'translateX(100%)' : 'translateX(0)',
        transition: `transform ${ANIM_MS}ms ease`,
      }}
    >
      {/* Top decorative image */}
      <Box sx={{ height: { xs: 160, sm: 120 }, width: '100%', backgroundImage: `url(${headerDay})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

      {/* Fixed header */}
      <Box sx={{ position: 'fixed', top: 36, left: 0, right: 0, zIndex: 20, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 'sm', mx: 'auto', py: 0.5 }}>
          <IconButton
            onClick={handleBack}
            sx={{ position: 'absolute', left: 0, top: 6, width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}
          >
            <ArrowBack />
          </IconButton>

          <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
            <Typography sx={{ color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '20px', fontStyle: 'normal', fontWeight: 500 }}>Thêm hàng hoá/dịch vụ</Typography>
          </Box>

        </Box>
      </Box>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, pt: { xs: '120px', sm: '96px' }, pb: 2 }}>
        <Box
          sx={{
            borderRadius: {
              xs: '16px 16px 0 0',
              sm: '16px',
            },
            px: 1,
            py: { xs: 2, sm: 6 },
            pb: { xs: `calc(100px + env(safe-area-inset-bottom, 0px))`, sm: 6 },
            position: { xs: 'fixed', sm: 'relative' },
            top: { xs: '100px', sm: 'auto' },
            bottom: { xs: 0, sm: 'auto' },
            left: '16px',
            right: '16px',
            maxWidth: 'calc(100% - 32px)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: { xs: 'auto', sm: 'visible' },
          }}
        >
          {/* Form Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Image Upload Section */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '12px',
                  border: '2px dashed #DEE2E6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'visible',
                  bgcolor: '#F8F9FA',
                  '&:hover': {
                    borderColor: '#FB7E00',
                  },
                }}
                onClick={() => !imagePreview && document.getElementById('image-upload')?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                ) : (
                  <Icon name="Gallery" size={32} color="#ADB5BD" variant="Outline" />
                )}
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageSelectionSheetOpen(true);
                  }}
                  sx={{
                    position: 'absolute',
                    bottom: -16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 40,
                    height: 40,
                    bgcolor: '#FB7E00',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: '#E65A2E',
                    },
                  }}
                >
                  <Icon name="Camera" size={20} color="#fff" variant="Outline" />
                </IconButton>
              </Box>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </Box>

            {/* Product info section */}
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#212529' }}>Thông tin chung</Typography>

            {/* Barcode field */}
            <RoundedTextField
              fullWidth
              label="Barcode"
              placeholder="Quét hoặc nhập barcode"
              value={barcode}
              onChange={(e) => handleFieldChange(setBarcode)(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleScanBarcode}>
                      <Icon name="ScanBarcode" size={20} color="#FB7E00" variant="Outline" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Row: Tính chất + Mã sản phẩm */}
            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'row', flexWrap: 'nowrap' }}>
              <Box sx={{ flex: '1 1 50%', minWidth: 0 }}>
                <RoundedTextField
                  fullWidth
                  required
                  label="Tính chất"
                  placeholder="Chọn tính chất"
                  value={productTypeLabel}
                  onClick={() => { setTempProductType(productType); setProductTypeSheetOpen(true); }}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Icon name="ArrowDown2" size={18} color="#6C757D" variant="Outline" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ flex: '1 1 50%', minWidth: 0 }}>
                <RoundedTextField
                  fullWidth
                  required
                  label="Mã sản phẩm"
                  placeholder="Nhập mã sản phẩm"
                  value={code}
                  onChange={(e) => handleFieldChange(setCode)(e.target.value)}
                />
              </Box>
            </Box>

            {/* Product Name */}
            <RoundedTextField
              fullWidth
              required
              label="Tên hàng hoá"
              placeholder="Nhập tên hàng hoá"
              value={name}
              onChange={(e) => handleFieldChange(setName)(e.target.value)}
            />

            {/* Product Group */}
            <RoundedTextField
              fullWidth
              label="Nhóm hàng hoá dịch vụ"
              placeholder="Chọn nhóm hàng hoá"
              value={productGroup}
              onClick={() => setProductGroupScreenOpen(true)}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setProductGroupScreenOpen(true);
                      }}
                    >
                      <Icon name="ArrowDown2" size={20} color="#4E4E4E" variant="Outline" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {/* Unit */}
            <RoundedTextField
              fullWidth
              required
              label="Đơn vị tính chính"
              placeholder="Chọn đơn vị tính"
              value={unit}
              onClick={() => setUnitScreenOpen(true)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setUnitScreenOpen(true)}
                    >
                      <Icon name="ArrowDown2" size={20} color="#4E4E4E" variant="Outline" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Đang sử dụng (unit active) */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0 }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#212529' }}>
                Đang sử dụng
              </Typography>
              <Switch
                checked={unitActive}
                onChange={(e) => {
                  handleFieldChange(setUnitActive)(e.target.checked);
                }}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#FB7E00',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#FB7E00',
                  },
                }}
              />
            </Box>

            {/* Giá & tồn kho */}
            <Box>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 2, color: '#212529' }}>
                Giá & tồn kho
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'row', alignItems: 'stretch' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <RoundedTextField
                      fullWidth
                      label="Đơn giá bán"
                      placeholder="0"
                      value={salePrice}
                      onChange={handlePriceChange(setSalePrice)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                      }}
                    />
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <RoundedTextField
                      fullWidth
                      label="Đơn giá mua"
                      placeholder="0"
                      value={purchasePrice}
                      onChange={handlePriceChange(setPurchasePrice)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                      }}
                    />
                  </Box>
                </Box>

                <RoundedTextField
                  fullWidth
                  label="Kho ngầm định"
                  placeholder="Chọn kho"
                  value={defaultWarehouse}
                  onClick={() => setWarehouseScreenOpen(true)}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setWarehouseScreenOpen(true)}>
                          <Icon name="ArrowDown2" size={20} color="#4E4E4E" variant="Outline" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <RoundedTextField
                  fullWidth
                  label="Tồn kho ban đầu"
                  placeholder="0"
                  value={initialStock}
                  onChange={handlePriceChange(setInitialStock)}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0 }}>
                  <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#212529' }}>
                    Cho phép bán hàng âm
                  </Typography>
                  <Switch
                    checked={allowNegative}
                    onChange={(_, checked) => handleAllowNegativeChange(checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#FB7E00',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#FB7E00',
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Warning for negative stock is shown as a floating snackbar instead of inline */}

            {/* Tax Section */}
            <Box>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 2, color: '#212529' }}>
                Thuế
              </Typography>

              {businessType === BusinessType.HOUSEHOLD_BUSINESS ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <RoundedTextField
                      fullWidth
                      label="Thuế GTGT mua vào (%)"
                      placeholder="Chọn thuế GTGT"
                      value={purchaseVAT}
                      onChange={(e) => handleFieldChange(setPurchaseVAT)(e.target.value)}
                      select
                      SelectProps={{ native: true }}
                      InputProps={{
                      }}
                    >
                      <option value="">Chọn thuế GTGT</option>
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="8">8%</option>
                      <option value="10">10%</option>
                    </RoundedTextField>
                  </Box>

                  <RoundedTextField
                    fullWidth
                    label="Nhóm ngành nghề tính thuế"
                    placeholder="Chọn nhóm ngành nghề"
                    value={taxIndustryLabel}
                    onClick={handleOpenTaxIndustry}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={handleOpenTaxIndustry}>
                            <Icon name="ArrowDown2" size={20} color="#4E4E4E" variant="Outline" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </>
              ) : (
                <Box sx={{ mb: 2 }}>
                  <RoundedTextField
                    fullWidth
                    label="Thuế GTGT (%)"
                    placeholder="Chọn thuế GTGT"
                    value={saleVAT}
                    onChange={(e) => handleFieldChange(setSaleVAT)(e.target.value)}
                    select
                    SelectProps={{ native: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon name="ReceiptDiscount" size={20} color="#6C757D" variant="Outline" />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <option value="">Chọn thuế GTGT</option>
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="8">8%</option>
                    <option value="10">10%</option>
                  </RoundedTextField>
                </Box>
              )}
            </Box>
          </Box>

          {/* Desktop buttons (hidden because sticky footer is used for all sizes) */}
          <Box sx={{ display: { xs: 'none', sm: 'none' }, gap: 2, mt: 4, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleSave}
              disabled={!isFormValid() || isLoading}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 500,
                borderColor: '#FB7E00',
                color: '#FB7E00',
                px: 4,
                py: 1.5,
                minWidth: 120,
                '&:hover': {
                  borderColor: '#E65A2E',
                  bgcolor: '#FFF4E6',
                },
                '&.Mui-disabled': {
                  borderColor: '#DEE2E6',
                  color: '#ADB5BD',
                },
              }}
            >
              Lưu
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveAndAddNew}
              disabled={!isFormValid() || isLoading}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: '#007DFB',
                color: 'white',
                px: 4,
                py: 1.5,
                minWidth: 120,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#0056b3',
                  boxShadow: 'none',
                },
                '&.Mui-disabled': {
                  bgcolor: '#DEE2E6',
                  color: '#ADB5BD',
                },
              }}
            >
              Lưu và thêm mới
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Mobile sticky footer */}
      <Box
        sx={{
          display: productTypeSheetOpen || productGroupScreenOpen || unitScreenOpen || warehouseScreenOpen || taxIndustryScreenOpen || imageSelectionSheetOpen ? 'none' : { xs: 'flex', sm: 'none' },
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1400,
          gap: 1.5,
          px: 2,
          py: 2,
          pb: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          bgcolor: '#ffffff',
          boxShadow: '0 -8px 16px rgba(0,0,0,0.12)',
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          onClick={handleSave}
          disabled={!isFormValid() || isLoading}
          sx={{
            flex: 1,
            borderRadius: '100px',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '16px',
            borderColor: '#C5C5C5',
            bgcolor: '#F5F5F5',
            color: '#090909',
            height: 56,
            '&:hover': {
              borderColor: '#E65A2E',
              bgcolor: '#FFF',
            },
          }}
        >
          Lưu
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSaveAndAddNew}
          disabled={!isFormValid() || isLoading}
          sx={{
            flex: 1,
            borderRadius: '100px',
            fontSize: '16px',
            textTransform: 'none',
            fontWeight: 500,
            bgcolor: '#FB7E00',
            color: 'white',
            height: 56,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#FB7E00',
              boxShadow: 'none',
            },
          }}
        >
          Lưu và thêm mới
        </Button>
      </Box>

      {/* Product Type BottomSheet (radio list + confirm) */}
      <Snackbar
        open={snackImageSizeOpen}
        autoHideDuration={3000}
        onClose={() => setSnackImageSizeOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: '84px' }}
      >
        <Alert severity="error" onClose={() => setSnackImageSizeOpen(false)} sx={{ borderRadius: '12px' }}>
          Kích thước ảnh không được vượt quá 5MB
        </Alert>
      </Snackbar>
      <Snackbar
        open={snackNegativeOpen}
        autoHideDuration={2400}
        onClose={() => setSnackNegativeOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: '84px' }}
      >
        <Alert severity="warning" onClose={() => setSnackNegativeOpen(false)} sx={{ borderRadius: '12px' }}>
          Tồn kho có thể bị âm nếu bật tính năng này
        </Alert>
      </Snackbar>
      <BottomSheet
        open={productTypeSheetOpen}
        onClose={() => {
          setTempProductType(productType);
          setProductTypeSheetOpen(false);
        }}
        title="Chọn tính chất"
        zIndexBase={9999}
        hideClose
      >
        <Box onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} sx={{ px: 0 }}>
          <RadioGroup value={tempProductType} onChange={(e) => setTempProductType(e.target.value)} sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {PRODUCT_TYPE_OPTIONS.map((opt, idx, arr) => (
              <Box key={opt.value}>
                <Box
                  onClick={() => {
                    setProductType(opt.value);
                    setHasChanges(true);
                    setProductTypeSheetOpen(false);
                  }}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.75, px: 0, cursor: 'pointer' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Radio value={opt.value} sx={{ '&.Mui-checked': { color: '#FB7E00' }, p: 0 }} />
                    <Typography sx={{ fontSize: 16, color: '#090909' }}>{opt.label}</Typography>
                  </Box>
                </Box>
                {idx < arr.length - 1 && <Divider sx={{ borderColor: '#F1F3F5' }} />}
              </Box>
            ))}
          </RadioGroup>
        </Box>
      </BottomSheet>
      <ProductGroupSelectionScreen
        open={productGroupScreenOpen}
        onClose={() => setProductGroupScreenOpen(false)}
        onSelect={(label) => {
          setProductGroup(label);
          setHasChanges(true);
        }}
      />
      <UnitSelectionScreen
        open={unitScreenOpen}
        onClose={() => setUnitScreenOpen(false)}
        onSelect={(label) => {
          setUnit(label);
          setHasChanges(true);
          setUnitScreenOpen(false);
        }}
      />
      <WarehouseSelectionScreen
        open={warehouseScreenOpen}
        onClose={() => setWarehouseScreenOpen(false)}
        onSelect={(label) => {
          setDefaultWarehouse(label);
          setHasChanges(true);
        }}
      />
      <TaxIndustrySelectionScreen
        open={taxIndustryScreenOpen}
        value={taxIndustry}
        onClose={() => setTaxIndustryScreenOpen(false)}
        onSelect={(code) => {
          setTaxIndustry(code);
          setHasChanges(true);
          setTaxIndustryScreenOpen(false);
        }}
      />
      <BottomSheet
        open={imageSelectionSheetOpen}
        onClose={() => setImageSelectionSheetOpen(false)}
        title="Chọn ảnh sản phẩm"
        zIndexBase={9999}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <Box
            onClick={() => {
              setImageSelectionSheetOpen(false);
              // Trigger camera (on mobile devices, this will open camera if available)
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.capture = 'environment';
              input.onchange = (e: any) => {
                const file = e.target?.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    setSnackImageSizeOpen(true);
                    return;
                  }
                  setImageFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setImagePreview(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                  setHasChanges(true);
                }
              };
              input.click();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              py: 2,
              px: 0,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#F8F9FA',
              },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                bgcolor: '#FFF4E6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="Camera" size={20} color="#FB7E00" variant="Outline" />
            </Box>
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#212529' }}>
              Chụp ảnh
            </Typography>
          </Box>
          <Divider sx={{ borderColor: '#F1F3F5' }} />
          <Box
            onClick={() => {
              setImageSelectionSheetOpen(false);
              document.getElementById('image-upload')?.click();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              py: 2,
              px: 0,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: '#F8F9FA',
              },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                bgcolor: '#E7F5FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="Gallery" size={20} color="#007DFB" variant="Outline" />
            </Box>
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#212529' }}>
              Chọn ảnh từ thư viện
            </Typography>
          </Box>
          {imagePreview && (
            <>
              <Divider sx={{ borderColor: '#F1F3F5' }} />
              <Box
                onClick={() => {
                  handleRemoveImage();
                  setImageSelectionSheetOpen(false);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 2,
                  px: 0,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#FFF5F5',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '8px',
                    bgcolor: '#FFE5E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="Trash" size={20} color="#DC3545" variant="Outline" />
                </Box>
                <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#DC3545' }}>
                  Xoá ảnh
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </BottomSheet>
      <ConfirmDialog
        open={showConfirmDialog}
        title="Thay đổi chưa được lưu"
        description="Bạn có muốn lưu thay đổi trước khi rời khỏi trang?"
        cancelText="Hủy thay đổi"
        confirmText="Lưu"
        onCancel={handleConfirmLeave}
        onConfirm={async () => {
          await handleSave();
          setShowConfirmDialog(false);
        }}
      />

      {/* Success Snackbar */}
      <SuccessSnackbar
        open={showSuccessSnackbar}
        message="Thêm sản phẩm mới thành công"
        onClose={() => setShowSuccessSnackbar(false)}
      />
    </Box>
  );
};

export default ProductFormScreen;
