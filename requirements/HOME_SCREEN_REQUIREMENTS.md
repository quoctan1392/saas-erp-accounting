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
- **Nguồn dữ liệu**: 
  - Ưu tiên lấy từ trường "Tên chủ hộ kinh doanh" hoặc "Tên chủ doanh nghiệp" đã khai báo trong quá trình onboarding
  - Fallback: `displayName`, `fullName`, `firstName`, hoặc `email`
- **Logic hiển thị tên**: 
  - **Định dạng tên**: Chỉ hiển thị tên gọi cuối cùng (First Name)
  - Ví dụ: "Hoàng Thị Phương" → hiển thị "Phương"
  - Implementation: Split full name và lấy phần tử cuối cùng
  - Nếu tên quá dài thì cắt ký tự dạng ....
- **Style**: Sử dụng style về màu sắc và font chữ như title của các màn onboarding
- **Positioning**: Top-left của header

#### 2.1.2. Badge gói dịch vụ (Service Plan Badge)
- **Vị trí**: Bên cạnh tên người dùng
- **Các loại badge**:
  - **Miễn phí** (Free) - mặc định khi mới bắt đầu
  - **Starter**
  - **Standard**
  - **Enterprise**
- **Icon**: Lấy từ `web-app/src/assets/badget_icon_free_tier.png`
- **Styling**: 
  - Pill-shaped badge với nền nhẹ, viền mỏng
  - Background: `#FFF4F0` (hoặc tương ứng với màu gói)
  - Border: 1px solid với màu primary nhạt
  - Font size: 12px, font-weight: 500
  - Padding: 4px 12px
  - Border-radius: 9999px (full rounded)
- **Nguồn dữ liệu**: Lấy từ `subscription.plan` hoặc `tenant.plan`
  
#### 2.1.3. Icon thông báo (Notification Bell)
- **Vị trí**: Góc phải trên cùng của header
- **Icon**: Bell/Chuông (outline variant)
- **Badge số**: 
  - Hiển thị số lượng thông báo chưa đọc
  - Position: absolute, top-right của icon
  - Background: `#DC3545` (đỏ)
  - Color: white
  - Font size: 10px, font-weight: 600
  - Min-width: 18px, height: 18px
  - Border-radius: 50%
- **Hành động**: 
  - Click/Tap vào icon mở màn hình Notifications (`/notifications`)
  - Sau khi mở, đánh dấu tất cả thông báo là "đã đọc", khi đó badge số biến mất
- **Loại thông báo**: 
  - Tin nhắn mới từ Kế toán dịch vụ
  - Cảnh báo tồn kho thấp
  - Thông báo hàng tháng (định kỳ) về công nợ nhà cung cấp, khách hàng hoặc các báo cáo định kỳ để user vào xem
  - Thông báo nhắc nhở (Reminder) (Nhắc nộp tờ khai thuế GTGT, Nhắc nộp tờ khai thuế TNCN khấu trừ, Nhắc nộp báo cáo tình hình sử dụng hóa đơn (quý), Nhắc nộp lệ phí môn bài (năm), Nhắc nộp báo cáo tài chính năm (nếu có phát sinh), Nhắc gói dịch vụ sắp hết hạn)
  - Thông báo hệ thống (cập nhật, bảo trì, thông báo bảo mật, tính năng mới) 
  - Thông báo về luật (các thay đổi, cập nhật về luật ảnh hưởng đến hệ thống và doanh nghiệp)
  - Thông báo khuyến mãi (giảm giá gói dịch vụ, tặng kèm gói/ tháng dùng thử, ưu đãi nâng cấp)
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng về notification

#### 2.1.4. Background image theo thời gian
- **Logic hiển thị**: Tự động thay đổi background dựa trên giờ trong ngày
- **Ban ngày** (6:00 - 18:00): `web-app/src/assets/Header_day.png`
- **Ban đêm** (18:00 - 6:00): `web-app/src/assets/Header_night.png`
- **Implementation**: 
  ```typescript
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 18;
  const backgroundImg = isDay ? HeaderDayBg : HeaderNightBg;
  ```
- **Styling**: 
  - Background-size: cover
  - Background-position: center
  - Background-repeat: no-repeat

#### 2.1.5. Component hóa (Component Structure)
- **Tách thành component riêng**: `DashboardHeader.tsx` (tái sử dụng được)
- **Props interface**:
  ```typescript
  interface DashboardHeaderProps {
    userName: string;
    planBadge: 'free' | 'starter' | 'standard' | 'enterprise';
    notificationCount: number;
    onNotificationClick: () => void;
    title?: string; // Tùy chọn thay đổi title cho từng màn hình
  }
  ```
- **Usage**: Có thể sử dụng lại cho các màn hình khác với title khác nhau

### 2.2. Công cụ Tìm kiếm và Quét mã (Search & Scan Tools)

#### 2.2.1. Thanh tìm kiếm (Search Bar)
- **Vị trí**: Dưới header, trên insight banner
- **Placeholder**: `"Nhập sản phẩm cần tìm..."`
- **Styling**:
  - Height: 48px
  - Background: white
  - Border: 1px solid `#DEE2E6`
  - Border-radius: 24px (pill-shaped)
  - Padding: 0 16px
  - Icon tìm kiếm (search icon) ở bên trái
  - Margin: 16px (trái/phải)
- **Chức năng tìm kiếm**:
  - **Sản phẩm/Hàng hóa**: Tìm theo tên, mã sản phẩm, barcode 
  - **Khách hàng**: Tìm theo tên, số điện thoại, email (phát triển sau)
  - **Nhà cung cấp**: Tìm theo tên, mã số thuế (phát triển sau)
  - **Đơn hàng**: Tìm theo mã đơn hàng
- **UX Flow**:
  - Hiển thị kết quả gợi ý real-time khi gõ (debounce 300ms)
  - Kết quả được phân loại rõ ràng theo nhóm: "Sản phẩm", "Đơn hàng", "Khách hàng", "Nhà cung cấp"
  - Click vào kết quả → Điều hướng đến trang chi tiết tương ứng
  - Empty state: "Không tìm thấy kết quả phù hợp"
  - Show recent searches (tối đa 5 kết quả), có thể xoá được từng kết quả
  - Click close tại chi tiết bản ghi -> Điều hướng quay lại Homepage

#### 2.2.2. Icon quét mã QR/Barcode (Scanner Button)
- **Vị trí**: Bên phải thanh tìm kiếm, trong cùng một container
- **Icon**: Barcode icon
- **Styling**:
  - Width: 40px, Height: 40px
  - Background: `#FB7E00` (primary color - màu cam)
  - Border-radius: 50% (tròn)
  - Color: white
  - Display: flex, align-items: center, justify-content: center
  - Box-shadow: 0 2px 4px rgba(0,0,0,0.1)
- **Hành động**: 
  - Tap/Click → Mở camera để quét mã
  - Request camera permission nếu chưa có
- **Chức năng**:
  - **Quét Barcode sản phẩm** → Mở trang chi tiết sản phẩm
 
- **Permission**: 
  - Yêu cầu quyền truy cập camera (Camera Permission)
  - Hiển thị dialog giải thích lý do nếu bị từ chối
- **Error handling**:
  - Camera không khả dụng → Show toast "Không thể mở camera"
  - Mã không hợp lệ → Show toast "Không nhận diện được mã"
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng quét mã
---

### 2.3. Banner Báo cáo xu hướng (Insight Banner)

#### 2.3.1. Card Banner
- **Vị trí**: Dưới Search Bar, trên Time Filter;
- **Design**: 
  - Dạng carousel 3-4 banner, mỗi banner 1 thông tin
  - Thay đổi khi chọn khoảng thời gian trên time filter
  - Height: 120px
  - Background: Gradient hoặc màu nền tùy theo insight type 
    - **Doanh thu tăng**: Gradient xanh lá (từ `#28A745` → `#20C997`)
    - **Doanh thu giảm**: Gradient đỏ (từ `#DC3545` → `#E57373`)
    - **Sản phẩm bán chạy**: Gradient cam (từ `#FB7E00` → `#FFA726`)
    - **Chi phí tăng**: Gradient vàng (từ `#FFC107` → `#FFD54F`)
  - Border-radius: 16px
  - Padding: 16px
  - Margin: 16px (trái/phải), 12px (trên/dưới)
  - Box-shadow: 0 2px 8px rgba(0,0,0,0.08)
- **Cấu trúc nội dung**:
  - **Icon**: Icon tương ứng với loại insight (trending_up, shopping_cart, warning, etc.)
    - Size: 40x40px
    - Position: Góc trái trên
    - Color: white
  - **Title (Headline)**: Font 16px, semi-bold, color: white
    - Ví dụ: "Doanh thu tăng 23% tuần này"
  - **Description (Sub-headline)**: Font 13px, regular, color: white opacity 90%
    - Ví dụ: "Bạn đã bán được 145 đơn hàng trong tuần này, tăng 32 đơn so với tuần trước"
  - **Button "Xem báo cáo"**: 
    - Position: Góc phải dưới
    - Background: white
    - Color: Text màu theo insight type (green/red/orange/yellow)
    - Padding: 8px 16px
    - Border-radius: 20px
    - Font: 13px, semi-bold
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng

#### 2.3.2. Loại Insights và Logic tính toán
**1. Doanh thu tăng/giảm**:
- **Điều kiện hiển thị**: So sánh doanh thu kỳ hiện tại vs kỳ trước (tuần/tháng)
- **Công thức**: `((revenue_current - revenue_previous) / revenue_previous) * 100`
- **Message template**:
  - Tăng: `"Doanh thu tăng {percent}% {period}"`
  - Giảm: `"Doanh thu giảm {percent}% {period}"`
- **Description template**: 
  - Tăng: `"Bạn đã bán được {order_count} đơn hàng trong {period}, tăng {increase_count} đơn so với {previous_period}"`
  - Giảm: `"Bạn chỉ bán được {order_count} đơn hàng trong {period}, giảm {decrease_count} đơn so với {previous_period}"`

**2. Sản phẩm bán chạy**:
- **Điều kiện**: Top 1 sản phẩm có số lượng bán nhiều nhất trong kỳ
- **Message template**: `"Sản phẩm '{product_name}' đang bán chạy"`
- **Description template**: `"Đã bán được {quantity} sản phẩm trong {period}, chiếm {percent}% tổng doanh thu"`

**3. Chi phí tăng**:
- **Điều kiện**: Chi phí tăng >= 15% so với kỳ trước
- **Message template**: `"Chi phí tăng {percent}% {period}"`
- **Description template**: `"Tổng chi phí đạt {total_expense} trong {period}, tăng {increase_amount} so với {previous_period}"`

#### 2.3.3. Logic xoay vòng Insights
- **Rotation**: Hiển thị dạng carousel 3 banners, có thể vuốt trái phải để xem, Carousel auto-play với interval 4 giây
- **Priority**: Nếu có nhiều insights, ưu tiên theo thứ tự:  
  1. Doanh thu tăng/giảm 
  2. Chi phí tăng
  3. Sản phẩm bán chạy
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng

#### 2.3.4. Hành động "Xem báo cáo"
- **Tap vào button** → Điều hướng đến:
  - Insight doanh thu → Trang "Báo cáo Doanh thu" với filter tương ứng
  - Insight sản phẩm → Trang "Báo cáo Sản phẩm" + highlight sản phẩm bán chạy
  - Insight chi phí → Trang "Báo cáo Thu-Chi" với filter chi phí
- **Tracking**: Log analytics event `"insight_banner_clicked"` với params: `insight_type`, `timestamp`
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng

#### 2.3.5. Data Source
```typescript
interface InsightBanner {
  id: string;
  type: 'revenue_increase' | 'revenue_decrease' | 'product_trending' | 'expense_increase' | 'low_stock';
  title: string;
  description: string;
  actionUrl: string; // Deep link URL
  priority: number; // 1-5, 1 is highest
  metadata: {
    percent?: number; // For percentage changes
    amount?: number; // For absolute values
    productName?: string; // For product trending
    count?: number; // For item counts
    period: 'week' | 'month' | 'quarter';
  };
}
```

---

### 2.4. Bộ lọc thời gian (Time Filter)
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng

#### 2.4.1. Giao diện
- **Kiểu hiển thị**: Horizontal selector với mũi tên trái/phải để chuyển kỳ
- **Styling**:
  - Font: 16px, semi-bold
  - Color: Text màu đen (#212529)
  - Background: Transparent hoặc white
  - Arrows: Icon mũi tên < và > ở hai bên, màu primary (cam)
  - Padding: 12px 16px
  - Margin: 16px (trái/phải), 12px (trên/dưới)
- **Giá trị mặc định**: `"Tháng này"`
- **Vị trí**: Giữa màn hình, phía trên các thẻ tài chính
- **Layout**: Flexbox horizontal với text ở giữa và arrows ở hai bên

#### 2.4.2. Các lựa chọn thời gian
- **Hôm nay**: Từ 00:00 đến 23:59 ngày hiện tại
  - Format hiển thị: `"Hôm nay - {DD/MM/YYYY}"`
- **Tuần này**: Từ thứ 2 đến chủ nhật (tuần bắt đầu từ thứ 2)
  - Format hiển thị: `"Tuần này - {DD/MM} đến {DD/MM}"`
- **Tháng này**: Từ ngày 1 đến cuối tháng hiện tại
  - Format hiển thị: `"Tháng {MM/YYYY}"`
  - Ví dụ: "Tháng 01/2025"
- **Tháng trước**: Từ ngày 1 đến cuối tháng trước
  - Format hiển thị: `"Tháng {MM/YYYY}"`
- **Quý này**: Từ ngày đầu đến cuối quý hiện tại
  - Format hiển thị: `"Quý {Q}/YYYY"`
  - Ví dụ: "Quý 1/2025" (Q1: tháng 1-3, Q2: tháng 4-6, Q3: tháng 7-9, Q4: tháng 10-12)
- **Năm này**: Từ 1/1 đến 31/12 năm hiện tại
  - Format hiển thị: `"Năm {YYYY}"`
- **Tùy chỉnh**: Cho phép chọn khoảng thời gian tùy ý
  - Mở Date Range Picker để chọn startDate và endDate
  - Format hiển thị: `"{DD/MM/YYYY} - {DD/MM/YYYY}"`

#### 2.4.3. Hành động
- **Thay đổi bộ lọc**: 
  - Tự động cập nhật các chỉ số tài chính bên dưới (Financial Cards)
  - Persist giá trị đã chọn (LocalStorage/SessionStorage) để giữ khi refresh
- **Navigation với arrows**:
  - Arrow trái (<): Chuyển sang kỳ trước (previous period)
  - Arrow phải (>): Chuyển sang kỳ sau (next period)
  - Ví dụ: Đang ở "Tháng 01/2025" → Click < → "Tháng 12/2024"
- **Thay đổi kỳ**:
  - Click vào option hiện tại (ví dụ: Tháng này) mở ra dropdown hoặc bottomsheet để chọn kỳ, bao gồm: Hôm nay, tuần này, tháng này, quý này, năm này, tuỳ chọn (mở datepicker chọn khoảng).
- **API call**: Gọi lại API để lấy dữ liệu theo khoảng thời gian mới
  ```
  GET /api/analytics/financial-overview?startDate={}&endDate={}
  ```
- **Loading state**: 
  - Hiển thị skeleton loader khi đang tải dữ liệu
  - Disable arrows và không cho phép thay đổi trong lúc loading
- **Empty state**: Nếu không có dữ liệu trong kỳ → Hiển thị "Chưa có giao dịch trong kỳ này"

---

### 2.5. Chỉ số tài chính (Financial Cards)
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng

#### 2.5.1. Bố cục chung
- **Layout**: Grid 2 cột (hoặc 2 cards ngang)
- **Spacing**: Gap 12px giữa 2 cards
- **Margin**: 16px (trái/phải)
- **Card Styling**:
  - Background: White
  - Border: 1px solid `#DEE2E6`
  - Border-radius: 12px
  - Padding: 16px
  - Box-shadow: 0 1px 3px rgba(0,0,0,0.06)

#### 2.5.2. Thẻ "Tổng đã thu" (Total Revenue)
- **Icon**: 
  - Icon: Dollar sign hoặc money receive (↓) trong vòng tròn
  - Size: 36x36px
  - Background: Light green (#D4EDDA)
  - Icon color: Dark green (#28A745)
- **Label**: `"Tổng đã thu"`
  - Font: 13px, regular
  - Color: #6C757D (text-muted)
- **Giá trị chính**: 
  - Format: `700.24tr` (cho số tiền 700,240,000 VNĐ)
  - Logic format:
    - >= 1 tỷ: `"1.24tỷ"` (billion)
    - >= 1 triệu: `"700.24tr"` (million)
    - < 1 triệu: `"450.5k"` (thousand)
  - Font size: 24px, bold (700)
  - Color: `#28A745` (green)
- **Chỉ số thay đổi (Comparison Badge)**:
  - Format: `+2.3% so với tháng trước`
  - Display: Chip/Badge component
  - **Styling cho tăng**:
    - Background: `#D4EDDA` (light green)
    - Text color: `#28A745` (green)
    - Icon: Arrow up (↑)
  - **Styling cho giảm**:
    - Background: `#F8D7DA` (light red)
    - Text color: `#DC3545` (red)
    - Icon: Arrow down (↓)
  - Font: 12px, semi-bold
  - Padding: 4px 8px
  - Border-radius: 12px
- **Nguồn dữ liệu**:
  ```
  GET /api/analytics/revenue-collected?startDate={}&endDate={}
  Response: {
    total: 700240000,
    formatted: "700.24tr",
    comparison: {
      percent: 2.3,
      direction: "increase" | "decrease" | "stable",
      previousPeriod: "tháng trước"
    }
  }
  ```

#### 2.5.3. Thẻ "Tổng đã chi" (Total Expense)
- **Icon**: 
  - Icon: Dollar sign hoặc money send (↑) trong vòng tròn
  - Size: 36x36px
  - Background: Light red (#F8D7DA)
  - Icon color: Dark red (#DC3545)
- **Label**: `"Tổng đã chi"`
  - Font: 13px, regular
  - Color: #6C757D (text-muted)
- **Giá trị chính**: 
  - Format: `235.34tr` (cho số tiền 235,340,000 VNĐ)
  - Logic format: (giống như "Tổng đã thu")
  - Font size: 24px, bold (700)
  - Color: `#DC3545` (red)
- **Chỉ số thay đổi (Comparison Badge)**:
  - Format: `-5.3% so với tháng trước` (nếu giảm, là tốt)
  - Display: Chip/Badge component
  - **Styling cho giảm** (positive outcome for expense):
    - Background: `#D4EDDA` (light green)
    - Text color: `#28A745` (green)
    - Icon: Arrow down (↓)
  - **Styling cho tăng** (negative outcome for expense):
    - Background: `#F8D7DA` (light red)
    - Text color: `#DC3545` (red)
    - Icon: Arrow up (↑)
  - Font: 12px, semi-bold
  - Padding: 4px 8px
  - Border-radius: 12px
- **Nguồn dữ liệu**:
  ```
  GET /api/analytics/expense-paid?startDate={}&endDate={}
  Response: {
    total: 235340000,
    formatted: "235.34tr",
    comparison: {
      percent: -5.3,
      direction: "decrease" | "increase" | "stable",
      previousPeriod: "tháng trước"
    }
  }
  ```

#### 2.5.4. Hành động
- **Tap vào card "Tổng đã thu"**: 
  - Điều hướng đến `/reports/revenue` hoặc `/reports/cash-flow` với tab "Thu"
  - Deep link với filter đã set sẵn theo Time Filter hiện tại
- **Tap vào card "Tổng đã chi"**: 
  - Điều hướng đến `/reports/expense` hoặc `/reports/cash-flow` với tab "Chi"
  - Deep link với filter đã set sẵn theo Time Filter hiện tại
- **Loading state**: 
  - Hiển thị skeleton placeholder cho giá trị và comparison badge
  - Giữ nguyên icon và label
- **Error state**: 
  - Hiển thị "---" thay vì giá trị
  - Ẩn comparison badge
  - Show toast error message nếu API call fail

#### 2.5.5. Component Interface (TypeScript)
```typescript
interface FinancialCard {
  type: 'revenue' | 'expense';
  icon: string;
  iconBgColor: string;
  iconColor: string;
  label: string;
  value: number; // Raw value in VND
  formatted: string; // Formatted display string
  valueColor: string; // Text color for the value
  comparison: {
    percent: number;
    direction: 'increase' | 'decrease' | 'stable';
    previousPeriod: string; // e.g., "tháng trước"
  } | null;
  onPress: () => void; // Navigation handler
}
```

---

### 2.6. Truy cập nhanh (Quick Access)
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng

#### 2.6.1. Bố cục
- **Tiêu đề section**: `"Truy cập nhanh"`
  - Font: 18px, semi-bold
  - Color: `#212529`
  - Margin: 16px (trái), 24px (trên), 16px (phải), 12px (dưới)
- **Layout**: Grid 3 cột x 2 hàng (total 6 items)
- **Spacing**: 
  - Gap giữa các items: 16px (horizontal), 20px (vertical)
  - Padding container: 16px (trái/phải)
- **Item styling**:
  - Display: flex-column
  - Align-items: center
  - Background: Transparent
  - Each item có icon + label

#### 2.6.2. Các tác vụ nhanh (theo thứ tự hiển thị)

##### A. Bán hàng (Create Invoice/Order)
- **Icon**: `receipt_long` hoặc document icon
  - Size: 40x40px
  - Background: Circle với màu cam nhạt `#FFE8D6`
  - Icon color: `#FB7E00` (primary color - cam)
- **Label**: `"Lên đơn"`
  - Font: 13px, medium
  - Color: `#495057`
  - Text-align: center
  - Margin-top: 8px
- **Hành động**: Điều hướng đến `/invoices/new` hoặc mở màn hình tạo đơn bán hàng mới
- **Permission**: `invoices.create`

##### B. Mua hàng (Create purchases)
- **Icon**: `cart` hoặc box icon
  - Size: 40x40px
  - Background: Circle với màu xanh dương nhạt `#D6E9FF`
  - Icon color: `#0D6EFD` (blue)
- **Label**: `"Mua hàng"`
  - Font: 13px, medium
  - Color: `#495057`
- **Hành động**: Điều hướng đến màn hình thêm mới đơn hàng mua 
- **Permission**: `purchases.create` 

##### C. Thu tiền (Receipts)
- **Icon**: `money-receive` hoặc wallet icon
  - Size: 40x40px
  - Background: Circle với màu xanh lá nhạt `#D4EDDA`
  - Icon color: `#28A745` (green)
- **Label**: `"Thu tiền"`
  - Font: 13px, medium
  - Color: `#495057`
- **Hành động**: Điều hướng đến màn hình thêm mới Phiếu thu tiền
- **Permission**:`receipts.create`
  
##### D. Chi tiền (Payments)
- **Icon**: `account_balance_wallet` hoặc wallet icon
  - Size: 40x40px
  - Background: Circle với màu xanh lá nhạt `#D4EDDA`
  - Icon color: `#28A745` (green)
- **Label**: `"Chi tiền"`
  - Font: 13px, medium
  - Color: `#495057`
- **Hành động**: Điều hướng đến màn hình thêm mới Phiếu chi tiền
- **Permission**:`payments.create`

#### 2.6.3. Responsive behavior
- **Mobile Portrait**: Grid 4 cột x 1 hàng
- **Mobile Landscape**: Grid 4 cột x 1 hàng
- **Tablet**: Grid 4 cột x 1 hàng
- **Desktop**: Grid 4 cột x 1 hàng

#### 2.6.4. Interaction
- **Tap effect**: 
  - Scale down 0.95 khi press
  - Opacity 0.7 khi press
  - Haptic feedback (light impact)
- **Loading state**: 
  - Show loading spinner nếu action cần load data
  - Disable tất cả items trong lúc loading
- **Permission check**: 
  - Nếu user không có permission → Ẩn item đó hoặc show disabled state
  - Show toast message khi tap vào disabled item: "Bạn không có quyền truy cập tính năng này"

---

### 2.7. Lời nhắc (Reminders)
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng
#### 2.7.1. Header section
- **Tiêu đề**: `"Lời nhắc hôm nay (2)"`
  - Số trong ngoặc là số lượng lời nhắc đang active
- **Nút "Xem tất cả"**: 
  - Vị trí: Bên phải tiêu đề
  - Màu chữ: Secondary color (xanh dương)
  - Hành động:Mở full danh sách lời nhắc

#### 2.7.2. Loại lời nhắc
- **Công nợ quá hạn**: Khách hàng/nhà cung cấp chưa thanh toán
- **Tồn kho thấp**: Sản phẩm sắp hết hàng
- **Đơn hàng chờ xử lý**: Đơn hàng mới cần xác nhận
- **Gói dịch vụ sắp hết hạn**: Nhắc nhở gia hạn
- **Báo cáo định kỳ**: Nhắc nộp báo cáo tháng/quý
- **Nộp giấy tờ**: Nhắc nộp báo cáo, tờ khai thuế,...

#### 2.7.3. Hiển thị preview (nếu có)
- Hiển thị dạng compact 1 lời nhắc, click Xem tất cả sẽ mở các lời nhắc còn lại ra
- Mỗi item gồm:
  - Tiêu đề
  - Nội dung ngắn gọn
  - Thời gian (ví dụ: "2 giờ trước", "Hôm nay 14:00")
  - Button: Kiểm tra ngay/Xem ngay
- Click vào từng item mở chi tiết task/reminder

#### 2.7.4. Nguồn dữ liệu
.... 

### 2.8 Công việc (Tasks)
- **Implement**: Tạm thời chỉ implement về UI, chưa cần tích hợp tính năng
#### 2.8.1. Header section
- **Tiêu đề**: `"Công việc cần làm (7)"`
  - Số trong ngoặc là số lượng công việc đang active, chưa hoàn thành
- **Nút "Xem tất cả"**: 
  - Vị trí: Bên phải tiêu đề
  - Màu chữ: Secondary color (Xanh dương)
  - Hành động: Mở full danh sách công việc hoặc điều hướng đến màn hình Công việc cần làm

#### 2.8.2. Loại công việc
  - Dựa vào tiêu đề và mô tả cũng như các sub-tasks được tạo trong mục Công việc (phát triển sau)

#### 2.8.3. Hiển thị preview (nếu có)
- Hiển thị dạng compact 1 công việc, click vào task sẽ điều hướng tới Công việc cần làm
- Mỗi item gồm:
  - Tiêu đề
  - Nội dung ngắn gọn
  - Deadline (cụ thể ngày giờ dạng DD/MM/YYYY HH:mm), nếu quá hạn hiển thị deadline màu đỏ
  - Subtask completion status (ví dụ 1/3 có nghĩa là có 3 subtasks, đã hoàn thành 1 subtask)
  - Checkbox để đánh dấu đã hoàn thành task (user click vào checkbox để đánh dấu đã hoàn thành cả task đó, còn nếu muốn click hoàn thành từng subtasks thì cần mở chi tiết task lên xem). Sau khi tick checkbox chuyển dạng checked màu cam.
- Click vào từng item mở chi tiết task

### 2.9. Thanh điều hướng dưới (Bottom Navigation)

#### 2.9.1. Cấu trúc 5 tab chính

##### Tab 1: Tổng quan (Home) - **Active State**
- **Icon**: `home`
  - Size: 24px
  - Active color: `#FB7E00` (primary - cam)
  - Inactive color: `#6C757D` (gray)
- **Label**: `"Tổng quan"`
  - Font: 12px, medium
  - Active color: `#FB7E00`
  - Inactive color: `#6C757D`
- **Route**: `/home`
- **Chức năng**: Màn hình Home hiện tại (default screen)
- **Active indicator**: 
  - Top bar: Height 2-3px, color `#FB7E00`
  - Label hiển thị semi-bold khi active

##### Tab 2: Đơn hàng (Orders)
- **Icon**: `receipt_long` hoặc document icon
  - Size: 24px
- **Label**: `"Đơn hàng"`
  - Font: 12px
- **Route**: `/orders` hoặc `/invoices`
- **Chức năng**: Quản lý đơn hàng bán (quản lý danh sách đơn hàng bán, thêm mới đơn hàng bán )
##### Tab 3: Sản phẩm (Products)
- **Icon**: `inventory_2` hoặc box icon
  - Size: 24px
- **Label**: `"Sản phẩm"`
  - Font: 12px
- **Route**: `/products`
- **Chức năng**: Quản lý hàng hóa, dịch vụ (quản lý danh sách hàng hoá, dịch vụ, thêm mới hàng hoá, dịch vụ)

##### Tab 4: Báo cáo (Reports)
- **Icon**: `bar_chart` hoặc analytics icon
  - Size: 24px
- **Label**: `"Báo cáo"`
  - Font: 12px
- **Route**: `/reports`
- **Chức năng**: Xem các báo cáo tài chính, doanh thu, chi phí

##### Tab 5: Thêm (More/Menu)
- **Icon**: `more_horiz` hoặc grid icon (3x3)
  - Size: 24px
- **Label**: `"Thêm"`
  - Font: 12px
- **Route**: `/menu` hoặc show modal menu
- **Chức năng**: Cài đặt, hồ sơ doanh nghiệp, đăng xuất

#### 2.8.2. Styling
- **Background**: White (`#FFFFFF`)
- **Top border**: 1px solid `#DEE2E6`
- **Box-shadow**: `0 -2px 8px rgba(0,0,0,0.06)`
- **Height**: 64px
- **Safe area**: Padding bottom cho iOS notch/home indicator
- **Z-index**: 1000

#### 2.8.3. Interaction
- **Tap effect**: Scale icon 0.9, ripple effect
- **Inactive state**:
  - Các option không được chọn chỉ hiển thị icon, ẩn label, icon màu đen 80% opacity, khi chọn chuyển sang active state
- **Active state**:
  - Smooth color transition 200ms
  - Tab đó chuyển thành pill-shaped container màu primary (cam)
  - Icon chuyển sang màu trắng, dạng bold thay vì outline
  - Text chuyển sang màu trắng, in đậm 600
- **Badge notification**: Badge đỏ (`#DC3545`) ở góc trên phải icon

---

### 2.9. Floating Action Button (FAB)
#### 2.9.1. Thiết kế
- **Vị trí**: Góc dưới bên phải, nổi trên bottom navigation
  - Right: 16px
  - Bottom: 80px
- **Icon**: `add` (dấu +)
  - Size: 28px
  - Color: White
- **Kích thước**: 56x56px, border-radius 50%
- **Màu nền**: `#FB7E00` hoặc gradient
- **Shadow**: `0 4px 12px rgba(251, 126, 0, 0.4)`
- **Animation**: Bounce + scale effect

#### 2.9.2. Chức năng - Speed Dial Menu
Click vào FAB mở menu tạo nhanh với các tùy chọn:
1. **Tạo đơn hàng** → `/sales/new`
2. **Thêm khách hàng** → `/customers/new`
3. **Thêm sản phẩm** → `/products/new`
4. **Tạo phiếu thu** → `/receipts/new`
5. **Tạo phiếu chi** → `/payments/new`

#### 2.9.3. Speed Dial UI (tạm thời chưa làm)
- **Layout**: Vertical stack, mở từ dưới lên
- **Item styling**: White bg, pill shape, icon + label
- **Backdrop**: `rgba(0,0,0,0.5)`
- **Animation**: Slide up + fade in, stagger 50ms
- **Close**: Tap backdrop, tap FAB (rotate 45°)
- **Implement**: Tại màn trang chủ mà click FAB thì auto điều hướng đến màn hình thêm mới đơn hàng bán.
---

### 2.10. Modal Hướng dẫn thiết lập ban đầu (Setup Guide Modal)

#### 2.10.1. Trigger
- Hiển thị sau Advanced Setup screen, khi vào Home lần đầu
- Check flag: `hasSeenSetupGuideModal` trong localStorage
- Delay: 500ms sau khi Home render

#### 2.10.2. Thiết kế
- **Kiểu**: Modal with blanket
- **Size**: 60-70% viewport (mobile), max-width 480px (desktop)
- **Background**: White, border-radius 16px (top)
- **Backdrop**: `rgba(0,0,0,0.6)`, không cho click outside

#### 2.10.3. Nội dung

**Header**:
- **Container**: Cao 314px, rộng 327px, background màu trắng, border radius 20px, padding 24px 16px
- **Title**: `"Bắt đầu sử dụng"` - 24px bold
- **Subtitle**: `"Để bắt đầu sử dụng, bạn hãy hoàn thành các bước dưới đây!"` - 14px

**Bước 1: Khai báo danh mục**
- Box màu xám #F9F9F9, border radius 8px, cao 52px, padding 12px 16px
- Badge màu cam hình tròn, bên trong là số 1
- Title: `"Khai báo danh mục"` - 16px semi-bold
- Arrow-right ở flex-end
- Action: Navigate to category setup

**Bước 2: Khai báo số dư ban đầu**
- Box màu xám #F9F9F9, border radius 8px, cao 52px, padding 12px 16px
- Badge màu cam hình tròn, bên trong là số 2
- Title: `"Bước 2: Khai báo số dư ban đầu"` - 16px semi-bold
- Arrow-right ở flex-end
- Action: Navigate to initial balance setup

**Footer**:
- **Button**: `"Bỏ qua"` - dạng text button no background, 40px height
  - Action: Close modal, set flag

#### 2.10.4. Logic
- LocalStorage key: `onboarding_setup_guide_completed`
- Value: `{ seen: boolean, step1_completed: boolean, step2_completed: boolean }`
- Re-display từ menu "Cài đặt" > "Hướng dẫn thiết lập"

#### 2.10.5. Animation
- Modal: Slide up 300ms, backdrop fade 200ms
- Icon: Bounce effect (scale 0 → 1.1 → 1), delay 150ms

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
- **Haptic feedback**: Rung nhẹ khi thực hiện hành động quan trọng

### 4.4. Accessibility
- **Screen reader**: Tất cả elements phải có label rõ ràng
- **Color contrast**: Đảm bảo tỷ lệ contrast tối thiểu 4.5:1
- **Touch target**: Kích thước tối thiểu 44x44px cho tất cả buttons
- **Font scaling**: Hỗ trợ dynamic font size

---

## 5. YÊU CẦU GIAO DIỆN (UI REQUIREMENTS)

### 5.1. Hệ thống màu sắc (Color Palette) - tự động cập nhật khi thay đổi color palette của theme

#### Màu chủ đạo (Primary)
- **Primary**: `#FF6B35` (Cam chủ đạo)
- **Primary Light**: `#FF8C61`
- **Primary Dark**: `#E65A2E`
- **Primary Background**: `#FFF4F0` (Nền nhạt cho các highlight)

#### Màu cấp 2 (Secondary)
- **Secondary**: `#007DFB` (Xanh dương)
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
