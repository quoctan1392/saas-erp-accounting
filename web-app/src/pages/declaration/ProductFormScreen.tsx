// @ts-nocheck
import { Box, Container, Typography, Button, IconButton, Switch, InputAdornment, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ROUTES } from '../../config/constants';
import { ArrowBack } from '@mui/icons-material';
import RoundedTextField from '../../components/RoundedTextField';
import ConfirmDialog from '../../components/ConfirmDialog';
import apiService from '../../services/api';
import headerDay from '../../assets/Header_day.png';
import * as Iconsax from 'iconsax-react';

const Icon = ({ name, size = 24, color = 'currentColor', variant = 'Outline' }: any) => {
  const Comp = (Iconsax as any)[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} variant={variant} />;
};

const ProductFormScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [productType, setProductType] = useState('goods'); // goods, service, material, finished
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [productGroup, setProductGroup] = useState('');
  const [unit, setUnit] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [defaultWarehouse, setDefaultWarehouse] = useState('');
  const [initialStock, setInitialStock] = useState('0');
  const [allowNegative, setAllowNegative] = useState(false);
  const [showNegativeWarning, setShowNegativeWarning] = useState(false);
  
  // Tax fields
  const [purchaseVAT, setPurchaseVAT] = useState('');
  const [saleVAT, setSaleVAT] = useState('');
  const [taxIndustry, setTaxIndustry] = useState('');
  
  // Image upload
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [barcode, setBarcode] = useState('');

  // Auto-generate product code on mount
  useEffect(() => {
    const generateProductCode = () => {
      const lastProductNumber = parseInt(localStorage.getItem('lastProductNumber') || '0', 10);
      const nextNumber = lastProductNumber + 1;
      return `VT${nextNumber.toString().padStart(5, '0')}`;
    };

    setCode(generateProductCode());
  }, []);

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
      navigate(ROUTES.DECLARATION_CATEGORIES);
    }
  };

  const handleConfirmLeave = () => {
    setShowConfirmDialog(false);
    navigate(ROUTES.DECLARATION_CATEGORIES);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB');
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
      setShowNegativeWarning(true);
      setTimeout(() => setShowNegativeWarning(false), 5000);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to create product
      const productData = {
        productType,
        code,
        name,
        productGroup,
        unit,
        salePrice: salePrice.replace(/,/g, ''),
        purchasePrice: purchasePrice.replace(/,/g, ''),
        defaultWarehouse,
        initialStock: initialStock.replace(/,/g, ''),
        allowNegative,
        purchaseVAT,
        saleVAT,
        taxIndustry,
      };

      console.log('Product saved successfully:', productData);
      setHasChanges(false);
      navigate(ROUTES.DECLARATION_CATEGORIES);
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
      const productData = {
        productType,
        code,
        name,
        productGroup,
        unit,
        salePrice: salePrice.replace(/,/g, ''),
        purchasePrice: purchasePrice.replace(/,/g, ''),
        defaultWarehouse,
        initialStock: initialStock.replace(/,/g, ''),
        allowNegative,
        purchaseVAT,
        saleVAT,
        taxIndustry,
      };

      console.log('Product saved successfully:', productData);

      // Save the product number to localStorage for sequential numbering
      const currentNumber = parseInt(code.replace('VT', ''), 10);
      localStorage.setItem('lastProductNumber', currentNumber.toString());

      // Reset form and generate new product code
      const generateProductCode = () => {
        const lastProductNumber = parseInt(localStorage.getItem('lastProductNumber') || '0', 10);
        const nextNumber = lastProductNumber + 1;
        return `VT${nextNumber.toString().padStart(5, '0')}`;
      };

      setCode(generateProductCode());
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
    return code && name && unit && productType;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        pt: 0,
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

          {/* (Barcode scan removed from header) */}
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
                  overflow: 'hidden',
                  bgcolor: '#F8F9FA',
                  '&:hover': {
                    borderColor: '#FB7E00',
                  },
                }}
                onClick={() => !imagePreview && document.getElementById('image-upload')?.click()}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        display: 'flex',
                        gap: 0.5,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById('image-upload')?.click();
                        }}
                        sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}
                      >
                        <Icon name="Edit" size={16} color="#FB7E00" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                        sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}
                      >
                        <Icon name="Trash" size={16} color="#DC3545" />
                      </IconButton>
                    </Box>
                  </>
                ) : (
                  <Icon name="Gallery" size={32} color="#ADB5BD" variant="Outline" />
                )}
              </Box>
              <input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </Box>

            {/* Product info section */}
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#212529' }}>Thông tin chung</Typography>

            {/* Barcode field (placed before other basic info) */}
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
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <RoundedTextField
                  fullWidth
                  required
                  label="Tính chất"
                  placeholder="Chọn tính chất"
                  value={productType}
                  onChange={(e) => handleFieldChange(setProductType)(e.target.value)}
                  select
                  SelectProps={{ native: true }}
                >
                  <option value="goods">Hàng hoá</option>
                  <option value="service">Dịch vụ</option>
                  <option value="material">Nguyên vật liệu</option>
                  <option value="finished">Thành phẩm</option>
                </RoundedTextField>
              </Box>

              <Box sx={{ flex: 1 }}>
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
              onChange={(e) => handleFieldChange(setProductGroup)(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        // TODO: Open add product group dialog
                        console.log('Add product group');
                      }}
                    >
                      <Icon name="Add" size={20} color="#FB7E00" variant="Outline" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Unit */}
            <RoundedTextField
              fullWidth
              required
              label="Đơn vị tính chính"
              placeholder="Chọn đơn vị tính"
              value={unit}
              onChange={(e) => handleFieldChange(setUnit)(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        // TODO: Open add unit dialog
                        console.log('Add unit');
                      }}
                    >
                      <Icon name="Add" size={20} color="#FB7E00" variant="Outline" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Sale Price */}
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

            {/* Purchase Price */}
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

            {/* Default Warehouse */}
            <RoundedTextField
              fullWidth
              label="Kho ngầm định"
              placeholder="Chọn kho"
              value={defaultWarehouse}
              onChange={(e) => handleFieldChange(setDefaultWarehouse)(e.target.value)}
            />

            {/* Initial Stock */}
            <RoundedTextField
              fullWidth
              label="Tồn kho ban đầu"
              placeholder="0"
              value={initialStock}
              onChange={handlePriceChange(setInitialStock)}
            />

            {/* Allow Negative Stock */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0 }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#212529' }}>
                Cho phép bán hàng âm
              </Typography>
              <Switch
                checked={allowNegative}
                onChange={(e) => handleAllowNegativeChange(e.target.checked)}
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

            {/* Warning for negative stock */}
            {showNegativeWarning && (
              <Alert
                severity="warning"
                icon={<Icon name="Warning2" size={20} color="#FFA500" variant="Outline" />}
                sx={{ borderRadius: '12px' }}
              >
                Lưu ý: Tồn kho có thể bị âm nếu bật tính năng này
              </Alert>
            )}

            {/* Tax Section */}
            <Box>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 2, color: '#212529' }}>
                Thuế
              </Typography>

              {/* Purchase VAT */}
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

              {/* Sale VAT */}
              <Box sx={{ mb: 2 }}>
                <RoundedTextField
                  fullWidth
                  label="Thuế GTGT bán ra (%)"
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

              {/* Tax Industry */}
              <RoundedTextField
                fullWidth
                label="Nhóm ngành nghề tính thuế"
                placeholder="Chọn nhóm ngành nghề"
                value={taxIndustry}
                onChange={(e) => handleFieldChange(setTaxIndustry)(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Icon name="Briefcase" size={20} color="#6C757D" variant="Outline" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          {/* Desktop buttons */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, mt: 4, justifyContent: 'flex-end' }}>
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
          display: { xs: 'flex', sm: 'none' },
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        title="Thay đổi chưa được lưu"
        description="Bạn có muốn lưu thay đổi trước khi rời khỏi trang?"
        cancelText="Hủy bỏ thay đổi"
        confirmText="Lưu"
        onCancel={handleConfirmLeave}
        onConfirm={async () => {
          await handleSave();
          setShowConfirmDialog(false);
        }}
      />
    </Box>
  );
};

export default ProductFormScreen;
