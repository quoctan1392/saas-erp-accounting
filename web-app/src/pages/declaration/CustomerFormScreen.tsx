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
import SuccessSnackbar from '../../components/SuccessSnackbar';
import SubjectGroupSelectionScreen from './SubjectGroupSelectionScreen';
import BankSelectionScreen from './BankSelectionScreen';
import headerDay from '../../assets/Header_day.png';
import * as Iconsax from 'iconsax-react';

// Icon wrapper component
const Icon = ({ name, size = 24, color = 'currentColor', variant = 'Outline' }: any) => {
  const Comp = (Iconsax as any)[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} variant={variant} />;
};

interface CustomerFormScreenProps {
  embedded?: boolean;
  onClose?: () => void;
  onSaveSuccess?: (customer: any) => void;
}

const CustomerFormScreen = ({ embedded = false, onClose, onSaveSuccess }: CustomerFormScreenProps = {}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const ANIM_MS = 280;

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
  const [isContactExpanded, setIsContactExpanded] = useState(true);
  const [isEInvoiceExpanded, setIsEInvoiceExpanded] = useState(true);
  const [isBankExpanded, setIsBankExpanded] = useState(true);

  // Customer Group
  const [customerGroup, setCustomerGroup] = useState('');
  const [customerGroupScreenOpen, setCustomerGroupScreenOpen] = useState(false);

  // Bank selection
  const [bankSelectionOpen, setBankSelectionOpen] = useState(false);

  // Auto-generate customer code on mount
  useEffect(() => {
    const fetchNextCode = async () => {
      try {
        const nextCode = await apiService.getNextObjectCode('customer');
        setCode(nextCode);
      } catch (error) {
        console.error('Error fetching next customer code:', error);
        // Fallback to localStorage
        const lastCustomerNumber = parseInt(localStorage.getItem('lastCustomerNumber') || '0', 10);
        const nextNumber = lastCustomerNumber + 1;
        setCode(`KH${nextNumber.toString().padStart(5, '0')}`);
      }
    };

    fetchNextCode();
  }, []);

  const handleFieldChange = (setter: any) => (value: any) => {
    setHasChanges(true);
    setter(value);
  };

  const handleBack = () => {
    if (embedded && onClose) {
      if (hasChanges) {
        setShowConfirmDialog(true);
      } else {
        onClose();
      }
    } else {
      if (hasChanges) {
        setShowConfirmDialog(true);
      } else {
        setExiting(true);
        setTimeout(() => navigate(ROUTES.DECLARATION_CATEGORIES), ANIM_MS);
      }
    }
  };

  const handleConfirmLeave = () => {
    setShowConfirmDialog(false);
    if (embedded && onClose) {
      onClose();
    } else {
      setExiting(true);
      setTimeout(() => navigate(ROUTES.DECLARATION_CATEGORIES), ANIM_MS);
    }
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
        isVendor: isDualRole,
        isEmployee: false,
        contactName: contactName || undefined,
        contactPhone: contactPhone || undefined,
        contactEmail: contactEmail || undefined,
        companyTaxCode: customerType === 'organization' ? taxCode || undefined : undefined,
        taxCode: customerType === 'organization' ? taxCode || undefined : undefined,
        identityNumber: customerType === 'individual' ? idNumber || undefined : undefined,
        listBankAccountIds: bankAccountNumber ? [bankAccountNumber] : undefined,
      };

      console.log('Saving customer with data:', accountingObjectData);

      const result = await apiService.createAccountingObject(accountingObjectData);
      console.log('Customer saved successfully:', result);

      // If embedded mode with callback, invoke it
      if (embedded && onSaveSuccess) {
        const customerData = {
          id: result.data?.id || result.id,
          name,
          code,
          type: customerType,
          taxCode: customerType === 'organization' ? taxCode : undefined,
          idNumber: customerType === 'individual' ? idNumber : undefined,
        };
        onSaveSuccess(customerData);
        setHasChanges(false);
        if (onClose) onClose();
        return;
      }

      setShowSuccessSnackbar(true);
      setHasChanges(false);
      setTimeout(() => navigate(ROUTES.DECLARATION_CATEGORIES), 1500);
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

      setShowSuccessSnackbar(true);

      // Fetch next code from API
      try {
        const nextCode = await apiService.getNextObjectCode('customer');
        setCode(nextCode);
      } catch (error) {
        // Fallback to localStorage
        const currentNumber = parseInt(code.replace('KH', ''), 10);
        localStorage.setItem('lastCustomerNumber', currentNumber.toString());
        const nextNumber = currentNumber + 1;
        setCode(`KH${nextNumber.toString().padStart(5, '0')}`);
      }

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
        transform: exiting ? 'translateX(100%)' : 'translateX(0)',
        transition: `transform ${ANIM_MS}ms ease`,
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pb: { xs: 3, sm: 0 } }}>
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

            {/* Customer Group */}
            <RoundedTextField
              fullWidth
              label="Nhóm khách hàng"
              placeholder="Chọn nhóm khách hàng"
              value={customerGroup}
              onClick={() => setCustomerGroupScreenOpen(true)}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomerGroupScreenOpen(true);
                      }}
                    >
                      <Icon name="ArrowDown2" size={18} color="#6C757D" variant="Outline" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Contact Information Section */}
            <Box>
              <Box
                onClick={() => setIsContactExpanded(!isContactExpanded)}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  py: 0,
                }}
              >
                <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#212529' }}>
                  Người liên hệ
                </Typography>
                <Icon
                  name={isContactExpanded ? 'ArrowDown2' : 'ArrowRight2'}
                  size={20}
                  color="#6C757D"
                  variant="Outline"
                />
              </Box>

              {isContactExpanded && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
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
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    py: 0,
                  }}
                >
                  <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#212529' }}>
                    Người nhận hoá đơn điện tử
                  </Typography>
                  <Icon
                    name={isEInvoiceExpanded ? 'ArrowDown2' : 'ArrowRight2'}
                    size={20}
                    color="#6C757D"
                    variant="Outline"
                  />
                </Box>

                {isEInvoiceExpanded && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
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
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 0,
                    cursor: 'pointer',
                    py: 0,
                  }}
                >
                  <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#212529' }}>
                    Tài khoản ngân hàng
                  </Typography>
                  <Icon
                    name={isBankExpanded ? 'ArrowDown2' : 'ArrowRight2'}
                    size={20}
                    color="#6C757D"
                    variant="Outline"
                  />
                </Box>

                {isBankExpanded && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
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
                      placeholder="Chọn ngân hàng"
                      value={bankName}
                      onClick={() => setBankSelectionOpen(true)}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setBankSelectionOpen(true);
                              }}
                            >
                              <Icon name="ArrowDown2" size={18} color="#6C757D" variant="Outline" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
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
            {!embedded && (
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
            )}
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
          variant={embedded ? "contained" : "outlined"}
          onClick={handleSave}
          disabled={!isFormValid() || isLoading}
          sx={{
            flex: 1,
            borderRadius: '100px',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '16px',
            ...(embedded ? {
              bgcolor: '#FB7E00',
              color: 'white',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#FB7E00',
                boxShadow: 'none',
              },
            } : {
              borderColor: '#C5C5C5',
              bgcolor: '#F5F5F5',
              color: '#090909',
              '&:hover': {
                borderColor: '#E65A2E',
                bgcolor: '#FFF',
              },
            }),
            height: 56,
          }}
        >
          Lưu
        </Button>
        {!embedded && (
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
        )}
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

      {/* Success Snackbar */}
      <SuccessSnackbar
        open={showSuccessSnackbar}
        message="Thêm khách hàng mới thành công"
        onClose={() => setShowSuccessSnackbar(false)}
      />

      {/* Customer Group Selection Screen */}
      <SubjectGroupSelectionScreen
        open={customerGroupScreenOpen}
        onClose={() => setCustomerGroupScreenOpen(false)}
        onSelect={(label) => {
          setCustomerGroup(label);
          setHasChanges(true);
          setCustomerGroupScreenOpen(false);
        }}
        type="customer"
      />

      {/* Bank Selection Screen */}
      <BankSelectionScreen
        open={bankSelectionOpen}
        onClose={() => setBankSelectionOpen(false)}
        onSelect={(shortName) => {
          setBankName(shortName);
          setHasChanges(true);
          setBankSelectionOpen(false);
        }}
      />
    </Box>
  );
};

export default CustomerFormScreen;
