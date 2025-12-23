# YÊU CẦU MÀN HÌNH THIẾT LẬP MỞ RỘNG (ADVANCED SETUP SCREEN)

## TỔNG QUAN

Màn hình **Thiết lập mở rộng** là bước cuối cùng (Step 5) trong quy trình Onboarding, cho phép người dùng thiết lập các kết nối tích hợp và cấu hình tùy chọn nghiệp vụ bổ sung trước khi bắt đầu sử dụng hệ thống.

### Vị trí trong luồng
- **Bước trước**: Thiết lập dữ liệu kế toán (AccountingSetupScreen)
- **Bước hiện tại**: Thiết lập mở rộng (AdvancedSetupScreen) - Step 5/5
- **Bước tiếp theo**: Màn hình chính (Homepage)

---

## HIGH-LEVEL REQUIREMENTS (HLR)

### HLR-1: Yêu cầu chung về màn hình

**HLR-1.1**: Hệ thống hiển thị tiêu đề màn hình "Thiết lập mở rộng" với typography:
- Font family: "Bricolage Grotesque", sans-serif
- Font size: 28px
- Font weight: 600
- Line height: 28px
- Letter spacing: 0.25px
- Color: #BA5C00

**HLR-1.2**: Hệ thống hiển thị dòng mô tả "Thiết lập các kết nối và nhắc nhở kê khai" với typography:
- Font size: 16px
- Line height: 24px
- Color: rgba(0, 0, 0, 0.8)

**HLR-1.3**: Màn hình sử dụng background tương tự AccountingSetupScreen:
- Background color: #F5EBE0
- Background image: welcomeBg
- Background size: cover
- Background position: center

**HLR-1.4**: Hệ thống hiển thị OnboardingHeader với:
- Nút quay lại (Back button)
- Thanh tiến trình (Progress bar) hiển thị 100% (Step 5/5)

**HLR-1.5**: Nội dung chính được đặt trong container màu trắng với:
- Background color: #FFFFFF
- Border radius: 16px (desktop), 16px 16px 0 0 (mobile)
- Padding: 16px (mobile), 48px (desktop)

### HLR-2: Yêu cầu về tính năng kết nối Hoá đơn điện tử

**HLR-2.1**: Hệ thống hiển thị section "Kết nối" với:
- Tiêu đề section: "Kết nối"
- Font size: 18px
- Font weight: 600
- Color: rgba(0, 0, 0, 0.87)

**HLR-2.2**: Hệ thống hiển thị card "Hoá đơn điện tử" bao gồm:
- Icon: Document (Outline variant, size 24, color #FB7E00)
- Tiêu đề: "Hoá đơn điện tử"
- Mô tả: "Kết nối với đơn vị phát hành để phát hành hoá đơn"
- Toggle switch để bật/tắt tính năng
- Border: 1px solid rgba(0, 0, 0, 0.12)
- Border radius: 12px
- Padding: 16px

**HLR-2.3**: Toggle switch phải sử dụng màu sắc:
- Active state: #FB7E00
- Inactive state: rgba(0, 0, 0, 0.38)

**HLR-2.4**: Khi toggle được bật lần đầu tiên:
- Hệ thống mở bottom sheet "Thiết lập kết nối Hoá đơn điện tử"
- Nếu người dùng tắt toggle, bottom sheet đóng lại

**HLR-2.5**: Sau khi kết nối thành công, hệ thống hiển thị trong card:
- Badge "Đã kết nối" với:
  - Background color: #E8F5E9
  - Text color: #2E7D32
  - Font size: 12px
  - Border radius: 12px
  - Padding: 4px 12px
- Tên đơn vị phát hành (ví dụ: "Viettel S-Invoice")
- Icon check circle màu xanh lá

**HLR-2.6**: Khi đã kết nối, người dùng có thể:
- Click vào card để mở lại bottom sheet và chỉnh sửa cấu hình
- Tắt toggle để ngắt kết nối (hiển thị confirm dialog trước khi ngắt)

### HLR-3: Yêu cầu về Bottom Sheet thiết lập kết nối

**HLR-3.1**: Bottom Sheet có tiêu đề "Thiết lập kết nối Hoá đơn điện tử"

**HLR-3.2**: Bottom Sheet hiển thị thông báo lỗi (nếu có) ở phía trên cùng:
- Background color: #FFEBEE
- Text color: #C62828
- Icon: Warning (Outline)
- Padding: 12px 16px
- Border radius: 8px
- Margin bottom: 16px

**HLR-3.3**: Trường "Đơn vị phát hành" (REQUIRED):
- Label: "Đơn vị phát hành" với dấu sao đỏ (*)
- Component: RoundedTextField với readOnly
- Placeholder: "Chọn đơn vị phát hành"
- Click để mở bottom sheet chọn đơn vị
- Icon: ArrowDown2 (Outline, size 20)

**HLR-3.4**: Trường "Mã số thuế" (REQUIRED):
- Label: "Mã số thuế" với dấu sao đỏ (*)
- Component: RoundedTextField
- Type: text (numeric input)
- Auto-fill từ dữ liệu đã nhập ở bước Business Identification
- Validation: Phải khớp với MST đã khai báo trước đó
- Error message: "Mã số thuế không khớp với thông tin đã khai báo"

**HLR-3.5**: Trường "Tên tài khoản" (REQUIRED):
- Label: "Tên tài khoản" với dấu sao đỏ (*)
- Component: RoundedTextField
- Type: text
- Placeholder: "Nhập tên đăng nhập web portal"

**HLR-3.6**: Trường "Mật khẩu" (REQUIRED):
- Label: "Mật khẩu" với dấu sao đỏ (*)
- Component: RoundedTextField
- Type: password (có thể toggle thành text)
- Icon: Eye/EyeSlash để ẩn/hiện mật khẩu
- Placeholder: "Nhập mật khẩu"

**HLR-3.7**: Checkbox "Phát hành HĐĐT trên màn hình bán hàng":
- Label: "Phát hành HĐĐT trên màn hình bán hàng"
- Component: Checkbox
- Default: true (checked)
- Color when checked: #FB7E00
- Description text dưới checkbox: "Tự động hiển thị form phát hành hoá đơn khi hoàn tất đơn bán hàng"

**HLR-3.8**: Nút hành động ở bottom của Bottom Sheet:
- Nút "Huỷ": 
  - Variant: outlined
  - Color: rgba(0, 0, 0, 0.6)
  - Border color: rgba(0, 0, 0, 0.23)
- Nút "Kết nối":
  - Variant: contained
  - Background color: #FB7E00
  - Loading state khi đang xác thực
  - Loading text: "Đang kết nối..."

**HLR-3.9**: Layout nút hành động:
- Mobile: Stack vertical với gap 12px, full width
- Desktop: Flexbox horizontal, nút "Huỷ" bên trái, nút "Kết nối" bên phải

### HLR-4: Yêu cầu về Bottom Sheet chọn Đơn vị phát hành

**HLR-4.1**: Bottom Sheet có tiêu đề "Chọn đơn vị phát hành"

**HLR-4.2**: Danh sách các đơn vị phát hành:
```typescript
const eInvoiceProviders = [
  {
    code: 'VIETTEL_SINVOICE',
    name: 'Viettel S-Invoice',
    logo: '/providers/viettel-sinvoice.png', // Optional
    description: 'Dịch vụ hoá đơn điện tử của Viettel'
  },
  {
    code: 'VNPT_MINVOICE',
    name: 'M-Invoice',
    logo: '/providers/m-invoice.png', // Optional
    description: 'Dịch vụ hoá đơn điện tử của VNPT'
  },
  {
    code: 'MISA_MEINVOICE',
    name: 'MISA meInvoice',
    logo: '/providers/misa-meinvoice.png', // Optional
    description: 'Dịch vụ hoá đơn điện tử của MISA'
  }
];
```

**HLR-4.3**: Mỗi item trong danh sách hiển thị:
- Logo (nếu có) hoặc icon mặc định
- Tên đơn vị phát hành (font weight 600)
- Mô tả ngắn (font size 14px, color rgba(0,0,0,0.6))
- Radio button để chọn
- Active state: Background color rgba(251, 126, 0, 0.08)

**HLR-4.4**: Khi người dùng chọn một đơn vị:
- Bottom sheet tự động đóng
- Giá trị được auto-fill vào trường "Đơn vị phát hành" ở bottom sheet trước đó
- Hiển thị animation transition mượt mà

### HLR-5: Yêu cầu về xác thực và xử lý lỗi

**HLR-5.1**: Validation trước khi kết nối:
- Kiểm tra tất cả các trường bắt buộc đã được điền
- Kiểm tra mã số thuế khớp với thông tin đã khai báo
- Hiển thị error message dưới trường tương ứng nếu validation fail

**HLR-5.2**: Khi người dùng nhấn "Kết nối":
- Hiển thị loading state trên nút
- Disable tất cả các trường input
- Gọi API xác thực thông tin đăng nhập

**HLR-5.3**: Xử lý kết quả xác thực:

**CASE 1 - Thành công**:
- Lưu thông tin kết nối vào localStorage/state
- Đóng bottom sheet
- Hiển thị badge "Đã kết nối" trên card
- Show snackbar: "Kết nối thành công với [Tên đơn vị]"
- Severity: success

**CASE 2 - Thất bại**:
- Hiển thị error banner ở top của bottom sheet
- Message: "Thông tin đăng nhập không đúng. Vui lòng thử lại."
- Icon: Warning (Outline)
- Background: #FFEBEE
- Color: #C62828
- Keep bottom sheet mở
- Enable lại các trường input

**HLR-5.4**: Các trường bắt buộc phải có dấu sao đỏ (*) sau label

### HLR-6: Yêu cầu về nút "Bắt đầu sử dụng"

**HLR-6.1**: Nút "Bắt đầu sử dụng" luôn hiển thị:
- Desktop: Ở cuối container, margin top 32px
- Mobile: Fixed position ở bottom, trong box có shadow

**HLR-6.2**: Styling của nút:
- Component: PrimaryButton
- Background color: #FB7E00
- Hover: #C96400
- Text: "Bắt đầu sử dụng"
- Height: 56px
- Border radius: 100px
- Box shadow: 0 6px 18px rgba(0,0,0,0.12)

**HLR-6.3**: Khi người dùng nhấn "Bắt đầu sử dụng":
- Hiển thị loading state: "Đang hoàn tất..."
- Lưu toàn bộ cấu hình onboarding vào backend
- Đánh dấu onboarding hoàn tất
- Xóa dữ liệu tạm trong localStorage (onboardingData)
- Show snackbar: "Thiết lập hoàn tất! Chào mừng đến với [Tên doanh nghiệp]"
- Navigate đến ROUTES.HOME (Dashboard)

**HLR-6.4**: Xử lý lỗi khi lưu:
- Show snackbar severity error
- Message: "Có lỗi xảy ra khi lưu thiết lập. Vui lòng thử lại."
- Keep người dùng ở màn hình hiện tại
- Log error để debug

### HLR-7: Yêu cầu về tính năng bỏ qua (Skip)

**HLR-7.1**: Người dùng có thể nhấn "Bắt đầu sử dụng" mà không cần thiết lập kết nối hoá đơn điện tử

**HLR-7.2**: Nếu toggle hoá đơn điện tử đang tắt:
- Không lưu thông tin kết nối
- Chỉ lưu cấu hình từ các bước trước
- Người dùng có thể thiết lập kết nối sau trong Settings

### HLR-8: Yêu cầu về điều hướng và xác nhận

**HLR-8.1**: Khi người dùng nhấn nút Back:
- Nếu có thay đổi chưa lưu (đang trong quá trình thiết lập):
  - Hiển thị ConfirmDialog với:
    - Title: "Xác nhận rời trang"
    - Description: "Thông tin kết nối chưa được lưu. Nếu bạn rời trang, các thay đổi sẽ bị mất. Bạn có chắc muốn thoát?"
    - Cancel text: "Hủy"
    - Confirm text: "Rời đi"
    - Confirm color: error
- Nếu không có thay đổi:
  - Navigate trực tiếp về AccountingSetupScreen

**HLR-8.2**: Nếu confirm rời trang:
- Clear các thông tin kết nối tạm thời
- Navigate về ROUTES.ONBOARDING_ACCOUNTING_SETUP

---

## LOW-LEVEL REQUIREMENTS (LLR)

### LLR-1: Component Structure

```typescript
interface AdvancedSetupScreenProps {}

interface EInvoiceConnection {
  provider: string;
  providerName: string;
  taxCode: string;
  username: string;
  password: string;
  autoIssueOnSale: boolean;
}

interface AdvancedSetupState {
  eInvoiceEnabled: boolean;
  eInvoiceConnection: EInvoiceConnection | null;
  isConnected: boolean;
}
```

### LLR-2: State Management

**LLR-2.1**: Local state:
```typescript
const [eInvoiceEnabled, setEInvoiceEnabled] = useState<boolean>(false);
const [isConnected, setIsConnected] = useState<boolean>(false);
const [showConnectionSheet, setShowConnectionSheet] = useState<boolean>(false);
const [showProviderSheet, setShowProviderSheet] = useState<boolean>(false);
const [isLoading, setIsLoading] = useState<boolean>(false);
const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
const [errorMessage, setErrorMessage] = useState<string>('');
```

**LLR-2.2**: Form state cho kết nối:
```typescript
const [selectedProvider, setSelectedProvider] = useState<string>('');
const [taxCode, setTaxCode] = useState<string>('');
const [username, setUsername] = useState<string>('');
const [password, setPassword] = useState<string>('');
const [showPassword, setShowPassword] = useState<boolean>(false);
const [autoIssueOnSale, setAutoIssueOnSale] = useState<boolean>(true);
```

**LLR-2.3**: Snackbar state:
```typescript
const [snack, setSnack] = useState<{
  open: boolean;
  severity: 'success' | 'error' | 'warning' | 'info';
  message: string;
}>({
  open: false,
  severity: 'success',
  message: '',
});
```

### LLR-3: Data Loading

**LLR-3.1**: Load dữ liệu từ localStorage khi component mount:
```typescript
useEffect(() => {
  const loadOnboardingData = () => {
    setIsDataLoading(true);
    try {
      const onboardingData = localStorage.getItem('onboardingData');
      if (onboardingData) {
        const data = JSON.parse(onboardingData);
        
        // Auto-fill tax code from business identification
        if (data.businessIdentification?.taxCode) {
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
    } catch (error) {
      console.error('Error loading onboarding data:', error);
    } finally {
      setIsDataLoading(false);
    }
  };
  
  loadOnboardingData();
}, []);
```

### LLR-4: Event Handlers

**LLR-4.1**: Handle toggle e-invoice:
```typescript
const handleToggleEInvoice = (checked: boolean) => {
  setEInvoiceEnabled(checked);
  if (checked && !isConnected) {
    setShowConnectionSheet(true);
  } else if (!checked && isConnected) {
    // Show confirm dialog to disconnect
    setShowConfirmDialog(true);
  }
};
```

**LLR-4.2**: Handle connect:
```typescript
const handleConnect = async () => {
  // Validation
  if (!selectedProvider) {
    setErrorMessage('Vui lòng chọn đơn vị phát hành');
    return;
  }
  if (!taxCode) {
    setErrorMessage('Vui lòng nhập mã số thuế');
    return;
  }
  if (!username) {
    setErrorMessage('Vui lòng nhập tên tài khoản');
    return;
  }
  if (!password) {
    setErrorMessage('Vui lòng nhập mật khẩu');
    return;
  }
  
  // Verify tax code matches previous entry
  const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
  if (onboardingData.businessIdentification?.taxCode !== taxCode) {
    setErrorMessage('Mã số thuế không khớp với thông tin đã khai báo');
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // On success
    setIsConnected(true);
    setShowConnectionSheet(false);
    
    const providerName = eInvoiceProviders.find(p => p.code === selectedProvider)?.name;
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
```

**LLR-4.3**: Handle submit (Complete onboarding):
```typescript
const handleSubmit = async () => {
  setIsLoading(true);
  
  try {
    const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
    
    // Prepare advanced setup payload
    let advancedSetupPayload: any = {
      eInvoiceEnabled,
    };
    
    if (eInvoiceEnabled && isConnected) {
      advancedSetupPayload.eInvoiceConnection = {
        provider: selectedProvider,
        providerName: eInvoiceProviders.find(p => p.code === selectedProvider)?.name,
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
    
    // TODO: Call API to complete onboarding
    // const currentTenant = JSON.parse(localStorage.getItem('currentTenant') || '{}');
    // await apiService.completeOnboarding(currentTenant.id, updatedData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Clean up localStorage
    localStorage.removeItem('onboardingData');
    
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
    setIsLoading(false);
  }
};
```

### LLR-5: E-Invoice Providers Data

```typescript
const eInvoiceProviders = [
  {
    code: 'VIETTEL_SINVOICE',
    name: 'Viettel S-Invoice',
    description: 'Dịch vụ hoá đơn điện tử của Viettel',
  },
  {
    code: 'VNPT_MINVOICE',
    name: 'M-Invoice',
    description: 'Dịch vụ hoá đơn điện tử của VNPT',
  },
  {
    code: 'MISA_MEINVOICE',
    name: 'MISA meInvoice',
    description: 'Dịch vụ hoá đơn điện tử của MISA',
  },
];
```

### LLR-6: Validation Functions

**LLR-6.1**: Validate form:
```typescript
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
  
  // Verify tax code
  const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
  if (onboardingData.businessIdentification?.taxCode !== taxCode) {
    setErrorMessage('Mã số thuế không khớp với thông tin đã khai báo');
    return false;
  }
  
  return true;
};
```

### LLR-7: Mobile Responsive Layout

**LLR-7.1**: Container responsive styles:
```typescript
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
  }}
>
```

**LLR-7.2**: Mobile sticky footer:
```typescript
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
```

### LLR-8: Bottom Sheet Components

**LLR-8.1**: Connection Bottom Sheet props:
```typescript
<Drawer
  anchor="bottom"
  open={showConnectionSheet}
  onClose={() => setShowConnectionSheet(false)}
  PaperProps={{
    sx: {
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: '90vh',
      p: 3,
    },
  }}
>
```

**LLR-8.2**: Provider Selection Bottom Sheet:
```typescript
<Drawer
  anchor="bottom"
  open={showProviderSheet}
  onClose={() => setShowProviderSheet(false)}
  PaperProps={{
    sx: {
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: '60vh',
      p: 3,
    },
  }}
>
```

---

## API SPECIFICATIONS

### API-1: Verify E-Invoice Connection

**Endpoint**: `POST /api/v1/integrations/e-invoice/verify`

**Request Body**:
```typescript
{
  provider: string; // 'VIETTEL_SINVOICE' | 'VNPT_MINVOICE' | 'MISA_MEINVOICE'
  taxCode: string;
  username: string;
  password: string;
}
```

**Response Success (200)**:
```typescript
{
  success: true;
  data: {
    verified: boolean;
    providerInfo: {
      name: string;
      taxCode: string;
      businessName: string;
    };
  };
}
```

**Response Error (400/401)**:
```typescript
{
  success: false;
  error: {
    code: string; // 'INVALID_CREDENTIALS' | 'TAX_CODE_MISMATCH'
    message: string;
  };
}
```

### API-2: Complete Onboarding

**Endpoint**: `POST /api/v1/tenants/{tenantId}/onboarding/complete`

**Request Body**:
```typescript
{
  businessIdentification: { ... };
  businessSector: { ... };
  accountingSetup: { ... };
  advancedSetup: {
    eInvoiceEnabled: boolean;
    eInvoiceConnection?: {
      provider: string;
      providerName: string;
      taxCode: string;
      username: string;
      password: string; // encrypted
      autoIssueOnSale: boolean;
      connectedAt: string; // ISO date
    };
  };
  completedAt: string; // ISO date
}
```

**Response Success (200)**:
```typescript
{
  success: true;
  data: {
    tenantId: string;
    onboardingCompleted: boolean;
    redirectUrl: string; // Dashboard URL
  };
}
```

---

## UI/UX SPECIFICATIONS

### Typography

| Element | Font Family | Size | Weight | Line Height | Color |
|---------|-------------|------|--------|-------------|-------|
| Screen Title | Bricolage Grotesque | 28px | 600 | 28px | #BA5C00 |
| Description | Default | 16px | 400 | 24px | rgba(0,0,0,0.8) |
| Section Title | Default | 18px | 600 | 24px | rgba(0,0,0,0.87) |
| Card Title | Default | 16px | 600 | 24px | rgba(0,0,0,0.87) |
| Card Description | Default | 14px | 400 | 20px | rgba(0,0,0,0.6) |
| Label | Default | 16px | 600 | 24px | rgba(0,0,0,0.87) |
| Input Text | Default | 16px | 400 | 24px | rgba(0,0,0,0.87) |
| Helper Text | Default | 12px | 400 | 16px | rgba(0,0,0,0.6) |
| Error Text | Default | 12px | 400 | 16px | #D32F2F |

### Colors

| Element | Color | Usage |
|---------|-------|-------|
| Primary | #FB7E00 | Buttons, toggles, active states |
| Primary Hover | #C96400 | Button hover states |
| Success | #2E7D32 | Connected badge, success messages |
| Success Light | #E8F5E9 | Connected badge background |
| Error | #D32F2F | Error messages, destructive actions |
| Error Light | #FFEBEE | Error banner background |
| Text Primary | rgba(0,0,0,0.87) | Main text |
| Text Secondary | rgba(0,0,0,0.6) | Descriptions, helper text |
| Border | rgba(0,0,0,0.12) | Card borders, dividers |
| Background | #F5EBE0 | Screen background |
| Surface | #FFFFFF | Cards, bottom sheets |

### Spacing

- Container padding: 16px (mobile), 48px (desktop)
- Section gap: 24px
- Field gap: 16px
- Button gap: 12px
- Card padding: 16px
- Bottom sheet padding: 24px

### Icons

- Document (Outline) - E-Invoice icon
- Calendar (Outline) - Date picker
- Eye/EyeSlash (Outline) - Password visibility
- ArrowDown2 (Outline) - Dropdown indicator
- TickCircle (Bold) - Success indicator
- Warning (Outline) - Error/Warning indicator
- ArrowLeft (Outline) - Back button

---

## TESTING REQUIREMENTS

### Test Cases

**TC-1**: Verify screen loads with correct initial state
- Toggle is OFF
- "Bắt đầu sử dụng" button is visible
- No connection details shown

**TC-2**: Toggle E-Invoice ON opens connection bottom sheet
- Bottom sheet opens with all required fields
- Tax code is auto-filled from previous step
- Auto-issue checkbox is checked by default

**TC-3**: Select provider from list
- Provider sheet opens when clicking provider field
- Selected provider is displayed in the field
- Provider sheet closes after selection

**TC-4**: Validate required fields
- Error shown if provider not selected
- Error shown if tax code empty
- Error shown if username empty
- Error shown if password empty

**TC-5**: Verify tax code mismatch
- Error shown if tax code doesn't match business identification

**TC-6**: Successful connection
- Loading state shown during verification
- Success message displayed
- Connection badge shown on card
- Bottom sheet closes

**TC-7**: Failed connection
- Error banner shown in bottom sheet
- Fields remain editable
- User can retry

**TC-8**: Skip E-Invoice setup
- User can complete onboarding without E-Invoice
- "Bắt đầu sử dụng" saves all other settings

**TC-9**: Navigate back with unsaved changes
- Confirm dialog shown
- Changes discarded if confirmed

**TC-10**: Complete onboarding
- All settings saved to backend
- User redirected to Dashboard
- localStorage cleaned up

---

## ACCESSIBILITY

- All interactive elements must be keyboard accessible
- Form fields must have proper labels and ARIA attributes
- Error messages must be announced by screen readers
- Focus management in bottom sheets
- Color contrast ratio minimum 4.5:1 for text
- Touch targets minimum 44x44px on mobile

---

## PERFORMANCE

- Screen should load within 500ms
- Form validation should be instant (< 100ms)
- API calls should have 30s timeout
- Loading states for all async operations
- Optimistic UI updates where appropriate

---

## SECURITY

- Password field must mask input by default
- Credentials must be encrypted before API call
- No sensitive data in console logs
- Token-based authentication for API calls
- Input sanitization for all text fields

---

## FUTURE ENHANCEMENTS

1. Support for more e-invoice providers
2. Test connection before saving
3. Sync invoice templates from provider
4. Schedule automatic invoice issuance
5. Notification settings for invoice reminders
6. Multi-provider support (connect multiple providers)
7. Import existing invoices from provider
8. Invoice template customization

---

## DEPENDENCIES

### npm Packages
- @mui/material (UI components)
- react-router-dom (Navigation)
- React (Core framework)

### Internal Dependencies
- PrimaryButton component
- OnboardingHeader component  
- RoundedTextField component
- ConfirmDialog component
- Icon component
- ROUTES constants
- Theme configuration

### Assets
- Welcome background image
- Provider logos (optional)

---

## FILE STRUCTURE

```
web-app/src/
├── pages/
│   └── onboarding/
│       └── AdvancedSetupScreen.tsx          # Main component
├── components/
│   └── EInvoiceConnectionSheet.tsx          # Bottom sheet component (optional)
├── data/
│   └── eInvoiceProviders.ts                 # Provider list
└── types/
    └── onboarding.ts                        # Add AdvancedSetup types
```

---

## NOTES

- This is the final step in the onboarding flow
- Users can skip e-invoice setup and configure it later in Settings
- All onboarding data should be persisted to backend before completion
- Consider adding a "Setup Later" button for faster onboarding
- Provide clear documentation links for each provider's setup process
- Consider adding video tutorials for connection setup
