import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import {
  Box,
  Container,
  Typography,
  IconButton,
  InputAdornment,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';
import { ArrowBack } from '@mui/icons-material';
import RoundedTextField from '../../../components/RoundedTextField';
import AlertDialog from '../../../components/AlertDialog';
import SuccessSnackbar from '../../../components/SuccessSnackbar';
import CustomStepper from '../../../components/CustomStepper';
import AppButton from '../../../components/AppButton';
import SupplierSelectionScreen from './SupplierSelectionScreen';
import headerDay from '../../../assets/Header_day.png';
import * as Iconsax from 'iconsax-react';

const Icon = ({ name, size = 24, color = 'currentColor', variant = 'Outline' }: any) => {
  const Comp = (Iconsax as any)[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} variant={variant} />;
};

const formatNumber = (value: number): string => {
  return value.toLocaleString('en-US');
};

interface SupplierDebt {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierCode: string;
  supplierType: 'organization' | 'individual';
  amount: number;
  debtDate?: string;
  note?: string;
}
interface Supplier {
  id: string;
  name: string;
  code: string;
  type: 'organization' | 'individual';
  taxCode?: string;
  idNumber?: string;
}

const InitialBalanceStep3Screen = ({ embedded = false }: { embedded?: boolean }) => {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(true);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ANIM_MS = 280;

  // Form state
  const [supplierDebts, setSupplierDebts] = useState<SupplierDebt[]>([]);
  
  // Debt form state (slide-in panel)
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<SupplierDebt | null>(null);
  const [debtFormData, setDebtFormData] = useState({
    supplierId: '',
    supplierName: '',
    supplierCode: '',
    supplierType: 'organization' as 'organization' | 'individual',
    amount: 0,
    amountInput: '0',
    debtDate: '',
    note: '',
  });
  const [showSupplierSelection, setShowSupplierSelection] = useState(false);

  // Load saved data from server (preferred) or tenant-scoped localStorage on mount
  useEffect(() => {
    const getTenantId = () => {
      try {
        const sel = localStorage.getItem('selectedTenant');
        if (sel) return JSON.parse(sel).id;
        const cur = localStorage.getItem('currentTenant');
        if (cur) return JSON.parse(cur).id;
        const token = localStorage.getItem('tenantAccessToken');
        if (token) {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload && (payload.tenantId || payload.tenant)) return payload.tenantId || payload.tenant;
          }
        }
      } catch (err) {
        console.warn('getTenantId parse error', err);
      }
      return null;
    };

    (async () => {
      const tenantId = getTenantId();
      try {
        const periods = await apiService.getOpeningPeriods();
        if (periods && periods.length > 0) {
          // Only use server data if there's a locked (finalized) period
          const period = (periods as any[]).find((p) => p.isLocked || p.is_locked) || null;
          if (period) {
            try {
              const balances = await apiService.getOpeningBalances({ periodId: period.id, page: 1, limit: 200 });
              const list = Array.isArray(balances) ? balances : balances?.data || balances || [];
              const serverSuppliers: SupplierDebt[] = [];
              for (const b of list) {
                const acct = (b.accountNumber || b.account_number || '').toString();
                const credit = b.creditBalance ?? b.credit ?? b.amount ?? 0;
                if (acct === '331') {
                  serverSuppliers.push({
                    id: b.id || `sup_${Date.now()}_${Math.random()}`,
                    supplierId: b.accountObjectId || b.account_object_id || '',
                    supplierName: b.note || b.accountObjectName || 'Nhà cung cấp',
                    supplierCode: b.accountObjectCode || b.account_object_code || '',
                    supplierType: 'organization',
                    amount: Number(credit) || 0,
                    debtDate: undefined,
                    note: b.note || '',
                  });
                }
              }
              if (serverSuppliers.length > 0) {
                setSupplierDebts(serverSuppliers);
                return;
              }
            } catch (err) {
              console.warn('Failed to load opening balances from server', err);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch opening periods', err);
      }

      const draftKey = tenantId ? `initial_balance_draft_step3_${tenantId}` : 'initial_balance_draft_step3';
      const savedData = localStorage.getItem(draftKey);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.supplierDebts) setSupplierDebts(parsed.supplierDebts);
        } catch (e) {
          console.error('Error loading saved data:', e);
        }
      }
    })();
  }, []);

  // Play entrance animation: start off-screen to the right, then animate to 0
  useEffect(() => {
    requestAnimationFrame(() => setExiting(false));
  }, []);

  const tenantIdForUI = (() => {
    try {
      const s = localStorage.getItem('selectedTenant');
      if (s) return JSON.parse(s).id;
      const c = localStorage.getItem('currentTenant');
      if (c) return JSON.parse(c).id;
    } catch (e) {}
    return null;
  })();
  const completedStepsForUI = JSON.parse(localStorage.getItem(tenantIdForUI ? `initial_balance_completed_steps_${tenantIdForUI}` : 'initial_balance_completed_steps') || '[]');

  // Calculate total debt (BR01 for US07)
  const totalDebt = supplierDebts.reduce((sum, debt) => sum + debt.amount, 0);

  // Handle back navigation
  const handleBack = () => {
    const tenantId = (() => {
      try {
        const s = localStorage.getItem('selectedTenant');
        if (s) return JSON.parse(s).id;
        const c = localStorage.getItem('currentTenant');
        if (c) return JSON.parse(c).id;
      } catch (e) {}
      return null;
    })();
    const draftKey = tenantId ? `initial_balance_draft_step3_${tenantId}` : 'initial_balance_draft_step3';
    const draftData = { supplierDebts };
    localStorage.setItem(draftKey, JSON.stringify(draftData));

    setExiting(true);
    setTimeout(() => navigate(ROUTES.DECLARATION_INITIAL_BALANCE_STEP2), ANIM_MS);
  };

  // Handle skip
  const handleSkipClick = () => {
    setShowSkipDialog(true);
  };

  const handleSkipConfirm = () => {
    const tenantId = (() => {
      try {
        const s = localStorage.getItem('selectedTenant');
        if (s) return JSON.parse(s).id;
        const c = localStorage.getItem('currentTenant');
        if (c) return JSON.parse(c).id;
      } catch (e) {}
      return null;
    })();
    const draftKey = tenantId ? `initial_balance_draft_step3_${tenantId}` : 'initial_balance_draft_step3';
    const skippedKey = tenantId ? `initialBalanceSkipped_${tenantId}` : 'initialBalanceSkipped';
    const draftData = { supplierDebts };
    localStorage.setItem(draftKey, JSON.stringify(draftData));
    localStorage.setItem(skippedKey, 'true');
    setShowSkipDialog(false);
    setExiting(true);
    setTimeout(() => navigate(ROUTES.HOME), ANIM_MS);
  };

  // Handle complete - final step
  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      // Save step 3 data
      const tenantId = (() => {
        try {
          const s = localStorage.getItem('selectedTenant');
          if (s) return JSON.parse(s).id;
          const c = localStorage.getItem('currentTenant');
          if (c) return JSON.parse(c).id;
        } catch (e) {}
        return null;
      })();
      const draftKey = tenantId ? `initial_balance_draft_step3_${tenantId}` : 'initial_balance_draft_step3';
      const completedKey = tenantId ? `initial_balance_completed_steps_${tenantId}` : 'initial_balance_completed_steps';
      const stepKey = tenantId ? `initialBalanceStep_${tenantId}` : 'initialBalanceStep';
      const skippedKey = tenantId ? `initialBalanceSkipped_${tenantId}` : 'initialBalanceSkipped';

      const draftData = { supplierDebts };
      localStorage.setItem(draftKey, JSON.stringify(draftData));

      const completedSteps = JSON.parse(localStorage.getItem(completedKey) || '[]');
      if (!completedSteps.includes(2)) {
        completedSteps.push(2);
        localStorage.setItem(completedKey, JSON.stringify(completedSteps));
      }

      // Mark initial balance as completed
      localStorage.setItem(stepKey, 'completed');
      localStorage.setItem('declarationCompleted', 'true');
      localStorage.removeItem(skippedKey);
      
      // Show success message
      setSuccessMessage('Hoàn tất khai báo số dư ban đầu');
      setShowSuccessSnackbar(true);
      
      // Navigate to home after delay
      setTimeout(() => {
        setExiting(true);
        setTimeout(() => navigate(ROUTES.HOME), ANIM_MS);
      }, 1500);
      
    } catch (error) {
      console.error('Error completing initial balance:', error);
      setSuccessMessage('Có lỗi xảy ra, vui lòng thử lại');
      setShowSuccessSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debt form handlers
  const handleOpenDebtForm = (debt?: SupplierDebt) => {
    if (debt) {
      setEditingDebt(debt);
      setDebtFormData({
        supplierId: debt.supplierId,
        supplierName: debt.supplierName,
        supplierCode: debt.supplierCode,
        supplierType: debt.supplierType,
        amount: debt.amount,
        amountInput: formatNumber(debt.amount),
        debtDate: debt.debtDate || '',
        note: debt.note || '',
      });
    } else {
      setEditingDebt(null);
      setDebtFormData({
        supplierId: '',
        supplierName: '',
        supplierCode: '',
        supplierType: 'organization',
        amount: 0,
        amountInput: '0',
        debtDate: '',
        note: '',
      });
    }
    setShowDebtForm(true);
  };

  const handleCloseDebtForm = () => {
    setShowDebtForm(false);
    setEditingDebt(null);
  };

  const handleSupplierSelect = (supplier: Supplier) => {
    setDebtFormData(prev => ({
      ...prev,
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierCode: supplier.code,
      supplierType: supplier.type,
    }));
    setShowSupplierSelection(false);
  };

  const handleDebtAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(rawValue, 10) || 0;
    setDebtFormData(prev => ({
      ...prev,
      amount: numValue,
      amountInput: formatNumber(numValue),
    }));
  };

  const isDebtFormValid = () => {
    return debtFormData.supplierId && debtFormData.amount > 0;
  };

  const handleSaveDebt = () => {
    if (!isDebtFormValid()) return;

    // Check for duplicate supplier (except when editing the same debt)
    const isDuplicate = supplierDebts.some(d => 
      d.supplierId === debtFormData.supplierId && 
      (!editingDebt || d.id !== editingDebt.id)
    );

    if (isDuplicate) {
      setSuccessMessage('Nhà cung cấp này đã được khai báo công nợ');
      setShowSuccessSnackbar(true);
      return;
    }

    if (editingDebt) {
      // Update existing
      setSupplierDebts(prev => prev.map(d => 
        d.id === editingDebt.id 
          ? { 
              ...d, 
              supplierId: debtFormData.supplierId,
              supplierName: debtFormData.supplierName,
              supplierCode: debtFormData.supplierCode,
              supplierType: debtFormData.supplierType,
              amount: debtFormData.amount,
              debtDate: debtFormData.debtDate,
              note: debtFormData.note,
            }
          : d
      ));
      setSuccessMessage('Đã cập nhật thành công');
    } else {
      // Add new
      const newDebt: SupplierDebt = {
        id: `supplier_debt_${Date.now()}`,
        supplierId: debtFormData.supplierId,
        supplierName: debtFormData.supplierName,
        supplierCode: debtFormData.supplierCode,
        supplierType: debtFormData.supplierType,
        amount: debtFormData.amount,
        debtDate: debtFormData.debtDate,
        note: debtFormData.note,
      };
      setSupplierDebts(prev => [...prev, newDebt]);
      setSuccessMessage('Đã thêm công nợ nhà cung cấp');
    }
    
    setShowSuccessSnackbar(true);
    handleCloseDebtForm();
  };

  // Delete handlers
  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      setSupplierDebts(prev => prev.filter(d => d.id !== deleteTargetId));
      setSuccessMessage('Đã xóa thành công');
      setShowSuccessSnackbar(true);
    }
    setShowDeleteDialog(false);
    setDeleteTargetId(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        pt: 0,
        transform: embedded ? undefined : exiting ? 'translateX(100%)' : 'translateX(0)',
        transition: embedded ? undefined : `transform ${ANIM_MS}ms ease`,
      }}
    >
      {/* Top decorative image */}
      <Box sx={{ height: { xs: 160, sm: 120 }, width: '100%', backgroundImage: `url(${headerDay})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

      {/* Fixed header */}
      <Box sx={{ position: 'fixed', top: 36, left: 0, right: 0, zIndex: 20, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 'sm', mx: 'auto', py: 0.5 }}>
          {/* Header row */}
          <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <IconButton
              onClick={handleBack}
              sx={{ width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}
            >
              <ArrowBack />
            </IconButton>

            <Typography sx={{ color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '20px', fontWeight: 500 }}>
              Khai báo số dư ban đầu
            </Typography>

            <Typography
              onClick={handleSkipClick}
              sx={{ fontSize: '14px', fontWeight: 500, color: '#1976D2', cursor: 'pointer', '&:hover': { color: '#1565C0' } }}
            >
              Bỏ qua
            </Typography>
          </Box>
        </Box>
      </Box>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, pt: { xs: '80px', sm: '60px' }, pb: 2 }}>
        <Box
          sx={{
            borderRadius: { xs: '16px 16px 0 0', sm: '16px' },
            px: 2,
            py: { xs: 1, sm: 2 },
            pb: { xs: `calc(100px + env(safe-area-inset-bottom, 0px))`, sm: 4 },
            position: { xs: 'fixed', sm: 'relative' },
            top: { xs: '100px', sm: 'auto' },
            bottom: { xs: 0, sm: 'auto' },
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            overflowY: { xs: 'auto', sm: 'visible' },
            bgcolor: 'transparent',
          }}
        >
          {/* Description Text */}
          <Typography sx={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', mb: 2, lineHeight: 1.5 }}>
            Nhập số dư đầu kỳ để quản lý sổ sách chính xác ngay từ ngày đầu. Bạn có thể chỉnh sửa sau trong phần thiết lập.
          </Typography>

          {/* Custom Stepper */}
          <Box sx={{ mb: 4 }}>
            <CustomStepper
              steps={[
                { label: 'Tiền mặt,', subLabel: 'tiền gửi' },
                { label: 'Công nợ', subLabel: 'khách hàng' },
                { label: 'Công nợ', subLabel: 'nhà cung cấp' },
              ]}
              activeStep={2}
              completedSteps={completedStepsForUI}
            />
          </Box>

          {/* Supplier Debts Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#212529', ml: '8px' }}>
                Công nợ nhà cung cấp
              </Typography>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#007DFB', mr: '8px' }}>
                {formatNumber(totalDebt)} đ
              </Typography>
            </Box>

            {supplierDebts.length === 0 ? (
              /* Empty State */
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: '16px 12px',
                  bgcolor: '#F8F9FA',
                  borderRadius: '12px',
                  border: '1px solid #C5C5C5',
                  mb: 2,
                }}
              >
                <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#767676', textAlign: 'center' }}>
                  Chưa có thông tin công nợ nhà cung cấp.
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#A0A0A0', textAlign: 'center' }}>
                  Nhấn Khai báo công nợ nhà cung cấp để bắt đầu.
                </Typography>
              </Box>
            ) : (
              /* Debt Cards */
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                {supplierDebts.map((debt) => (
                  <Box
                    key={debt.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: '12px',
                      bgcolor: '#F9F9F9',
                      borderRadius: '12px',
                    }}
                  >
                    {/* Supplier Info: name / code / amount stacked (name should take remaining width) */}
                    <Box sx={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
                      <Typography
                        sx={{
                          fontSize: '16px',
                          fontWeight: 500,
                          color: '#212529',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'block',
                          maxWidth: '100%',
                        }}
                      >
                        {debt.supplierName}
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#6C757D', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {debt.supplierCode}
                      </Typography>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1976D2' }}>
                        {formatNumber(debt.amount)} ₫
                      </Typography>
                    </Box>
                    {/* Actions (fixed-size so name can shrink) */}
                    <Box sx={{ display: 'flex', gap: 1, flex: '0 0 auto' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDebtForm(debt)}
                        sx={{
                          bgcolor: '#FFFFFF',
                          borderRadius: '100px',
                          width: 36,
                          height: 36,
                          '&:hover': { bgcolor: '#FFFFFF' },
                        }}
                      >
                        <Icon name="Edit2" size={20} color="#6C757D" variant="Outline" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(debt.id)}
                        sx={{
                          bgcolor: '#FFFFFF',
                          borderRadius: '100px',
                          width: 36,
                          height: 36,
                          '&:hover': { bgcolor: '#FFFFFF' },
                        }}
                      >
                        <Icon name="Trash" size={20} color="#DC3545" variant="Outline" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* Add Debt Button */}
            <Box
              onClick={() => handleOpenDebtForm()}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                p: '12px',
                bgcolor: '#E9F3FF',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: '#D0E6FF',
                },
              }}
            >
              <Icon name="Add" size={20} color="#007DFB" variant="Outline" />
              <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#007DFB' }}>
                Khai báo công nợ nhà cung cấp
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Footer Button - Final Step */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          pb: `calc(16px + env(safe-area-inset-bottom, 0px))`,
          bgcolor: '#FFFFFF',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
          zIndex: 30,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 'calc(100%)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <AppButton
              variantType="primary"
              fullWidth
              onClick={handleComplete}
              disabled={isSubmitting}
              sx={{ width: '100%' }}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Bắt đầu sử dụng'}
            </AppButton>
          </Box>
        </Box>
      </Box>

      {/* Debt Form (Slide-in Panel) */}
      {showDebtForm && (
        <>
          <Box
            onClick={handleCloseDebtForm}
            sx={{
              position: 'fixed',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.4)',
              zIndex: 1200,
            }}
          />
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
              animation: 'slideInFromRight 0.28s ease',
              '@keyframes slideInFromRight': {
                from: { transform: 'translateX(100%)' },
                to: { transform: 'translateX(0)' },
              },
            }}
          >
            {/* Form Header */}
            <Box sx={{ height: { xs: 160, sm: 120 }, width: '100%', backgroundImage: `url(${headerDay})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

            <Box sx={{ position: 'absolute', top: 36, left: 0, right: 0, zIndex: 1202, px: { xs: 2, sm: 3 } }}>
              <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 'sm', mx: 'auto', py: 0.5 }}>
                <IconButton
                  onClick={handleCloseDebtForm}
                  sx={{ position: 'absolute', left: 0, top: 6, width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}
                >
                  <ArrowBack />
                </IconButton>

                <Typography sx={{ color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '18px', fontWeight: 500, height: 40, display: 'flex', alignItems: 'center' }}>
                  {editingDebt ? 'Chỉnh sửa công nợ' : 'Khai báo công nợ nhà cung cấp'}
                </Typography>
              </Box>
            </Box>

            {/* Form Content */}
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 'sm', mx: 'auto' }}>
                {/* Supplier Selection (match customer UI) */}
                <RoundedTextField
                  fullWidth
                  label="Chọn nhà cung cấp *"
                  value={debtFormData.supplierName ? `${debtFormData.supplierName} - ${debtFormData.supplierCode}` : ''}
                  placeholder="Chọn nhà cung cấp"
                  onClick={() => setShowSupplierSelection(true)}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Icon name="ArrowDown2" size={20} color="#6C757D" variant="Outline" />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Debt Amount (match customer amount field) */}
                <RoundedTextField
                  fullWidth
                  label="Số tiền còn phải trả *"
                  value={debtFormData.amountInput}
                  placeholder="Nhập số tiền còn phải trả"
                  onChange={handleDebtAmountChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography sx={{ fontSize: '16px', color: '#495057' }}>₫</Typography>
                      </InputAdornment>
                    ),
                    inputMode: 'decimal' as any,
                  }}
                />
              </Box>
            </Box>

            {/* Form Footer */}
            <Box
              sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                pb: `calc(16px + env(safe-area-inset-bottom, 0px))`,
                bgcolor: '#FFFFFF',
                boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
              }}
            >
              <Button
                fullWidth
                variant="contained"
                onClick={handleSaveDebt}
                disabled={!isDebtFormValid()}
                sx={{
                  bgcolor: '#FB7E00',
                  borderRadius: '100px',
                  height: 48,
                  fontSize: '16px',
                  fontWeight: 500,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#E67000' },
                  '&:disabled': { bgcolor: '#E9ECEF', color: '#ADB5BD' },
                }}
              >
                Hoàn tất
              </Button>
            </Box>
          </Box>
        </>
      )}

      {/* Supplier Selection Screen */}
      <SupplierSelectionScreen
        open={showSupplierSelection}
        onClose={() => setShowSupplierSelection(false)}
        onSelect={handleSupplierSelect}
        excludeIds={supplierDebts.map(d => d.supplierId).filter(id => !editingDebt || id !== editingDebt.supplierId)}
      />

      {/* Skip Confirm Dialog */}
      <AlertDialog
        variant="confirm"
        open={showSkipDialog}
        onClose={() => setShowSkipDialog(false)}
        title="Bỏ qua khai báo số dư?"
        description="Dữ liệu đã nhập ở các bước trước sẽ được lưu. Bạn có thể quay lại khai báo sau trong phần Cài đặt."
        confirmText="Bỏ qua"
        cancelText="Tiếp tục"
        onConfirm={handleSkipConfirm}
      />

      {/* Delete Confirm Dialog */}
      <AlertDialog
        variant="confirm"
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Xác nhận xóa công nợ?"
        description="Bạn chắc chắn muốn xóa công nợ này. Thao tác này không thể khôi phục."
        confirmText="Đồng ý"
        cancelText="Hủy"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
      />

      {/* Success Snackbar */}
      <SuccessSnackbar
        open={showSuccessSnackbar}
        message={successMessage}
        onClose={() => setShowSuccessSnackbar(false)}
      />
    </Box>
  );
};

export default InitialBalanceStep3Screen;
