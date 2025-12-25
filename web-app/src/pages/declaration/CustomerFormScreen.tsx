import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import { ArrowBack } from '@mui/icons-material';
import RoundedTextField from '../../components/RoundedTextField';
import { apiService } from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import headerDay from '../../assets/Header_day.png';
import * as Iconsax from 'iconsax-react';

// Icon wrapper component
const Icon = ({ name, size = 24, color = 'currentColor', variant = 'Outline' }: any) => {
  const Comp = (Iconsax as any)[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} variant={variant} />;
};

const CustomerFormScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [customerType, setCustomerType] = useState<'organization' | 'individual'>('organization');
  const [isDualRole, setIsDualRole] = useState(false);
  const [code, setCode] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Contact information
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // E-invoice recipient (organization only)
  const [eInvoiceName, setEInvoiceName] = useState('');
  const [eInvoicePhone, setEInvoicePhone] = useState('');
  const [eInvoiceEmail, setEInvoiceEmail] = useState('');

  // Bank account (organization only)
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');

  

  // Expandable sections
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  const [isEInvoiceExpanded, setIsEInvoiceExpanded] = useState(false);
  const [isBankExpanded, setIsBankExpanded] = useState(false);

  // Auto-generate customer code on mount
  useEffect(() => {
    // TODO: Call API to get next customer code
    // For now, generate sequential code in format KH00001, KH00002, etc.
    const generateCustomerCode = () => {
      // In production, this should call API: GET /api/customers/next-code
      // For now, use localStorage to track the last customer number
      const lastCustomerNumber = parseInt(localStorage.getItem('lastCustomerNumber') || '0', 10);
      const nextNumber = lastCustomerNumber + 1;
      return `KH${nextNumber.toString().padStart(5, '0')}`;
    };

    setCode(generateCustomerCode());
  }, []);

  const handleFieldChange = (setter: any) => (value: any) => {
    setHasChanges(true);
    setter(value);
  };

  const handleBack = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      navigate(ROUTES.DECLARATION_CATEGORIES);
    }
  };

  const handleConfirmLeave = () => {
    setShowConfirmDialog(false);
    navigate(ROUTES.DECLARATION_CATEGORIES);
  };

  const handleTaxLookup = async () => {
    // TODO: Call API to lookup tax code
    console.log('Lookup tax code:', taxCode);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Map form fields to core-service CreateAccountingObjectDto
      const accountingObjectData: any = {
        accountObjectCode: code,
        accountObjectName: name,
        address,
        phone,
        isCustomer: true,
        isVendor: false,
        isEmployee: false,
        contactName: contactName || undefined,
        contactPhone: contactPhone || undefined,
        contactEmail: contactEmail || undefined,
        companyTaxCode: customerType === 'organization' ? taxCode || undefined : undefined,
        taxCode: customerType === 'organization' ? taxCode || undefined : undefined,
        identityNumber: customerType === 'individual' ? idNumber || undefined : undefined,
        listBankAccountIds: bankAccountNumber ? [bankAccountNumber] : undefined,
      };

      const result = await apiService.createAccountingObject(accountingObjectData);
      console.log('Customer saved successfully:', result);

      setHasChanges(false);
      navigate(ROUTES.DECLARATION_CATEGORIES);
    } catch (error) {
      console.error('Error saving customer:', error);
      // TODO: Show error notification to user
      alert('Không thể lưu khách hàng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndAddNew = async () => {
    setIsLoading(true);
    try {
      // Map form fields to core-service CreateAccountingObjectDto (for "Save and add new")
      const accountingObjectData: any = {
        accountObjectCode: code,
        accountObjectName: name,
        address,
        phone,
        isCustomer: true,
        isVendor: false,
        isEmployee: false,
        contactName: contactName || undefined,
        contactPhone: contactPhone || undefined,
        contactEmail: contactEmail || undefined,
        companyTaxCode: customerType === 'organization' ? taxCode || undefined : undefined,
        taxCode: customerType === 'organization' ? taxCode || undefined : undefined,
        identityNumber: customerType === 'individual' ? idNumber || undefined : undefined,
        listBankAccountIds: bankAccountNumber ? [bankAccountNumber] : undefined,
      };

      const result = await apiService.createAccountingObject(accountingObjectData);
      console.log('Customer saved successfully:', result);

      // Save the customer number to localStorage for sequential numbering
      const currentNumber = parseInt(code.replace('KH', ''), 10);
      localStorage.setItem('lastCustomerNumber', currentNumber.toString());

      // Reset form and generate new customer code
      const generateCustomerCode = () => {
        const lastCustomerNumber = parseInt(localStorage.getItem('lastCustomerNumber') || '0', 10);
        const nextNumber = lastCustomerNumber + 1;
        return `KH${nextNumber.toString().padStart(5, '0')}`;
      };

      setCode(generateCustomerCode());
      setTaxCode('');
      setIdNumber('');
      setName('');
      setAddress('');
      setPhone('');
      setIsDualRole(false);
      // Reset contact
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      // Reset e-invoice recipient
      setEInvoiceName('');
      setEInvoicePhone('');
      setEInvoiceEmail('');
      // Reset bank account
      setBankAccountNumber('');
      setBankName('');
      setBankBranch('');
      // Reset expanded states
      setIsContactExpanded(false);
      setIsEInvoiceExpanded(false);
      setIsBankExpanded(false);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving customer:', error);
      // TODO: Show error notification to user
      alert('Không thể lưu khách hàng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (customerType === 'organization') {
      return code && taxCode && name && address;
    } else {
      return code && idNumber && name;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        pt: 0,
      }}
    >
      {/* Top decorative image */}
      <Box sx={{ height: { xs: 160, sm: 120 }, width: '100%', backgroundImage: `url(${headerDay})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

      {/* Fixed header (matches CategoryDeclarationScreen style) */}
      <Box sx={{ position: 'fixed', top: 36, left: 0, right: 0, zIndex: 20, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 'sm', mx: 'auto', py: 0.5 }}>
          <IconButton
            onClick={handleBack}
            sx={{ position: 'absolute', left: 0, top: 6, width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}
          >
            <ArrowBack />
          </IconButton>

          <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
            <Typography sx={{ color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '20px', fontStyle: 'normal', fontWeight: 500 }}>Thêm khách hàng</Typography>
          </Box>
        </Box>
      </Box>

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, pt: { xs: '120px', sm: '96px' }, pb: 2 }}>
        <Box
          sx={{
            borderRadius: {
              xs: '16px 16px 0 0',
              sm: '16px',
            },
            px: 1,
            py: { xs: 2, sm: 6 },
            pb: { xs: `calc(100px + env(safe-area-inset-bottom, 0px))`, sm: 6 },
            position: { xs: 'fixed', sm: 'relative' },
            top: { xs: '100px', sm: 'auto' },
            bottom: { xs: 0, sm: 'auto' },
            left: '16px',
            right: '16px',
            maxWidth: 'calc(100% - 32px)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: { xs: 'auto', sm: 'visible' },
          }}
        >
          {/* Form Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Customer Type and Dual Role */}
            <Box>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 1, color: '#212529' }}>
                Thông tin khách hàng <span style={{ color: '#DC3545' }}>*</span>
              </Typography>
              <RadioGroup
                value={customerType}
                onChange={(e) => handleFieldChange(setCustomerType)(e.target.value)}
                sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 1 }}
              >
                <FormControlLabel
                  value="organization"
                  control={<Radio sx={{ '&.Mui-checked': { color: '#FB7E00' } }} />}
                  label="Tổ chức"
                />
                <FormControlLabel
                  value="individual"
                  control={<Radio sx={{ '&.Mui-checked': { color: '#FB7E00' } }} />}
                  label="Cá nhân"
                />
              </RadioGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isDualRole}
                    onChange={(e) => handleFieldChange(setIsDualRole)(e.target.checked)}
                    sx={{ '&.Mui-checked': { color: '#FB7E00' } }}
                  />
                }
                label="Đồng thời là nhà cung cấp"
              />
            </Box>

            {/* Customer Code */}
            <RoundedTextField
              fullWidth
              required
              label="Mã khách hàng"
              placeholder="Nhập mã khách hàng"
              value={code}
              onChange={(e) => handleFieldChange(setCode)(e.target.value)}
              InputProps={{
              }}
            />

            {/* Tax Code or ID Number */}
            {customerType === 'organization' ? (
              <RoundedTextField
                fullWidth
                required
                label="Mã số thuế"
                placeholder="Nhập mã số thuế"
                value={taxCode}
                onChange={(e) => handleFieldChange(setTaxCode)(e.target.value)}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTaxLookup} size="small">
                        <Icon name="SearchNormal" size={20} color="#FB7E00" variant="Outline" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            ) : (
              <RoundedTextField
                fullWidth
                required
                label="Số CCCD"
                placeholder="Nhập số căn cước công dân"
                value={idNumber}
                onChange={(e) => handleFieldChange(setIdNumber)(e.target.value)}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small">
                        <Icon name="SearchNormal" size={20} color="#FB7E00" variant="Outline" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}

            {/* Customer Name */}
            <RoundedTextField
              fullWidth
              required
              label="Tên khách hàng"
              placeholder="Nhập tên khách hàng"
              value={name}
              onChange={(e) => handleFieldChange(setName)(e.target.value)}
              InputProps={{
              }}
            />

            {/* Address (required for organization) */}
            {customerType === 'organization' && (
              <RoundedTextField
                fullWidth
                required
                label="Địa chỉ"
                placeholder="Nhập địa chỉ"
                value={address}
                onChange={(e) => handleFieldChange(setAddress)(e.target.value)}
                InputProps={{
                }}
              />
            )}

            {/* Phone */}
            <RoundedTextField
              fullWidth
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => handleFieldChange(setPhone)(e.target.value)}
              inputProps={{ inputMode: 'tel' }}
              InputProps={{
              }}
            />

            {/* Contact Information Section */}
            <Box>
              <Box
                onClick={() => setIsContactExpanded(!isContactExpanded)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  py: 1,
                }}
              >
                <Icon
                  name={isContactExpanded ? 'ArrowDown2' : 'ArrowRight2'}
                  size={20}
                  color="#6C757D"
                  variant="Outline"
                />
                <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#212529' }}>
                  Người liên hệ
                </Typography>
              </Box>

              {isContactExpanded && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                  {customerType === 'organization' && (
                    <RoundedTextField
                      fullWidth
                      label="Họ và tên"
                      placeholder="Nhập họ và tên người liên hệ"
                      value={contactName}
                      onChange={(e) => handleFieldChange(setContactName)(e.target.value)}
                      inputProps={{ maxLength: 100 }}
                    />
                  )}
                  <RoundedTextField
                    fullWidth
                    label="Số điện thoại"
                    placeholder="Nhập số điện thoại"
                    value={contactPhone}
                    onChange={(e) => handleFieldChange(setContactPhone)(e.target.value)}
                    inputProps={{ inputMode: 'tel' }}
                  />
                  <RoundedTextField
                    fullWidth
                    label="Email"
                    placeholder="Nhập email"
                    value={contactEmail}
                    onChange={(e) => handleFieldChange(setContactEmail)(e.target.value)}
                    inputProps={{ type: 'email' }}
                  />
                </Box>
              )}
            </Box>

            {/* E-Invoice Recipient Section (Organization only) */}
            {customerType === 'organization' && (
              <Box>
                <Box
                  onClick={() => setIsEInvoiceExpanded(!isEInvoiceExpanded)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    py: 1,
                  }}
                >
                  <Icon
                    name={isEInvoiceExpanded ? 'ArrowDown2' : 'ArrowRight2'}
                    size={20}
                    color="#6C757D"
                    variant="Outline"
                  />
                  <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#212529' }}>
                    Người nhận hoá đơn điện tử
                  </Typography>
                </Box>

                {isEInvoiceExpanded && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                    <RoundedTextField
                      fullWidth
                      label="Họ tên"
                      placeholder="Nhập họ tên"
                      value={eInvoiceName}
                      onChange={(e) => handleFieldChange(setEInvoiceName)(e.target.value)}
                      inputProps={{ maxLength: 100 }}
                    />
                    <RoundedTextField
                      fullWidth
                      label="Số điện thoại"
                      placeholder="Nhập số điện thoại"
                      value={eInvoicePhone}
                      onChange={(e) => handleFieldChange(setEInvoicePhone)(e.target.value)}
                      inputProps={{ inputMode: 'tel' }}
                    />
                    <RoundedTextField
                      fullWidth
                      required={eInvoiceName || eInvoicePhone ? true : false}
                      label="Email"
                      placeholder="Nhập email"
                      value={eInvoiceEmail}
                      onChange={(e) => handleFieldChange(setEInvoiceEmail)(e.target.value)}
                      inputProps={{ type: 'email' }}
                    />
                  </Box>
                )}
              </Box>
            )}

            {/* Bank Account Section (Organization only) */}
            {customerType === 'organization' && (
              <Box>
                <Box
                  onClick={() => setIsBankExpanded(!isBankExpanded)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    py: 1,
                  }}
                >
                  <Icon
                    name={isBankExpanded ? 'ArrowDown2' : 'ArrowRight2'}
                    size={20}
                    color="#6C757D"
                    variant="Outline"
                  />
                  <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#212529' }}>
                    Tài khoản ngân hàng
                  </Typography>
                </Box>

                {isBankExpanded && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                    <RoundedTextField
                      fullWidth
                      label="Số tài khoản"
                      placeholder="Nhập số tài khoản"
                      value={bankAccountNumber}
                      onChange={(e) => handleFieldChange(setBankAccountNumber)(e.target.value)}
                      inputProps={{ inputMode: 'numeric', minLength: 6, maxLength: 20 }}
                    />
                    <RoundedTextField
                      fullWidth
                      label="Tên ngân hàng"
                      placeholder="Nhập tên ngân hàng"
                      value={bankName}
                      onChange={(e) => handleFieldChange(setBankName)(e.target.value)}
                    />
                    <RoundedTextField
                      fullWidth
                      label="Chi nhánh"
                      placeholder="Nhập chi nhánh"
                      value={bankBranch}
                      onChange={(e) => handleFieldChange(setBankBranch)(e.target.value)}
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Desktop buttons */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2, mt: 4, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={handleSave}
              disabled={!isFormValid() || isLoading}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 500,
                borderColor: '#FB7E00',
                color: '#FB7E00',
                px: 4,
                py: 1.5,
                minWidth: 120,
                '&:hover': {
                  borderColor: '#E65A2E',
                  bgcolor: '#FFF4E6',
                },
                '&.Mui-disabled': {
                  borderColor: '#DEE2E6',
                  color: '#ADB5BD',
                },
              }}
            >
              Lưu
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveAndAddNew}
              disabled={!isFormValid() || isLoading}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: '#007DFB',
                color: 'white',
                px: 4,
                py: 1.5,
                minWidth: 120,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#0056b3',
                  boxShadow: 'none',
                },
                '&.Mui-disabled': {
                  bgcolor: '#DEE2E6',
                  color: '#ADB5BD',
                },
              }}
            >
              Lưu và thêm mới
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
          gap: 1.5,
          px: 2,
          py: 2,
          pb: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          bgcolor: '#ffffff',
          boxShadow: '0 -8px 16px rgba(0,0,0,0.12)',
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          onClick={handleSave}
          disabled={!isFormValid() || isLoading}
          sx={{
            flex: 1,
            borderRadius: '100px',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '16px',
            borderColor: '#C5C5C5',
            bgcolor: '#F5F5F5',
            color: '#090909',
            height: 56,
            '&:hover': {
              borderColor: '#E65A2E',
              bgcolor: '#FFF',
            },
          }}
        >
          Lưu
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSaveAndAddNew}
          disabled={!isFormValid() || isLoading}
          sx={{
            flex: 1,
            borderRadius: '100px',
            fontSize: '16px',
            textTransform: 'none',
            fontWeight: 500,
            bgcolor: '#FB7E00',
            color: 'white',
            height: 56,
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#FB7E00',
              boxShadow: 'none',
            },
          }}
        >
          Lưu và thêm mới
        </Button>
      </Box>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        title="Thay đổi chưa được lưu"
        description="Bạn có muốn lưu thay đổi trước khi rời khỏi trang?"
        cancelText="Hủy bỏ thay đổi"
        confirmText="Lưu"
        onCancel={handleConfirmLeave}
        onConfirm={async () => {
          await handleSave();
          setShowConfirmDialog(false);
        }}
      />
    </Box>
  );
};

export default CustomerFormScreen;
