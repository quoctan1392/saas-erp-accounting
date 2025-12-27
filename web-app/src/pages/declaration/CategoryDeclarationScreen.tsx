import { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Checkbox, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import { ArrowBack } from '@mui/icons-material';
import headerDay from '../../assets/Header_day.png';
import * as Iconsax from 'iconsax-react';

// Icon wrapper component
const Icon = ({ name, size = 24, color = 'currentColor', variant = 'Outline' }: any) => {
  const Comp = (Iconsax as any)[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} variant={variant} />;
};

interface CategoryStatus {
  id: string;
  name: string;
  route: string;
  count: number;
  completed: boolean;
}

const CategoryDeclarationScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [exiting, setExiting] = useState(false);
  const ANIM_MS = 280;
  
  // Mock data - trong thực tế sẽ load từ API
  const [categories] = useState<CategoryStatus[]>([
    { id: 'customers', name: 'Danh mục khách hàng', route: ROUTES.DECLARATION_CUSTOMERS, count: 0, completed: false },
    { id: 'suppliers', name: 'Danh mục nhà cung cấp', route: ROUTES.DECLARATION_SUPPLIERS, count: 0, completed: false },
    { id: 'warehouses', name: 'Danh mục kho', route: ROUTES.DECLARATION_WAREHOUSES, count: 0, completed: false },
    { id: 'products', name: 'Danh mục hàng hoá dịch vụ', route: ROUTES.DECLARATION_PRODUCTS, count: 0, completed: false },
  ]);

  useEffect(() => {
    // TODO: Load category counts from API
    // const loadCategoryCounts = async () => {
    //   const counts = await apiService.getDeclarationCounts();
    //   setCategories(prevCategories =>
    //     prevCategories.map(cat => ({
    //       ...cat,
    //       count: counts[cat.id] || 0,
    //       completed: (counts[cat.id] || 0) > 0
    //     }))
    //   );
    // };
    // loadCategoryCounts();
  }, []);

  const handleBack = () => {
    setExiting(true);
    setTimeout(() => navigate(ROUTES.HOME), ANIM_MS);
  };


  const handleInitialBalance = () => {
    // TODO: Navigate to initial balance screen
    navigate(ROUTES.DECLARATION_INITIAL_BALANCE);
  };

  const handleStartUsing = () => {
    setIsLoading(true);
    // Mark declaration as completed
    localStorage.setItem('declarationCompleted', 'true');
    
    setTimeout(() => {
      navigate(ROUTES.HOME);
    }, 500);
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
      {/* Date removed per design request */}

      {/* Header row with back button and centered title */}
      <Box sx={{ position: 'fixed', top: 36, left: 0, right: 0, zIndex: 20, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 'sm', mx: 'auto', py: 0.5 }}>
          <IconButton
            onClick={handleBack}
            sx={{ position: 'absolute', left: 0, top:  6, width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' }}}
          >
            <ArrowBack />
          </IconButton>

          <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0, gap: 0 }}>
            <Typography sx={{ color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '20px', fontStyle: 'normal', fontWeight: 500}}>Khai báo danh mục</Typography>
          </Box>

          <Box sx={{ mt: 1.5 }}>
            <Typography sx={{ fontSize: 13, color: 'rgba(0,0,0,0.6)', textAlign: 'center', mx: 2 }}>
              Khai báo các danh mục ban đầu để hệ thống tự động ghi nhận và quản lý giao dịch một cách chính xác.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, pt: { xs: '120px', sm: '96px' }, pb: 2 }}>
        {/* Title */}
        <Typography
          sx={{
            fontFamily: '"Bricolage Grotesque", sans-serif',
            fontSize: '28px',
            fontWeight: 600,
            lineHeight: '28px',
            letterSpacing: '0.25px',
            color: '#BA5C00',
            mb: 1,
            textAlign: 'left',
          }}
        >
          Khai báo danh mục
        </Typography>

        {/* Description */}
        <Typography
          sx={{
            fontSize: '16px',
            lineHeight: '24px',
            color: 'rgba(0, 0, 0, 0.8)',
            textAlign: 'left',
            mb: 1,
          }}
        >
          Thiết lập các danh mục cơ bản để hệ thống tự động ghi nhận và quản lý giao dịch một cách chính xác
        </Typography>

        <Box
          sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: {
              xs: '16px 16px 0 0',
              sm: '16px',
            },
            py: { xs: 2, sm: 6 },
            pb: { xs: `calc(150px + env(safe-area-inset-bottom, 0px))`, sm: 6 },
            position: { xs: 'fixed', sm: 'relative' },
            top: { xs: '140px', sm: 'auto' },
            bottom: { xs: 0, sm: 'auto' },
            left: '16px',
            right: '16px',
            maxWidth: 'calc(100% - 32px)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: { xs: 'auto', sm: 'visible' },
          }}
        >
          {/* Categories List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
            {categories.map((category) => (
              <Box
                key={category.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // navigate in next tick to avoid click carry-over to newly mounted inputs
                  setTimeout(() => {
                    if (category.id === 'products') {
                      navigate(`${ROUTES.DECLARATION_PRODUCTS}/new`);
                      return;
                    }
                    navigate(category.route);
                  }, 0);
                }}
                sx={{
                  display: 'flex',
                  height: 60,
                  alignItems: 'center',
                  gap: 1.5,
                  p: 2,
                  borderRadius: '12px',
                  bgcolor: '#F9F9F9',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0)',
                    transform: 'translateX(0px)',
                  },
                }}
              >
                {/* Circular checkbox */}
                <Checkbox
                  checked={category.completed}
                  readOnly
                  icon={<Box sx={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid #ADB5BD' }} />}
                  checkedIcon={
                    <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#28A745', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'white' }} />
                    </Box>
                  }
                  sx={{ p: 0 }}
                />

                {/* Category Name */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#212529',
                    }}
                  >
                    {category.name}
                  </Typography>
                </Box>

                {/* Count or Status */}
                {category.completed && (
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '100px',
                      bgcolor: '#D3E7FF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: '#090909',
                      }}
                    >
                      {category.count} mục
                    </Typography>
                  </Box>
                )}

                {/* Arrow */}
                <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Outline" />
              </Box>
            ))}
          </Box>

          {/* Desktop buttons */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, mt: 'auto' }}>
            <Button
              fullWidth
              variant="text"
              onClick={handleInitialBalance}
              sx={{
                borderRadius: '100px',
                textTransform: 'none',
                fontWeight: 500,
                color: '#FB7E00',
                py: 1.5,
                height: 48,
                '&:hover': {
                  bgcolor: '#FFF4E6',
                },
              }}
            >
              Khai báo số dư ban đầu
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleStartUsing}
              disabled={isLoading}
              sx={{
                borderRadius: '100px',
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: '#FB7E00',
                color: 'white',
                py: 1.5,
                height: 48,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#E65A2E',
                  boxShadow: 'none',
                },
              }}
            >
              {isLoading ? 'Đang xử lý...' : 'Bắt đầu sử dụng'}
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
          flexDirection: 'column',
          gap: 0.5,
          px: 2,
          py: 2,
          pb: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          bgcolor: '#ffffff',
          boxShadow: '0 -8px 16px rgba(0,0,0,0.12)',
        }}
      >
        <Button
          fullWidth
          variant="contained"
          onClick={handleStartUsing}
          disabled={isLoading}
          sx={{
            borderRadius: '100px',
            fontSize: 16,
            textTransform: 'none',
            fontWeight: 500,
            bgcolor: '#FB7E00',
            color: 'white',
            height: 56,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#E65A2E',
              boxShadow: 'none',
            },
          }}
        >
          {isLoading ? 'Đang xử lý...' : 'Bắt đầu sử dụng'}
        </Button>
        <Button
          fullWidth
          variant="text"
          onClick={handleInitialBalance}
          sx={{
            borderRadius: '100px',
            fontSize: 16,
            textTransform: 'none',
            fontWeight: 500,
            color: '#090909',
            height: 56,
            '&:hover': {
              borderColor: '#E65A2E',
              bgcolor: '#FFF4E6',
            },
          }}
        >
          Khai báo số dư ban đầu
        </Button>
      </Box>
    </Box>
  );
};

export default CategoryDeclarationScreen;
