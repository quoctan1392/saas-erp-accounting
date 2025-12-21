import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Home, ReceiptText, Box as BoxIcon, Chart, Menu } from 'iconsax-react';

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
        left: 16,
        right: 16,
        bottom: 16,
        height: 64,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1400,
        px: 1,
        borderRadius: '16px',
        // Glassmorphism
        backgroundColor: 'rgba(216, 216, 216, 0.55)',
        backdropFilter: 'blur(10px) saturate(120%)',
        WebkitBackdropFilter: 'blur(10px) saturate(120%)',
        boxShadow: '0 8px 24px rgba(4, 6, 10, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
      }}
    >
      {/** Helper to render each nav item; active items show icon + text in a pill */}
      {[
        { key: 'home', label: 'Tổng quan', icon: Home },
        { key: 'orders', label: 'Đơn hàng', icon: ReceiptText },
        { key: 'inventory', label: 'Kho hàng', icon: BoxIcon },
        { key: 'reports', label: 'Báo cáo', icon: Chart },
        { key: 'more', label: 'Thêm', icon: Menu },
      ].map((item) => {
        const isActive = activeTab === item.key;
        const Icon = item.icon as any;
        const iconVariant = item.key === 'more' ? 'Outline' : 'TwoTone';
        const iconProps: any = {
          size: 20,
          color: isActive ? 'white' : '#020202ff',
          variant: iconVariant,
        };
        return (
          <Box
            key={item.key}
            onClick={() => handleClick(item.key)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              py: 1,
              px: 0.5,
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                transition: 'all 0.18s ease',
                ...(isActive
                  ? {
                      bgcolor: '#FF6B35',
                      color: 'white',
                      // reduce horizontal padding, increase vertical padding
                      px: 1,
                      py: 1,
                      borderRadius: '999px',
                    }
                  : { color: '#6C757D' }),
              }}
            >
              {/* Icon */}
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                {React.createElement(Icon, iconProps)}
              </Box>

              {/* Label shown when active */}
              {isActive && (
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{item.label}</Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Paper>
  );
};

export default BottomNavigationBar;
