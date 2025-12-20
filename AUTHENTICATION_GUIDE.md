# Hướng Dẫn Xác Thực (Authentication Guide)

## Tổng Quan

Hệ thống hỗ trợ 3 phương thức đăng nhập:

1. **Google OAuth 2.0** - Đăng nhập bằng tài khoản Google
2. **Email & Password** - Đăng ký và đăng nhập bằng email/mật khẩu
3. **Demo Mode** - Đăng nhập demo cho mục đích test (không cần Google OAuth)

## Backend API Endpoints

### 1. Đăng Ký (Register)
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "John",      // optional
  "lastName": "Doe"         // optional
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "employee",
    "provider": "local"
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### 2. Đăng Nhập (Login)
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}

Response:
{
  "user": { ... },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### 3. Đăng Nhập Google (Google OAuth)
```
POST /api/v1/auth/google
Content-Type: application/json

{
  "idToken": "google-id-token"
}

Response:
{
  "success": true,
  "isNewUser": false,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token",
      "expiresIn": 3600
    },
    "tenants": [ ... ]  // Only for existing users
  }
}
```

### 4. Refresh Token
```
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token"
}
```

### 5. Get Current User
```
GET /api/v1/auth/me
Authorization: Bearer {access-token}
```

## Frontend Pages

### 1. Login Demo Screen (`/login-demo`)
- Màn hình chính khi truy cập hệ thống
- Có 3 lựa chọn:
  - **Đăng nhập Demo** - Không cần thông tin đăng nhập thật
  - **Google Login** - Đăng nhập bằng Google
  - **Email Login/Signup** - Chuyển đến trang login hoặc signup

### 2. Signup Screen (`/signup`)
- Form đăng ký tài khoản mới
- Các trường:
  - Email (bắt buộc)
  - Password (bắt buộc, tối thiểu 8 ký tự)
  - Confirm Password (bắt buộc)
  - First Name (tùy chọn)
  - Last Name (tùy chọn)
- Hỗ trợ đăng ký bằng Google OAuth
- Link chuyển đến trang Login

### 3. Login Screen (`/login`)
- Form đăng nhập
- Các trường:
  - Email (bắt buộc)
  - Password (bắt buộc)
- Hỗ trợ đăng nhập bằng Google OAuth
- Link chuyển đến trang Signup

## Luồng Người Dùng (User Flow)

### Đăng Ký Mới (New User)
1. User truy cập `/signup`
2. Điền thông tin và submit
3. Backend tạo user mới với:
   - Password được hash bằng bcrypt
   - Role mặc định: `employee`
   - Provider: `local`
4. Tự động đăng nhập và chuyển đến `/processing`
5. Tạo tenant đầu tiên

### Đăng Nhập (Existing User)
1. User truy cập `/login`
2. Nhập email và password
3. Backend xác thực credentials
4. Frontend nhận tokens và user info
5. Fetch danh sách tenants của user:
   - **Nếu có 1 tenant**: Tự động select và đi đến dashboard
   - **Nếu có nhiều tenants**: Hiển thị màn hình chọn tenant
   - **Nếu không có tenant**: Chuyển đến `/processing` để tạo mới

### Google OAuth Flow
1. User click nút Google Login
2. Google OAuth popup mở ra
3. User chọn tài khoản Google
4. Frontend nhận `idToken` từ Google
5. Gửi `idToken` đến backend
6. Backend verify token và:
   - Nếu user mới: Tạo user và chuyển đến `/processing`
   - Nếu user cũ: Trả về tenants và chuyển đến dashboard hoặc tenant selection

## Bảo Mật (Security)

### Password Requirements
- Tối thiểu 8 ký tự
- Được hash bằng bcrypt (salt rounds: 10)
- Không lưu password dạng plain text

### JWT Tokens
- **Access Token**: Expires in 1 hour
- **Refresh Token**: Expires in 30 days
- Refresh token được hash và lưu trong database
- Token validation trên mọi protected routes

### CORS Configuration
- Frontend: `http://localhost:5173`
- Auth Service: `http://localhost:3001`
- Tenant Service: `http://localhost:3002`

## Testing

### Test Registration
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

## Cấu Hình Environment

### Auth Service (.env)
```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=auth_db
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
```

### Web App (.env)
```env
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_TENANT_SERVICE_URL=http://localhost:3002
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Troubleshooting

### Lỗi "Invalid credentials"
- Kiểm tra email/password có đúng không
- Đảm bảo account đã được tạo
- Check database để verify user tồn tại

### Google OAuth không hoạt động
- Verify GOOGLE_CLIENT_ID trong .env
- Kiểm tra Google Console để đảm bảo redirect URIs được cấu hình
- Check browser console để xem lỗi từ Google

### Token expired
- Sử dụng refresh token để lấy access token mới
- Implement auto-refresh logic trong frontend

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Facebook, Microsoft, GitHub)
- [ ] Remember me functionality
- [ ] Account lockout after failed attempts
- [ ] Password strength meter
- [ ] OAuth for mobile apps
