// @ts-nocheck
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
  Switch,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { ROUTES } from '../../config/constants';
import RoundedTextField from '../../components/RoundedTextField';
import AlertDialog from '../../components/AlertDialog';
import SuccessSnackbar from '../../components/SuccessSnackbar';
import SubjectGroupSelectionScreen from './SubjectGroupSelectionScreen';
import BankSelectionScreen from './BankSelectionScreen';
import { apiService } from '../../services/api';
import headerDay from '../../assets/Header_day.png';
import * as Iconsax from 'iconsax-react';

// Icon wrapper component
const Icon = ({ name, size = 24, color = 'currentColor', variant = 'Outline' }: any) => {
  const Comp = (Iconsax as any)[name];
  if (!Comp) return null;
  return <Comp size={size} color={color} variant={variant} />;
};

interface SupplierFormScreenProps {
  embedded?: boolean;
  onClose?: () => void;
  onSaveSuccess?: (supplier: any) => void;
}

const SupplierFormScreen = ({ embedded = false, onClose, onSaveSuccess }: SupplierFormScreenProps = {}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isPerformingConfirmAction, setIsPerformingConfirmAction] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const ANIM_MS = 280;

  // Form state
  const [supplierType, setSupplierType] = useState<'organization' | 'individual'>('organization');
  const [isDualRole, setIsDualRole] = useState(false);
  const [isActive, setIsActive] = useState(true);
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

  // Bank account
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');

  // Expandable sections
  const [isContactExpanded, setIsContactExpanded] = useState(true);
  const [isBankExpanded, setIsBankExpanded] = useState(true);

  // Supplier Group
  const [supplierGroup, setSupplierGroup] = useState('');
  const [supplierGroupScreenOpen, setSupplierGroupScreenOpen] = useState(false);

  // Bank selection
  const [bankSelectionOpen, setBankSelectionOpen] = useState(false);

  // Auto-generate supplier code on mount - fetch from API
  useEffect(() => {
    const fetchNextCode = async () => {
      try {
        const nextCode = await apiService.getNextObjectCode('vendor');
        setCode(nextCode);
      } catch (error) {
        console.error('Error fetching next supplier code:', error);
        // Fallback to localStorage
        const lastSupplierNumber = parseInt(localStorage.getItem('lastSupplierNumber') || '0', 10);
        const nextNumber = lastSupplierNumber + 1;
        setCode(`NCC${nextNumber.toString().padStart(5, '0')}`);
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
        isCustomer: isDualRole,
        isVendor: true,
        isEmployee: false,
        contactName: contactName || undefined,
        contactPhone: contactPhone || undefined,
        contactEmail: contactEmail || undefined,
        companyTaxCode: supplierType === 'organization' ? taxCode || undefined : undefined,
        taxCode: supplierType === 'organization' ? taxCode || undefined : undefined,
        identityNumber: supplierType === 'individual' ? idNumber || undefined : undefined,
        listBankAccountIds: bankAccountNumber ? [bankAccountNumber] : undefined,
        isActive,
      };

      const result = await apiService.createAccountingObject(accountingObjectData);
      console.log('Supplier saved successfully:', result);

      // If embedded mode with callback, invoke it
      if (embedded && onSaveSuccess) {
        const supplierData = {
          id: result.data?.id || result.id,
          name,
          code,
          type: supplierType,
          taxCode: supplierType === 'organization' ? taxCode : undefined,
          idNumber: supplierType === 'individual' ? idNumber : undefined,
        };
        onSaveSuccess(supplierData);
        setHasChanges(false);
        if (onClose) onClose();
        return;
      }

      setShowSuccessSnackbar(true);
      setHasChanges(false);
      setTimeout(() => navigate(ROUTES.DECLARATION_CATEGORIES), 1500);
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Không thể lưu nhà cung cấp. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndAddNew = async () => {
    setIsLoading(true);
    try {
      const accountingObjectData: any = {
        accountObjectCode: code,
        accountObjectName: name,
        address,
        phone,
        isCustomer: isDualRole,
        isVendor: true,
        isEmployee: false,
        contactName: contactName || undefined,
        contactPhone: contactPhone || undefined,
        contactEmail: contactEmail || undefined,
        companyTaxCode: supplierType === 'organization' ? taxCode || undefined : undefined,
        taxCode: supplierType === 'organization' ? taxCode || undefined : undefined,
        identityNumber: supplierType === 'individual' ? idNumber || undefined : undefined,
        listBankAccountIds: bankAccountNumber ? [bankAccountNumber] : undefined,
        isActive,
      };

      const result = await apiService.createAccountingObject(accountingObjectData);
      console.log('Supplier saved successfully:', result);

      setShowSuccessSnackbar(true);

      // Save the supplier number to localStorage for sequential numbering (fallback)
      const currentNumber = parseInt(code.replace('NCC', ''), 10);
      localStorage.setItem('lastSupplierNumber', currentNumber.toString());

      // Reset form and fetch new supplier code from API
      try {
        const nextCode = await apiService.getNextObjectCode('vendor');
        setCode(nextCode);
      } catch (error) {
        console.error('Error fetching next supplier code:', error);
        // Fallback to localStorage
        const lastSupplierNumber = parseInt(localStorage.getItem('lastSupplierNumber') || '0', 10);
        const nextNumber = lastSupplierNumber + 1;
        setCode(`NCC${nextNumber.toString().padStart(5, '0')}`);
      }
      setTaxCode('');
      setIdNumber('');
      setName('');
      setAddress('');
      setPhone('');
      setIsDualRole(false);
      setIsActive(true);
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setBankAccountNumber('');
      setBankName('');
      setBankBranch('');
      setIsContactExpanded(false);
      setIsBankExpanded(false);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Không thể lưu nhà cung cấp. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    if (supplierType === 'organization') {
      return code && taxCode && name;
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

      {/* Fixed header */}
      <Box sx={{ position: 'fixed', top: 36, left: 0, right: 0, zIndex: 20, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 'sm', mx: 'auto', py: 0.5 }}>
          <IconButton
            onClick={handleBack}
            sx={{ position: 'absolute', left: 0, top: 6, width: 40, height: 40, backgroundColor: '#fff', '&:hover': { backgroundColor: '#f5f5f5' } }}
          >
            <ArrowBack />
          </IconButton>

          <Box sx={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
            <Typography sx={{ color: 'var(--Greyscale-900, #0D0D12)', textAlign: 'center', fontFamily: '"Bricolage Grotesque"', fontSize: '20px', fontStyle: 'normal', fontWeight: 500 }}>Thêm nhà cung cấp</Typography>
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
            {/* Supplier Type and Dual Role */}
            <Box>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 1, color: '#212529' }}>
                Thông tin nhà cung cấp <span style={{ color: '#DC3545' }}>*</span>
              </Typography>
              <RadioGroup
                value={supplierType}
                onChange={(e) => handleFieldChange(setSupplierType)(e.target.value)}
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
                label="Đồng thời là khách hàng"
              />
            </Box>

            {/* Supplier Code */}
            <RoundedTextField
              fullWidth
              required
              label="Mã nhà cung cấp"
              placeholder="Nhập mã nhà cung cấp"
              value={code}
              onChange={(e) => handleFieldChange(setCode)(e.target.value)}
            />

            {/* Tax Code or ID Number */}
            {supplierType === 'organization' ? (
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

            {/* Supplier Name */}
            <RoundedTextField
              fullWidth
              required
              label="Tên nhà cung cấp"
              placeholder="Nhập tên nhà cung cấp"
              value={name}
              onChange={(e) => handleFieldChange(setName)(e.target.value)}
            />

            {/* Address */}
            <RoundedTextField
              fullWidth
              label="Địa chỉ"
              placeholder="Nhập địa chỉ"
              value={address}
              onChange={(e) => handleFieldChange(setAddress)(e.target.value)}
            />

            {/* Phone */}
            <RoundedTextField
              fullWidth
              label="Số điện thoại"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => handleFieldChange(setPhone)(e.target.value)}
              inputProps={{ inputMode: 'tel' }}
            />

            {/* Supplier Group */}
            <RoundedTextField
              fullWidth
              label="Nhóm nhà cung cấp"
              placeholder="Chọn nhóm nhà cung cấp"
              value={supplierGroup}
              onClick={() => setSupplierGroupScreenOpen(true)}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSupplierGroupScreenOpen(true);
                      }}
                    >
                      <Icon name="ArrowDown2" size={18} color="#6C757D" variant="Outline" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Status Switch */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0 }}>
              <Typography sx={{ fontSize: '16px', fontWeight: 500, color: '#212529' }}>
                Đang sử dụng
              </Typography>
              <Switch
                checked={isActive}
                onChange={(e) => handleFieldChange(setIsActive)(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#FB7E00',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#FB7E00',
                  },
                }}
              />
            </Box>

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
                  <RoundedTextField
                    fullWidth
                    label="Họ và tên"
                    placeholder="Nhập họ và tên người liên hệ"
                    value={contactName}
                    onChange={(e) => handleFieldChange(setContactName)(e.target.value)}
                    inputProps={{ maxLength: 100 }}
                  />
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

            {/* Bank Account Section */}
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
                    inputProps={{ inputMode: 'numeric' }}
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
      <AlertDialog
        variant="confirm"
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title="Thay đổi chưa được lưu"
        description="Bạn có muốn thoát mà không lưu lại các thay đổi?"
        cancelText="Huỷ"
        confirmText="Đồng ý"
        onConfirm={handleConfirmLeave}
      />

      {/* Success Snackbar */}
      <SuccessSnackbar
        open={showSuccessSnackbar}
        message="Thêm nhà cung cấp mới thành công"
        onClose={() => setShowSuccessSnackbar(false)}
      />

      {/* Supplier Group Selection Screen */}
      <SubjectGroupSelectionScreen
        open={supplierGroupScreenOpen}
        onClose={() => setSupplierGroupScreenOpen(false)}
        onSelect={(label) => {
          setSupplierGroup(label);
          setHasChanges(true);
          setSupplierGroupScreenOpen(false);
        }}
        type="vendor"
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

export default SupplierFormScreen;
