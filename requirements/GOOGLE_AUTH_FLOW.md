# Yêu Cầu Tính Năng: Đăng Nhập/Đăng Ký với Google Account

## 1. Tổng Quan

Tài liệu này mô tả chi tiết yêu cầu cho tính năng đăng nhập/đăng ký bằng Google Account cho ứng dụng SaaS ERP Accounting.

## 2. Thông Tin Google OAuth

- **Client ID**: `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
- **Client Secret**: `YOUR_GOOGLE_CLIENT_SECRET`

## 3. Luồng Người Dùng (User Flow)

### 3.1. Lần Đầu Mở App

```
[App Launch] 
    ↓
[Splash Screen] (2-3 giây)
    ↓
[Login/Signup Screen]
```

### 3.2. Màn Hình Đăng Nhập/Đăng Ký

**Thành phần UI:**
- Title: "Khởi đầu cùng Symper"
- Button: "Đăng nhập với Google" (với icon Google)

### 3.3. Luồng Sau Khi Đăng Nhập Google Thành Công

```
[Google Login Success]
    ↓
[Check User Status]
    ↓
    ├─→ [New User]
    │       ↓
    │   [Show Processing Screen]
    │       ↓
    │   [Create Tenant]
    │       ↓
    │   [Navigate to Home Screen]
    │
    └─→ [Existing User]
            ↓
        [Check Tenant Count]
            ↓
            ├─→ [Single Tenant]
            │       ↓
            │   [Auto Login to Tenant]
            │       ↓
            │   [Navigate to Home Screen]
            │
            └─→ [Multiple Tenants]
                    ↓
                [Show Tenant Selection Screen]
                    ↓
                [User Selects Tenant]
                    ↓
                [Login to Selected Tenant]
                    ↓
                [Navigate to Home Screen]
```

## 4. Chi Tiết Các Màn Hình

### 4.1. Splash Screen
**Mục đích:** Hiển thị logo/branding trong khi app khởi động

**Yêu cầu:**
- Hiển thị logo Symper
- Thời gian hiển thị: 2-3 giây
- Tự động chuyển sang màn hình đăng nhập/đăng ký
- Có thể thêm animation fade in/out

### 4.2. Login/Signup Screen
**Mục đích:** Cho phép user đăng nhập bằng Google

**Layout:**
```
┌─────────────────────────────┐
│                             │
│      [Logo/Illustration]    │
│                             │
│   Khởi đầu cùng Symper      │
│                             │
│                             │
│  ┌───────────────────────┐  │
│  │  [G] Đăng nhập với    │  │
│  │      Google           │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

**Yêu cầu:**
- Title: "Khởi đầu cùng Symper" (Typography variant h4 cho mobile, h3 cho desktop)
- Subtitle (optional): Mô tả ngắn về app
- Google Login Button:
  - MUI Button component với startIcon (Google icon)
  - Variant: outlined hoặc contained
  - Size: large cho dễ tap trên mobile
  - Text: "Đăng nhập với Google"
  - Sử dụng màu sắc theo Google brand guidelines (#4285F4)
  - Full width trên mobile, max-width 400px trên desktop
  - Khi click: Mở Google OAuth flow
- Responsive:
  MUI CircularProgress centered
- Typography: "Đang thiết lập tài khoản của bạn..." (variant h6)
- Optional: MUI Stepper component với các steps:
  - "Tạo không gian làm việc..."
  - "Cấu hình dữ liệu..."
  - "Hoàn tất..."
- MUI LinearProgress ở top của screen
- Backdrop để prevent user interaction
- Centered layout với animationn thị trạng thái trong khi tạo tenant cho user mới

**Yêu cầu:**
- Loading indicator (spinner/progress)
- Text: "Đang thiết lập tài khoản của bạn..."
- Optional: Progress steps
  - "Tạo không gian làm việc..."
  - "Cấu hình dữ liệu..."
  - "Hoàn tất..."
- Không cho phép user back/cancel trong quá trình này

### 4.4. Tenant Selection Screen
**Mục đích:** Cho phép user chọn tenant khi họ thuộc nhiều tenant

**Layout:**
```
┌─────────────────────────────┐
│  Chọn Không Gian Làm Việc   │
│                             │
│  ┌───────────────────────┐  │
│  │  Công ty ABC          │  │
│  │  Owner                │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │  Công ty XYZ          │  │
│  │  Member               │  │
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
``MUI Typography variant h5: "Chọn Không Gian Làm Việc"
- MUI List hoặc Grid của Card components
- Mỗi tenant item (MUI Card):
  - CardActionArea cho clickable area
  - Avatar với tenant icon/first letter
  - Typography variant h6: Tên tenant
  - Chip component: Role badge (Owner/Admin/Member) với màu khác nhau
  - Ripple effect khi click
  - Hover elevation increase
- Responsive:
  - Mobile: List view (full width)
  - Tablet/Desktop: Grid view (2-3 columns)
- Empty state: Nếu không có tenant nào
- Skeleton loading khi đang fetch data
- Khi click: Show loading state → Login vào tenant → N
  - Role của user trong tenant (Owner/Admin/Member)
  - Optional: Icon/avatar của tenant
- Khi click vào tenant: Login vào tenant đó và navigate to home

### 4.5. Home Screen
**Mục đích:** Màn hình chính của app (tạm thời blank)

**Yêu cầu:**
- Màn hình trắng/blank
- Optional: Placeholder text "Home Screen - Coming Soon"
- Có thể thêm basic navigation structure (drawer/tab bar)

## 5. Yêu Cầu Backend API

### 5.1. Auth Service APIs

#### 5.1.1. POST /auth/google/login
**Mục đích:** Xác thực Google token và đăng nhập/đăng ký user

**Request:**
```json
{
  "idToken": "string",
  "accessToken": "string"
}
```

**Response (New User):**
```json
{
  "isNewUser": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://..."
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

**Response (Existing User):**
```json
{
  "isNewUser": false,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://..."
  },
  "tenants": [
    {
      "id": "uuid",
      "name": "Công ty ABC",
      "role": "owner"
    }
  ],
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### 5.1.2. GET /auth/me
**Mục đích:** Lấy thông tin user hiện tại và danh sách tenant

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  },
  "tenants": [
    {
      "id": "uuid",
      "name": "Tenant Name",
      "role": "owner"
    }
  ]
}
```

### 5.2. Tenant Service APIs

#### 5.2.1. POST /tenants
**Mục đích:** Tạo tenant mới cho user

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "string",
  "userId": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "string",
  "ownerId": "uuid",
  "createdAt": "timestamp"
}
```

#### 5.2.2. POST /tenants/:tenantId/login
**Mục đích:** Login vào một tenant cụ thể

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "tenantAccessToken": "jwt_token_with_tenant_context",
  "tenant": {
    "id": "uuid",
    "name": "string"
  }
}
```

## 6. Yêu Cầu Kỹ Thuật

### 6.1. Frontend App
- **Framework:** React 18+ với TypeScript
- **UI Library:** Material-UI (MUI) v5+
- **Design System:** Material Design 3
- **Responsive Design:** Hỗ trợ đầy đủ Mobile, Tablet, Desktop
- **App Type:** Progressive Web App (PWA) - có thể cài đặt như native app
- **State Management:** Redux Toolkit hoặc Zustand
- **Routing:** React Router v6+
- **Google Sign-In Library:** `@react-oauth/google`
- **HTTP Client:** Axios
- **Form Handling:** React Hook Form + Yup validation

### 6.1.1. Responsive Breakpoints
- **Mobile:** < 600px
- **Tablet:** 600px - 1024px  
- **Desktop:** > 1024px

### 6.1.2. Material Design Components
- Buttons: MUI Button với variants (contained, outlined, text)
- Typography: Material Design typography scale
- Colors: Material Design color palette (primary, secondary, error, etc.)
- Elevation & Shadows: Material Design shadow system
- Icons: Material Icons hoặc Material Symbols
- Loading: MUI CircularProgress, LinearProgress, Skeleton

### 6.1.3. Modern UI/UX Features
- Smooth transitions và animations
- Dark mode support (optional cho phase 1)
- Touch-friendly controls (minimum 48x48px tap targets)
- Swipe gestures cho mobile
- Keyboard shortcuts cho desktop
- Loading states và skeleton screens
- Error boundaries và graceful error handling

### 6.2. Backend Services

#### Auth Service Updates:
- Implement Google Strategy sử dụng Passport.js
- Xử lý Google OAuth callback
- Tạo/cập nhật user record
- Generate JWT tokens
- Lưu refresh token

#### Tenant Service Updates:
- API tạo tenant mới
- API lấy danh sách tenant của user
- API login vào tenant cụ thể
- Tạo tenant context trong JWT

### 6.3. Database Schema Updates

#### Users Table:
```sql
- id (uuid)
- email (unique)
- name
- picture
- googleId (unique)
- createdAt
- updatedAt
```

#### Tenants Table:
```sql
- id (uuid)
- name
- ownerId (foreign key to users)
- createdAt
- updatedAt
```

#### TenantMembers Table:
```sql
- id (uuid)
- tenantId (foreign key)
- userId (foreign key)
- role (enum: owner, admin, member)
- createdAt
- unique(tenantId, userId)
```

## 7. Error Handling

### 7.1. Google Login Errors
- Network error: Hiển thị "Không thể kết nối. Vui lòng thử lại."
- User cancels: Quay lại màn hình đăng nhập
- Invalid token: Hiển thị "Đăng nhập thất bại. Vui lòng thử lại."

### 7.2. Tenant Creation Errors
- API error: Hiển thị "Không thể tạo tài khoản. Vui lòng thử lại."
- Timeout: Hiển thị "Quá trình tạo tài khoản đang mất nhiều thời gian. Vui lòng kiểm tra lại sau."

## 8. Security Requirements

1. Validate Google ID token trên backend
2. Sử dụng HTTPS cho tất cả API calls
3. Store tokens securely (Keychain/Keystore)
4. Implement token refresh mechanism
5. Validate tenant access permissions

## 9. Performance Requirements

1. Splash screen: Load trong < 1 giây
2. Google login: Response trong < 3 giây (network dependent)
3. Tenant creation: Complete trong < 10 giây
4. Tenant selection: Load danh sách trong < 2 giây

## 10. Testing Requirements

### 10.1. Unit Tests
- Google token validation
- User creation logic
- Tenant creation logic
- JWT generation

### 10.2. Integration Tests
- Complete login flow (new user)
- Complete login flow (existing user, single tenant)
- Complete login flow (existing user, multiple tenants)
- Error scenarios

### 10.3. E2E Tests
- First time Frontend App Setup
1. Create React + TypeScript + Vite project
2. Setup MUI library và theme customization
3. Setup Google OAuth library
4. Setup React Router
5. Setup Redux Toolkit / Zustand
6. Setup Axios với interceptors
7. Setup PWA configurationon Phases

### Phase 1: Backend Setup
1. Update auth-service với Google OAuth strategy
2. Implement APIs trong auth-service
3. Update tenant-service APIs
4. Database migrations

### Phase 2: Mobile App Setup
1. Create React Native project structure
2. Setup Google Sign-In library
3. Setup navigation structure
4. Setup API client

### Phase 3: Screen Implementation
1. Splash screen
2. Login/Signup screen
3. Processing screen
4. Tenant selection screen
5. Home screen

### Phase 4: Integration & Testing
1. Connect screens với backend APIs
2. Implement error handling
3. Testing flows
4. Bug fixes

### Phase 5: Polish
1. UI/UX refinements
2. Loading states
3. Animations
4. Performance optimization
