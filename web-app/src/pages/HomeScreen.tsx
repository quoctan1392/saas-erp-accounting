import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Fade,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import SwitchAccountIcon from '@mui/icons-material/SwitchAccount';
import DashboardIcon from '@mui/icons-material/Dashboard';

const HomeScreen = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<any>(null);
  const [currentTenant, setCurrentTenant] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('tenantAccessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // Load user and tenant data
    const userData = localStorage.getItem('user');
    const tenantData = localStorage.getItem('currentTenant');

    if (userData) setUser(JSON.parse(userData));
    if (tenantData) setCurrentTenant(JSON.parse(tenantData));
  }, [navigate]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tenantAccessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('currentTenant');
    navigate('/login');
  };

  const handleSwitchWorkspace = () => {
    localStorage.removeItem('tenantAccessToken');
    localStorage.removeItem('currentTenant');
    navigate('/login');
  };

  return (
    <Fade in timeout={800}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* AppBar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'white',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="primary"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Symper
            </Typography>

            {currentTenant && (
              <Chip
                label={currentTenant.name}
                size="small"
                sx={{
                  mr: 2,
                  display: { xs: 'none', sm: 'flex' },
                }}
              />
            )}

            <IconButton onClick={handleMenuOpen}>
              <Avatar
                src={user?.picture}
                sx={{ width: 36, height: 36 }}
              >
                {user?.name ? user.name.charAt(0) : 'U'}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: { mt: 1.5, minWidth: 200 },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
                {currentTenant && (
                  <Chip
                    label={currentTenant.name}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
              <MenuItem onClick={handleSwitchWorkspace}>
                <SwitchAccountIcon sx={{ mr: 1.5 }} />
                Đổi workspace
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 1.5 }} />
                Đăng xuất
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box
            sx={{
              minHeight: 'calc(100vh - 200px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DashboardIcon
              sx={{
                fontSize: 120,
                color: 'text.disabled',
                mb: 3,
              }}
            />
            <Typography
              variant="h3"
              sx={{
                mb: 2,
                fontWeight: 600,
                color: 'text.primary',
                textAlign: 'center',
              }}
            >
              Chào mừng đến với Symper
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, textAlign: 'center' }}
            >
              Trang chủ đang được phát triển
            </Typography>

            {/* Placeholder Cards */}
            <Box sx={{ maxWidth: 900, mt: 4, display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Box sx={{ flex: '1 1 250px', maxWidth: 300 }}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Tổng quan
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Xem tổng quan tài chính
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 250px', maxWidth: 300 }}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Hóa đơn
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Quản lý hóa đơn
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: '1 1 250px', maxWidth: 300 }}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Báo cáo
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Xem báo cáo chi tiết
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Fade>
  );
};

export default HomeScreen;
