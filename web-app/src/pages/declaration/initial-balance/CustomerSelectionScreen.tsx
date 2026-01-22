import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  variant?: string;
}

const Icon = ({ name, size = 20, color = 'currentColor', variant = 'Outline' }: IconProps) => {
  const Comp = (Iconsax as Record<string, React.ComponentType<{ size?: number; color?: string; variant?: string }>>)[name];
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
    // Filtering runs when inputs change; avoid noisy console logs here.

    // Use a JSON snapshot of excludeIds in the dependency list so that
    // a freshly-created (but identical) default array does not trigger
    // the effect on every render and cause an update loop.
    // Use JSON snapshot of excludeIds to avoid triggering the effect on identical array instances

    let result = customers.filter(c => !(excludeIds || []).includes(c.id));

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
    // include excludeIds snapshot directly in deps
  }, [customers, query, filterTab, JSON.stringify(excludeIds || [])]);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      // Request all accounting objects and filter client-side to avoid backend query shape issues
      const response = await apiService.getAccountingObjects();
      // API response retrieved

      // Extract data array from paginated response: { data: [...], total, page, limit, totalPages }
      let data: unknown[] = [];
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

      // normalized data length: data.length

      // Filter for customers only (isCustomer must be true)
      const customerItems = data.filter((item: unknown): item is Record<string, unknown> => 
        typeof item === 'object' && item !== null && (item as Record<string, unknown>).isCustomer === true
      );

      const mapped: Customer[] = customerItems.map((item: Record<string, unknown>) => ({
        id: String(item.id || item._id || ''),
        name: String(item.accountObjectName || item.name || ''),
        code: String(item.accountObjectCode || item.code || ''),
        type: (item.companyTaxCode || item.taxCode) ? 'organization' : 'individual',
        taxCode: (item.companyTaxCode || item.taxCode) as string | undefined,
        idNumber: (item.identityNumber || item.idNumber) as string | undefined,
      }));

      setCustomers(mapped);
    } catch (err: unknown) {
      const error = err as { message?: string; response?: { data?: unknown; status?: number }; config?: { url?: string } };
      console.error('Error loading customers:', error?.message || err);
      console.error('Error response data:', error?.response?.data);
      console.error('Error response status:', error?.response?.status);
      console.error('Request URL/config:', error?.config?.url, error?.config);
      // Show empty list if API fails
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerClose = () => {
    if (exiting) return;
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

  const handleCustomerFormSave = (newCustomer: unknown) => {
    // Reload customer list to include the newly created customer
    loadCustomers();
    // Normalize the API result into the shape expected by onSelect
    const raw = newCustomer as Record<string, unknown>;
    const payloadTemp = (raw?.data as Record<string, unknown>) || raw;
    const payload = ((payloadTemp?.data as Record<string, unknown>) || payloadTemp?.accountingObject || payloadTemp?.accounting_object || payloadTemp?.result || payloadTemp) as Record<string, unknown>;
    const normalized: Customer = {
      id: (payload?.id || payload?._id || raw?.id || raw?._id || '') as string,
      name:
        (payload?.accountObjectName || payload?.account_object_name || payload?.name || raw?.accountObjectName || raw?.name || '') as string,
      code:
        (payload?.accountObjectCode || payload?.account_object_code || payload?.code || raw?.accountObjectCode || raw?.code || '') as string,
      type: (payload?.companyTaxCode || payload?.taxCode || raw?.companyTaxCode || raw?.taxCode) ? 'organization' : 'individual',
      taxCode: (payload?.companyTaxCode || payload?.taxCode || raw?.companyTaxCode || raw?.taxCode) as string | undefined,
      idNumber: (payload?.identityNumber || payload?.idNumber || raw?.identityNumber || raw?.idNumber) as string | undefined,
    };

    try {
      onSelect(normalized);
    } catch (err) {
      console.warn('onSelect callback threw when selecting new customer', err);
      onSelect(newCustomer as Customer);
    }

    setShowCustomerForm(false);
    triggerClose();
  };

  if (!open) return null;

  const overlay = (
    <>
      <Box onClick={triggerClose} sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', zIndex: 9999 }} />

      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 10000,
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
        <Box sx={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 10001, px: { xs: 2, sm: 3 } }}>
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
            <SearchBox fullWidth placeholder="Tìm kiếm khách hàng..." value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} />

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
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <Typography sx={{ fontSize: '16px', color: '#495057', mt: 2 }}>
                  {query ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng nào. Vui lòng thêm mới để tiếp tục'}
                </Typography>
                <Button variant="text" onClick={handleAddNew} startIcon={<Icon name="Add" size={20} color="#FB7E00" />} sx={{ mt: 2, color: '#FB7E00', textTransform: 'none' }}>
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
                      '&:hover': { backgroundColor: '#FBFBFB' },
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#212529', mb: 0 }}>{customer.name}</Typography>
                      <Typography sx={{ fontSize: '14px', color: '#6C757D' }}>{customer.code}</Typography>
                    </Box>

                    <Box sx={{ px: 1, py: 0.5, borderRadius: '16px', bgcolor: customer.type === 'organization' ? '#F0EBFE' : '#FFF9ED', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography sx={{ fontSize: '12px', fontWeight: 400, color: customer.type === 'organization' ? '#412294' : '#A77B2E' }}>
                        {customer.type === 'organization' ? 'Tổ chức' : 'Cá nhân'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Customer Form Modal */}
        {showCustomerForm && (
          <Box sx={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 10002, bgcolor: '#fff', animation: 'slideInFromRight 0.28s ease' }}>
            <CustomerFormScreen embedded={true} onClose={handleCustomerFormClose} onSaveSuccess={handleCustomerFormSave} />
          </Box>
        )}
      </Box>
    </>
  );

  // Render overlay into document.body so it sits above the Sales form and global headers
  if (typeof document !== 'undefined') {
    return createPortal(overlay, document.body);
  }
  return overlay;

  
};

export default CustomerSelectionScreen;
