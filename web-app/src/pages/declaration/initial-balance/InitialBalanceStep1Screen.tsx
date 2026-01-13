import { useState, useEffect } from 'react';
import { apiService } from '../../../services/api';
import {
  Box,
  Container,
  Typography,
  IconButton,
  InputAdornment,
  Divider,
  Button,
  Chip,
  Radio,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/constants';
import { ArrowBack } from '@mui/icons-material';
import RoundedTextField from '../../../components/RoundedTextField';
import AlertDialog from '../../../components/AlertDialog';
import SuccessSnackbar from '../../../components/SuccessSnackbar';
import CustomStepper from '../../../components/CustomStepper';
import AppButton from '../../../components/AppButton';
import BankSelectionScreen from '../BankSelectionScreen';
import SearchBox from '../../../components/SearchBox';
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

interface BankAccount {
  id: string;
  bankCode: string;
  bankShortName: string;
  bankName: string;
  bankLogo?: string;
  accountNumber: string;
  accountHolder?: string;
  province?: string;
  branch?: string;
  branchAddress?: string;
  description?: string;
}

interface BankDeposit {
  id: string;
  bankAccountId: string;
  bankShortName: string;
  accountNumber: string;
  bankLogo?: string;
  balance: number;
}

const QUICK_BANKS = [
  { shortName: 'Vietcombank', name: 'Ngân hàng Ngoại thương Việt Nam' },
  { shortName: 'BIDV', name: 'Ngân hàng Đầu tư và Phát triển Việt Nam' },
  { shortName: 'VietinBank', name: 'Ngân hàng Công Thương Việt Nam' },
  { shortName: 'Agribank', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam' },
  { shortName: 'Techcombank', name: 'Ngân hàng Kỹ thương Việt Nam' },
  { shortName: 'MB Bank', name: 'Ngân hàng Quân đội' },
];

const InitialBalanceStep1Screen = ({ embedded = false }: { embedded?: boolean }) => {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(true);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const ANIM_MS = 280;

  const [cashBalance, setCashBalance] = useState<number>(0);
  const [cashBalanceInput, setCashBalanceInput] = useState<string>('');
  const [bankDeposits, setBankDeposits] = useState<BankDeposit[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showBankAccountSelection, setShowBankAccountSelection] = useState(false);
  const [showAddBankAccount, setShowAddBankAccount] = useState(false);
  const [showBankSelection, setShowBankSelection] = useState(false);

  const [bankSearch, setBankSearch] = useState('');

  const [editingDeposit, setEditingDeposit] = useState<BankDeposit | null>(null);
  const [depositFormData, setDepositFormData] = useState({
    bankAccountId: '',
    bankShortName: '',
    accountNumber: '',
    bankLogo: '',
    balance: 0,
    balanceInput: '',
  });

  const [bankAccountFormData, setBankAccountFormData] = useState({
    bankCode: '',
    bankShortName: '',
    bankName: '',
    bankLogo: '',
    accountNumber: '',
    accountHolder: '',
    province: '',
    branch: '',
    branchAddress: '',
    description: '',
  });

  useEffect(() => {
    // Load tenant-aware draft or server data. Prefer server data when a period exists.
    const getTenantId = () => {
      try {
        const sel = localStorage.getItem('selectedTenant');
        if (sel) {
          const t = JSON.parse(sel);
          if (t && t.id) return t.id;
        }
        const cur = localStorage.getItem('currentTenant');
        if (cur) {
          const t = JSON.parse(cur);
          if (t && t.id) return t.id;
        }
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

      const stepKey = tenantId ? `initialBalanceStep_${tenantId}` : 'initialBalanceStep';
      const completedKey = tenantId ? `initial_balance_completed_steps_${tenantId}` : 'initial_balance_completed_steps';
      const completedSteps = JSON.parse(localStorage.getItem(completedKey) || '[]');
      const hasCompletedSteps = Array.isArray(completedSteps) && completedSteps.length > 0;
      const hasVisited = localStorage.getItem(stepKey) === 'completed' || hasCompletedSteps;

      try {
        // Only fetch server data when tenant has previously progressed in initial-balance
        if (hasVisited) {
          const periods = await apiService.getOpeningPeriods();
          if (periods && periods.length > 0) {
            // Prefer only locked (finalized) periods — treat unlocked/in-progress as no server data
            const period = (periods as any[]).find((p) => p.isLocked || p.is_locked) || null;
            if (period) {
              try {
                const balances = await apiService.getOpeningBalances({ periodId: period.id, page: 1, limit: 200 });
                const list = Array.isArray(balances) ? balances : balances?.data || balances || [];
                let serverCash = 0;
                const serverBanks: BankDeposit[] = [];
                for (const b of list) {
                  const acct = (b.accountNumber || b.account_number || '').toString();
                  const debit = b.debitBalance ?? b.debit ?? b.amount ?? 0;
                  if (acct === '1111') {
                    serverCash = Number(debit) || 0;
                  }
                  if (acct === '1121') {
                    serverBanks.push({
                      id: b.id || `bal_${Date.now()}`,
                      bankAccountId: b.accountObjectId || acct,
                      bankShortName: b.note || 'Tài khoản ngân hàng',
                      accountNumber: b.accountNumber || b.account_number || '',
                      bankLogo: '',
                      balance: Number(debit) || 0,
                    });
                  }
                }
                setCashBalance(serverCash);
                setCashBalanceInput(serverCash > 0 ? formatNumber(serverCash) : '');
                setBankDeposits(serverBanks);
                return; // loaded from server, skip tenant-local draft
              } catch (err) {
                console.warn('Failed to load opening balances from server', err);
              }
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch opening periods', err);
      }

      // No server data — load tenant-scoped draft (if present)
      const draftKey = tenantId ? `initial_balance_draft_step1_${tenantId}` : 'initial_balance_draft_step1';
      const savedData = localStorage.getItem(draftKey);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.cashBalance !== undefined) {
            setCashBalance(parsed.cashBalance);
            setCashBalanceInput(parsed.cashBalance > 0 ? formatNumber(parsed.cashBalance) : '');
          }
          if (parsed.bankDeposits) {
            setBankDeposits(parsed.bankDeposits);
          }
        } catch (e) {
          console.error('Error loading saved data:', e);
        }
      }

      const accountsKey = tenantId ? `bank_accounts_${tenantId}` : 'bank_accounts';
      const savedAccounts = localStorage.getItem(accountsKey);
      if (savedAccounts) {
        try {
          setBankAccounts(JSON.parse(savedAccounts));
        } catch (e) {
          console.error('Error loading bank accounts:', e);
        }
      }
    })();
  }, []);

  // Play entrance animation: start off-screen to the right, then animate to 0
  useEffect(() => {
    requestAnimationFrame(() => setExiting(false));
  }, []);

  const totalBalance =
    cashBalance + bankDeposits.reduce((sum, deposit) => sum + deposit.balance, 0);

  const handleCashBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(rawValue, 10) || 0;
    setCashBalance(numValue);
    setCashBalanceInput(numValue > 0 ? formatNumber(numValue) : '');
  };

  const handleBack = () => {
    setExiting(true);
    setTimeout(() => navigate(ROUTES.DECLARATION_CATEGORIES), ANIM_MS);
  };

  const handleSkipClick = () => setShowSkipDialog(true);

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
    const draftKey = tenantId ? `initial_balance_draft_step1_${tenantId}` : 'initial_balance_draft_step1';
    const skippedKey = tenantId ? `initialBalanceSkipped_${tenantId}` : 'initialBalanceSkipped';
    const draftData = { cashBalance, bankDeposits };
    localStorage.setItem(draftKey, JSON.stringify(draftData));
    localStorage.setItem(skippedKey, 'true');
    setShowSkipDialog(false);
    setExiting(true);
    setTimeout(() => navigate(ROUTES.HOME), ANIM_MS);
  };

  const handleContinue = () => {
    const tenantId = (() => {
      try {
        const s = localStorage.getItem('selectedTenant');
        if (s) return JSON.parse(s).id;
        const c = localStorage.getItem('currentTenant');
        if (c) return JSON.parse(c).id;
      } catch (e) {}
      return null;
    })();
    const draftKey = tenantId ? `initial_balance_draft_step1_${tenantId}` : 'initial_balance_draft_step1';
    const stepKey = tenantId ? `initialBalanceStep_${tenantId}` : 'initialBalanceStep';
    const completedKey = tenantId ? `initial_balance_completed_steps_${tenantId}` : 'initial_balance_completed_steps';
    const draftData = { cashBalance, bankDeposits };
    localStorage.setItem(draftKey, JSON.stringify(draftData));
    localStorage.setItem(stepKey, '2');
    const completedSteps = JSON.parse(localStorage.getItem(completedKey) || '[]');
    if (!completedSteps.includes(0)) {
      completedSteps.push(0);
      localStorage.setItem(completedKey, JSON.stringify(completedSteps));
    }
    // Navigate immediately so the next route (Step2) can handle its slide-in animation.
    navigate(ROUTES.DECLARATION_INITIAL_BALANCE_STEP2);
  };

  const handleOpenDepositForm = (deposit?: BankDeposit) => {
    if (deposit) {
      setEditingDeposit(deposit);
      setDepositFormData({
        bankAccountId: deposit.bankAccountId,
        bankShortName: deposit.bankShortName,
        accountNumber: deposit.accountNumber,
        bankLogo: deposit.bankLogo || '',
        balance: deposit.balance,
        balanceInput: deposit.balance > 0 ? formatNumber(deposit.balance) : '',
      });
    } else {
      setEditingDeposit(null);
      setDepositFormData({
        bankAccountId: '',
        bankShortName: '',
        accountNumber: '',
        bankLogo: '',
        balance: 0,
        balanceInput: '',
      });
    }
    setShowDepositForm(true);
  };

  const handleCloseDepositForm = () => {
    setShowDepositForm(false);
    setEditingDeposit(null);
  };

  const handleDepositBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(rawValue, 10) || 0;
    setDepositFormData((prev) => ({
      ...prev,
      balance: numValue,
      balanceInput: numValue > 0 ? formatNumber(numValue) : '',
    }));
  };

  const isDepositFormValid = () => depositFormData.bankAccountId && depositFormData.balance >= 0;

  const handleSaveDeposit = () => {
    if (!isDepositFormValid()) return;
    if (editingDeposit) {
      setBankDeposits((prev) =>
        prev.map((d) => (d.id === editingDeposit.id ? { ...d, ...depositFormData } : d)),
      );
      setSuccessMessage('Đã cập nhật thành công');
    } else {
      const newDeposit: BankDeposit = {
        id: `deposit_${Date.now()}`,
        bankAccountId: depositFormData.bankAccountId,
        bankShortName: depositFormData.bankShortName,
        accountNumber: depositFormData.accountNumber,
        bankLogo: depositFormData.bankLogo,
        balance: depositFormData.balance,
      };
      setBankDeposits((prev) => [...prev, newDeposit]);
      setSuccessMessage('Đã thêm số dư tiền gửi');
    }
    setShowSuccessSnackbar(true);
    handleCloseDepositForm();
  };

  const handleOpenBankAccountSelection = () => setShowBankAccountSelection(true);
  const handleCloseBankAccountSelection = () => setShowBankAccountSelection(false);

  const handleSelectBankAccount = (account: BankAccount) => {
    setDepositFormData((prev) => ({
      ...prev,
      bankAccountId: account.id,
      bankShortName: account.bankShortName,
      accountNumber: account.accountNumber,
      bankLogo: account.bankLogo || '',
    }));
    handleCloseBankAccountSelection();
  };

  const handleOpenAddBankAccount = () => {
    setBankAccountFormData({
      bankCode: '',
      bankShortName: '',
      bankName: '',
      bankLogo: '',
      accountNumber: '',
      accountHolder: '',
      province: '',
      branch: '',
      branchAddress: '',
      description: '',
    });
    setShowAddBankAccount(true);
  };

  const handleCloseAddBankAccount = () => setShowAddBankAccount(false);

  const handleBankSelect = (shortName: string, fullName: string) => {
    const bankLogos: Record<string, string> = {
      Vietcombank: 'https://my.sepay.vn/assets/images/banklogo/vietcombank-icon.png',
      Techcombank: 'https://my.sepay.vn/assets/images/banklogo/techcombank-icon.png',
      BIDV: 'https://my.sepay.vn/assets/images/banklogo/bidv-icon.png',
      VietinBank: 'https://my.sepay.vn/assets/images/banklogo/vietinbank-icon.png',
      Agribank: 'https://my.sepay.vn/assets/images/banklogo/agribank-icon.png',
      'MB Bank': 'https://my.sepay.vn/assets/images/banklogo/mbbank-icon.png',
      TPBank: 'https://my.sepay.vn/assets/images/banklogo/tpbank-icon.png',
      VPBank: 'https://my.sepay.vn/assets/images/banklogo/vpbank-icon.png',
      ACB: 'https://my.sepay.vn/assets/images/banklogo/acb-icon.png',
      Sacombank: 'https://my.sepay.vn/assets/images/banklogo/sacombank-icon.png',
      SHB: 'https://my.sepay.vn/assets/images/banklogo/shb-icon.png',
    };
    setBankAccountFormData((prev) => ({
      ...prev,
      bankCode: shortName.toLowerCase().replace(/\s/g, ''),
      bankShortName: shortName,
      bankName: fullName,
      bankLogo: bankLogos[shortName] || '',
    }));
    setShowBankSelection(false);
  };

  const handleQuickBankSelect = (bank: { shortName: string; name: string }) =>
    handleBankSelect(bank.shortName, bank.name);
  const isBankAccountFormValid = () =>
    bankAccountFormData.bankCode && bankAccountFormData.accountNumber.length >= 6;

  const handleSaveBankAccount = () => {
    if (!isBankAccountFormValid()) return;
    const newAccount: BankAccount = {
      id: `account_${Date.now()}`,
      bankCode: bankAccountFormData.bankCode,
      bankShortName: bankAccountFormData.bankShortName,
      bankName: bankAccountFormData.bankName,
      bankLogo: bankAccountFormData.bankLogo,
      accountNumber: bankAccountFormData.accountNumber,
      accountHolder: bankAccountFormData.accountHolder,
      province: bankAccountFormData.province,
      branch: bankAccountFormData.branch,
      branchAddress: bankAccountFormData.branchAddress,
      description: bankAccountFormData.description,
    };
    const updatedAccounts = [...bankAccounts, newAccount];
    setBankAccounts(updatedAccounts);
    // tenant-scoped bank accounts
    try {
      const s = localStorage.getItem('selectedTenant');
      const c = localStorage.getItem('currentTenant');
      const tenantId = s ? JSON.parse(s).id : c ? JSON.parse(c).id : null;
      const accountsKey = tenantId ? `bank_accounts_${tenantId}` : 'bank_accounts';
      localStorage.setItem(accountsKey, JSON.stringify(updatedAccounts));
    } catch (e) {
      localStorage.setItem('bank_accounts', JSON.stringify(updatedAccounts));
    }
    setDepositFormData((prev) => ({
      ...prev,
      bankAccountId: newAccount.id,
      bankShortName: newAccount.bankShortName,
      accountNumber: newAccount.accountNumber,
      bankLogo: newAccount.bankLogo || '',
    }));
    setSuccessMessage('Đã thêm tài khoản ngân hàng');
    setShowSuccessSnackbar(true);
    handleCloseAddBankAccount();
    handleCloseBankAccountSelection();
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteDialog(true);
  };
  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      setBankDeposits((prev) => prev.filter((d) => d.id !== deleteTargetId));
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
      <Box
        sx={{
          height: { xs: 160, sm: 120 },
          width: '100%',
          backgroundImage: `url(${headerDay})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Box sx={{ position: 'fixed', top: 36, left: 0, right: 0, zIndex: 20, px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 'sm',
            mx: 'auto',
            py: 0.5,
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <IconButton
              onClick={handleBack}
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
                color: 'var(--Greyscale-900, #0D0D12)',
                textAlign: 'center',
                fontFamily: '"Bricolage Grotesque"',
                fontSize: '20px',
                fontWeight: 500,
              }}
            >
              Khai báo số dư ban đầu
            </Typography>
            <Typography
              onClick={handleSkipClick}
              sx={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#1976D2',
                cursor: 'pointer',
                '&:hover': { color: '#1565C0' },
              }}
            >
              Bỏ qua
            </Typography>
          </Box>
        </Box>
      </Box>
      <Container
        maxWidth="sm"
        sx={{ position: 'relative', zIndex: 1, pt: { xs: '80px', sm: '60px' }, pb: 2 }}
      >
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
          <Typography sx={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', mb: 2, lineHeight: 1.5 }}>
            Nhập số dư đầu kỳ để quản lý sổ sách chính xác ngay từ ngày đầu. Bạn có thể chỉnh sửa
            sau trong phần thiết lập.
          </Typography>
          <Box sx={{ mb: 4 }}>
            <CustomStepper
              steps={[
                { label: 'Tiền mặt,', subLabel: 'tiền gửi' },
                { label: 'Công nợ', subLabel: 'khách hàng' },
                { label: 'Công nợ', subLabel: 'nhà cung cấp' },
              ]}
              activeStep={0}
            />
          </Box>
          <Box
            sx={{
              border: '1px solid #FB7E00',
              borderRadius: '12px',
              p: '12px',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#212529' }}>
              Tổng số dư quỹ:
            </Typography>
            <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#FB7E00' }}>
              {formatNumber(totalBalance)} đ
            </Typography>
          </Box>
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5,
              }}
            >
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#212529', ml: '8px' }}>
                Tiền mặt
              </Typography>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#007DFB', mr: '8px' }}>
                {formatNumber(cashBalance)} đ
              </Typography>
            </Box>
            <RoundedTextField
              fullWidth
              label="Số dư tiền mặt"
              placeholder="Nhập số dư tiền mặt"
              value={cashBalanceInput}
              onChange={handleCashBalanceChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon name="Moneys" size={20} color="#4E4E4E" variant="Outline" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography sx={{ fontSize: '16px', color: '#495057', fontWeight: 500 }}>
                      VND
                    </Typography>
                  </InputAdornment>
                ),
                inputMode: 'decimal' as any,
              }}
            />
          </Box>
          <Box sx={{ mb: 6 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5,
              }}
            >
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#212529', ml: '8px' }}>
                Tiền gửi ngân hàng
              </Typography>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#007DFB', mr: '8px' }}>
                {formatNumber(bankDeposits.reduce((sum, d) => sum + d.balance, 0))} đ
              </Typography>
            </Box>
            {bankDeposits.length === 0 ? (
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
                <Typography
                  sx={{ fontSize: '16px', fontWeight: 500, color: '#767676', textAlign: 'center' }}
                >
                  Chưa có thông tin số dư tiền gửi nào.
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#A0A0A0', textAlign: 'center' }}>
                  Nhấn Thêm số dư tiền gửi để bắt đầu.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                {bankDeposits.map((deposit) => (
                  <Box
                    key={deposit.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: '12px',
                      bgcolor: '#F9F9F9',
                      borderRadius: '12px',
                    }}
                  >
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>
                      <Typography
                        sx={{
                          fontSize: '16px',
                          fontWeight: 500,
                          color: '#212529',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {deposit.bankShortName}
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#6C757D', mb: 0.5 }}>
                        STK: {deposit.accountNumber}
                      </Typography>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1976D2' }}>
                        {formatNumber(deposit.balance)} VND
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDepositForm(deposit)}
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
                        onClick={() => handleDeleteClick(deposit.id)}
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
            <Box
              onClick={() => handleOpenDepositForm()}
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
                '&:hover': { bgcolor: '#D0E6FF' },
              }}
            >
              <Icon name="Add" size={20} color="#007DFB" variant="Outline" />
              <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#007DFB' }}>
                Khai báo số dư tiền gửi
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
        </Box>
      </Container>
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
              onClick={handleContinue}
              endIcon={<Icon name="ArrowRight" size={20} color="#FFFFFF" variant="Outline" />}
              sx={{ width: '100%' }}
            >
              Tiếp tục
            </AppButton>
          </Box>
        </Box>
      </Box>
      {showDepositForm && (
        <>
          <Box
            onClick={handleCloseDepositForm}
            sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', zIndex: 1200 }}
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
            <Box
              sx={{
                height: { xs: 160, sm: 120 },
                width: '100%',
                backgroundImage: `url(${headerDay})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 36,
                left: 0,
                right: 0,
                zIndex: 1202,
                px: { xs: 2, sm: 3 },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  maxWidth: 'sm',
                  mx: 'auto',
                  py: 0.5,
                }}
              >
                <IconButton
                  onClick={handleCloseDepositForm}
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 6,
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
                    color: 'var(--Greyscale-900, #0D0D12)',
                    textAlign: 'center',
                    fontFamily: '"Bricolage Grotesque"',
                    fontSize: '18px',
                    fontWeight: 500,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  Khai báo số dư tiền gửi
                </Typography>
              </Box>
            </Box>
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
                bgcolor: '#transparent',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  maxWidth: 'sm',
                  mx: 'auto',
                }}
              >
                <RoundedTextField
                  fullWidth
                  label="Chọn tài khoản ngân hàng"
                  value={
                    depositFormData.bankShortName
                      ? `${depositFormData.bankShortName} - ${depositFormData.accountNumber}`
                      : ''
                  }
                  placeholder="Chọn tài khoản ngân hàng"
                  onClick={handleOpenBankAccountSelection}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Outline" />
                      </InputAdornment>
                    ),
                  }}
                />
                <RoundedTextField
                  fullWidth
                  label="Nhập số dư hiện tại"
                  placeholder="Nhập số dư hiện tại"
                  value={depositFormData.balanceInput}
                  onChange={handleDepositBalanceChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography sx={{ fontSize: '16px', color: '#495057', fontWeight: 500 }}>
                          VND
                        </Typography>
                      </InputAdornment>
                    ),
                    inputMode: 'decimal' as any,
                  }}
                />
              </Box>
            </Box>
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
                onClick={handleSaveDeposit}
                disabled={!isDepositFormValid()}
                sx={{
                  bgcolor: '#FB7E00',
                  color: '#FFFFFF',
                  borderRadius: '100px',
                  height: 56,
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
      {showBankAccountSelection && (
        <>
          <Box
            onClick={handleCloseBankAccountSelection}
            sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', zIndex: 1300 }}
          />
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: 1301,
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
            <Box
              sx={{
                height: { xs: 160, sm: 120 },
                width: '100%',
                backgroundImage: `url(${headerDay})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 36,
                left: 0,
                right: 0,
                zIndex: 1302,
                px: { xs: 2, sm: 3 },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  maxWidth: 'sm',
                  mx: 'auto',
                  py: 0.5,
                }}
              >
                <IconButton
                  onClick={handleCloseBankAccountSelection}
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
                    color: 'var(--Greyscale-900, #0D0D12)',
                    textAlign: 'center',
                    fontFamily: '"Bricolage Grotesque"',
                    fontSize: '18px',
                    fontWeight: 500,
                  }}
                >
                  Chọn tài khoản ngân hàng
                </Typography>
                <IconButton
                  onClick={handleOpenAddBankAccount}
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
            <Box
              sx={{
                position: { xs: 'fixed', sm: 'relative' },
                top: { xs: '80px', sm: 'auto' },
                bottom: { xs: 0, sm: 'auto' },
                left: 0,
                right: 0,
                px: 2,
                py: 2,
                overflowY: 'auto',
                bgcolor: '#transparent',
              }}
            >
              <Box sx={{ maxWidth: 'sm', mx: 'auto' }}>
                {bankAccounts.length === 0 ? (
                  <Box sx={{ textAlign: 'center', pt: 4 }}>
                    <Typography sx={{ fontSize: '16px', color: '#767676' }}>
                      Chưa có tài khoản ngân hàng nào.
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: '#A0A0A0' }}>
                      Vui lòng Thêm mới để tiếp tục.
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <SearchBox
                      fullWidth
                      placeholder="Tìm tên hoặc số tài khoản"
                      value={bankSearch}
                      onChange={(e: any) => setBankSearch(e.target.value)}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2 }}>
                      {bankAccounts.filter((a) => {
                        const q = bankSearch.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          a.bankShortName.toLowerCase().includes(q) ||
                          a.accountNumber.toLowerCase().includes(q) ||
                          (a.accountHolder || '').toLowerCase().includes(q)
                        );
                      }).length === 0 ? (
                        <Box sx={{ textAlign: 'center', pt: 2 }}>
                          <Typography sx={{ fontSize: '16px', color: '#767676' }}>
                            Không tìm thấy tài khoản ngân hàng.
                          </Typography>
                        </Box>
                      ) : (
                        bankAccounts
                          .filter((a) => {
                            const q = bankSearch.trim().toLowerCase();
                            if (!q) return true;
                            return (
                              a.bankShortName.toLowerCase().includes(q) ||
                              a.accountNumber.toLowerCase().includes(q) ||
                              (a.accountHolder || '').toLowerCase().includes(q)
                            );
                          })
                          .map((account, _idx, _arr) => (
                            <Box
                              key={account.id}
                              onClick={() => handleSelectBankAccount(account)}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                px: 1,
                                py: 1.5,
                                cursor: 'pointer',
                                transition: 'all 0.12s',
                                '&:hover': { bgcolor: '#F8F9FA' },
                                borderBottom: '1px solid #E9ECEF',
                              }}
                            >
                              <Radio
                                checked={depositFormData.bankAccountId === account.id}
                                value={account.id}
                                size="small"
                                sx={{ '&.Mui-checked': { color: '#FB7E00' } }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#212529' }}>
                                  {account.bankShortName}
                                </Typography>
                                <Typography sx={{ fontSize: '14px', color: '#6C757D' }}>
                                  {account.accountNumber}{' '}
                                  {account.accountHolder && `• ${account.accountHolder}`}
                                </Typography>
                              </Box>
                            </Box>
                          ))
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </>
      )}
      {showAddBankAccount && (
        <>
          <Box
            onClick={handleCloseAddBankAccount}
            sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', zIndex: 1400 }}
          />
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: 1401,
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
            <Box
              sx={{
                height: { xs: 160, sm: 120 },
                width: '100%',
                backgroundImage: `url(${headerDay})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 36,
                left: 0,
                right: 0,
                zIndex: 1402,
                px: { xs: 2, sm: 3 },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  maxWidth: 'sm',
                  mx: 'auto',
                  py: 0.5,
                }}
              >
                <IconButton
                  onClick={handleCloseAddBankAccount}
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 6,
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
                    color: 'var(--Greyscale-900, #0D0D12)',
                    textAlign: 'center',
                    fontFamily: '"Bricolage Grotesque"',
                    fontSize: '18px',
                    fontWeight: 500,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  Thêm tài khoản ngân hàng
                </Typography>
              </Box>
            </Box>
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
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  maxWidth: 'sm',
                  mx: 'auto',
                }}
              >
                <RoundedTextField
                  fullWidth
                  label={
                    <>
                      Chọn ngân hàng{' '}
                      <Typography component="span" sx={{ color: '#DC3545' }}>
                        *
                      </Typography>
                    </>
                  }
                  value={
                    bankAccountFormData.bankShortName
                      ? `${bankAccountFormData.bankShortName} - ${bankAccountFormData.bankName}`
                      : ''
                  }
                  placeholder="Chọn ngân hàng"
                  onClick={() => setShowBankSelection(true)}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Icon name="ArrowRight2" size={20} color="#6C757D" variant="Outline" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: -1 }}>
                  {QUICK_BANKS.map((bank) => (
                    <Chip
                      key={bank.shortName}
                      label={bank.shortName}
                      onClick={() => handleQuickBankSelect(bank)}
                      sx={{
                        borderRadius: '20px',
                        border: '1px solid #C5C5C5',
                        bgcolor:
                          bankAccountFormData.bankShortName === bank.shortName
                            ? '#F5F5F5'
                            : '#F5F5F5',
                        color: '#090909',
                        '&:hover': { bgcolor: '#F8F9FA' },
                      }}
                    />
                  ))}
                </Box>
                <RoundedTextField
                  fullWidth
                  label={
                    <>
                      Số tài khoản{' '}
                      <Typography component="span" sx={{ color: '#DC3545' }}>
                        *
                      </Typography>
                    </>
                  }
                  placeholder="Số tài khoản"
                  value={bankAccountFormData.accountNumber}
                  onChange={(e) =>
                    setBankAccountFormData((prev) => ({
                      ...prev,
                      accountNumber: e.target.value.replace(/[^0-9]/g, '').slice(0, 20),
                    }))
                  }
                  InputProps={{ inputMode: 'numeric' as any }}
                />
                <RoundedTextField
                  fullWidth
                  label="Chủ tài khoản"
                  placeholder="Chủ tài khoản"
                  value={bankAccountFormData.accountHolder}
                  onChange={(e) =>
                    setBankAccountFormData((prev) => ({ ...prev, accountHolder: e.target.value }))
                  }
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <RoundedTextField
                    fullWidth
                    label="Tỉnh/ Thành phố"
                    placeholder="Tỉnh/ Thành phố"
                    value={bankAccountFormData.province}
                    onChange={(e) =>
                      setBankAccountFormData((prev) => ({ ...prev, province: e.target.value }))
                    }
                  />
                  <RoundedTextField
                    fullWidth
                    label="Chi nhánh"
                    placeholder="Chi nhánh"
                    value={bankAccountFormData.branch}
                    onChange={(e) =>
                      setBankAccountFormData((prev) => ({ ...prev, branch: e.target.value }))
                    }
                  />
                </Box>
                <RoundedTextField
                  fullWidth
                  label="Địa chỉ chi nhánh"
                  placeholder="Địa chỉ chi nhánh"
                  value={bankAccountFormData.branchAddress}
                  onChange={(e) =>
                    setBankAccountFormData((prev) => ({ ...prev, branchAddress: e.target.value }))
                  }
                />
                <RoundedTextField
                  fullWidth
                  label="Diễn giải"
                  placeholder="Diễn giải"
                  value={bankAccountFormData.description}
                  onChange={(e) =>
                    setBankAccountFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </Box>
            </Box>
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
                onClick={handleSaveBankAccount}
                disabled={!isBankAccountFormValid()}
                sx={{
                  bgcolor: '#FB7E00',
                  color: '#FFFFFF',
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
      <BankSelectionScreen
        open={showBankSelection}
        onClose={() => setShowBankSelection(false)}
        onSelect={handleBankSelect}
      />
      <AlertDialog
        variant="confirm"
        open={showSkipDialog}
        onClose={() => setShowSkipDialog(false)}
        title="Bỏ qua khai báo số dư?"
        description="Dữ liệu đã nhập ở các bước trước sẽ được lưu. Bạn có thể quay lại khai báo sau trong phần Cài đặt."
        confirmText="Bỏ qua"
        cancelText="Tiếp tục khai báo"
        onConfirm={handleSkipConfirm}
      />
      <AlertDialog
        variant="confirm"
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Xác nhận xóa?"
        description="Bạn chắc chắn muốn xóa tài khoản ngân hàng này. Thao tác này không thể khôi phục."
        confirmText="Đồng ý"
        cancelText="Hủy"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
      />
      <SuccessSnackbar
        open={showSuccessSnackbar}
        message={successMessage}
        onClose={() => setShowSuccessSnackbar(false)}
      />
    </Box>
  );
};

export default InitialBalanceStep1Screen;
