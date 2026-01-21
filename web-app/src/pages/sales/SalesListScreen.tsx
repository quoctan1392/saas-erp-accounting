import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Chip,
  Fab,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import * as Iconsax from 'iconsax-react';
import { apiService } from '../../services/api';
import { formatCurrency, formatDate, getDateRangeForFilter } from '../../utils/dashboardUtils';
import TimeFilterSheet from '../../components/TimeFilterSheet';
import DateRangeBottomSheet from '../../components/DateRangeBottomSheet';
import PageHeader from '../../components/PageHeader';
import headerDay from '../../assets/Header_day.png';
import { useUi } from '../../context/UiContext';

interface SaleVoucher {
  id: string;
  voucherNumber: string;
  transactionDate: string;
  objectCode: string;
  objectName: string;
  objectAddress?: string;
  totalAmount: number;
  totalDiscountAmount?: number;
  totalVatAmount?: number;
  finalAmount: number;
  status: 'draft' | 'posted' | 'canceled';
  description?: string;
  createdAt: string;
}

const SalesListScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [vouchers, setVouchers] = useState<SaleVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Time filter states
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('this_month');
  const [currentRange, setCurrentRange] = useState<{ startDate: Date; endDate: Date }>(() =>
    getDateRangeForFilter('this_month')
  );
  const [tempTimeFilter, setTempTimeFilter] = useState<string>(selectedTimeFilter);
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [previewCustomStart, setPreviewCustomStart] = useState<string>('');
  const [previewCustomEnd, setPreviewCustomEnd] = useState<string>('');
  const [showTimeFilterSheet, setShowTimeFilterSheet] = useState(false);
  const [showDateRangeSheet, setShowDateRangeSheet] = useState(false);

  const tabFilters = useMemo(() => [
    { label: 'Tất cả', value: null },
    { label: 'Nháp', value: 'draft' },
    { label: 'Hoàn thành', value: 'posted' },
    { label: 'Đã hủy', value: 'canceled' },
  ], []);

  const loadVouchers = useCallback(async (loadMore = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = loadMore ? page + 1 : 1;
      const status = tabFilters[activeTab].value;
      
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: 20,
      };
      
      if (status) params.status = status;
      if (searchQuery) params.search = searchQuery;
      if (currentRange) {
        params.fromDate = currentRange.startDate.toISOString();
        params.toDate = currentRange.endDate.toISOString();
      }

      const response = await apiService.getSaleVouchers(params);
      
      const data = response?.data || response || [];
      const voucherList = Array.isArray(data) ? data : [];
      
      // If response has pagination info
      if (response?.total !== undefined) {
        setTotalCount(response.total);
      } else {
        setTotalCount(voucherList.length);
      }
      
      if (loadMore) {
        setVouchers((prev: SaleVoucher[]) => [...prev, ...voucherList]);
        setPage(currentPage);
      } else {
        setVouchers(voucherList);
        setPage(1);
      }
      
      setHasMore(voucherList.length === 20);
    } catch (err: unknown) {
      console.error('Error loading vouchers:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, page, tabFilters, currentRange]);

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  useEffect(() => {
    if (selectedTimeFilter !== 'custom') {
      setCurrentRange(getDateRangeForFilter(selectedTimeFilter));
    }
  }, [selectedTimeFilter]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleVoucherClick = (id: string) => {
    navigate(`/sales/orders/${id}`);
  };

  const handleCreateNew = () => {
    navigate('/sales/orders/new');
  };

  const getTimeFilterLabel = () => {
    if (selectedTimeFilter === 'custom') {
      return `${formatDate(currentRange.startDate)} - ${formatDate(currentRange.endDate)}`;
    }
    const labels: Record<string, string> = {
      today: 'Hôm nay',
      this_week: 'Tuần này',
      this_month: 'Tháng này',
      this_quarter: 'Quý này',
      this_year: 'Năm nay',
    };
    return labels[selectedTimeFilter] || 'Tháng này';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return '#FB7E00'; // Orange - Nháp
      case 'posted':
        return '#065F46'; // Green - Hoàn thành
      case 'canceled':
        return '#6B7280'; // Gray - Đã hủy
      default:
        return '#757575';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'draft':
        return '#FFF7ED'; // Light orange background
      case 'posted':
        return '#D1FAE5'; // Light green background
      case 'canceled':
        return '#F3F4F6'; // Light gray background
      default:
        return '#F3F4F6';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Nháp';
      case 'posted':
        return 'Hoàn thành';
      case 'canceled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const { setShowBottomNav } = useUi();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 10 }}>
      <PageHeader
        title="Hóa đơn bán hàng"
        onBack={() => navigate('/home')}
        backgroundImage={headerDay}
        variant="decorative"
        rightAction={(
          <IconButton sx={{ p: 0.5 }}>
            <Iconsax.More size={24} color="#212529" />
          </IconButton>
        )}
      />

      {/* Search */}
      <Container sx={{ mt: 2 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm hóa đơn, khách hàng..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconsax.SearchNormal1 size={20} color="rgba(0,0,0,0.38)" />
              </InputAdornment>
            ),
            sx: {
              height: 52,
              bgcolor: 'white',
              borderRadius: '12px',
              fontSize: '14px',
              '& fieldset': { border: 'none' },
              '& input::placeholder': {
                color: 'rgba(0,0,0,0.38)',
                fontSize: '14px',
              },
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            },
          }}
        />
      </Container>

      {/* Tabs & Time Filter */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0', mt: 2 }}>
        <Container>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                flex: 1,
                minHeight: 45,
                '& .MuiTab-root': {
                  minWidth: 'auto',
                  minHeight: 45,
                  px: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: 'rgba(0,0,0,0.6)',
                },
                '& .Mui-selected': {
                  bgcolor: '#FFF7ED',
                  color: '#BA5C00 !important',
                  fontWeight: 600,
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#FB7E00',
                  height: 2,
                },
              }}
            >
              {tabFilters.map((tab, index) => (
                <Tab key={index} label={tab.label} />
              ))}
            </Tabs>
            <IconButton 
              onClick={() => {
                setTempTimeFilter(selectedTimeFilter);
                setShowTimeFilterSheet(true);
              }}
              sx={{
                minWidth: 'auto',
                height: 36,
                px: 1.5,
                borderRadius: '8px',
                border: '1px solid #E0E0E0',
                bgcolor: 'white',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                  border: '1px solid #BDBDBD',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Iconsax.Calendar size={16} color="#666666" />
                <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#212529' }}>
                  {getTimeFilterLabel()}
                </Typography>
                <Iconsax.ArrowDown2 size={16} color="#666666" />
              </Box>
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* Result Count */}
      <Container sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Iconsax.Folder2 size={16} color="rgba(0,0,0,0.6)" />
          <Typography sx={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)' }}>
            {totalCount} hóa đơn
          </Typography>
        </Box>
      </Container>

      {/* Content */}
      <Container sx={{ mt: 2 }}>
        {loading && page === 1 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : vouchers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Iconsax.DocumentText size={64} color="#BDBDBD" variant="Bulk" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Chưa có hóa đơn nào
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {vouchers.map((voucher: SaleVoucher) => (
              <Card
                key={voucher.id}
                onClick={() => handleVoucherClick(voucher.id)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  '&:active': {
                    transform: 'scale(0.98)',
                    transition: 'transform 0.1s',
                  },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  {/* Header Row with Shop icon */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconsax.Shop size={20} color="#FB7E00" variant="Bold" />
                      <Typography variant="body2" fontWeight={600} color="#212529">
                        {voucher.voucherNumber}
                      </Typography>
                    </Box>
                    <Chip
                      label={getStatusLabel(voucher.status)}
                      size="small"
                      sx={{
                        bgcolor: getStatusBgColor(voucher.status),
                        color: getStatusColor(voucher.status),
                        fontWeight: 600,
                        fontSize: '11px',
                        height: '22px',
                        borderRadius: '6px',
                      }}
                    />
                  </Box>

                  {/* Meta info: date & creator */}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                    {formatDate(new Date(voucher.transactionDate))}
                  </Typography>

                  {/* Customer Info Card */}
                  <Box
                    sx={{
                      bgcolor: 'rgba(0,0,0,0.04)',
                      borderRadius: '8px',
                      p: 1.5,
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Iconsax.User size={16} color="#757575" />
                      <Typography variant="body2" fontWeight={500} color="#212529">
                        {voucher.objectName}
                      </Typography>
                    </Box>
                    {voucher.objectAddress && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Iconsax.Location size={16} color="#757575" />
                        <Typography variant="caption" color="text.secondary">
                          {voucher.objectAddress}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* TODO: Items preview section - will be added when API provides items data */}

                  {/* Summary Section */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="text.secondary">
                        Tổng tiền hàng
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {formatCurrency(voucher.totalAmount)}
                      </Typography>
                    </Box>
                    {voucher.totalDiscountAmount ? (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                          Chiết khấu
                        </Typography>
                        <Typography variant="caption" fontWeight={600} color="#DC2626">
                          -{formatCurrency(voucher.totalDiscountAmount)}
                        </Typography>
                      </Box>
                    ) : null}
                    {voucher.totalVatAmount ? (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                          Thuế GTGT
                        </Typography>
                        <Typography variant="caption" fontWeight={600} color="#059669">
                          +{formatCurrency(voucher.totalVatAmount)}
                        </Typography>
                      </Box>
                    ) : null}
                  </Box>

                  {/* Total Amount */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pt: 1.5,
                      borderTop: '1px solid #E5E7EB',
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} color="rgba(0,0,0,0.6)">
                      Tổng thanh toán
                    </Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ fontSize: '16px', color: '#FB7E00' }}>
                      {formatCurrency(voucher.finalAmount)}
                    </Typography>
                  </Box>

                  {/* TODO: Payment status & Invoice status badges - will be added when API provides this data */}
                </CardContent>
              </Card>
            ))}

            {/* Load More */}
            {hasMore && !loading && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ cursor: 'pointer', fontWeight: 500 }}
                  onClick={() => loadVouchers(true)}
                >
                  Xem thêm
                </Typography>
              </Box>
            )}

            {loading && page > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
        )}
      </Container>

      {/* FAB */}
      <Fab
        onClick={handleCreateNew}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          width: 56,
          height: 56,
          bgcolor: '#FB7E00',
          '&:hover': {
            bgcolor: '#E56E00',
          },
          boxShadow: '0 4px 12px rgba(251, 126, 0, 0.4)',
        }}
      >
        <Iconsax.Add size={24} color="white" variant="Bold" />
      </Fab>

      {/* Time Filter Sheet */}
      <TimeFilterSheet
        open={showTimeFilterSheet}
        onClose={() => {
          setShowTimeFilterSheet(false);
        }}
        tempTimeFilter={tempTimeFilter}
        setTempTimeFilter={setTempTimeFilter}
        selectedTimeFilter={selectedTimeFilter}
        setSelectedTimeFilter={setSelectedTimeFilter}
        currentRange={currentRange}
        setCurrentRange={setCurrentRange}
        customStart={customStart}
        customEnd={customEnd}
        setCustomStart={setCustomStart}
        setCustomEnd={setCustomEnd}
        previewCustomStart={previewCustomStart}
        previewCustomEnd={previewCustomEnd}
        setPreviewCustomStart={setPreviewCustomStart}
        setPreviewCustomEnd={setPreviewCustomEnd}
        setShowDateRangeSheet={setShowDateRangeSheet}
        setShowBottomNav={setShowBottomNav}
      />

      {/* Date Range Bottom Sheet */}
      <DateRangeBottomSheet
        open={showDateRangeSheet}
        onClose={() => {
          setShowDateRangeSheet(false);
        }}
        onConfirm={() => {
          setShowDateRangeSheet(false);
        }}
      />
    </Box>
  );
};

export default SalesListScreen;
