import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NumberSpinner from './NumberSpinner';
import { formatVND, formatNumber } from '../utils/dashboardUtils';
import tokens from '../styles/tokens';

interface ProductCardProps {
  // Common fields
  name: string;
  code: string;
  image?: string;
  stock?: number;
  // optional map of warehouseId|name -> stock count
  stockByWarehouse?: Record<string, number>;
  // when selected, shows stock for this warehouse (id or name)
  selectedWarehouse?: string | null;
  unitPrice: number;
  unit?: string | { name?: string };
  
  // Order mode fields
  mode?: 'selection' | 'order';
  selected?: boolean;
  quantity?: number;
  warehouse?: string;
  discount?: number;
  onQuantityChange?: (quantity: number) => void;
  onDelete?: () => void;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  code,
  image,
  stock,
  stockByWarehouse,
  selectedWarehouse = null,
  unitPrice,
  unit = 'chiếc',
  mode = 'selection',
  selected = false,
  quantity = 1,
  warehouse,
  discount = 0,
  onQuantityChange,
  onDelete,
  onClick,
}) => {
  const isOrderMode = mode === 'order';
  const originalTotal = unitPrice * quantity;
  const discountedTotal = originalTotal * (1 - discount / 100);
  
  // Extract unit name robustly: support string or object shapes returned by API/selection components
  const unitName = (() => {
    if (!unit) return 'chiếc';
    if (typeof unit === 'string') return unit;
    try {
      const u = unit as any;
      return u.name || u.label || u.value || u.code || (typeof u === 'string' ? u : 'chiếc');
    } catch {
      return 'chiếc';
    }
  })();

  // Compute displayed stock:
  // - when not selected: show total across warehouses if provided, else `stock`
  // - when selected and `selectedWarehouse` provided: show stock for that warehouse if available, else fall back to `stock` or total
  const totalStock = stockByWarehouse ? Object.values(stockByWarehouse).reduce((s, v) => s + (Number(v) || 0), 0) : (stock ?? 0);
  let displayedStock = totalStock;
  if (selected && selectedWarehouse) {
    const wStock = stockByWarehouse ? stockByWarehouse[selectedWarehouse] : undefined;
    if (typeof wStock === 'number') displayedStock = wStock;
    else displayedStock = typeof stock === 'number' ? stock : totalStock;
  }

  const showStepper = isOrderMode || Boolean(selected);

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100px',
        padding: '8px 12px 8px 8px',
        borderRadius: '20px',
        border: selected ? '1px solid var(--Scheme-Primary, #FB7E00)' : '1px solid var(--Scheme-SurfaceContainer, #F5F5F5)',
        background: 'var(--Greyscale-0, #FFF)',
        boxShadow: '1px 2px 12px 0 rgba(0, 0, 0, 0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'default',
        transition: 'all 0.2s ease',
        '&:hover': !isOrderMode ? {
          boxShadow: '1px 2px 12px 0 rgba(0, 0, 0, 0.08)',
        } : {},
      }}
    >
      {/* Stock chip (top-right) - moved to card root so it's always visible */}
      {typeof displayedStock !== 'undefined' && (
        <Box sx={{ position: 'absolute', top: 8, right: 12, zIndex: 10 }}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: '#009F00',
              bgcolor: '#EFF8EF',
              px: 1,
              py: '4px',
              borderRadius: '12px',
            }}
          >
            {`Tồn: ${formatNumber(Number(displayedStock || 0))}`}{selected && selectedWarehouse ? ` • Kho: ${selectedWarehouse}` : ''}
          </Typography>
        </Box>
      )}
      {/* Image */}
      <Box
        sx={{
          width: 84,
          height: 84,
          borderRadius: '16px',
          bgcolor: '#E8E8E8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {image ? (
          <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <ImageIcon sx={{ fontSize: 32, color: '#999' }} />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 0.5 }}>
        {/* Top section: Name and Code */}
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#090909', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.3 }}>
            {name}
          </Typography>
          <Typography sx={{ fontSize: 13, color: tokens.colors.text.secondary, mt: 0.25 }}>
            {code}
            {warehouse && ` • Kho: ${warehouse}`}
          </Typography>
        </Box>

        {/* Bottom section: Price and Stock or Discount */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
            {!isOrderMode ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#FB7E00' }}>
                    {formatVND(unitPrice)}
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#090909' }}>
                    {`/ ${unitName}`}
                  </Typography>
                </Box>
              </>
            ) : (
              <Box sx={{ flex: 1 }}>
                {discount > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                    <Typography sx={{ fontSize: 13, color: '#999', textDecoration: 'line-through' }}>
                      {formatVND(originalTotal)}
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#EF4444', bgcolor: '#FEE2E2', px: 1, py: 0.25, borderRadius: '8px' }}>
                      -{discount}%
                    </Typography>
                  </Box>
                )}
                <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#090909' }}>
                  {formatVND(discountedTotal)}
                </Typography>
              </Box>
            )}
          </Box>

          {showStepper ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NumberSpinner
                value={quantity}
                size="sm"
                onChange={(v) => {
                  // If user decrements to zero in selection mode, treat it as "deselect" (cart icon)
                  if (!isOrderMode && v <= 0) {
                    // toggle parent selection
                    onClick?.();
                    return;
                  }
                  onQuantityChange?.(v);
                }}
              />

              {isOrderMode && (
                <IconButton onClick={onDelete} sx={{ width: 40, height: 40, bgcolor: tokens.colors.primary, '&:hover': { bgcolor: tokens.colors.primaryHover } }}>
                  <DeleteOutlineIcon sx={{ color: '#FFF' }} />
                </IconButton>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', pl: 0 }}>
              <IconButton onClick={onClick} sx={{ width: 28, height: 28, p: 0, bgcolor: tokens.colors.primary, '&:hover': { bgcolor: tokens.colors.primaryHover } }}>
                <ShoppingCartIcon sx={{ color: '#FFF', fontSize: 16, variant: "Outline" }} />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProductCard;
