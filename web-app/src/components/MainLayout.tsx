import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import BottomNavigationBar from './BottomNavigationBar';

/**
 * MainLayout wraps routes that should have a persistent bottom navigation.
 * The Outlet renders child routes while the navigator stays mounted.
 */
const MainLayout = () => {
  const location = useLocation();

  // Determine active tab based on current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/home') return 'home';
    if (path === '/more') return 'more';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/inventory')) return 'inventory';
    if (path.includes('/reports')) return 'reports';
    return 'home';
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Child routes render here */}
      <Outlet />
      
      {/* Persistent bottom navigation - doesn't reload on route changes */}
      <BottomNavigationBar activeTab={getActiveTab()} />
    </Box>
  );
};

export default MainLayout;
