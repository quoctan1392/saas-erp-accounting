import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import * as Iconsax from 'iconsax-react';
import { formatCurrency } from '../utils/dashboardUtils';
import tokens from '../styles/tokens';

interface ProductCardProps {
  // Common fields
  name: string;
  code: string;
  image?: string;
  stock?: number;
  unitPrice: number;
  unit?: string | any;
  
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
  
  // Extract unit name if unit is an object, otherwise use as string
  const unitName = typeof unit === 'object' && unit !== null ? (unit.name || 'chiếc') : (unit || 'chiếc');

  return (
    <Box
      onClick={!isOrderMode ? onClick : undefined}
      sx={{
        height: '100px',
        padding: '8px 12px 8px 8px',
        borderRadius: '20px',
        border: selected || isOrderMode ? `1px solid ${tokens.colors.primary}` : `1px solid ${tokens.colors.border.light}`,
        background: '#FFF',
        boxShadow: selected || isOrderMode ? '1px 2px 12px 0 rgba(0, 0, 0, 0.04)' : 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: !isOrderMode ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        '&:hover': !isOrderMode ? {
          boxShadow: '1px 2px 12px 0 rgba(0, 0, 0, 0.08)',
        } : {},
      }}
    >
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
          <Iconsax.Gallery size={32} color="#999" variant="Outline" />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 0.5 }}>
        {/* Top section: Name and Code */}
        <Box>
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 500,
              color: '#090909',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3,
            }}
          >
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
                <Typography sx={{ fontSize: 15, fontWeight: 600, color: tokens.colors.primary }}>
                  {formatCurrency(unitPrice)}/{unitName}
                </Typography>
                {stock !== undefined && (
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#16A34A',
                      bgcolor: '#D6EDD4',
                      px: 1,
                      py: 0.25,
                      borderRadius: '4px',
                    }}
                  >
                    Tồn: {stock}
                  </Typography>
                )}
              </>
            ) : (
              <Box sx={{ flex: 1 }}>
                {discount > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: '#999',
                        textDecoration: 'line-through',
                      }}
                    >
                      {formatCurrency(originalTotal)}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#EF4444',
                        bgcolor: '#FEE2E2',
                        px: 1,
                        py: 0.25,
                        borderRadius: '8px',
                      }}
                    >
                      -{discount}%
                    </Typography>
                  </Box>
                )}
                <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#090909' }}>
                  {formatCurrency(discountedTotal)}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Actions for order mode */}
          {isOrderMode && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Quantity controls */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: '#F5F5F5',
                  borderRadius: '12px',
                  px: 1,
                  py: 0.5,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => onQuantityChange?.(Math.max(1, quantity - 1))}
                  sx={{ width: 24, height: 24, p: 0 }}
                >
                  <Iconsax.Minus size={16} color="#4E4E4E" />
                </IconButton>
                <Typography sx={{ fontSize: 15, fontWeight: 500, minWidth: 24, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onQuantityChange?.(quantity + 1)}
                  sx={{ width: 24, height: 24, p: 0 }}
                >
                  <Iconsax.Add size={16} color="#4E4E4E" />
                </IconButton>
              </Box>

              {/* Delete button */}
              <IconButton
                onClick={onDelete}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: tokens.colors.primary,
                  '&:hover': { bgcolor: tokens.colors.primaryHover },
                }}
              >
                <Iconsax.Trash size={20} color="#FFF" variant="Outline" />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProductCard;
