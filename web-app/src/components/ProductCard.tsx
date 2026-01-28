import React, { useEffect, useState } from 'react';
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
  variant?: 'default' | 'selected-complete';
  selected?: boolean;
  quantity?: number;
  warehouse?: string;
  discount?: number;
  discountAmount?: number;
  isTradeDiscount?: boolean;
  vatRate?: number;
  taxIndustry?: string;
  onQuantityChange?: (quantity: number) => void;
  onDelete?: () => void;
  onClick?: () => void;
  onCardClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({
  name,
  code,
  image,
  stock,
  stockByWarehouse,
  selectedWarehouse = null,
  unitPrice,
  unit = 'chiếc',
  mode = 'selection',
  variant = 'default',
  selected = false,
  quantity = 1,
  warehouse,
  discount = 0,
  discountAmount,
  isTradeDiscount = false,
  vatRate,
  taxIndustry,
  onQuantityChange,
  onDelete,
  onClick,
  onCardClick,
}) => {
  const isOrderMode = mode === 'order';
  const isSelectedComplete = variant === 'selected-complete';
  const originalTotal = unitPrice * quantity;
  const discountAmtComputed = typeof discountAmount === 'number' ? discountAmount : (discount ? (originalTotal * discount) / 100 : 0);
  const discountedTotal = originalTotal - (Number.isFinite(discountAmtComputed) ? discountAmtComputed : 0);
  
  // Extract unit name robustly: support string or object shapes returned by API/selection components
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Reset image error state when image source changes
    setImgError(false);
  }, [image]);

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

  // Render selected-complete variant
  if (isSelectedComplete) {
    return (
      <Box
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const isInteractive = target.closest('button') || target.closest('[role="button"]');
          if (!isInteractive && onCardClick) {
            onCardClick();
          }
        }}
        sx={{
          display: 'flex',
          width: 361,
          padding: '8px 12px 8px 8px',
          alignItems: 'center',
          gap: 1.5,
          borderRadius: '20px',
          border: '1px solid var(--Scheme-SurfaceContainer, #F5F5F5)',
          background: 'var(--Greyscale-0, #FFF)',
          boxShadow: '1px 2px 12px 0 rgba(0, 0, 0, 0.04)',
          cursor: onCardClick ? 'pointer' : 'default',
        }}
      >
        {/* Image */}
        <Box
          sx={{
            width: 105,
            flexShrink: 0,
            alignSelf: 'stretch',
            aspectRatio: '1 / 1',
            borderRadius: '12px',
            bgcolor: '#E8E8E8',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {image && !imgError ? (
            <img
              src={image}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setImgError(true)}
            />
          ) : (
            <ImageIcon sx={{ fontSize: 32, color: '#999' }} />
          )}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#090909', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name}
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#6B7280', mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {code}
                {selectedWarehouse ? ` • ${selectedWarehouse}` : warehouse ? ` • ${warehouse}` : ''}
              </Typography>
            </Box>

            {/* Discount chip (top-right) */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {discount > 0 && (
                <Box sx={{ display: 'flex', height: 20, padding: '2px 8px', alignItems: 'center', borderRadius: '16px', bgcolor: 'var(--Alert-Error-25, #FADBE1)' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#EF4444' }}>{`-${discount}%`}</Typography>
                </Box>
              )}
              {discountAmount && discountAmount > 0 && (
                <Box sx={{ display: 'flex', height: 20, padding: '2px 8px', alignItems: 'center', borderRadius: '16px', bgcolor: 'var(--Alert-Error-25, #FADBE1)' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#EF4444' }}>{`-${formatVND(discountAmount)}`}</Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            <Box>
              {Number.isFinite(discountAmtComputed) && discountAmtComputed > 0 ? (
                <Typography sx={{ overflow: 'hidden', color: 'var(--Ref-Error-50, #FF2317)', fontSize: 12, fontWeight: 500, textDecoration: 'line-through' }}>
                  {formatVND(originalTotal)}
                </Typography>
              ) : null}
              <Typography sx={{ color: 'var(--Scheme-OnSurface, #090909)', fontSize: 18, fontWeight: 600, lineHeight: '140%' }}>{formatVND(discountedTotal)}</Typography>
            </Box>
            {/* Number Spinner aligned right */}
            <Box>
              <NumberSpinner
                value={quantity}
                size="sm"
                variant="compact"
                onChange={(v) => {
                  if (v <= 0 && onDelete) {
                    onDelete();
                    return;
                  }
                  onQuantityChange?.(v);
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // Default variant rendering
  return (
    <Box
      onClick={(e) => {
        // Only trigger card click if not clicking on interactive elements
        const target = e.target as HTMLElement;
        const isInteractive = target.closest('button') || target.closest('[role="button"]');
        if (!isInteractive && onCardClick) {
          onCardClick();
        }
      }}
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
        cursor: onCardClick ? 'pointer' : 'default',
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
            {`Tồn: ${formatNumber(Number(displayedStock || 0))}`}
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
        {image && !imgError ? (
          <img
            src={image}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImgError(true)}
          />
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
                variant="compact"
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
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
