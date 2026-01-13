import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Checkbox,
  FormGroup,
  Snackbar,
  Alert,
  Chip,
  InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import {
  BusinessType,
  AccountingRegime,
  TaxFilingFrequency,
  TaxCalculationMethod,
  Currency,
  InventoryValuationMethod,
} from '../../types/onboarding';
import AppButton from '../../components/AppButton';
import OnboardingHeader from '../../components/OnboardingHeader';
import RoundedTextField from '../../components/RoundedTextField';
import welcomeBg from '../../assets/Welcome screen.png';
import AlertDialog from '../../components/AlertDialog';
import Icon from '../../components/Icon';
import TaxIndustryGroupSelector from '../../components/TaxIndustryGroupSelector';
import taxIndustryGroups from '../../data/taxIndustryGroups';
import DatePickerBottomSheet from '../../components/DatePickerBottomSheet';
import { apiService } from '../../services/api';

const AccountingSetupScreen = () => {
  const navigate = useNavigate();
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hkDateRef = useRef<HTMLInputElement | null>(null);
  const dntnDateRef = useRef<HTMLInputElement | null>(null);
  const hkNativeDateRef = useRef<HTMLInputElement | null>(null);
  const dntnNativeDateRef = useRef<HTMLInputElement | null>(null);

  const formatDisplayDate = (iso?: string) => {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const openNativeDatePicker = (ref: React.RefObject<HTMLInputElement | null>, e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (!ref?.current) return;
    const input = ref.current as HTMLInputElement & { showPicker?: () => void };
    
    // First try the modern showPicker API
    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
        return;
      }
    } catch (err) {
      // Silently fall through to other methods
    }
    
    // Fallback: try focus + click
    try {
      input.focus();
      setTimeout(() => {
        input.click();
      }, 10);
    } catch (err) {
      console.warn('Could not open date picker:', err);
    }
  };

  const shouldUseBottomSheet = () => {
    if (typeof window === 'undefined') return false;
    try {
      // Prefer bottom sheet on touch-capable devices or small viewports
      const hasTouch = (navigator as any)?.maxTouchPoints > 0 || 'ontouchstart' in window;
      const smallViewport = window.innerWidth <= 768;
      return hasTouch || smallViewport;
    } catch (err) {
      return false;
    }
  };

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    severity: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }>({
    open: false,
    severity: 'success',
    message: '',
  });

  // Form state for HKD
  const [dataStartDate, setDataStartDate] = useState<string>('');
  const [taxFilingFrequency, setTaxFilingFrequency] = useState<TaxFilingFrequency>(
    TaxFilingFrequency.QUARTERLY
  );
  const [usePOSDevice, setUsePOSDevice] = useState<boolean>(false);
  const [taxIndustryGroup, setTaxIndustryGroup] = useState<string>('');
  const [showTaxIndustryModal, setShowTaxIndustryModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form state for DNTN
  const [accountingRegimeDNTN, setAccountingRegimeDNTN] = useState<AccountingRegime>(
    AccountingRegime.TT200_2014
  );
  const [taxCalculationMethod, setTaxCalculationMethod] = useState<TaxCalculationMethod>(
    TaxCalculationMethod.DEDUCTION
  );
  const [baseCurrency, setBaseCurrency] = useState<Currency>(Currency.VND);
  const [hasForeignCurrency, setHasForeignCurrency] = useState<boolean>(false);
  const [inventoryValuationMethod, setInventoryValuationMethod] =
    useState<InventoryValuationMethod>(InventoryValuationMethod.WEIGHTED_AVERAGE);

  const initialFormRef = useRef<any>(null);

  const handleCloseSnack = () => setSnack((s) => ({ ...s, open: false }));

  // Load onboarding data and update state
  useEffect(() => {
    const loadOnboardingData = () => {
      try {
        const onboardingData = localStorage.getItem('onboardingData');
        if (onboardingData) {
          const data = JSON.parse(onboardingData);
          setBusinessType(data.businessType || null);

          // Set default date to first day of current year
          const currentYear = new Date().getFullYear();
          const defaultDate = `${currentYear}-01-01`;
          setDataStartDate(defaultDate);

          if (data.accountingSetup) {
            const setup = data.accountingSetup;

            if (setup.dataStartDate) {
              const date = new Date(setup.dataStartDate);
              if (!isNaN(date.getTime())) {
                setDataStartDate(date.toISOString().split('T')[0]);
              }
            }

            // HKD fields
            if (setup.taxFilingFrequency) {
              setTaxFilingFrequency(setup.taxFilingFrequency);
            }
            if (setup.usePOSDevice !== undefined) {
              setUsePOSDevice(setup.usePOSDevice);
            }
            if (setup.taxIndustryGroup) {
              setTaxIndustryGroup(setup.taxIndustryGroup);
            }

            // DNTN fields
            if (setup.accountingRegime) {
              setAccountingRegimeDNTN(setup.accountingRegime);
            }
            if (setup.taxCalculationMethod) {
              setTaxCalculationMethod(setup.taxCalculationMethod);
            }
            if (setup.baseCurrency) {
              setBaseCurrency(setup.baseCurrency);
            }
            if (setup.hasForeignCurrency !== undefined) {
              setHasForeignCurrency(setup.hasForeignCurrency);
            }
            if (setup.inventoryValuationMethod) {
              setInventoryValuationMethod(setup.inventoryValuationMethod);
            }
          }
        }
      } catch (error) {
        console.error('Error loading onboarding data:', error);
      }
    };

    loadOnboardingData();
  }, []);

  // Set initial form snapshot after state updates
  useEffect(() => {
    initialFormRef.current = {
      dataStartDate,
      taxFilingFrequency,
      usePOSDevice,
      taxIndustryGroup,
      accountingRegimeDNTN,
      taxCalculationMethod,
      baseCurrency,
      hasForeignCurrency,
      inventoryValuationMethod,
    };
  }, [
    dataStartDate,
    taxFilingFrequency,
    usePOSDevice,
    taxIndustryGroup,
    accountingRegimeDNTN,
    taxCalculationMethod,
    baseCurrency,
    hasForeignCurrency,
    inventoryValuationMethod,
  ]);

  const handleBack = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmLeave = () => {
    setShowConfirmDialog(false);
    navigate(ROUTES.ONBOARDING_BUSINESS_SECTOR);
  };

  const handleCancelLeave = () => setShowConfirmDialog(false);

  const handleSubmit = async () => {
    // Validation
    if (!dataStartDate) {
      setSnack({
        open: true,
        severity: 'error',
        message: 'Vui lòng chọn ngày bắt đầu dữ liệu',
      });
      return;
    }

    if (businessType === BusinessType.HOUSEHOLD_BUSINESS && !taxIndustryGroup) {
      setSnack({
        open: true,
        severity: 'error',
        message: 'Vui lòng chọn nhóm ngành nghề tính thuế',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Validate current tenant
      const currentTenantStr = localStorage.getItem('currentTenant');
      if (!currentTenantStr) {
        setSnack({
          open: true,
          severity: 'error',
          message: 'Không tìm thấy thông tin tenant. Vui lòng đăng nhập lại.',
        });
        setTimeout(() => navigate('/login'), 1200);
        return;
      }

      // Validate JSON format
      try {
        JSON.parse(currentTenantStr);
      } catch {
        setSnack({
          open: true,
          severity: 'error',
          message: 'Dữ liệu tenant không hợp lệ. Vui lòng đăng nhập lại.',
        });
        setTimeout(() => navigate('/login'), 1200);
        return;
      }

      // Prepare accounting setup payload
      let accountingSetupPayload: any = {
        dataStartDate: `${dataStartDate}T00:00:00.000Z`,
      };

      if (businessType === BusinessType.HOUSEHOLD_BUSINESS) {
        accountingSetupPayload = {
          ...accountingSetupPayload,
          accountingRegime: AccountingRegime.TT88_2021,
          taxFilingFrequency,
          usePOSDevice,
          inventoryValuationMethod: InventoryValuationMethod.WEIGHTED_AVERAGE,
          taxIndustryGroup,
        };
      } else if (businessType === BusinessType.PRIVATE_ENTERPRISE) {
        accountingSetupPayload = {
          ...accountingSetupPayload,
          accountingRegime: accountingRegimeDNTN,
          taxCalculationMethod,
          baseCurrency,
          hasForeignCurrency,
          inventoryValuationMethod,
        };
      }

      console.log('[AccountingSetupScreen] Payload:', accountingSetupPayload);

      // Use the already validated currentTenant
      const currentTenant = JSON.parse(currentTenantStr);

      // Save to server
      await apiService.saveAccountingSetup(currentTenant.id, accountingSetupPayload);

      // Save to localStorage
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      const updatedData = {
        ...onboardingData,
        accountingSetup: accountingSetupPayload,
        cachedAt: Date.now(),
      };
      localStorage.setItem('onboardingData', JSON.stringify(updatedData));

      setSnack({
        open: true,
        severity: 'success',
        message: 'Thiết lập dữ liệu kế toán thành công!',
      });

      setTimeout(() => {
        navigate(ROUTES.ONBOARDING_ADVANCED_SETUP);
      }, 1000);
    } catch (error: any) {
      console.error('Failed to complete accounting setup:', error);
      setSnack({
        open: true,
        severity: 'error',
        message: error.message || 'Có lỗi xảy ra khi hoàn tất thiết lập. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isHKD = businessType === BusinessType.HOUSEHOLD_BUSINESS;
  const isDNTN = businessType === BusinessType.PRIVATE_ENTERPRISE;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F5EBE0',
        backgroundImage: `url(${welcomeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        pt: 8,
      }}
    >
      <OnboardingHeader onBack={handleBack} progress={100} />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, py: 2 }}>
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
          Thiết lập dữ liệu kế toán
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
          Thiết lập dữ liệu kế toán ban đầu.
        </Typography>

        <Box
          sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: {
              xs: '16px 16px 0 0',
              sm: '16px',
            },
            px: 2,
            py: { xs: 2, sm: 6 },
            pb: { xs: `calc(68px + env(safe-area-inset-bottom, 0px) + 16px)`, sm: 6 },
            position: { xs: 'fixed', sm: 'relative' },
            top: { xs: '160px', sm: 'auto' },
            bottom: { xs: 0, sm: 'auto' },
            // enforce 16px spacing from the viewport edges on both sides
            left: '16px',
            right: '16px',
            maxWidth: 'calc(100% - 32px)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: 'auto', sm: 'auto' },
          }}
        >
          {/* Scrollable content area */}
          <Box
            sx={{
              flex: 1,
              overflowY: { xs: 'auto', sm: 'visible' },
              pr: 0,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* HKD Form */}
            {isHKD && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Accounting Regime - display as a radio (HKD only) */}
                    <FormControl component="fieldset">
                      <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 1 }}>
                        Chế độ kế toán
                      </Typography>
                      <RadioGroup value={AccountingRegime.TT88_2021} sx={{ display: 'flex', gap: 1 }}>
                        <FormControlLabel
                          value={AccountingRegime.TT88_2021}
                          control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#FB7E00' } }} />}
                          label="Thông tư 88/2021/TT-BTC (Dành riêng cho hộ kinh doanh)"
                          sx={{ py: 0.5, px: 0, '& .MuiFormControlLabel-label': { marginLeft: '0px' } }}
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Data Start Date */}
                    <Box>
                      <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 1 }}>
                        Ngày bắt đầu dữ liệu <span style={{ color: '#D32F2F' }}>*</span>
                      </Typography>
                      {/* hidden native date input used to open native picker */}
                      <input
                        type="date"
                        ref={hkNativeDateRef}
                        value={dataStartDate}
                        onChange={(e) => setDataStartDate(e.target.value)}
                        style={{ 
                          position: 'absolute', 
                          opacity: 0, 
                          pointerEvents: 'none',
                          top: 0,
                          left: 0,
                          width: 1, 
                          height: 1,
                          zIndex: -1
                        }}
                        tabIndex={-1}
                        aria-hidden="true"
                      />

                      <RoundedTextField
                        fullWidth
                        type="text"
                        value={formatDisplayDate(dataStartDate)}
                        inputRef={hkDateRef}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ readOnly: true }}
                        sx={{ 
                          '& .MuiOutlinedInput-input': { textAlign: 'left', paddingLeft: 0 },
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e?.stopPropagation();
                          if (shouldUseBottomSheet()) {
                            setShowDatePicker(true);
                          } else {
                            openNativeDatePicker(hkNativeDateRef, e);
                          }
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Box 
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (shouldUseBottomSheet()) {
                                    setShowDatePicker(true);
                                  } else {
                                    openNativeDatePicker(hkNativeDateRef, e);
                                  }
                                }}
                                sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              >
                                <Icon name="Calendar1" size={20} color="#4E4E4E" variant="Outline" />
                              </Box>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    {/* Tax Filing Frequency */}
                    <FormControl component="fieldset">
                      <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 1 }}>
                        Chọn tần suất kê khai thuế và mẫu tờ khai{' '}
                      </Typography>
                      <Typography sx={{ fontSize: '14px', color: 'rgba(0,0,0,0.6)', mb: 0 }}>
                        Mẫu 01/CNKD là tờ khai thuế dành cho hộ kinh doanh, cá nhân tự kê khai
                        thuế theo phương pháp kê khai
                      </Typography>
                      <RadioGroup
                        row
                        value={taxFilingFrequency}
                        onChange={(e) =>
                          setTaxFilingFrequency(e.target.value as TaxFilingFrequency)
                        }
                        sx={{ display: 'flex', gap: 2 }}
                      >
                        <FormControlLabel
                          value={TaxFilingFrequency.QUARTERLY}
                          control={
                            <Radio size="small" sx={{ '&.Mui-checked': { color: '#FB7E00' } }} />
                          }
                          label="Hàng quý"
                          sx={{ py: 0.5, px: 0, '& .MuiFormControlLabel-label': { marginLeft: '0px' } }}
                        />
                        <FormControlLabel
                          value={TaxFilingFrequency.MONTHLY}
                          control={
                            <Radio size="small" sx={{ '&.Mui-checked': { color: '#FB7E00' } }} />
                          }
                          label="Hàng tháng"
                          sx={{ py: 0.5, px: 0, '& .MuiFormControlLabel-label': { marginLeft: '0px' } }}
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Use POS Device */}
                    <FormControl component="fieldset">
                      <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 0 }}>
                        Có sử dụng máy tính tiền xuất hóa đơn{' '}
                      </Typography>
                      <RadioGroup
                        row
                        value={usePOSDevice ? 'yes' : 'no'}
                        onChange={(e) => setUsePOSDevice(e.target.value === 'yes')}
                        sx={{ gap: 2 }}
                      >
                        <FormControlLabel
                          value="yes"
                          control={
                            <Radio size="small" sx={{ '&.Mui-checked': { color: '#FB7E00' } }} />
                          }
                          label="Có"
                          sx={{ py: 0.5, px: 0, '& .MuiFormControlLabel-label': { marginLeft: '0px' } }}
                        />
                        <FormControlLabel
                          value="no"
                          control={
                            <Radio size="small" sx={{ '&.Mui-checked': { color: '#FB7E00' } }} />
                          }
                          label="Không"
                          sx={{ py: 0.5, px: 0, '& .MuiFormControlLabel-label': { marginLeft: '0px' } }}
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Inventory Valuation Method - compact radio (no background) */}
                    <FormControl component="fieldset">
                      <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 0 }}>
                        Phương pháp tính giá xuất kho
                      </Typography>
                      <RadioGroup
                        value={inventoryValuationMethod}
                        onChange={(e) =>
                          setInventoryValuationMethod(
                            e.target.value as InventoryValuationMethod
                          )
                        }
                        sx={{ display: 'flex', gap: 1 }}
                      >
                        <FormControlLabel
                          value={InventoryValuationMethod.WEIGHTED_AVERAGE}
                          control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#FB7E00' } }} />}
                          label="Bình quân cuối kỳ"
                          sx={{ py: 0.5, px: 0, '& .MuiFormControlLabel-label': { marginLeft: '0px' } }}
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Tax Industry Group */}
                    <Box>
                      <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 1 }}>
                        Nhóm ngành nghề tính thuế GTGT, TNCN{' '}
                        <span style={{ color: '#D32F2F' }}>*</span>
                      </Typography>
                      <RoundedTextField
                        fullWidth
                        placeholder="Chọn nhóm ngành nghề"
                        value={
                          taxIndustryGroup
                            ? (() => {
                                const selected = taxIndustryGroups.find(
                                  (g) => g.code === taxIndustryGroup
                                );
                                return selected ? `${selected.code} - ${selected.name}` : '';
                              })()
                            : ''
                        }
                        onClick={() => setShowTaxIndustryModal(true)}
                        inputProps={{ readOnly: true }}
                        sx={{
                          cursor: 'pointer',
                          '& .MuiOutlinedInput-input': {
                            textAlign: 'left',
                            paddingLeft: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Icon name="ArrowDown2" size={20} color="#4E4E4E" variant="Outline" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                  </Box>
                )}

                {/* DNTN Form */}
                {isDNTN && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Accounting Regime */}
                    <FormControl component="fieldset">
                      <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 1 }}>
                        Chế độ kế toán <span style={{ color: '#D32F2F' }}>*</span>
                      </Typography>
                      <RadioGroup
                        value={accountingRegimeDNTN}
                        onChange={(e) =>
                          setAccountingRegimeDNTN(e.target.value as AccountingRegime)
                        }
                        sx={{ display: 'flex', gap: 1 }}
                      >
                        <FormControlLabel
                          value={AccountingRegime.TT200_2014}
                          control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#FB7E00' } }} />}
                          label="Thông tư 200/2014/TT-BTC - Chế độ kế toán doanh nghiệp"
                          sx={{ py: 0.5, px: 0, '& .MuiFormControlLabel-label': { marginLeft: '0px' } }}
                        />
                        <FormControlLabel
                          value={AccountingRegime.TT133_2016}
                          control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#FB7E00' } }} />}
                          label="Thông tư 133/2016/TT-BTC - Chế độ kế toán doanh nghiệp nhỏ và vừa"
                          sx={{ py: 0.5, px: 0, '& .MuiFormControlLabel-label': { marginLeft: '0px' } }}
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Data Start Date */}
                    <Box>
                      <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 1 }}>
                        Ngày bắt đầu dữ liệu <span style={{ color: '#D32F2F' }}>*</span>
                      </Typography>
                      <input
                        type="date"
                        ref={dntnNativeDateRef}
                        value={dataStartDate}
                        onChange={(e) => setDataStartDate(e.target.value)}
                        style={{ 
                          position: 'absolute', 
                          opacity: 0, 
                          pointerEvents: 'none',
                          top: 0,
                          left: 0,
                          width: 1, 
                          height: 1,
                          zIndex: -1
                        }}
                        tabIndex={-1}
                        aria-hidden="true"
                      />

                      <RoundedTextField
                        fullWidth
                        type="text"
                        value={formatDisplayDate(dataStartDate)}
                        inputRef={dntnDateRef}
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ readOnly: true }}
                        sx={{ 
                          '& .MuiOutlinedInput-input': { textAlign: 'left', paddingLeft: 0 },
                          cursor: 'pointer'
                        }}
                        onClick={(e) => {
                          e?.stopPropagation();
                          if (shouldUseBottomSheet()) {
                            setShowDatePicker(true);
                          } else {
                            openNativeDatePicker(dntnNativeDateRef, e);
                          }
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Box 
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (shouldUseBottomSheet()) {
                                    setShowDatePicker(true);
                                  } else {
                                    openNativeDatePicker(dntnNativeDateRef, e);
                                  }
                                }}
                                sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              >
                                <Icon name="Calendar" size={20} color="#4E4E4E" variant="Outline" />
                              </Box>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    {/* Tax Calculation Method */}
                    <FormControl component="fieldset">
                      <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 1 }}>
                        Phương pháp tính thuế <span style={{ color: '#D32F2F' }}>*</span>
                      </Typography>
                      <RadioGroup
                        value={taxCalculationMethod}
                        onChange={(e) =>
                          setTaxCalculationMethod(e.target.value as TaxCalculationMethod)
                        }
                      >
                        <FormControlLabel
                          value={TaxCalculationMethod.DEDUCTION}
                          control={
                            <Radio
                              size="small"
                              sx={{
                                '&.Mui-checked': { color: '#FB7E00' },
                              }}
                            />
                          }
                          label="Phương pháp khấu trừ"
                        />
                        <FormControlLabel
                          value={TaxCalculationMethod.DIRECT}
                          control={
                            <Radio
                              size="small"
                              sx={{
                                '&.Mui-checked': { color: '#FB7E00' },
                              }}
                            />
                          }
                          label="Phương pháp trực tiếp trên doanh thu"
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Base Currency */}
                    <FormControl component="fieldset">
                      <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 1 }}>
                        Đồng tiền hạch toán <span style={{ color: '#D32F2F' }}>*</span>
                      </Typography>
                      <RadioGroup
                        value={baseCurrency}
                        onChange={(e) => setBaseCurrency(e.target.value as Currency)}
                        sx={{ display: 'flex', gap: 0}}
                      >
                        <FormControlLabel
                          value={Currency.VND}
                          control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#FB7E00' } }} />}
                          label="Việt Nam Đồng (VND)"
                          sx={{ py: 0, px: 0, '& .MuiFormControlLabel-label': { marginLeft: '0px' } }}
                        />
                        <FormControlLabel
                          value={Currency.USD}
                          control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#FB7E00' } }} />}
                          label="Đô-la Mỹ (USD)"
                          sx={{ py: 0, px: 0, '& .MuiFormControlLabel-label': { marginLeft: '0px' } }}
                        />
                      </RadioGroup>
                    </FormControl>

                    {/* Foreign Currency (moved into Base Currency block for visual grouping) */}
                    <FormGroup sx={{ mt: -2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={hasForeignCurrency}
                            onChange={(e) => setHasForeignCurrency(e.target.checked)}
                            sx={{
                              '&.Mui-checked': { color: '#FB7E00' },
                            }}
                          />
                        }
                        label="Phát sinh nghiệp vụ liên quan đến ngoại tệ"
                      />
                    </FormGroup>

                    {/* Inventory Valuation Method */}
                    <FormControl component="fieldset">
                      <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 1 }}>
                        Phương pháp tính giá xuất kho{' '}
                        <span style={{ color: '#D32F2F' }}>*</span>
                      </Typography>
                      <RadioGroup
                        value={inventoryValuationMethod}
                        onChange={(e) =>
                          setInventoryValuationMethod(
                            e.target.value as InventoryValuationMethod
                          )
                        }
                      >
                        <FormControlLabel
                          value={InventoryValuationMethod.WEIGHTED_AVERAGE}
                          control={
                            <Radio
                              size="small"
                              sx={{
                                '&.Mui-checked': { color: '#FB7E00' },
                              }}
                            />
                          }
                          label="Bình quân cuối kỳ"
                        />
                        <FormControlLabel
                          value={InventoryValuationMethod.INSTANT_WEIGHTED_AVERAGE}
                          disabled
                          control={
                            <Radio
                              size="small"
                              sx={{
                                '&.Mui-checked': { color: '#FB7E00' },
                              }}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography>Bình quân tức thời</Typography>
                              <Chip
                                label="Đang phát triển"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '12px',
                                  backgroundColor: '#E0E0E0',
                                  color: '#666',
                                }}
                              />
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value={InventoryValuationMethod.SPECIFIC_IDENTIFICATION}
                          disabled
                          control={
                            <Radio
                              size="small"
                              sx={{
                                '&.Mui-checked': { color: '#FB7E00' },
                              }}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography>Giá đích danh</Typography>
                              <Chip
                                label="Đang phát triển"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '12px',
                                  backgroundColor: '#E0E0E0',
                                  color: '#666',
                                }}
                              />
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value={InventoryValuationMethod.FIFO}
                          disabled
                          control={
                            <Radio
                              size="small"
                              sx={{
                                '&.Mui-checked': { color: '#FB7E00' },
                              }}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography>Nhập trước xuất trước</Typography>
                              <Chip
                                label="Đang phát triển"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '12px',
                                  backgroundColor: '#E0E0E0',
                                  color: '#666',
                                }}
                              />
                            </Box>
                          }
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>
                )}
              </Box>

              {/* Fixed button at bottom - Desktop */}
              <Box sx={{ display: { xs: 'none', sm: 'block' }, mt: 4 }}>
                <AppButton variantType="primary" fullWidth onClick={handleSubmit} loading={isLoading} loadingText="Đang hoàn tất...">
                  Tiếp tục
                </AppButton>
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
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          bgcolor: '#ffffff',
          boxShadow: '0 -8px 16px rgba(0,0,0,0.12)',
          minHeight: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <AppButton variantType="primary"
              fullWidth
              onClick={handleSubmit}
              loading={isLoading}
              loadingText="Đang hoàn tất..."
              sx={{
                height: 56,
                borderRadius: '100px',
                backgroundColor: '#FB7E00',
                '&:hover': { backgroundColor: '#C96400' },
                boxShadow: 'none',
              }}
            >
              Tiếp tục
            </AppButton>
          </Box>
        </Box>
      </Box>

      {/* Confirm dialog */}
      <AlertDialog
        variant="confirm"
        open={showConfirmDialog}
        onClose={handleCancelLeave}
        title="Thay đổi chưa được lưu"
        description="Bạn có muốn thoát mà không lưu lại các thay đổi?"
        cancelText="Huỷ"
        confirmText="Đồng ý"
        onConfirm={handleConfirmLeave}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={handleCloseSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnack} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>

      {/* Tax Industry Group Selector Modal */}
      <TaxIndustryGroupSelector
        open={showTaxIndustryModal}
        onClose={() => setShowTaxIndustryModal(false)}
        value={taxIndustryGroup}
        onChange={(code) => setTaxIndustryGroup(code)}
      />

      <DatePickerBottomSheet
        open={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        initial={dataStartDate ? new Date(dataStartDate) : new Date(new Date().getFullYear(), 0, 1)}
        onConfirm={(d) => {
          const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().split('T')[0];
          setDataStartDate(iso);
          setShowDatePicker(false);
        }}
      />
    </Box>
  );
};

export default AccountingSetupScreen;
