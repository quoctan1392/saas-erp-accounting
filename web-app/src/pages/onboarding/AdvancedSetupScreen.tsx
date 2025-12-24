import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Switch,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  InputAdornment,
  RadioGroup,
  Radio,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import type { EInvoiceProvider } from '../../types/onboarding';
import PrimaryButton from '../../components/PrimaryButton';
import OnboardingHeader from '../../components/OnboardingHeader';
import RoundedTextField from '../../components/RoundedTextField';
import welcomeBg from '../../assets/Welcome screen.png';
import ConfirmDialog from '../../components/ConfirmDialog';
import BottomSheet from '../../components/BottomSheet';
import Icon from '../../components/Icon';

const AdvancedSetupScreen = () => {
  const navigate = useNavigate();
  
  // Main state
  const [eInvoiceEnabled, setEInvoiceEnabled] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Bottom sheets
  const [showConnectionSheet, setShowConnectionSheet] = useState<boolean>(false);
  const [showProviderSheet, setShowProviderSheet] = useState<boolean>(false);
  
  // Dialogs
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  
  // Form state
  const [providers, setProviders] = useState<EInvoiceProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [taxCode, setTaxCode] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [autoIssueOnSale, setAutoIssueOnSale] = useState<boolean>(true);
  
  // Error state
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Snackbar state
  const [snack, setSnack] = useState<{
    open: boolean;
    severity: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }>({
    open: false,
    severity: 'success',
    message: '',
  });

  const handleCloseSnack = () => setSnack((s) => ({ ...s, open: false }));

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);
      try {
        // Load onboarding data from localStorage
        const onboardingDataRaw = localStorage.getItem('onboardingData');
        let data: any = undefined;
        if (onboardingDataRaw) {
          // cleanup any previously simulated demo connection data
          const parsed = JSON.parse(onboardingDataRaw);
          const demoUsername = 'admin@symper.vn';
          const demoTax = '0108344905';
          if (
            parsed.advancedSetup?.eInvoiceConnection?.username === demoUsername ||
            parsed.advancedSetup?.eInvoiceConnection?.taxCode === demoTax ||
            parsed.businessIdentification?.taxCode === demoTax
          ) {
            // remove demo advancedSetup and demo taxCode
            delete parsed.advancedSetup;
            if (parsed.businessIdentification && parsed.businessIdentification.taxCode === demoTax) {
              delete parsed.businessIdentification.taxCode;
            }
            localStorage.setItem('onboardingData', JSON.stringify(parsed));
            data = parsed;
          } else {
            data = parsed;
          }
          
          // Auto-fill tax code from business identification
          if (data?.businessIdentification?.taxCode) {
            setTaxCode(data.businessIdentification.taxCode);
          }
          
          // Load saved advanced setup if exists
          if (data.advancedSetup) {
            const setup = data.advancedSetup;
            if (setup.eInvoiceConnection) {
              setEInvoiceEnabled(true);
              setIsConnected(true);
              setSelectedProvider(setup.eInvoiceConnection.provider);
              setUsername(setup.eInvoiceConnection.username);
              setAutoIssueOnSale(setup.eInvoiceConnection.autoIssueOnSale ?? true);
            }
          }
        }
        
        // TODO: Fetch providers from API
        // const response = await apiService.getEInvoiceProviders();
        // setProviders(response.data);
        
        // Mock data for now
        setProviders([
          {
            id: '1',
            code: 'VIETTEL_SINVOICE',
            name: 'Viettel S-Invoice',
            description: 'Dịch vụ hoá đơn điện tử của Viettel',
            isActive: true,
          },
          {
            id: '2',
            code: 'VNPT_MINVOICE',
            name: 'M-Invoice',
            description: 'Dịch vụ hoá đơn điện tử của VNPT',
            isActive: true,
          },
          {
            id: '3',
            code: 'MISA_MEINVOICE',
            name: 'MISA meInvoice',
            description: 'Dịch vụ hoá đơn điện tử của MISA',
            isActive: true,
          },
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
        setSnack({
          open: true,
          severity: 'error',
          message: 'Có lỗi khi tải dữ liệu. Vui lòng thử lại.',
        });
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle toggle e-invoice
  const handleToggleEInvoice = (checked: boolean) => {
    if (checked && !isConnected) {
      setEInvoiceEnabled(true);
      setShowConnectionSheet(true);
    } else if (!checked && isConnected) {
      setShowDisconnectDialog(true);
    } else {
      setEInvoiceEnabled(checked);
    }
  };

  // (simulateConnection removed) dev simulation cleaned up on mount

  // Handle disconnect confirm
  const handleConfirmDisconnect = () => {
    setEInvoiceEnabled(false);
    setIsConnected(false);
    setSelectedProvider('');
    setUsername('');
    setPassword('');
    setShowDisconnectDialog(false);
    setSnack({
      open: true,
      severity: 'info',
      message: 'Đã ngắt kết nối hoá đơn điện tử',
    });
  };

  // Handle select provider
  const handleSelectProvider = (providerCode: string) => {
    setSelectedProvider(providerCode);
    setShowProviderSheet(false);
  };

  // Validate connection form
  const validateConnectionForm = (): boolean => {
    if (!selectedProvider) {
      setErrorMessage('Vui lòng chọn đơn vị phát hành');
      return false;
    }
    if (!taxCode) {
      setErrorMessage('Vui lòng nhập mã số thuế');
      return false;
    }
    if (!username) {
      setErrorMessage('Vui lòng nhập tên tài khoản');
      return false;
    }
    if (!password) {
      setErrorMessage('Vui lòng nhập mật khẩu');
      return false;
    }

    // Verify tax code matches previous entry
    const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    if (onboardingData.businessIdentification?.taxCode !== taxCode) {
      setErrorMessage('Thông tin đăng nhập không đúng. Vui lòng thử lại.');
      return false;
    }

    return true;
  };

  // Check completeness (used to enable/disable Connect button without showing errors)
  const isConnectionFormComplete = () => {
    return !!selectedProvider && !!taxCode && !!username && !!password;
  };

  // Handle connect
  const handleConnect = async () => {
    if (!validateConnectionForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // TODO: Call API to verify credentials
      // const response = await apiService.verifyEInvoiceConnection({
      //   provider: selectedProvider,
      //   taxCode,
      //   username,
      //   password
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // On success
      setIsConnected(true);
      setShowConnectionSheet(false);

      const providerName = providers.find((p) => p.code === selectedProvider)?.name;
      setSnack({
        open: true,
        severity: 'success',
        message: `Kết nối thành công với ${providerName}`,
      });
    } catch (error: any) {
      setErrorMessage('Thông tin đăng nhập không đúng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel connection
  const handleCancelConnection = () => {
    setShowConnectionSheet(false);
    if (!isConnected) {
      setEInvoiceEnabled(false);
    }
    setErrorMessage('');
  };

  // Handle back
  const handleBack = () => {
    if (showConnectionSheet && !isConnected) {
      setShowConfirmDialog(true);
    } else {
      navigate(ROUTES.ONBOARDING_ACCOUNTING_SETUP);
    }
  };

  const handleConfirmLeave = () => {
    setShowConfirmDialog(false);
    setShowConnectionSheet(false);
    setEInvoiceEnabled(false);
    setSelectedProvider('');
    setUsername('');
    setPassword('');
    navigate(ROUTES.ONBOARDING_ACCOUNTING_SETUP);
  };

  const handleCancelLeave = () => setShowConfirmDialog(false);

  // Handle submit (Complete onboarding)
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');

      // Prepare advanced setup payload
      let advancedSetupPayload: any = {
        eInvoiceEnabled,
      };

      if (eInvoiceEnabled && isConnected) {
        advancedSetupPayload.eInvoiceConnection = {
          provider: selectedProvider,
          providerName: providers.find((p) => p.code === selectedProvider)?.name,
          taxCode,
          username,
          password, // Should be encrypted in real implementation
          autoIssueOnSale,
          connectedAt: new Date().toISOString(),
        };
      }

      const updatedData = {
        ...onboardingData,
        advancedSetup: advancedSetupPayload,
        completedAt: new Date().toISOString(),
      };

      console.log('[AdvancedSetupScreen] Complete onboarding payload:', updatedData);

      // TODO: Call API to complete onboarding
      // const currentTenant = JSON.parse(localStorage.getItem('currentTenant') || '{}');
      // await apiService.completeOnboarding(currentTenant.id, updatedData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Clean up localStorage
      localStorage.removeItem('onboardingData');
      
      // Set flag to show initial setup modal on Home screen
      localStorage.setItem('justCompletedOnboarding', 'true');
      // Ensure any previous "seen" flag is cleared so the modal will display
      localStorage.removeItem('hasSeenSetupGuideModal');

      const businessName = onboardingData.businessIdentification?.businessName || 'hệ thống';
      setSnack({
        open: true,
        severity: 'success',
        message: `Thiết lập hoàn tất! Chào mừng đến với ${businessName}`,
      });

      setTimeout(() => {
        navigate(ROUTES.HOME);
      }, 1500);
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error);
      setSnack({
        open: true,
        severity: 'error',
        message: 'Có lỗi xảy ra khi lưu thiết lập. Vui lòng thử lại.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProviderData = providers.find((p) => p.code === selectedProvider);

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
          Thiết lập mở rộng
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
          Thiết lập các kết nối và nhắc nhở kê khai
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
            left: '16px',
            right: '16px',
            maxWidth: 'calc(100% - 32px)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: 'auto', sm: 'auto' },
          }}
        >
          {isDataLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '300px',
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Scrollable content area */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: { xs: 'auto', sm: 'visible' },
                  pr: 0,
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {/* Section: Kết nối */}
                <Typography
                  sx={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'rgba(0, 0, 0, 0.87)',
                    mb: 2,
                  }}
                >
                  Thiết lập kết nối
                </Typography>

                {/* E-Invoice Card */}
                <Box
                  sx={{
                    backgroundColor: '#F9F9F9',
                    borderRadius: '12px',
                    p: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: isConnected ? 'pointer' : 'default',
                    '&:hover': isConnected
                      ? {
                          backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        }
                      : {},
                  }}
                  onClick={() => {
                    if (isConnected) {
                      setShowConnectionSheet(true);
                    }
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0 }}>
                      <Typography sx={{ fontSize: '16px', fontWeight: 600 }}>
                        Hoá đơn điện tử
                      </Typography>
                    </Box>

                    {isConnected && selectedProviderData && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Chip
                          label="Đã kết nối"
                          size="small"
                          icon={
                            <Icon
                              name="TickCircle"
                              size={16}
                              color="#2E7D32"
                              variant="Bold"
                            />
                          }
                          sx={{
                            backgroundColor: '#E8F5E9',
                            color: '#2E7D32',
                            fontSize: '12px',
                            fontWeight: 600,
                            height: 24,
                            '& .MuiChip-icon': {
                              marginLeft: '4px',
                            },
                          }}
                        />
                        <Typography sx={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.87)' }}>
                          {selectedProviderData.name}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Switch
                      checked={eInvoiceEnabled}
                      onChange={(e) => handleToggleEInvoice(e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#FB7E00',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#FB7E00',
                        },
                      }}
                    />
                    {/* dev simulate removed */}
                  </Box>
                </Box>
              </Box>

              {/* Fixed button at bottom - Desktop */}
              <Box sx={{ display: { xs: 'none', sm: 'block' }, mt: 4 }}>
                <PrimaryButton
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  loadingText="Đang hoàn tất..."
                >
                  Bắt đầu sử dụng
                </PrimaryButton>
              </Box>
            </>
          )}
        </Box>
      </Container>

      {/* Mobile sticky footer */}
      <Box
        sx={{
          display: { xs: showConnectionSheet || showProviderSheet ? 'none' : 'flex', sm: 'none' },
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
        <Box sx={{ width: '100%', maxWidth: 'calc(100% - 32px)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <PrimaryButton
              onClick={handleSubmit}
              loading={isSubmitting}
              loadingText="Đang hoàn tất..."
              sx={{
                height: 56,
                borderRadius: '100px',
                backgroundColor: '#FB7E00',
                '&:hover': { backgroundColor: '#C96400' },
                boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
              }}
            >
              Bắt đầu sử dụng
            </PrimaryButton>
          </Box>
        </Box>
      </Box>

      {/* Connection Bottom Sheet */}
      <BottomSheet
        open={showConnectionSheet}
        onClose={handleCancelConnection}
        title="Thiết lập kết nối"
        maxHeight="90vh"
      >

          {/* Error Banner */}
          {errorMessage && (
            <Box
              sx={{
                backgroundColor: '#FFEBEE',
                color: '#C62828',
                borderRadius: '8px',
                p: 1.5,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Icon name="Warning" size={20} color="#C62828" variant="Outline" />
              <Typography sx={{ fontSize: '14px' }}>{errorMessage}</Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 2 }}>
            <RoundedTextField
              fullWidth
              required
              label="Đơn vị phát hành"
              placeholder="Chọn đơn vị phát hành"
              value={selectedProviderData?.name || ''}
              onClick={() => setShowProviderSheet(true)}
              inputProps={{ readOnly: true }}
              sx={{ cursor: 'pointer' }}
              InputProps={{
                startAdornment: (
                <InputAdornment position="start">
                    <Icon name="Building" size={20} color="#4E4E4E" variant="Outline" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Icon name="ArrowDown2" size={20} color="#4E4E4E" variant="Outline" />
                  </InputAdornment>
                ),
              }}
            />

            <RoundedTextField
              fullWidth
              required
              label="Mã số thuế"
              placeholder="Nhập mã số thuế"
              value={taxCode}
              onChange={(e) => setTaxCode(e.target.value)}
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon name="ReceiptText" size={20} color="#4E4E4E" variant="Outline" />
                  </InputAdornment>
                ),
              }}
            />

            <RoundedTextField
              fullWidth
              required
              label="Tên tài khoản"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                <InputAdornment position="start">
                    <Icon name="user" size={20} color="#4E4E4E" variant="Outline" />
                  </InputAdornment>
                ),
              }}
            /> 
            <RoundedTextField
              fullWidth
              required
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                <InputAdornment position="start">
                    <Icon name="Lock" size={20} color="#4E4E4E" variant="Outline" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Box
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Icon name={showPassword ? 'Eye' : 'EyeSlash'} size={20} color="#4E4E4E" variant="Outline" />
                    </Box>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Auto-issue checkbox */}
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={autoIssueOnSale}
                  onChange={(e) => setAutoIssueOnSale(e.target.checked)}
                  sx={{
                    '&.Mui-checked': { color: '#FB7E00' },
                  }}
                />
              }
              label="Phát hành HĐĐT trên màn hình bán hàng"
            />
          </Box>

          {/* Action buttons */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: '12px',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCancelConnection}
              disabled={isLoading}
              sx={{
                flex: 1,
                textTransform: 'none',
                fontSize: '16px',
                minWidth: 120,
                color: 'rgba(0, 0, 0, 0.6)',
                borderColor: 'rgba(0, 0, 0, 0.23)',
                borderRadius: '100px',
                height: 48,
                '&:hover': {
                  borderColor: 'rgba(0, 0, 0, 0.4)',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              Huỷ
            </Button>
            <Button
              variant="contained"
              onClick={handleConnect}
              disabled={!isConnectionFormComplete() || isLoading}
              sx={{
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 500,
                flex: 1,
                minWidth: 120,
                backgroundColor: '#FB7E00',
                borderRadius: '100px',
                height: 48,
                boxShadow: 'none',
                '&:hover': { backgroundColor: 'rgba(233, 119, 4, 1)' },
                '&.Mui-disabled': {
                  backgroundColor: '#F5F5F5',
                  color: 'rgba(0,0,0,0.26)',
                },
              }}
            >
              {isLoading ? 'Đang kết nối...' : 'Kết nối'}
            </Button>
          </Box>
      </BottomSheet>

      {/* Provider Selection Bottom Sheet */}
      <BottomSheet
        open={showProviderSheet}
        onClose={() => setShowProviderSheet(false)}
        title="Chọn đơn vị phát hành"
        maxHeight="60vh"
      >

          <RadioGroup value={selectedProvider} onChange={(e) => handleSelectProvider(e.target.value)}>
            {providers.map((provider) => (
              <Box
                key={provider.id}
                sx={{
                  p: 2,
                  borderRadius: '8px',
                  mb: 1,
                  cursor: 'pointer',
                  backgroundColor:
                    selectedProvider === provider.code
                      ? 'rgba(251, 126, 0, 0.08)'
                      : 'transparent',
                  border: '1px solid',
                  borderColor:
                    selectedProvider === provider.code
                      ? '#FB7E00'
                      : 'rgba(0, 0, 0, 0.12)',
                  '&:hover': {
                    backgroundColor:
                      selectedProvider === provider.code
                        ? 'rgba(251, 126, 0, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
                onClick={() => handleSelectProvider(provider.code)}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Radio
                    value={provider.code}
                    sx={{
                      '&.Mui-checked': { color: '#FB7E00' },
                      p: 0,
                      mt: 0.5,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: 'rgba(0, 0, 0, 0.87)',
                      }}
                    >
                      {provider.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        color: 'rgba(0, 0, 0, 0.6)',
                        mt: 0.5,
                      }}
                    >
                      {provider.description}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </RadioGroup>
      </BottomSheet>

      {/* Disconnect Confirm Dialog */}
      <ConfirmDialog
        open={showDisconnectDialog}
        title="Xác nhận ngắt kết nối"
        description="Bạn có chắc muốn ngắt kết nối với đơn vị phát hành hoá đơn điện tử? Bạn có thể thiết lập lại sau trong phần Cài đặt."
        cancelText="Hủy"
        confirmText="Ngắt kết nối"
        confirmColor="error"
        onCancel={() => setShowDisconnectDialog(false)}
        onConfirm={handleConfirmDisconnect}
      />

      {/* Leave Confirm Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        title="Xác nhận rời trang"
        description="Thông tin kết nối chưa được lưu. Nếu bạn rời trang, các thay đổi sẽ bị mất. Bạn có chắc muốn thoát?"
        cancelText="Hủy"
        confirmText="Rời đi"
        confirmColor="error"
        onCancel={handleCancelLeave}
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
    </Box>
  );
};

export default AdvancedSetupScreen;
