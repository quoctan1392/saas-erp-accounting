import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home, ReceiptText, Box as BoxIcon, Chart2, HambergerMenu } from 'iconsax-react';

interface Props {
  activeTab?: string;
  onMore?: () => void;
}

const BottomNavigationBar: React.FC<Props> = ({ activeTab = 'home', onMore }) => {
  const navigate = useNavigate();

  const handleClick = (tab: string) => {
    if (tab === 'more') {
      if (onMore) return onMore();
      return navigate('/more');
    }
    if (tab === 'home') return navigate('/home');
    // Fallback paths for other tabs - adjust later if routes change
    return navigate(`/${tab}`);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: 72,
        display: 'flex',
        alignItems: 'center',
        zIndex: 1400,
        px: 2,
        borderRadius: 0,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
        borderTop: '1px solid #E0E0E0',
        // Respect iOS safe area
        pb: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/** Helper to render each nav item; active items show icon + text in a pill */}
      {[
        { key: 'home', label: 'Tổng quan', icon: Home },
        { key: 'orders', label: 'Đơn hàng', icon: ReceiptText },
        { key: 'products', label: 'Sản phẩm', icon: BoxIcon },
        { key: 'reports', label: 'Báo cáo', icon: Chart2 },
        { key: 'more', label: 'Thêm', icon: HambergerMenu },
      ].map((item, idx) => {
        const isActive = activeTab === item.key;
        const isFirst = idx === 0;
        const isLast = idx === 4;
        const Icon = item.icon as any;
        const iconVariant = isActive ? 'Bold' : 'Outline';
        const iconProps: any = {
          size: 20,
          color: isActive ? '#FFFFFF' : '#666666',
          variant: iconVariant,
        };

        return (
          <Box
            key={item.key}
            onClick={() => handleClick(item.key)}
            sx={{
              flex: isActive ? '0 0 112px' : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: isActive ? (isFirst ? 'flex-start' : isLast ? 'flex-end' : 'center') : 'center',
              cursor: 'pointer',
              minWidth: 0,
              transition: 'flex 260ms cubic-bezier(.2,.8,.2,1)',
              px: 0,
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.75,
                transition: 'all 260ms cubic-bezier(.2,.8,.2,1)',
                width: isActive ? '112px' : 'auto',
                height: isActive ? '40px' : 'auto',
                px: isActive ? 1.5 : 0,
                py: isActive ? 1 : 0,
                borderRadius: '999px',
                ...(isActive
                  ? {
                      bgcolor: '#F37021',
                      color: '#FFFFFF',
                      boxShadow: '0 2px 8px rgba(243,112,33,0.18)',
                    }
                  : { color: '#666666' }),
              }}
            >
              <Box sx={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                {React.createElement(Icon, iconProps)}
              </Box>

              {isActive && (
                <Typography sx={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', color: '#FFFFFF' }}>
                  {item.label}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Paper>
  );
};

export default BottomNavigationBar;
