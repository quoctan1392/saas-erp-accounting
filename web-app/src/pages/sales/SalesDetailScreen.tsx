import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Divider,
  Menu,
  MenuItem,
} from '@mui/material';
import * as Iconsax from 'iconsax-react';
import { apiService } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/dashboardUtils';

interface SaleVoucher {
  id: string;
  voucherNumber: string;
  transactionDate: string;
  postingDate?: string;
  objectCode: string;
  objectName: string;
  objectAddress?: string;
  objectPhone?: string;
  totalAmount: number;
  totalDiscountAmount?: number;
  totalVatAmount?: number;
  finalAmount: number;
  status: 'draft' | 'posted' | 'canceled';
  description?: string;
  createdAt: string;
  createdBy?: string;
  items?: Array<{
    id: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    total: number;
  }>;
}

const SalesDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [voucher, setVoucher] = useState<SaleVoucher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null);

  const loadVoucher = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getSaleVoucher(id!);
      setVoucher(data);
    } catch (err: unknown) {
      console.error('Error loading voucher:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin hóa đơn');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadVoucher();
    }
  }, [id, loadVoucher]);

  const handleEdit = () => {
    navigate(`/sales/orders/${id}/edit`);
  };

  const handlePost = async () => {
    try {
      await apiService.postSaleVoucher(id!);
      loadVoucher();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể ghi sổ');
    }
  };

  const handleUnpost = async () => {
    try {
      // TODO: Implement unpostSaleVoucher API endpoint
      // await apiService.unpostSaleVoucher(id!);
      console.log('Unpost voucher:', id);
      alert('Chức năng bỏ ghi sổ chưa được triển khai');
      loadVoucher();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể bỏ ghi');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) return;
    try {
      await apiService.deleteSaleVoucher(id!);
      navigate('/sales/orders');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể xóa hóa đơn');
    }
  };

  const handlePrint = () => {
    // TODO: Implement print functionality
    console.log('Print voucher:', id);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share voucher:', id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return '#FB7E00';
      case 'posted':
        return '#065F46';
      case 'canceled':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'draft':
        return '#FFF7ED';
      case 'posted':
        return '#D1FAE5';
      case 'canceled':
        return '#F3F4F6';
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

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !voucher) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
          <Container>
            <Box sx={{ display: 'flex', alignItems: 'center', height: 56 }}>
              <IconButton onClick={() => navigate('/sales/orders')} sx={{ p: 0.5 }}>
                <Iconsax.ArrowLeft2 size={24} color="#212529" />
              </IconButton>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#212529', ml: 1 }}>
                Chi tiết hóa đơn
              </Typography>
            </Box>
          </Container>
        </Box>
        <Container sx={{ mt: 2 }}>
          <Alert severity="error">{error || 'Không tìm thấy hóa đơn'}</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', pb: 10 }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
        <Container>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            height: 56,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={() => navigate('/sales/orders')} sx={{ p: 0.5 }}>
                <Iconsax.ArrowLeft2 size={24} color="#212529" />
              </IconButton>
              <Typography sx={{ fontSize: 18, fontWeight: 600, color: '#212529' }}>
                Chi tiết hóa đơn
              </Typography>
            </Box>
            <IconButton 
              onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
              sx={{ p: 0.5 }}
            >
              <Iconsax.More size={24} color="#212529" />
            </IconButton>
          </Box>
        </Container>
      </Box>

      <Container sx={{ mt: 2 }}>
        {/* Voucher Info Card */}
        <Card sx={{ mb: 2, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 2.5 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  bgcolor: '#FFF7ED', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Iconsax.Shop size={20} color="#FB7E00" variant="Bold" />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 16, color: '#1F2937' }}>
                    {voucher.voucherNumber}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
                    {formatDate(new Date(voucher.transactionDate))} {voucher.createdBy && `• ${voucher.createdBy}`}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={getStatusLabel(voucher.status)}
                size="small"
                sx={{
                  bgcolor: getStatusBgColor(voucher.status),
                  color: getStatusColor(voucher.status),
                  fontWeight: 600,
                  fontSize: 12,
                  height: 24,
                  borderRadius: '6px',
                }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Customer Info */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 1 }}>
                Khách hàng
              </Typography>
              <Box
                sx={{
                  bgcolor: 'rgba(0,0,0,0.04)',
                  borderRadius: '8px',
                  p: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Iconsax.User size={16} color="#757575" />
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                    {voucher.objectName}
                  </Typography>
                </Box>
                {voucher.objectPhone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Iconsax.Call size={16} color="#757575" />
                    <Typography sx={{ fontSize: 13, color: 'rgba(0,0,0,0.6)' }}>
                      {voucher.objectPhone}
                    </Typography>
                  </Box>
                )}
                {voucher.objectAddress && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Iconsax.Location size={16} color="#757575" />
                    <Typography sx={{ fontSize: 13, color: 'rgba(0,0,0,0.6)' }}>
                      {voucher.objectAddress}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Items */}
            {voucher.items && voucher.items.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 1 }}>
                  Danh sách hàng hóa ({voucher.items.length})
                </Typography>
                {voucher.items.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: '1px solid #F3F4F6',
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Iconsax.Box size={16} color="#FB7E00" />
                        <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                          {item.itemName}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
                        {item.quantity} x {formatCurrency(item.unitPrice)} {item.discount ? `(CK: ${formatCurrency(item.discount)})` : ''}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                      {formatCurrency(item.total)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Summary */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>
                  Tổng tiền hàng
                </Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  {formatCurrency(voucher.totalAmount)}
                </Typography>
              </Box>
              {voucher.totalDiscountAmount && voucher.totalDiscountAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>
                    Chiết khấu
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#DC2626' }}>
                    -{formatCurrency(voucher.totalDiscountAmount)}
                  </Typography>
                </Box>
              )}
              {voucher.totalVatAmount && voucher.totalVatAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 14, color: 'rgba(0,0,0,0.6)' }}>
                    Thuế GTGT
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>
                    +{formatCurrency(voucher.totalVatAmount)}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'rgba(251, 126, 0, 0.1)',
                borderRadius: '8px',
                p: 1.5,
              }}
            >
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'rgba(0,0,0,0.6)' }}>
                Tổng thanh toán
              </Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#FB7E00' }}>
                {formatCurrency(voucher.finalAmount)}
              </Typography>
            </Box>

            {/* Description */}
            {voucher.description && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography sx={{ fontSize: 13, color: '#6B7280', mb: 0.5 }}>
                    Diễn giải
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: '#374151' }}>
                    {voucher.description}
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        {/* Related Documents */}
        <Card sx={{ mb: 2, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#212529', mb: 1.5 }}>
              Chứng từ liên quan
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* TODO: Add related documents when available from API */}
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography sx={{ fontSize: 13, color: '#6B7280' }}>
                  Chưa có chứng từ liên quan
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          {voucher.status === 'draft' && (
            <>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleEdit}
                startIcon={<Iconsax.Edit2 size={20} />}
                sx={{
                  borderColor: '#E5E7EB',
                  color: '#374151',
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#D1D5DB',
                    bgcolor: '#F9FAFB',
                  },
                }}
              >
                Sửa
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handlePost}
                startIcon={<Iconsax.TickCircle size={20} />}
                sx={{
                  bgcolor: '#FB7E00',
                  fontWeight: 600,
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(251, 126, 0, 0.3)',
                  '&:hover': {
                    bgcolor: '#E56E00',
                  },
                }}
              >
                Ghi sổ
              </Button>
            </>
          )}
          {voucher.status === 'posted' && (
            <Button
              variant="outlined"
              fullWidth
              onClick={handleUnpost}
              startIcon={<Iconsax.CloseCircle size={20} />}
              sx={{
                borderColor: '#FB7E00',
                color: '#FB7E00',
                fontWeight: 600,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#E56E00',
                  bgcolor: 'rgba(251, 126, 0, 0.05)',
                },
              }}
            >
              Bỏ ghi
            </Button>
          )}
        </Box>

        {/* Print and Share Buttons */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handlePrint}
            startIcon={<Iconsax.Printer size={20} />}
            sx={{
              borderColor: '#E5E7EB',
              color: '#374151',
              fontWeight: 600,
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#D1D5DB',
                bgcolor: '#F9FAFB',
              },
            }}
          >
            In
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleShare}
            startIcon={<Iconsax.Share size={20} />}
            sx={{
              borderColor: '#E5E7EB',
              color: '#374151',
              fontWeight: 600,
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#D1D5DB',
                bgcolor: '#F9FAFB',
              },
            }}
          >
            Chia sẻ
          </Button>
        </Box>
      </Container>

      {/* More Menu */}
      <Menu
        anchorEl={moreMenuAnchor}
        open={Boolean(moreMenuAnchor)}
        onClose={() => setMoreMenuAnchor(null)}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 180,
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          },
        }}
      >
        {voucher.status === 'draft' && (
          <MenuItem
            onClick={() => {
              setMoreMenuAnchor(null);
              handleDelete();
            }}
            sx={{ color: '#DC2626', fontSize: 14, py: 1.5 }}
          >
            <Iconsax.Trash size={18} color="#DC2626" style={{ marginRight: 8 }} />
            Xóa hóa đơn
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setMoreMenuAnchor(null);
            handlePrint();
          }}
          sx={{ fontSize: 14, py: 1.5 }}
        >
          <Iconsax.Printer size={18} style={{ marginRight: 8 }} />
          In hóa đơn
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMoreMenuAnchor(null);
            handleShare();
          }}
          sx={{ fontSize: 14, py: 1.5 }}
        >
          <Iconsax.Share size={18} style={{ marginRight: 8 }} />
          Chia sẻ
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default SalesDetailScreen;
