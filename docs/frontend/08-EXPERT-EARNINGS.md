# 08 - Tính năng Chuyên gia: Quản lý Thu nhập

**Module**: Expert Earnings & Commission Management
**Vai trò**: Chuyên gia (Expert)
**Priority**: CAO
**Completion**: 0% (0/3 features)

---

## 📋 Tổng quan

Module này cung cấp công cụ minh bạch cho Chuyên gia để theo dõi hiệu suất làm việc và thu nhập:

- Xem tổng quan thu nhập
- Xem lịch sử hoa hồng chi tiết
- Theo dõi hiệu suất (số yêu cầu hoàn thành, bộ đề tạo)
- Xuất báo cáo thu nhập

---

## 🎯 Use Case

### UC-014: Quản lý thu nhập

**Mô tả**: Chuyên gia theo dõi thu nhập và hoa hồng một cách minh bạch.

**Priority**: CAO
**Status**: ❌ Chưa triển khai

**Actors**: Expert

**Preconditions**: Expert đã đăng nhập

**Main Flow**:

1. Expert truy cập trang "Thu nhập của tôi"
2. Hệ thống hiển thị bảng điều khiển tổng quan:
   - Tổng thu nhập (lifetime)
   - Số dư hiện tại (chưa thanh toán)
   - Số tiền đã thanh toán
   - Thu nhập tháng này
3. Hệ thống hiển thị biểu đồ xu hướng thu nhập theo thời gian
4. Hệ thống liệt kê lịch sử các khoản thu nhập chi tiết:
   - Mã yêu cầu kiểm duyệt / Mã bộ đề
   - Tên bộ đề
   - Loại (Validated / Published)
   - Ngày ghi nhận
   - Số tiền hoa hồng
   - Trạng thái (Pending / Paid)
5. Expert có thể lọc lịch sử theo:
   - Khoảng thời gian (ngày, tháng, năm)
   - Loại (Validated / Published)
   - Trạng thái (Pending / Paid)
6. Expert có thể xuất báo cáo thu nhập (CSV/PDF)

**Postconditions**: Expert có cái nhìn minh bạch về hiệu suất và thu nhập

---

## 💰 Commission Calculation Logic

### Công thức tính hoa hồng (SRS 4.1.2)

**Định nghĩa**:

- `NetPremiumRevenue_m`: Doanh thu thực từ gói trả phí trong tháng m (sau khi trừ hoàn tiền, chiết khấu, thuế)
- `CommissionPoolRate`: Tỷ lệ % doanh thu dành cho hoa hồng (mặc định 30%, cấu hình bởi Admin)
- `CommissionPool_m = NetPremiumRevenue_m * CommissionPoolRate`
- `PremiumAttempts_m`: Tổng số lượt làm bài của premium users trên các bộ đề đủ điều kiện trong tháng m
- `PerAttemptUnit_m = CommissionPool_m / max(1, PremiumAttempts_m)` (đơn giá 1 lượt)

**Loại nội dung**:

- `PublishedByExpert`: Bộ đề do Expert tạo (UC-013) → Rate = 40%
- `ValidatedByExpert`: Bộ đề do Learner tạo, Expert xác thực (UC-012) → Rate = 20%

**Quy tắc tính cho 1 lượt làm bài**:

```javascript
function calculateCommission(attempt, set, expert) {
  const { PerAttemptUnit_m } = getMonthlyMetrics(attempt.month);

  if (set.type === "PublishedByExpert" && set.author === expert.id) {
    return PerAttemptUnit_m * 0.4; // 40% for published content
  }

  if (set.type === "ValidatedByExpert" && set.validator === expert.id) {
    const validatedDate = set.validatedAt;
    const validityPeriod = 180; // days
    const daysSinceValidation = daysBetween(validatedDate, attempt.date);

    if (daysSinceValidation <= validityPeriod) {
      return PerAttemptUnit_m * 0.2; // 20% for validated content
    }
  }

  return 0;
}
```

**Hoa hồng tháng của Expert**:

```
Commission_Expert_m = Σ commission(attempt_k)
  for all attempts in month m
```

**Ngoại lệ**:

- Lượt làm bài bị hủy/hoàn tiền → không tính hoa hồng (hủy bút toán)
- Nếu `PremiumAttempts_m = 0` → `PerAttemptUnit_m = 0` (không phát sinh hoa hồng)

---

## 🖥️ UI Components

### 1. Expert Earnings Page

**Route**: `/expert/earnings`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
ExpertEarnings/
├── ExpertEarningsPage.jsx
├── ExpertEarningsPage.css
├── index.js
└── components/
    ├── EarningsOverview.jsx       // Tổng quan số liệu
    ├── EarningsChart.jsx          // Biểu đồ xu hướng
    ├── CommissionHistory.jsx      // Lịch sử chi tiết
    ├── EarningsFilter.jsx         // Bộ lọc
    └── ExportReportModal.jsx      // Modal xuất báo cáo
```

**API Endpoints**:

```javascript
// Get earnings overview
GET /api/experts/earnings/overview
// Response:
{
  "totalEarnings": 15000000,        // VND
  "currentBalance": 3500000,        // Pending
  "paidAmount": 11500000,           // Đã thanh toán
  "thisMonthEarnings": 2500000,
  "validatedSetsCount": 45,
  "publishedSetsCount": 8,
  "thisMonthValidations": 12,
  "thisMonthAttempts": 340          // Lượt làm bài phát sinh hoa hồng
}

// Get earnings chart data
GET /api/experts/earnings/chart?period={monthly|weekly|daily}&months={6}
// Response:
{
  "data": [
    {
      "period": "2025-05",
      "validatedEarnings": 800000,
      "publishedEarnings": 1200000,
      "totalEarnings": 2000000
    },
    {
      "period": "2025-06",
      "validatedEarnings": 900000,
      "publishedEarnings": 1600000,
      "totalEarnings": 2500000
    }
  ]
}

// Get commission records
GET /api/experts/earnings/records?page={n}&startDate={date}&endDate={date}&type={type}&status={status}
// Response:
{
  "data": [
    {
      "recordId": "rec_001",
      "setId": "set_123",
      "setTitle": "Toán cao cấp A1",
      "attemptId": "att_456",
      "type": "Validated",           // or "Published"
      "commissionAmount": 15000,      // VND
      "transactionDate": "2025-11-05T14:30:00Z",
      "status": "Pending"             // or "Paid"
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 234,
    "totalPages": 12
  }
}

// Export earnings report
POST /api/experts/earnings/export
{
  "startDate": "2025-01-01",
  "endDate": "2025-11-05",
  "format": "csv" | "pdf"
}
// Response: File download
```

**Features**:

**Earnings Overview Card**:

```
┌────────────────────────────────────────────────┐
│ 💰 Tổng quan Thu nhập                          │
├────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐            │
│ │ Tổng thu nhập│  │ Số dư hiện tại│            │
│ │  15,000,000₫ │  │  3,500,000₫  │            │
│ └──────────────┘  └──────────────┘            │
│ ┌──────────────┐  ┌──────────────┐            │
│ │ Đã thanh toán│  │ Thu nhập T11 │            │
│ │ 11,500,000₫  │  │  2,500,000₫  │            │
│ └──────────────┘  └──────────────┘            │
│                                                 │
│ Hiệu suất:                                     │
│ • 45 bộ đề đã xác thực                        │
│ • 8 bộ đề premium đã tạo                      │
│ • 12 xác thực tháng này                       │
│ • 340 lượt làm bài (phát sinh hoa hồng)       │
└────────────────────────────────────────────────┘
```

**Earnings Chart**:

- Line/Bar chart hiển thị xu hướng thu nhập
- 2 series:
  - Thu nhập từ Validated (màu xanh lá)
  - Thu nhập từ Published (màu xanh dương)
- Filter: 1 tháng, 3 tháng, 6 tháng, 1 năm
- Tooltip hiển thị chi tiết khi hover

**Commission History Table**:

| Ngày       | Bộ đề            | Loại      | Số tiền | Trạng thái     |
| ---------- | ---------------- | --------- | ------- | -------------- |
| 05/11/2025 | Toán cao cấp A1  | Validated | 15,000₫ | Chờ thanh toán |
| 04/11/2025 | Vật lý đại cương | Published | 45,000₫ | Chờ thanh toán |
| 03/11/2025 | Hóa học hữu cơ   | Validated | 12,000₫ | Đã thanh toán  |

Features:

- Sortable columns
- Pagination
- Click row to view details

**Filters**:

- Date range picker
- Type: All / Validated / Published
- Status: All / Pending / Paid
- Search by set title

**Export Report**:

- Button: "📊 Xuất báo cáo"
- Modal with options:
  - Date range
  - Format: CSV / PDF
  - Include: Summary / Detailed

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────┐
│ 💰 Thu nhập của tôi                                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ [Tổng quan Thu nhập - như trên]                        │
│                                                          │
│ 📈 Xu hướng Thu nhập                                   │
│ ┌───────────────────────────────────────────────────┐  │
│ │     [1T] [3T] [6T] [1N]                          │  │
│ │ 3M ┤                                   ●          │  │
│ │ 2M ┤                       ●       ●              │  │
│ │ 1M ┤           ●       ●                          │  │
│ │ 0  └──────────────────────────────────────────   │  │
│ │      T6    T7    T8    T9   T10   T11            │  │
│ │    ■ Validated   ■ Published                     │  │
│ └───────────────────────────────────────────────────┘  │
│                                                          │
│ 📋 Lịch sử Hoa hồng                      [📊 Xuất BC] │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Từ: [05/05/2025] Đến: [05/11/2025]             │    │
│ │ Loại: [Tất cả ▼] Trạng thái: [Tất cả ▼]       │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ [Table như trên]                                        │
│                                                          │
│ [< Trước]  [1] [2] [3] ... [12]  [Sau >]              │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Commission Record Details Modal

**Components**:

```
CommissionRecordDetails/
├── CommissionRecordDetailsModal.jsx
├── CommissionRecordDetailsModal.css
└── index.js
```

**Triggered**: Click on a row in Commission History table

**Content**:

```
┌─────────────────────────────────────────────┐
│ Chi tiết Hoa hồng #rec_001            [×]  │
├─────────────────────────────────────────────┤
│                                              │
│ Bộ đề: Toán cao cấp A1                     │
│ Loại: Validated                             │
│                                              │
│ Thông tin giao dịch:                       │
│ • Mã giao dịch: rec_001                    │
│ • Mã lượt làm bài: att_456                 │
│ • Ngày phát sinh: 05/11/2025 14:30        │
│ • Số tiền: 15,000₫                         │
│ • Trạng thái: Chờ thanh toán              │
│                                              │
│ Chi tiết tính toán:                        │
│ • PerAttemptUnit: 75,000₫                  │
│ • Rate (Validated): 20%                    │
│ • Commission: 75,000₫ × 20% = 15,000₫     │
│                                              │
│ [Đóng]                                      │
└─────────────────────────────────────────────┘
```

---

## 📡 API Service

### earnings.service.js

```javascript
/**
 * Earnings Service
 * API for expert earnings management
 */

import axiosInstance from "./axios.config";

const BASE_PATH = "/experts/earnings";

export const earningsService = {
  /**
   * Get earnings overview
   * @returns {Promise<Object>}
   */
  getOverview: async () => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/overview`);
    return data;
  },

  /**
   * Get earnings chart data
   * @param {Object} params
   * @param {string} params.period - monthly, weekly, daily
   * @param {number} params.months - Number of months
   * @returns {Promise<Object>}
   */
  getChartData: async (params = { period: "monthly", months: 6 }) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/chart`, { params });
    return data;
  },

  /**
   * Get commission records
   * @param {Object} params - Query params
   * @param {number} params.page
   * @param {string} params.startDate
   * @param {string} params.endDate
   * @param {string} params.type - Validated, Published
   * @param {string} params.status - Pending, Paid
   * @returns {Promise<Object>}
   */
  getRecords: async (params = {}) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/records`, { params });
    return data;
  },

  /**
   * Get commission record details
   * @param {string} recordId
   * @returns {Promise<Object>}
   */
  getRecordDetails: async (recordId) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/records/${recordId}`);
    return data;
  },

  /**
   * Export earnings report
   * @param {Object} params
   * @param {string} params.startDate
   * @param {string} params.endDate
   * @param {string} params.format - csv, pdf
   * @returns {Promise<Blob>}
   */
  exportReport: async (params) => {
    const response = await axiosInstance.post(`${BASE_PATH}/export`, params, {
      responseType: "blob",
    });
    return response.data;
  },
};
```

---

## ✅ Implementation Checklist

### Phase 1: Overview & Chart (Sprint 5)

- [ ] **Setup Route**

  - [ ] Add `/expert/earnings` route
  - [ ] Add ProtectedRoute với role `Expert`

- [ ] **Create API Service**

  - [ ] `earnings.service.js`
  - [ ] All methods implemented

- [ ] **Earnings Overview Component**

  - [ ] Fetch overview data
  - [ ] Display 4 key metrics cards
  - [ ] Display performance stats
  - [ ] Loading state
  - [ ] Error handling

- [ ] **Earnings Chart Component**
  - [ ] Choose chart library (Chart.js / Recharts / Victory)
  - [ ] Implement line/bar chart
  - [ ] 2 data series (Validated, Published)
  - [ ] Period filter (1M, 3M, 6M, 1Y)
  - [ ] Tooltip with details
  - [ ] Responsive design

### Phase 2: Commission History (Sprint 5)

- [ ] **Commission History Component**

  - [ ] Table with sortable columns
  - [ ] Pagination
  - [ ] Click row to view details
  - [ ] Loading skeleton
  - [ ] Empty state

- [ ] **Earnings Filter Component**

  - [ ] Date range picker
  - [ ] Type filter (dropdown)
  - [ ] Status filter (dropdown)
  - [ ] Search by title
  - [ ] Clear filters button
  - [ ] Apply filters with debounce

- [ ] **Commission Record Details Modal**
  - [ ] Fetch record details
  - [ ] Display all information
  - [ ] Show calculation breakdown
  - [ ] Close modal

### Phase 3: Export Report (Sprint 5)

- [ ] **Export Report Modal**

  - [ ] Date range picker
  - [ ] Format selection (CSV/PDF)
  - [ ] Include options (Summary/Detailed)
  - [ ] Export button
  - [ ] Progress indicator
  - [ ] Download handling

- [ ] **Export Functionality**
  - [ ] Call export API
  - [ ] Handle blob response
  - [ ] Trigger file download
  - [ ] Error handling

### Phase 4: Testing & Polish

- [ ] **Data Validation**

  - [ ] Verify commission calculations
  - [ ] Test with different time periods
  - [ ] Test edge cases (no data, large dataset)

- [ ] **UI/UX Polish**

  - [ ] Add loading states everywhere
  - [ ] Add empty states
  - [ ] Add error messages
  - [ ] Currency formatting (VND)
  - [ ] Number formatting (thousands separator)
  - [ ] Date formatting (Vietnamese locale)

- [ ] **Responsive Design**
  - [ ] Mobile view for overview cards
  - [ ] Mobile-friendly chart
  - [ ] Scrollable table on mobile
  - [ ] Responsive filters

---

## 🔗 Related Use Cases

- **UC-012**: Tiếp nhận và kiểm duyệt (tạo commission records)
- **UC-013**: Tạo bộ câu hỏi chuẩn (tạo commission records)
- **UC-018**: Admin quản lý thanh toán cho Expert
- **UC-006**: Learner làm bài thi (phát sinh commission)

---

## 📊 Success Metrics

- Thời gian trung bình Expert xem báo cáo thu nhập
- Tỷ lệ Expert xuất báo cáo (engagement)
- Độ chính xác của commission calculation
- Tỷ lệ khiếu nại về thu nhập (target: < 1%)

---

## 📝 Notes

### Business Rules

**Commission Rates** (configurable by Admin in UC-020):

- `CommissionPoolRate`: 30% (default)
- `Rate_Published`: 40%
- `Rate_Validated`: 20%
- `ValidityPeriod`: 180 days

**Payment Schedule**:

- Admin reviews and pays commission monthly
- Payment typically on 5th of next month
- Expert receives notification when paid

**Transparency**:

- All calculations must be visible to Expert
- Show breakdown: PerAttemptUnit × Rate = Amount
- Link to original quiz attempt (if needed)

### Technical Considerations

**Chart Library Options**:

1. **Chart.js** - Lightweight, good for basic charts
2. **Recharts** - React-specific, composable
3. **Victory** - Highly customizable, accessible

**Currency Formatting**:

```javascript
const formatVND = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Output: "15.000₫"
```

**Date Formatting**:

```javascript
const formatDate = (dateString) => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

// Output: "05/11/2025 14:30"
```

**Export File Download**:

```javascript
const handleExport = async (params) => {
  try {
    const blob = await earningsService.exportReport(params);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `earnings_report_${params.startDate}_${params.endDate}.${params.format}`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    showToast("Xuất báo cáo thất bại", "error");
  }
};
```

**Caching Strategy**:

- Cache overview data for 5 minutes
- Invalidate cache when new commission record is created
- Use React Query or SWR for data fetching

---

**Status**: Ready for Implementation
**Estimated Effort**: 1-1.5 sprints
**Dependencies**: Commission Records API, Payment workflow (UC-018)
