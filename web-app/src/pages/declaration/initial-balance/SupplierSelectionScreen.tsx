import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import * as Iconsax from 'iconsax-react';
import SearchBox from '../../../components/SearchBox';
import { apiService } from '../../../services/api';
import SupplierFormScreen from '../SupplierFormScreen';
import headerDay from '../../../assets/Header_day.png';

const Icon = ({ name, size = 20, color = 'currentColor', variant = 'Outline' }: any) => {
  const Comp = (Iconsax as any)[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} variant={variant} />;
};

interface Supplier {
  id: string;
  name: string;
  code: string;
  type: 'organization' | 'individual';
  taxCode?: string;
  idNumber?: string;
}

interface SupplierSelectionScreenProps {
  open: boolean;
  onClose: () => void;
  onSelect: (supplier: Supplier) => void;
  excludeIds?: string[];
}

const SupplierSelectionScreen: React.FC<SupplierSelectionScreenProps> = ({ open, onClose, onSelect, excludeIds = [] }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [query, setQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'organization' | 'individual'>('all');
  const [exiting, setExiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const ANIM_MS = 280;

  // Load suppliers on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setFilterTab('all');
      loadSuppliers();
    }
  }, [open]);

  // Filter suppliers based on query and tab
  useEffect(() => {
    console.log('Filtering suppliers - suppliers:', suppliers);
    console.log('Filtering suppliers - excludeIds:', excludeIds, 'filterTab:', filterTab, 'query:', query);

    let result = suppliers.filter(s => !excludeIds.includes(s.id));

    // Apply type filter
    if (filterTab !== 'all') {
      result = result.filter(s => s.type === filterTab);
    }

    // Apply search query
    if (query.trim()) {
      const searchLower = query.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(searchLower) ||
        s.code.toLowerCase().includes(searchLower) ||
        (s.taxCode && s.taxCode.includes(searchLower)) ||
        (s.idNumber && s.idNumber.includes(searchLower))
      );
    }

    setFilteredSuppliers(result);
    console.log('Filtered suppliers result:', result);
  }, [suppliers, query, filterTab, excludeIds]);

  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      // Request all accounting objects
      const response = await apiService.getAccountingObjects();
      console.log('API Response (suppliers):', response);

      // Extract data array from paginated response
      let data: any[] = [];
      if (!response) {
        data = [];
      } else if (Array.isArray(response)) {
        data = response;
      } else if (response.data) {
        if (typeof response.data === 'object' && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        } else {
          data = [response.data];
        }
      }

      console.log('Suppliers data (normalized):', data);

      if (data.length > 0) {
        console.log('Sample item keys:', Object.keys(data[0]));
        console.log('Sample item preview:', data[0]);
      }

      // Filter for suppliers only (isVendor must be true)
      const supplierItems = data.filter((item: any) => item.isVendor === true);

      const mapped: Supplier[] = supplierItems.map((item: any) => ({
        id: item.id || item._id || '',
        name: item.accountObjectName || item.name || '',
        code: item.accountObjectCode || item.code || '',
        type: (item.companyTaxCode || item.taxCode) ? 'organization' : 'individual',
        taxCode: item.companyTaxCode || item.taxCode,
        idNumber: item.identityNumber || item.idNumber,
      }));

      console.log('Mapped suppliers:', mapped);
      setSuppliers(mapped);
    } catch (err: any) {
      console.error('Error loading suppliers:', err?.message || err);
      console.error('Error response data:', err?.response?.data);
      console.error('Error response status:', err?.response?.status);
      console.error('Request URL/config:', err?.config?.url, err?.config);
      // Show empty list if API fails
      setSuppliers([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  const triggerClose = () => {
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      onClose();
    }, ANIM_MS);
  };

  const handleSelect = (supplier: Supplier) => {
    onSelect(supplier);
    triggerClose();
  };

  const handleAddNew = () => {
    setShowSupplierForm(true);
  };

  const handleSupplierFormClose = () => {
    setShowSupplierForm(false);
  };

  const handleSupplierFormSave = (newSupplier: any) => {
    // Reload supplier list to include the newly created supplier
    loadSuppliers();
    // Auto-select the newly created supplier
    onSelect(newSupplier);
    setShowSupplierForm(false);
    triggerClose();
  };

  return (
    <>
      <Box onClick={triggerClose} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', zIndex: 1200 }} />

      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 1201,
          bgcolor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          animation: exiting ? 'slideOutToRight 0.28s ease' : 'slideInFromRight 0.28s ease',
          '@keyframes slideInFromRight': {
            from: { transform: 'translateX(100%)' },
            to: { transform: 'translateX(0)' },
          },
          '@keyframes slideOutToRight': {
            from: { transform: 'translateX(0)' },
            to: { transform: 'translateX(100%)' },
          },
        }}
      >
        {/* Header Background */}
        <Box
          sx={{
            height: { xs: 160, sm: 120 },
            width: '100%',
            backgroundImage: `url(${headerDay})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Header Content */}
        <Box sx={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 1202, px: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              maxWidth: 'sm',
              mx: 'auto',
              py: 0.5,
            }}
          >
            <IconButton
              onClick={triggerClose}
              sx={{
                width: 40,
                height: 40,
                backgroundColor: '#fff',
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
            >
              <ArrowBack />
            </IconButton>

            <Typography
              sx={{
                flex: 1,
                color: 'var(--Greyscale-900, #0D0D12)',
                textAlign: 'center',
                fontFamily: '"Bricolage Grotesque"',
                fontSize: '20px',
                fontWeight: 500,
              }}
            >
              Chọn nhà cung cấp
            </Typography>

            <IconButton
              onClick={handleAddNew}
              sx={{
                width: 40,
                height: 40,
                backgroundColor: '#fff',
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
            >
              <Icon name="Add" size={24} color="#4E4E4E" variant="Outline" />
            </IconButton>
          </Box>
        </Box>

        {/* Search and Content */}
        <Box
          sx={{
            position: { xs: 'fixed', sm: 'relative' },
            top: { xs: '100px', sm: 'auto' },
            bottom: { xs: 0, sm: 'auto' },
            left: 0,
            right: 0,
            px: 2,
            py: 2,
            pb: `calc(100px + env(safe-area-inset-bottom, 0px))`,
            overflowY: 'auto',
            bgcolor: 'transparent',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 'sm', mx: 'auto' }}>
          {/* Search Input */}
          <SearchBox
            fullWidth
            placeholder="Tìm kiếm nhà cung cấp..."
            value={query}
            onChange={(e: any) => setQuery(e.target.value)}
          />

          {/* Filter Tabs */}
          <Tabs
            value={filterTab}
            onChange={(_, value) => setFilterTab(value)}
            sx={{
              mb: 1,
              minHeight: 36,
              '& .MuiTabs-indicator': { backgroundColor: '#FB7E00' },
              '& .MuiTab-root': {
                minHeight: 36,
                py: 0.5,
                textTransform: 'none',
                fontSize: '14px',
                color: '#6C757D',
                '&.Mui-selected': { color: '#FB7E00' },
              },
            }}
          >
            <Tab value="all" label="TẤT CẢ" />
            <Tab value="organization" label="TỔ CHỨC" />
            <Tab value="individual" label="CÁ NHÂN" />
          </Tabs>

          {/* Supplier List */}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Typography sx={{ color: '#6C757D' }}>Đang tải...</Typography>
            </Box>
          ) : filteredSuppliers.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 4,
              }}
            >
              <Icon name="Building" size={48} color="#ADB5BD" variant="Outline" />
              <Typography sx={{ fontSize: '16px', color: '#495057', mt: 2 }}>
                {query ? 'Không tìm thấy nhà cung cấp' : 'Chưa có nhà cung cấp nào'}
              </Typography>
              <Button
                variant="text"
                onClick={handleAddNew}
                startIcon={<Icon name="Add" size={20} color="#FB7E00" />}
                sx={{
                  mt: 2,
                  color: '#FB7E00',
                  textTransform: 'none',
                }}
              >
                Thêm nhà cung cấp mới
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {filteredSuppliers.map((supplier) => (
                <Box
                  key={supplier.id}
                  onClick={() => handleSelect(supplier)}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 1.25,
                    py: 1.25,
                    px: 0,
                    borderBottom: '1px solid #E9ECEF',
                    bgcolor: 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: '#FBFBFB',
                    },
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  {/* Info */}
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#212529', mb: 0 }}>
                      {supplier.name}
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: '#6C757D' }}>
                      {supplier.code}
                    </Typography>
                  </Box>

                  {/* Type Chip */}
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: '16px',
                      bgcolor: supplier.type === 'organization' ? '#F0EBFE' : '#FFF9ED',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontWeight: 400,
                        color: supplier.type === 'organization' ? '#412294' : '#A77B2E',
                      }}
                    >
                      {supplier.type === 'organization' ? 'Tổ chức' : 'Cá nhân'}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
          </Box>
        </Box>
      </Box>

      {/* Supplier Form Modal */}
      {showSupplierForm && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 1300,
            bgcolor: '#fff',
            animation: 'slideInFromRight 0.28s ease',
            '@keyframes slideInFromRight': {
              from: { transform: 'translateX(100%)' },
              to: { transform: 'translateX(0)' },
            },
          }}
        >
          <SupplierFormScreen
            embedded={true}
            onClose={handleSupplierFormClose}
            onSaveSuccess={handleSupplierFormSave}
          />
        </Box>
      )}
    </>
  );
};

export default SupplierSelectionScreen;
