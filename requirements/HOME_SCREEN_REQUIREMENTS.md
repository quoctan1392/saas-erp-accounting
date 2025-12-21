# YÊU CẦU CHỨC NĂNG VÀ GIAO DIỆN - MÀN HÌNH HOME

## 1. TỔNG QUAN (OVERVIEW)

### 1.1. Thông tin cơ bản
- **Tên màn hình**: Home
- **Route**: `/home`
- **Vai trò**: Màn hình chính sau khi đăng nhập
- **Mục tiêu**: Cung cấp cái nhìn tổng quan nhanh về tình hình kinh doanh, doanh thu, dòng tiền và các lối tắt đến các tác vụ quan trọng

### 1.2. Đối tượng sử dụng
- Chủ doanh nghiệp
- Quản lý cửa hàng / Chi nhánh
- Nhân viên kế toán
- Nhân viên bán hàng

---

## 2. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### 2.1. Header & Định danh người dùng

#### 2.1.1. Lời chào cá nhân hóa
- **Hiển thị**: `Xin chào, [Tên người dùng]`
- **Nguồn dữ liệu**: Lấy từ thông tin user đã đăng nhập (User Profile)
- **Logic hiển thị tên**: 
  - Ưu tiên hiển thị `displayName` hoặc `fullName`
  - Nếu không có, hiển thị `firstName` hoặc `email`
- **Style**: sử dụng style về màu sắc và font chữ như title của các màn onboarding

#### 2.1.2. Badge thông tin goi sản phẩm của user
- **Vị trí**: Bên cạnh tên người dùng
- **Các loại badge**:
  - default hiện tại hãy để "Miễn phí"
- **iCon**: lấy từ web-app\src\assets\badget_icon_free_tier.png 
- **Styling**: Pill-shaped badge với nền nhẹ, viền mỏng

#### 2.1.3. Icon thông báo
- **Vị trí**: Góc phải trên cùng của header
- **Icon**: Bell/Chuông
- **Badge số**: Hiển thị số lượng thông báo chưa đọc
- **Hành động**: Click vào mở màn hình Notifications
- **Loại thông báo**:
  - Biến động số dư
  - Đơn hàng mới
  - Cảnh báo tồn kho
  - Nhắc nhở công nợ
  - Thông báo hệ thống
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng về noti
---
#### 2.1.4. Background img
Hiển thị img tuy theo giờ trong ngày
- Ban ngày dùng img: web-app\src\assets\Header_day.png
- Ban đêm dùng img: web-app\src\assets\Header_night.png
#### 2.1.5. component hóa
- Tách thành 1 component riêng để sau này tái sử dụng, có thể thay đổi được title thông tin tùy theo từng màn hình

### 2.2. Tìm kiếm và Quét mã

#### 2.2.1. Thanh tìm kiếm
- **Placeholder**: `"Nhập sản phẩm cần tìm..."`
- **Chức năng tìm kiếm**:
  - Tìm sản phẩm theo tên, mã SKU
  - Tìm đơn hàng theo số đơn
  - Tìm khách hàng theo tên, số điện thoại
  - Tìm nhà cung cấp
- **UX**:
  - Hiển thị kết quả gợi ý real-time khi gõ (debounce 300ms)
  - Phân loại kết quả: Sản phẩm, Đơn hàng, Khách hàng
  - Click vào kết quả điều hướng đến trang chi tiết tương ứng
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng

#### 2.2.2. Icon quét mã QR/Barcode
- **Vị trí**: Bên phải thanh tìm kiếm
- **Icon**: Camera/Scanner icon màu cam (primary color)
- **Hành động**: Mở camera để quét mã
- **Chức năng**:
  - Quét Barcode sản phẩm → Mở trang chi tiết sản phẩm
  - Quét QR code đơn hàng → Mở chi tiết đơn hàng
  - Quét QR code thanh toán → Mở giao diện thanh toán
- **Permission**: Yêu cầu quyền truy cập camera
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng
---

### 2.3. Banner Báo cáo xu hướng (Insight Banner)

#### 2.3.1. Thiết kế và nội dung
- **Background**: Gradient từ xanh dương (#4F46E5) sang xanh lá/xanh lơ (#22D3EE)
- **Icon**: Lịch/Calendar icon
- **Tiêu đề**: Hiển thị insight động
  - Ví dụ: `"Doanh thu bán hàng tăng 5.9% trong 01 tuần"`
  - Ví dụ: `"Lợi nhuận giảm 2.3% so với tháng trước"`
- **Nút hành động**: `"Xem báo cáo →"`
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng

#### 2.3.2. Logic tính toán insight
- **Dữ liệu so sánh**:
  - Tuần này vs tuần trước
  - Tháng này vs tháng trước
  - Hoặc theo kỳ được chọn trong bộ lọc
- **Các chỉ số có thể hiển thị**:
  - Doanh thu bán hàng
  - Lợi nhuận
  - Số đơn hàng
  - Số khách hàng mới
- **Tự động rotation**: Xoay vòng hiển thị các insight khác nhau mỗi lần load (hoặc mỗi 10 giây)
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng

#### 2.3.3. Hành động
- **Click vào banner**: Điều hướng đến màn hình Báo cáo (Reports)
- **Deep link**: Mở trang báo cáo với bộ lọc tương ứng đã được set sẵn
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng

---

### 2.4. Bộ lọc thời gian (Time Filter)
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng

#### 2.4.1. Giao diện
- **Kiểu hiển thị**: Selector với mũi tên trái/phải
- **Giá trị mặc định**: `"Tháng này"`
- **Vị trí**: Giữa màn hình, phía trên các thẻ tài chính

#### 2.4.2. Các lựa chọn thời gian
- **Hôm nay**: Từ 00:00 đến 23:59 ngày hiện tại
- **Tuần này**: Từ thứ 2 đến chủ nhật
- **Tháng này**: Từ ngày 1 đến cuối tháng hiện tại
- **Tháng trước**: Từ ngày 1 đến cuối tháng trước
- **Quý này**: Từ ngày đầu đến cuối quý hiện tại
- **Năm này**: Từ 1/1 đến 31/12 năm hiện tại
- **Tùy chỉnh**: Cho phép chọn khoảng thời gian tùy ý

#### 2.4.3. Hành động
- **Thay đổi bộ lọc**: Tự động cập nhật các chỉ số tài chính bên dưới
- **API call**: Gọi lại API để lấy dữ liệu theo khoảng thời gian mới
- **Loading state**: Hiển thị skeleton loader khi đang tải dữ liệu

---

### 2.5. Chỉ số tài chính (Financial Cards)
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng

#### 2.5.1. Thẻ "Tổng đã thu"
- **Icon**: Dollar/Money icon với vòng tròn
- **Label**: `"Tổng đã thu"`
- **Giá trị chính**: 
  - Format: `700.24tr` (cho số tiền 700,240,000 VNĐ)
  - Font size lớn, màu xanh lá (#28A745)
  - Font-weight: Bold (700)
- **Chỉ số thay đổi**:
  - Format: `+2.3% so với tháng trước`
  - Màu xanh lá, background xanh nhạt
  - Icon mũi tên lên nếu tăng
- **Nguồn dữ liệu**:
  ```
  GET /api/analytics/revenue-collected?startDate={}&endDate={}
  ```

#### 2.5.2. Thẻ "Tổng đã chi"
- **Icon**: Dollar/Money icon với vòng tròn
- **Label**: `"Tổng đã chi"`
- **Giá trị chính**: 
  - Format: `235.34tr` (cho số tiền 235,340,000 VNĐ)
  - Font size lớn, màu đỏ (#DC3545)
  - Font-weight: Bold (700)
- **Chỉ số thay đổi**:
  - Format: `-5.3% so với tháng trước`
  - Màu đỏ, background đỏ nhạt
  - Icon mũi tên xuống nếu giảm
- **Nguồn dữ liệu**:....
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng

---

### 2.6. Truy cập nhanh (Quick Access)
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng
#### 2.6.1. Bố cục
- **Tiêu đề section**: `"Truy cập nhanh"`
- **Layout**: Grid 4 cột (hoặc 4 items ngang)
- **Spacing**: Khoảng cách đều giữa các item

#### 2.6.2. Các tác vụ nhanh

##### A. Bán hàng
- **Icon**: Shopping cart / Giỏ hàng (màu xanh dương)
- **Label**: `"Bán hàng"`
- **Hành động**: Điều hướng đến `/sales/new` hoặc mở modal tạo đơn bán
- **Permission**: `sales.create`

##### B. Mua hàng
- **Icon**: Shopping bag / Túi mua sắm (màu tím)
- **Label**: `"Mua hàng"`
- **Hành động**: Điều hướng đến `/purchases/new` hoặc mở modal tạo đơn mua
- **Permission**: `purchases.create`

##### C. Thu tiền
- **Icon**: Money receive / Đồng tiền với mũi tên vào (màu xanh lá)
- **Label**: `"Thu tiền"`
- **Hành động**: Điều hướng đến `/receipts/new` hoặc danh sách phiếu thu
- **Permission**: `receipts.create`

##### D. Chi tiền
- **Icon**: Money send / Đồng tiền với mũi tên ra (màu cam)
- **Label**: `"Chi tiền"`
- **Hành động**: Điều hướng đến `/payments/new` hoặc danh sách phiếu chi
- **Permission**: `payments.create`

#### 2.6.3. Responsive behavior
- **Mobile**: Hiển thị dạng grid 4 cột
- **Tablet**: Hiển thị dạng grid 4 cột hoặc 2 hàng
- **Desktop**: Có thể mở rộng thêm tác vụ nhanh khác

---

### 2.7. Lời nhắc (Reminders)
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng
#### 2.7.1. Header section
- **Tiêu đề**: `"Lời nhắc hôm nay (2)"`
  - Số trong ngoặc là số lượng lời nhắc đang active
- **Nút "Xem tất cả"**: 
  - Vị trí: Bên phải tiêu đề
  - Màu chữ: Primary color (cam)
  - Hành động: Điều hướng đến `/reminders` hoặc `/tasks`

#### 2.7.2. Loại lời nhắc
- **Công nợ quá hạn**: Khách hàng/nhà cung cấp chưa thanh toán
- **Tồn kho thấp**: Sản phẩm sắp hết hàng
- **Đơn hàng chờ xử lý**: Đơn hàng mới cần xác nhận
- **Hợp đồng sắp hết hạn**: Nhắc nhở gia hạn
- **Lịch hẹn**: Cuộc họp, gặp khách hàng
- **Báo cáo định kỳ**: Nhắc nộp báo cáo tháng/quý

#### 2.7.3. Hiển thị preview (nếu có)
- Hiển thị 2-3 lời nhắc gần nhất
- Mỗi item gồm:
  - Icon tương ứng loại lời nhắc
  - Nội dung ngắn gọn
  - Thời gian (ví dụ: "2 giờ trước", "Hôm nay 14:00")
- Click vào từng item mở chi tiết task/reminder

#### 2.7.4. Nguồn dữ liệu
....

### 2.8. Thanh điều hướng dưới (Bottom Navigation)

#### 2.8.1. Cấu trúc 5 tab chính

##### Tab 1: Tổng quan (Home) - **Active State**
- **Icon**: Home / Nhà
- **Label**: `"Tổng quan"`
- **Route**: `/dashboard` hoặc `/home`
- **Active state**: Icon và text màu cam (primary), có indicator bar ở trên

##### Tab 2: Đơn hàng
- **Icon**: Document / Giấy tờ
- **Label**: `"Phiếu"`
- **Route**: `/transactions`
- **Chức năng**: Xem danh sách tất cả phiếu thu/chi/điều chuyển

##### Tab 3: Kho hàng (Inventory)
- **Icon**: Package / Thùng hàng
- **Label**: `"Kho hàng"`
- **Route**: `/inventory`
- **Chức năng**: Quản lý tồn kho, nhập/xuất kho

##### Tab 4: Báo cáo (Reports)
- **Icon**: Chart / Biểu đồ
- **Label**: `"Báo cáo"`
- **Route**: `/reports`
- **Chức năng**: Xem các báo cáo tài chính, kinh doanh

##### Tab 5: Menu (More)
- **Icon**: Hamburger menu hoặc Grid (3 dấu gạch ngang)
- **Label**: `"Thêm"` hoặc không có label
- **Route**: `/menu` hoặc mở menu overlay
- **Chức năng**: Cài đặt, hồ sơ, đăng xuất, các tính năng bổ sung

#### 2.8.2. Styling
- **Background**: Trắng với shadow nhẹ ở trên
- **Height**: 56px - 64px
- **Icon size**: 24px
- **Label font size**: 12px
- **Spacing**: Đều giữa các tab
- **Label logic**: Chỉ khi focus mới hiển thị label tên của menu điều hướng

---

### 2.9. Floating Action Button (FAB)

#### 2.9.1. Thiết kế
- **Vị trí**: Góc dưới bên phải, nổi trên bottom navigation
- **Icon**: Plus (+)
- **Màu nền**: Gradient cam (primary color) hoặc cam đậm
- **Kích thước**: 56x56px
- **Shadow**: Elevation cao để tạo cảm giác nổi
- **Animation**: Bounce khi hover/press

#### 2.9.2. Chức năng
Click vào FAB mở menu tạo nhanh với các tùy chọn:
1. **Tạo đơn hàng** → `/sales/new`
2. **Thêm khách hàng** → `/customers/new`
3. **Thêm sản phẩm** → `/products/new`
4. **Tạo phiếu thu** → `/receipts/new`
5. **Tạo phiếu chi** → `/payments/new`

#### 2.9.3. Menu overlay
- **Hiển thị**: Speed dial menu hoặc modal bottom sheet
- **Animation**: Slide up và fade in
- **Dismiss**: Click outside hoặc nút close

---


## 4. YÊU CẦU UX (USER EXPERIENCE REQUIREMENTS)

### 4.1. Loading States
- **Initial load**: Skeleton loaders cho tất cả sections
- **Pull to refresh**: Native pull-to-refresh gesture
- **Partial update**: Chỉ show spinner cho section đang update
- **Timeout**: Hiển thị error sau 10s nếu không load được

### 4.2. Empty States
- **Chưa có dữ liệu tài chính**: Hiển thị illustration + CTA "Tạo đơn hàng đầu tiên"
- **Chưa có reminder**: "Bạn không có lời nhắc nào hôm nay"
- **Chưa có thông báo**: "Không có thông báo mới"

### 4.3. Gestures & Interactions
- **Swipe**: Vuốt trái/phải để chuyển time filter
- **Pull to refresh**: Kéo xuống để refresh toàn bộ dashboard
- **Long press**: Long press trên financial card để xem breakdown chi tiết
- **Haptic feedback**: Rung nhẹ khi thực hiện hành động quan trọng

### 4.4. Accessibility
- **Screen reader**: Tất cả elements phải có label rõ ràng
- **Color contrast**: Đảm bảo tỷ lệ contrast tối thiểu 4.5:1
- **Touch target**: Kích thước tối thiểu 44x44px cho tất cả buttons
- **Font scaling**: Hỗ trợ dynamic font size

---

## 5. YÊU CẦU GIAO DIỆN (UI REQUIREMENTS)

### 5.1. Hệ thống màu sắc (Color Palette)

#### Màu chủ đạo (Primary)
- **Primary**: `#FF6B35` (Cam chủ đạo)
- **Primary Light**: `#FF8C61`
- **Primary Dark**: `#E65A2E`
- **Primary Background**: `#FFF4F0` (Nền nhạt cho các highlight)

#### Màu trạng thái (Status Colors)
- **Success**: `#28A745` (Xanh lá - Tăng trưởng dương)
- **Success Light**: `#D4EDDA` (Background cho badge tăng)
- **Danger**: `#DC3545` (Đỏ - Giảm/Chi phí)
- **Danger Light**: `#F8D7DA` (Background cho badge giảm)
- **Warning**: `#FFC107` (Vàng - Cảnh báo)
- **Info**: `#17A2B8` (Xanh dương - Thông tin)

#### Màu nền và text (Neutrals)
- **Background**: `#F8F9FA` (Nền chính của app)
- **Card Background**: `#FFFFFF` (Nền thẻ/card)
- **Text Primary**: `#212529` (Text chính)
- **Text Secondary**: `#6C757D` (Text phụ)
- **Border**: `#DEE2E6` (Viền mảnh)
- **Divider**: `#E9ECEF`

#### Gradient (Insight Banner)
```css
background: linear-gradient(135deg, #4F46E5 0%, #22D3EE 100%);
/* Hoặc */
background: linear-gradient(135deg, #667EEA 0%, #64B5F6 50%, #48D597 100%);
```

---

### 5.2. Typography

#### Font Family
```css
font-family: Theo chuẩn font hiện tại của project
```

#### Font Sizes
- **Heading 1** (Lời chào): `20px / 1.25rem` - Semi-bold (600)
- **Heading 2** (Section titles): `16px / 1rem` - Semi-bold (600)
- **Body Large** (Số tiền lớn): `28px / 1.75rem` - Bold (700)
- **Body Regular**: `14px / 0.875rem` - Regular (400)
- **Body Small** (Labels, % change): `12px / 0.75rem` - Medium (500)
- **Caption** (Bottom nav labels): `11px / 0.6875rem` - Regular (400)

#### Line Heights
- **Heading**: `1.2`
- **Body**: `1.5`
- **Compact** (Financial cards): `1.3`

---

### 5.3. Spacing System (8pt Grid)

```css
--spacing-xs: 4px;   /* 0.25rem */
--spacing-sm: 8px;   /* 0.5rem */
--spacing-md: 16px;  /* 1rem */
--spacing-lg: 24px;  /* 1.5rem */
--spacing-xl: 32px;  /* 2rem */
--spacing-xxl: 48px; /* 3rem */
```

#### Áp dụng
- **Padding trái/phải màn hình**: `16px` (--spacing-md)
- **Khoảng cách giữa sections**: `24px` (--spacing-lg)
- **Padding trong card**: `16px` (--spacing-md)
- **Gap giữa các cards**: `12px` (0.75rem)

---

### 5.4. Border Radius

```css
--radius-sm: 8px;   /* Small buttons, badges */
--radius-md: 12px;  /* Standard cards */
--radius-lg: 16px;  /* Large cards, modals */
--radius-xl: 24px;  /* Insight banner */
--radius-full: 9999px; /* Pills, badges, FAB */
```

---

### 5.5. Shadows (Elevation)

```css
/* Level 1 - Cards */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08), 
             0 1px 2px rgba(0, 0, 0, 0.06);

/* Level 2 - Raised elements */
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 
             0 2px 4px rgba(0, 0, 0, 0.05);

/* Level 3 - FAB, modals */
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 
             0 4px 6px rgba(0, 0, 0, 0.05);

/* Level 4 - Bottom nav */
--shadow-xl: 0 -2px 10px rgba(0, 0, 0, 0.06);
```

---

### 5.6. Component Specifications

#### A. Header
```css
.header {
  height: 64px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid var(--border-color);
}

.greeting {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.account-badge {
  padding: 4px 12px;
  border-radius: 9999px;
  background: var(--primary-background);
  color: var(--primary);
  font-size: 12px;
  font-weight: 500;
  border: 1px solid var(--primary-light);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  width: 18px;
  height: 18px;
  background: var(--danger);
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 600;
}
```

#### B. Search Bar
```css
.search-bar {
  height: 48px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.scan-button {
  width: 40px;
  height: 40px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}
```

#### C. Insight Banner
```css
.insight-banner {
  background: linear-gradient(135deg, #4F46E5 0%, #22D3EE 100%);
  border-radius: 20px;
  padding: 20px;
  margin: 16px;
  color: white;
  box-shadow: var(--shadow-md);
}

.insight-date {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.insight-message {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 16px;
}

.view-report-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 8px 16px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(10px);
}
```

#### D. Time Filter
```css
.time-filter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
}

.filter-arrow {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 4px;
}
```

#### E. Financial Cards
```css
.financial-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 16px;
  margin-bottom: 24px;
}

.financial-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--background);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.card-amount {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 8px;
}

.card-amount.revenue {
  color: var(--success);
}

.card-amount.expense {
  color: var(--danger);
}

.card-change {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.card-change.positive {
  background: var(--success-light);
  color: var(--success);
}

.card-change.negative {
  background: var(--danger-light);
  color: var(--danger);
}
```

#### F. Quick Access
```css
.quick-access {
  padding: 24px 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.quick-access-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.quick-access-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.quick-access-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.quick-access-label {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 500;
  text-align: center;
}
```

#### G. Floating Action Button
```css
.fab {
  position: fixed;
  bottom: 72px; /* Trên bottom nav */
  right: 16px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 10;
  transition: transform 0.2s ease;
}

.fab:active {
  transform: scale(0.95);
}

.fab-icon {
  width: 24px;
  height: 24px;
}
```

#### H. Bottom Navigation
```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  box-shadow: var(--shadow-xl);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  cursor: pointer;
  flex: 1;
  max-width: 80px;
}

.nav-icon {
  width: 24px;
  height: 24px;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.nav-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 400;
  transition: color 0.2s ease;
}

.nav-item.active .nav-icon,
.nav-item.active .nav-label {
  color: var(--primary);
}

.nav-item.active {
  position: relative;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 3px;
  background: var(--primary);
  border-radius: 0 0 3px 3px;
}
```

---

### 5.7. Responsive Breakpoints

```css
/* Mobile (Default) */
@media (max-width: 767px) {
  /* Áp dụng layout mobile như mô tả */
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .financial-cards {
    grid-template-columns: 1fr 1fr;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .quick-access-grid {
    grid-template-columns: repeat(4, 1fr);
    max-width: 600px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
  }
  
  .financial-cards {
    grid-template-columns: repeat(4, 1fr); /* 4 cards ngang */
  }
  
  .bottom-nav {
    display: none; /* Có thể thay bằng sidebar */
  }
  
  .fab {
    bottom: 24px;
  }
}
```

---

### 5.8. Animation & Transitions

#### Page Transitions
```css
.page-enter {
  opacity: 0;
  transform: translateX(100%);
}

.page-enter-active {
  opacity: 1;
  transform: translateX(0);
  transition: all 0.3s ease-out;
}
```

#### Card Hover (Desktop)
```css
@media (hover: hover) {
  .financial-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    transition: all 0.2s ease;
  }
  
  .quick-access-item:hover {
    transform: scale(1.05);
    transition: transform 0.2s ease;
  }
}
```

#### Loading Skeletons
```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

---

## 6. YÊU CẦU HIỆU NĂNG (PERFORMANCE REQUIREMENTS)

### 6.1. Loading Time
- **Initial page load**: < 2 giây
- **API response**: < 500ms
- **Interactive**: < 1 giây (Time to Interactive)

### 6.2. Optimization
- **Code splitting**: Lazy load bottom nav screens
- **Image optimization**: Compress và lazy load images
- **API calls**: Debounce search (300ms), throttle scroll events
- **Memoization**: Cache calculated values (%, formatted currency)

### 6.3. Offline Support
- **Cached data**: Hiển thị dữ liệu cached khi offline
- **Offline indicator**: Banner thông báo khi mất kết nối
- **Sync**: Auto-sync khi có kết nối trở lại

---

## 7. YÊU CẦU BẢO MẬT (SECURITY REQUIREMENTS)

### 7.1. Authentication
- User phải đăng nhập mới truy cập được màn hình Home
- Token expiry: Tự động logout khi token hết hạn
- Refresh token: Silent refresh khi token sắp hết hạn

### 7.2. Authorization
- Kiểm tra quyền trước khi hiển thị các tác vụ nhanh
- Hide/disable buttons nếu user không có quyền
- API level: Validate permissions ở backend

### 7.3. Data Privacy
- Không log sensitive data (số tiền, tên khách hàng)
- HTTPS only
- Secure storage cho cached data

---

## 8. TEST CASES

### 8.1. Functional Tests
1. ✅ Hiển thị đúng tên user và account badge
2. ✅ Notification badge hiển thị đúng số lượng
3. ✅ Search bar trả về kết quả đúng
4. ✅ Scan QR code hoạt động chính xác
5. ✅ Insight banner tính toán % đúng
6. ✅ Time filter thay đổi data chính xác
7. ✅ Financial cards hiển thị đúng số tiền và %
8. ✅ Quick access điều hướng đúng route
9. ✅ Reminders hiển thị đúng số lượng
10. ✅ Bottom nav active state đúng
11. ✅ FAB mở menu đúng options

### 8.2. UI/UX Tests
1. ✅ Responsive trên các kích thước màn hình
2. ✅ Color contrast đạt chuẩn WCAG AA
3. ✅ Touch targets >= 44x44px
4. ✅ Loading states hiển thị mượt mà
5. ✅ Error states có message rõ ràng
6. ✅ Animations không gây giật lag

### 8.3. Performance Tests
1. ✅ Page load < 2s
2. ✅ API calls < 500ms
3. ✅ Smooth scrolling (60fps)
4. ✅ Memory không leak sau nhiều lần load

---

## 9. PHỤ LỤC (APPENDIX)

### 9.1. Glossary
- **Tập đoàn**: Organization/Group với nhiều chi nhánh
- **Chi nhánh**: Branch/Location cụ thể
- **Phiếu chứng từ**: Transaction documents (thu/chi)
- **Công nợ**: Account receivables/payables
- **Tồn kho**: Inventory

### 9.2. References
- Design system: Material Design 3
- Icon library: Material Icons / Heroicons
- Color palette tool: Coolors.co
- Accessibility: WCAG 2.1 Level AA

### 9.3. Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-21 | Team | Initial draft |

---

**Tài liệu này là cơ sở để triển khai màn hình Home. Mọi thay đổi cần được review và approve trước khi implement.**
