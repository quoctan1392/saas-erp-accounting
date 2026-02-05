import React, { useState } from 'react';
import { Box, Typography, Drawer, IconButton } from '@mui/material';
import * as Iconsax from 'iconsax-react';
import ProductCard from './ProductCard';
import tokens from '../styles/tokens';

interface ProductConfig {
  id: string;
  itemId: string;
  name: string;
  code?: string;
  image?: string;
  unitPrice: number;
  unit?: string | { name?: string };
  quantity: number;
  warehouse?: string;
  discount?: number;
  discountAmount?: number;
  isTradeDiscount?: boolean;
  taxIndustry?: string;
  vatRate?: number;
  // Additional config fields to identify unique configs
  configKey?: string; // unique key for this config combination
}

interface ConfigChoiceBottomSheetProps {
  open: boolean;
  onClose: () => void;
  initialConfigs: ProductConfig[]; // Array of existing product configs
  onConfigsChange: (configs: ProductConfig[]) => void;
  onAddMore: () => void; // Callback when user clicks "Chọn thêm"
}

const ConfigChoiceBottomSheet: React.FC<ConfigChoiceBottomSheetProps> = ({
  open,
  onClose,
  initialConfigs,
  onConfigsChange,
  onAddMore,
}) => {
  const [configs, setConfigs] = useState<ProductConfig[]>(initialConfigs);

  // Update configs when initialConfigs change
  React.useEffect(() => {
    console.log('[ConfigChoiceBottomSheet] Received initialConfigs:', initialConfigs);
    setConfigs(initialConfigs);
  }, [initialConfigs]);

  const handleQuantityChange = (configId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove config if quantity is 0
      const updated = configs.filter(c => c.id !== configId);
      setConfigs(updated);
      onConfigsChange(updated);
      // Close bottom sheet if no configs left
      if (updated.length === 0) {
        onClose();
      }
    } else {
      const updated = configs.map(c =>
        c.id === configId ? { ...c, quantity: newQuantity } : c
      );
      setConfigs(updated);
      onConfigsChange(updated);
    }
  };

  const getUnitName = (unit: string | { name?: string } | undefined): string => {
    if (!unit) return '';
    if (typeof unit === 'string') return unit;
    try {
      const u = unit as any;
      return u.name || u.label || u.value || u.code || '';
    } catch {
      return '';
    }
  };

  const getConfigDetails = (config: ProductConfig): string[] => {
    const details: string[] = [];
    
    // Add unit/size if available
    const unitName = getUnitName(config.unit);
    if (unitName) {
      details.push(`Size ${unitName}`);
    }
    
    // Add warehouse if specified
    if (config.warehouse) {
      details.push(config.warehouse);
    }
    
    return details;
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          maxWidth: '600px',
          margin: '0 auto',
          left: 0,
          right: 0,
          maxHeight: '80vh',
        },
      }}
    >
      <Box sx={{ p: 3, pb: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 600, color: tokens.colors.text.primary }}>
            Điều chỉnh sản phẩm
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              width: 32,
              height: 32,
              p: 0,
            }}
          >
            <Iconsax.CloseCircle size={24} color={tokens.colors.text.secondary} />
          </IconButton>
        </Box>

        {/* Product Config Cards using ProductCard component */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2, maxHeight: 'calc(80vh - 200px)', overflowY: 'auto' }}>
          {configs.length === 0 && (
            <Typography sx={{ textAlign: 'center', py: 2, color: tokens.colors.text.secondary }}>
              Chưa có config nào
            </Typography>
          )}
          {configs.map((config, index) => {
            console.log(`[ConfigChoiceBottomSheet] Rendering config ${index}:`, config);
            return (
              <ProductCard
                key={config.id}
                variant="selected-complete"
                name={config.name}
                code={config.code || 'N/A'}
                image={config.image}
                unitPrice={config.unitPrice}
                unit={config.unit}
                mode="order"
                selected={true}
                quantity={config.quantity}
                warehouse={config.warehouse}
                discount={config.discount || 0}
                discountAmount={config.discountAmount}
                discountType={config.discount && config.discount > 0 ? 'percent' : 'amount'}
                isTradeDiscount={config.isTradeDiscount}
                vatRate={config.vatRate}
                taxIndustry={config.taxIndustry}
                onQuantityChange={(newQuantity) => handleQuantityChange(config.id, newQuantity)}
                onDelete={() => handleQuantityChange(config.id, 0)}
              />
            );
          })}
        </Box>

        {/* Add More Button */}
        <Box
          onClick={() => {
            onAddMore();
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            py: 1.75,
            borderRadius: '12px',
            border: `2px solid ${tokens.colors.primary}`,
            bgcolor: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: tokens.colors.primaryLight,
            },
          }}
        >
          <Iconsax.Add size={20} color={tokens.colors.primary} />
          <Typography sx={{ fontSize: 15, fontWeight: 500, color: tokens.colors.primary }}>
            Chọn thêm
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ConfigChoiceBottomSheet;
