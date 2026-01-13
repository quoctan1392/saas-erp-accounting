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
import CustomerFormScreen from '../CustomerFormScreen';
import headerDay from '../../../assets/Header_day.png';

const Icon = ({ name, size = 20, color = 'currentColor', variant = 'Outline' }: any) => {
  const Comp = (Iconsax as any)[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} variant={variant} />;
};

interface Customer {
  id: string;
  name: string;
  code: string;
  type: 'organization' | 'individual';
  taxCode?: string;
  idNumber?: string;
}

interface CustomerSelectionScreenProps {
  open: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
  excludeIds?: string[];
}

const CustomerSelectionScreen: React.FC<CustomerSelectionScreenProps> = ({ open, onClose, onSelect, excludeIds = [] }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [query, setQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'organization' | 'individual'>('all');
  const [exiting, setExiting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const ANIM_MS = 280;

  // Load customers on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setFilterTab('all');
      loadCustomers();
    }
  }, [open]);

  // Filter customers based on query and tab
  useEffect(() => {
    console.log('Filtering customers - customers:', customers);
    console.log('Filtering customers - excludeIds:', excludeIds, 'filterTab:', filterTab, 'query:', query);

    let result = customers.filter(c => !excludeIds.includes(c.id));

    // Apply type filter
    if (filterTab !== 'all') {
      result = result.filter(c => c.type === filterTab);
    }

    // Apply search query
    if (query.trim()) {
      const searchLower = query.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.code.toLowerCase().includes(searchLower) ||
        (c.taxCode && c.taxCode.includes(searchLower)) ||
        (c.idNumber && c.idNumber.includes(searchLower))
      );
    }

    setFilteredCustomers(result);
    console.log('Filtered customers result:', result);
  }, [customers, query, filterTab, excludeIds]);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      // Request all accounting objects and filter client-side to avoid backend query shape issues
      const response = await apiService.getAccountingObjects();
      console.log('API Response (raw):', response);

      // Extract data array from paginated response: { data: [...], total, page, limit, totalPages }
      let data: any[] = [];
      if (!response) {
        data = [];
      } else if (Array.isArray(response)) {
        data = response;
      } else if (response.data) {
        // Check if response.data is the paginated wrapper with a nested data array
        if (typeof response.data === 'object' && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        } else {
          data = [response.data];
        }
      }

      console.log('Customers data (normalized):', data);

      if (data.length > 0) {
        console.log('Sample item keys:', Object.keys(data[0]));
        console.log('Sample item preview:', data[0]);
      }

      // Filter for customers only (isCustomer must be true)
      const customerItems = data.filter((item: any) => item.isCustomer === true);

      const mapped: Customer[] = customerItems.map((item: any) => ({
        id: item.id || item._id || '',
        name: item.accountObjectName || item.name || '',
        code: item.accountObjectCode || item.code || '',
        type: (item.companyTaxCode || item.taxCode) ? 'organization' : 'individual',
        taxCode: item.companyTaxCode || item.taxCode,
        idNumber: item.identityNumber || item.idNumber,
      }));

      console.log('Mapped customers:', mapped);
      setCustomers(mapped);
    } catch (err: any) {
      console.error('Error loading customers:', err?.message || err);
      console.error('Error response data:', err?.response?.data);
      console.error('Error response status:', err?.response?.status);
      console.error('Request URL/config:', err?.config?.url, err?.config);
      // Show empty list if API fails
      setCustomers([]);
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

  const handleSelect = (customer: Customer) => {
    onSelect(customer);
    triggerClose();
  };

  const handleAddNew = () => {
    setShowCustomerForm(true);
  };

  const handleCustomerFormClose = () => {
    setShowCustomerForm(false);
  };

  const handleCustomerFormSave = (newCustomer: any) => {
    // Reload customer list to include the newly created customer
    loadCustomers();
    // Normalize the API result into the shape expected by onSelect
    const payload = newCustomer?.data || newCustomer?.data?.data || newCustomer?.accountingObject || newCustomer?.accounting_object || newCustomer?.result || newCustomer;
    const normalized: Customer = {
      id: payload?.id || payload?._id || newCustomer?.id || newCustomer?._id || '',
      name:
        payload?.accountObjectName || payload?.account_object_name || payload?.name || newCustomer?.accountObjectName || newCustomer?.name || '',
      code:
        payload?.accountObjectCode || payload?.account_object_code || payload?.code || newCustomer?.accountObjectCode || newCustomer?.code || '',
      type: (payload?.companyTaxCode || payload?.taxCode || newCustomer?.companyTaxCode || newCustomer?.taxCode) ? 'organization' : 'individual',
      taxCode: payload?.companyTaxCode || payload?.taxCode || newCustomer?.companyTaxCode || newCustomer?.taxCode,
      idNumber: payload?.identityNumber || payload?.idNumber || newCustomer?.identityNumber || newCustomer?.idNumber,
    };

    // Auto-select the newly created customer with normalized fields
    try {
      onSelect(normalized);
    } catch (err) {
      console.warn('onSelect callback threw when selecting new customer', err);
      // Fallback: pass raw object if normalization fails
      onSelect(newCustomer as any);
    }

    setShowCustomerForm(false);
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
              Chọn khách hàng
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
            placeholder="Tìm kiếm khách hàng..."
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

          {/* Customer List */}
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Typography sx={{ color: '#6C757D' }}>Đang tải...</Typography>
            </Box>
          ) : filteredCustomers.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 4,
              }}
            >
              <Typography sx={{ fontSize: '16px', color: '#495057', mt: 2 }}>
                {query ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào. Vui lòng thêm mới để tiếp tục'}
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
                Thêm khách hàng mới
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {filteredCustomers.map((customer) => (
                <Box
                  key={customer.id}
                  onClick={() => handleSelect(customer)}
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
                      {customer.name}
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: '#6C757D' }}>
                      {customer.code}
                    </Typography>
                  </Box>

                  {/* Type Chip */}
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: '16px',
                      bgcolor: customer.type === 'organization' ? '#F0EBFE' : '#FFF9ED',
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
                        color: customer.type === 'organization' ? '#412294' : '#A77B2E',
                      }}
                    >
                      {customer.type === 'organization' ? 'Tổ chức' : 'Cá nhân'}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
          </Box>
        </Box>
      </Box>

      {/* Customer Form Modal */}
      {showCustomerForm && (
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
          <CustomerFormScreen
            embedded={true}
            onClose={handleCustomerFormClose}
            onSaveSuccess={handleCustomerFormSave}
          />
        </Box>
      )}
    </>
  );
};

export default CustomerSelectionScreen;
