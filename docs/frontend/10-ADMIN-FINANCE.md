# 10 - Tính năng Admin: Quản lý Tài chính & Nội dung (Phần 2)

**Module**: Admin Finance & Content Management
**Vai trò**: Quản trị viên (Administrator)
**Priority**: CAO (Finance), TRUNG BÌNH (Content)
**Completion**: 0% (0/4 features)

---

## 📋 Tổng quan Module

Module này bao gồm các tính năng quản lý tài chính và nội dung:

- **UC-017**: Theo dõi doanh thu từ gói premium
- **UC-018**: Quản lý thanh toán cho Expert
- **UC-019**: Duyệt và xuất bản nội dung của Expert
- **UC-020**: Cấu hình gói dịch vụ và chính sách hệ thống

---

## 🎯 Use Cases - Part 2

### UC-017: Theo dõi Doanh thu

**Mô tả**: Admin xem bảng điều khiển tài chính để theo dõi doanh thu từ việc bán các gói premium.

**Priority**: CAO
**Status**: ❌ Chưa triển khai

**Actors**: Administrator

**Preconditions**: Admin đã đăng nhập

**Main Flow**:

1. Admin truy cập "Bảng điều khiển Doanh thu"
2. Hệ thống hiển thị các chỉ số tài chính quan trọng:
   - Tổng doanh thu (lifetime)
   - Doanh thu tháng này
   - Số lượng người dùng premium mới
   - Tỷ lệ chuyển đổi (conversion rate)
   - Average Revenue Per User (ARPU)
3. Hệ thống hiển thị biểu đồ xu hướng doanh thu theo thời gian:
   - Doanh thu theo ngày/tuần/tháng
   - So sánh với kỳ trước
   - Breakdown theo gói đăng ký
4. Hệ thống hiển thị bảng chi tiết giao dịch:
   - User
   - Gói đăng ký
   - Số tiền
   - Ngày thanh toán
   - Trạng thái
   - Phương thức thanh toán
5. Admin có thể lọc theo:
   - Khoảng thời gian
   - Gói đăng ký
   - Trạng thái giao dịch
6. Admin có thể xuất báo cáo doanh thu (CSV, PDF, Excel)

**Postconditions**: Admin nắm được tình hình kinh doanh của sản phẩm

---

### UC-018: Quản lý Thanh toán cho Chuyên gia

**Mô tả**: Admin xem xét, phê duyệt và ghi nhận các khoản thanh toán lương/hoa hồng cho đội ngũ Expert.

**Priority**: CAO
**Status**: ❌ Chưa triển khai

**Actors**: Administrator

**Preconditions**:

- Admin đã đăng nhập
- Có ít nhất 1 Expert có phát sinh thu nhập

**Main Flow**:

1. Admin truy cập "Quản lý Thanh toán Chuyên gia"
2. Hệ thống hiển thị danh sách Expert với:
   - Tên Expert
   - Email
   - Số dư hoa hồng hiện tại (Pending)
   - Số tiền đã thanh toán
   - Số yêu cầu hoàn thành tháng này
3. Admin xem chi tiết thu nhập của một Expert:
   - Breakdown theo loại (Validated/Published)
   - Lịch sử commission records
   - Thời gian hưởng hoa hồng còn lại (cho validated content)
4. Admin thực hiện thanh toán (quy trình bên ngoài hệ thống):
   - Chuyển khoản ngân hàng
   - Nhận confirmation từ ngân hàng
5. Sau khi thanh toán, Admin nhấn "Xác nhận đã thanh toán"
6. Admin nhập thông tin giao dịch:
   - Mã giao dịch (transaction reference)
   - Ngày thanh toán
   - Số tiền thực tế
   - Ghi chú (nếu có)
7. Hệ thống:
   - Ghi nhận giao dịch
   - Reset số dư Expert về 0
   - Cập nhật status commission records → "Paid"
   - Gửi email xác nhận cho Expert

**Postconditions**: Giao dịch thanh toán hoa hồng được ghi nhận trên hệ thống

**Notes**: Quy trình thanh toán thực tế (bước 4) là quy trình thủ công, nằm ngoài hệ thống phần mềm

---

### UC-019: Duyệt và xuất bản nội dung của Chuyên gia

**Mô tả**: Admin xem xét và phê duyệt các bộ câu hỏi chuẩn do Expert tạo (từ UC-013) trước khi xuất bản ra kho đề premium.

**Priority**: TRUNG BÌNH
**Status**: ❌ Chưa triển khai

**Actors**: Administrator

**Preconditions**:

- Admin đã đăng nhập
- Có ít nhất 1 bộ câu hỏi từ Expert ở status "PendingApproval"

**Main Flow**:

1. Admin vào "Duyệt nội dung Chuyên gia"
2. Hệ thống hiển thị danh sách bộ câu hỏi chờ phê duyệt:
   - Tiêu đề bộ đề
   - Expert tạo
   - Môn học
   - Số câu hỏi
   - Ngày gửi duyệt
   - Quick preview score
3. Admin chọn một bộ đề để xem xét chi tiết:
   - Preview toàn bộ câu hỏi
   - Kiểm tra chất lượng:
     - Nội dung câu hỏi rõ ràng
     - Đáp án chính xác
     - Lời giải thích đầy đủ
     - Mức độ khó phù hợp
   - Xem thông tin Expert (credibility)
4. Admin nhấn "Phê duyệt" để xuất bản
5. Hệ thống:
   - Cập nhật status bộ đề → "Published"
   - Đưa vào kho đề premium
   - Gửi thông báo cho Expert
   - Bắt đầu tính hoa hồng khi có lượt làm bài

**Alternative Flow** (Từ chối):

- **4a. Chất lượng không đạt**:
  1. Admin nhấn "Từ chối"
  2. Admin nhập phản hồi/lý do
  3. Hệ thống:
     - Trả bộ đề về status "Draft"
     - Gửi phản hồi cho Expert để chỉnh sửa
     - Expert có thể chỉnh sửa và gửi lại

**Postconditions**: Bộ câu hỏi được xuất bản hoặc bị từ chối kèm phản hồi

---

### UC-020: Cấu hình Gói dịch vụ và Chính sách

**Mô tả**: Admin thiết lập và điều chỉnh các gói đăng ký với quyền lợi và giá khác nhau; cấu hình các quy định của hệ thống.

**Priority**: TRUNG BÌNH
**Status**: ❌ Chưa triển khai

**Actors**: Administrator

**Preconditions**: Admin đã đăng nhập

**Main Flow**:

**A. Quản lý Gói dịch vụ**:

1. Admin truy cập "Cài đặt Hệ thống" → "Quản lý Gói dịch vụ"
2. Hệ thống hiển thị danh sách các gói hiện tại (Free, Premium, Pro, etc.)
3. Admin có thể:
   - **Tạo gói mới**:
     - planName (ví dụ: "Premium Plus")
     - billingCycle (Monthly/Yearly)
     - price (VND)
     - entitlements (quyền lợi):
       - maxMonthlyTestGenerations (số đề tạo/tháng)
       - maxValidationRequests (số yêu cầu xác thực/tháng)
       - priorityProcessing (ưu tiên xử lý: true/false)
       - shareLimits (số lượt chia sẻ)
       - maxSubjects (số môn học tối đa)
       - accessPremiumContent (truy cập đề premium: true/false)
   - **Sửa gói hiện có**:
     - Thay đổi giá
     - Thay đổi quyền lợi
     - Thay đổi description
   - **Xóa/Archive gói**:
     - Không xóa vĩnh viễn (giữ lại cho users hiện tại)
     - Status → "Archived" (không hiển thị cho users mới)
4. Admin lưu thay đổi
5. Hệ thống version hóa cấu hình (lưu lịch sử thay đổi)

**B. Cấu hình Chính sách hệ thống**:

1. Admin chọn mục "Tiêu chuẩn kiểm duyệt"
2. Hệ thống hiển thị form cấu hình:
   - **Trọng số điểm theo mức độ**:
     - Biết (Knowledge): [1.00]
     - Hiểu (Comprehension): [1.25]
     - Vận dụng (Application): [1.50]
     - Vận dụng cao (High Application): [2.00]
   - **Hoa hồng Expert**:
     - CommissionPoolRate: [30]%
     - Rate_Published: [40]%
     - Rate_Validated: [20]%
     - ValidityPeriod: [180] ngày
   - **Quy định kiểm duyệt**:
     - Thời hạn Expert xử lý: [7] ngày
     - Số lần Expert được từ chối/tháng: [3] lần
   - **File upload**:
     - Max file size: [20] MB
     - Allowed types: PDF, DOCX, TXT
3. Admin cập nhật và lưu
4. Hệ thống áp dụng ngay cho các giao dịch mới

**Postconditions**: Các chính sách và giá cả dịch vụ được cập nhật trên toàn hệ thống

---

## 🖥️ UI Components

### 1. Revenue Dashboard Page

**Route**: `/admin/revenue`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
RevenueDashboard/
├── RevenueDashboardPage.jsx
├── RevenueDashboardPage.css
├── index.js
└── components/
    ├── RevenueMetrics.jsx         // KPIs cards
    ├── RevenueChart.jsx           // Biểu đồ xu hướng
    ├── RevenueBreakdown.jsx       // Breakdown theo plan
    ├── TransactionsTable.jsx      // Bảng giao dịch
    ├── RevenueFilters.jsx         // Bộ lọc
    └── ExportRevenueModal.jsx     // Modal xuất báo cáo
```

**API Endpoints**:

```javascript
// Get revenue overview
GET /api/admin/revenue/overview
// Response:
{
  "totalRevenue": 500000000,         // VND, lifetime
  "thisMonthRevenue": 150000000,
  "lastMonthRevenue": 120000000,
  "growthRate": 0.25,                // 25% growth
  "newPremiumUsers": 125,
  "totalPremiumUsers": 890,
  "conversionRate": 0.15,            // 15%
  "arpu": 168539,                    // Average Revenue Per User
  "churnRate": 0.05                  // 5% churn
}

// Get revenue chart data
GET /api/admin/revenue/chart?period={daily|weekly|monthly}&months={6}
// Response:
{
  "data": [
    {
      "period": "2025-05",
      "freeUsers": 1200,
      "premiumRevenue": 120000000,
      "planBreakdown": {
        "Premium": 80000000,
        "Pro": 40000000
      }
    }
  ]
}

// Get transactions
GET /api/admin/revenue/transactions?page={n}&startDate={date}&endDate={date}&planId={id}&status={status}
// Response:
{
  "data": [
    {
      "transactionId": "txn_001",
      "userId": "user_123",
      "userName": "Nguyễn Văn A",
      "userEmail": "user@example.com",
      "planName": "Premium",
      "amount": 199000,               // VND
      "paymentMethod": "Sepay",
      "transactionDate": "2025-11-05T10:00:00Z",
      "status": "Completed",          // Pending, Completed, Failed, Refunded
      "billingCycle": "Monthly"
    }
  ],
  "meta": { "page": 1, "totalItems": 890, "totalPages": 45 }
}

// Export revenue report
POST /api/admin/revenue/export
{
  "startDate": "2025-01-01",
  "endDate": "2025-11-05",
  "format": "csv" | "pdf" | "excel",
  "includePlanBreakdown": true
}
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────┐
│ 💰 Bảng điều khiển Doanh thu                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│ │ Tổng DT │ │ DT T11  │ │ Users   │ │  ARPU   │       │
│ │ 500M ₫  │ │ 150M ₫  │ │Premium  │ │ 169K ₫  │       │
│ │         │ │ +25% ↑  │ │  890    │ │         │       │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                          │
│ 📈 Xu hướng Doanh thu            [1M] [3M] [6M] [1N]  │
│ [Revenue Chart - Line + Bar combo]                     │
│                                                          │
│ 📊 Phân bổ theo Gói                                    │
│ [Pie Chart: Premium 60%, Pro 35%, Other 5%]           │
│                                                          │
│ 💳 Giao dịch gần đây                  [📊 Xuất BC →]  │
│ [Từ: 01/11] [Đến: 05/11] [Gói: Tất cả▼] [Tìm kiếm]   │
│ ┌──────────────────────────────────────────────────┐   │
│ │ Ngày    │ User      │ Gói     │ Số tiền  │ TT  │   │
│ ├──────────────────────────────────────────────────┤   │
│ │05/11/25│Nguyễn A  │Premium │199,000₫│ ✓   │   │
│ │05/11/25│Trần B    │Pro     │499,000₫│ ✓   │   │
│ └──────────────────────────────────────────────────┘   │
│ [< Trước]  [1] [2] ... [45]  [Sau >]                  │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Expert Payments Management Page

**Route**: `/admin/expert-payments`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
ExpertPayments/
├── ExpertPaymentsPage.jsx
├── ExpertPaymentsPage.css
├── index.js
└── components/
    ├── ExpertsTable.jsx           // Bảng danh sách Expert
    ├── PaymentFilters.jsx         // Bộ lọc
    ├── ExpertEarningsModal.jsx    // Modal chi tiết thu nhập
    ├── ConfirmPaymentModal.jsx    // Modal xác nhận thanh toán
    └── PaymentHistory.jsx         // Lịch sử thanh toán
```

**API Endpoints**:

```javascript
// Get experts with earnings
GET /api/admin/expert-payments?status={status}&page={n}
// Response:
{
  "data": [
    {
      "expertId": "exp_001",
      "fullName": "TS. Nguyễn Văn X",
      "email": "expert@example.com",
      "currentBalance": 3500000,      // VND, pending
      "totalPaid": 12000000,
      "thisMonthEarnings": 1200000,
      "completedValidations": 45,
      "publishedSets": 8,
      "lastPaymentDate": "2025-10-05",
      "status": "Pending"             // Pending, Paid
    }
  ],
  "meta": { "page": 1, "totalItems": 45, "totalPages": 3 },
  "summary": {
    "totalPending": 85000000,         // Tổng số tiền chờ thanh toán
    "totalExperts": 45
  }
}

// Get expert earnings details
GET /api/admin/expert-payments/:expertId/details
// Response:
{
  "expertId": "exp_001",
  "fullName": "TS. Nguyễn Văn X",
  "email": "expert@example.com",
  "currentBalance": 3500000,
  "breakdown": {
    "validatedEarnings": 1200000,
    "publishedEarnings": 2300000
  },
  "commissionRecords": [
    {
      "recordId": "rec_001",
      "setTitle": "Toán cao cấp A1",
      "type": "Validated",
      "amount": 15000,
      "date": "2025-11-05",
      "status": "Pending"
    }
  ],
  "paymentHistory": [
    {
      "paymentId": "pay_001",
      "amount": 5000000,
      "date": "2025-10-05",
      "transactionRef": "TXN-20251005-001",
      "adminName": "Admin Nguyễn"
    }
  ]
}

// Confirm payment
POST /api/admin/expert-payments/:expertId/confirm-payment
{
  "amount": 3500000,
  "transactionRef": "TXN-20251105-123",
  "paymentDate": "2025-11-05",
  "note": "Thanh toán hoa hồng tháng 11"
}

// Get payment history
GET /api/admin/expert-payments/history?page={n}&startDate={date}&endDate={date}
// Response: List of all payments made
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────┐
│ 💳 Quản lý Thanh toán Chuyên gia                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ 📊 Tổng quan                                           │
│ • Tổng chờ thanh toán: 85,000,000₫                     │
│ • Số Expert: 45                                         │
│                                                          │
│ Trạng thái: [Tất cả ▼] Tìm kiếm: [           ] [Tìm] │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Expert      │Số dư    │Tháng này│Đã TT   │Actions│  │
│ ├────────────────────────────────────────────────────┤  │
│ │TS.Nguyễn X │3.5M ₫   │1.2M ₫   │12M ₫  │[Chi tiết]│  │
│ │             │         │         │        │[Thanh toán]│  │
│ ├────────────────────────────────────────────────────┤  │
│ │PGS.Trần Y  │2.8M ₫   │900K ₫   │8M ₫   │[Chi tiết]│  │
│ │             │         │         │        │[Thanh toán]│  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ [< Trước]  [1] [2] [3]  [Sau >]                        │
│                                                          │
│ [📜 Lịch sử Thanh toán]                               │
└─────────────────────────────────────────────────────────┘
```

**Confirm Payment Modal**:

```
┌─────────────────────────────────────────────────┐
│ Xác nhận Thanh toán                       [×]  │
├─────────────────────────────────────────────────┤
│ Expert: TS. Nguyễn Văn X                       │
│ Email: expert@example.com                       │
│                                                  │
│ Số tiền thanh toán: 3,500,000₫                 │
│                                                  │
│ Mã giao dịch: *                                │
│ ┌─────────────────────────────────────────┐    │
│ │ TXN-20251105-123                        │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ Ngày thanh toán: *                             │
│ ┌─────────────────────────────────────────┐    │
│ │ [05/11/2025]                            │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ Ghi chú:                                        │
│ ┌─────────────────────────────────────────┐    │
│ │ Thanh toán hoa hồng tháng 11           │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ Sau khi xác nhận:                              │
│ • Số dư Expert sẽ về 0                        │
│ • Commission records → "Paid"                  │
│ • Email xác nhận sẽ được gửi                  │
│                                                  │
│        [Hủy]           [Xác nhận]              │
└─────────────────────────────────────────────────┘
```

---

### 3. Expert Content Approval Page

**Route**: `/admin/content-approval`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
ContentApproval/
├── ContentApprovalPage.jsx
├── ContentApprovalPage.css
├── index.js
└── components/
    ├── PendingSetsTable.jsx       // Bảng bộ đề chờ duyệt
    ├── SetPreview.jsx             // Preview bộ đề
    ├── ApproveRejectActions.jsx   // Actions
    └── RejectReasonModal.jsx      // Modal lý do từ chối
```

**API Endpoints**:

```javascript
// Get pending question sets from experts
GET /api/admin/content-approval?status={PendingApproval}&page={n}
// Response:
{
  "data": [
    {
      "setId": "set_001",
      "title": "Toán cao cấp nâng cao",
      "subjectName": "Toán học",
      "expertId": "exp_001",
      "expertName": "TS. Nguyễn Văn X",
      "questionCount": 25,
      "submittedAt": "2025-11-03T10:00:00Z",
      "status": "PendingApproval",
      "qualityScore": 0.88           // Auto-calculated quality score
    }
  ],
  "meta": { "page": 1, "totalItems": 12, "totalPages": 2 }
}

// Get set details for review
GET /api/admin/content-approval/:setId
// Response: Full question set with all questions

// Approve set
POST /api/admin/content-approval/:setId/approve
{
  "note": "Chất lượng tốt, xuất bản"
}

// Reject set
POST /api/admin/content-approval/:setId/reject
{
  "reason": "Một số câu hỏi cần bổ sung lời giải chi tiết hơn",
  "feedback": "Câu 5, 12, 18 cần giải thích rõ hơn"
}
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────┐
│ 📝 Duyệt Nội dung Chuyên gia                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Bộ đề chờ duyệt: 12                                    │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │Bộ đề         │Expert    │Môn  │Câu│Ngày  │Score│  │  │
│ ├────────────────────────────────────────────────────┤  │
│ │Toán cao cấp  │TS.NguyễnX│Toán │25 │03/11 │88% │[>]│  │
│ │Vật lý đại    │PGS.Trần Y│Vật lý│30│02/11 │92% │[>]│  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ [Bộ đề được chọn: Toán cao cấp nâng cao]              │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Expert: TS. Nguyễn Văn X                          │  │
│ │ Môn: Toán học | Số câu: 25                        │  │
│ │ Gửi duyệt: 03/11/2025 | Quality: 88%              │  │
│ │                                                    │  │
│ │ [Xem trước bộ đề]                                 │  │
│ │                                                    │  │
│ │ Đánh giá:                                         │  │
│ │ ✓ Nội dung rõ ràng                               │  │
│ │ ✓ Đáp án chính xác                               │  │
│ │ ⚠ Một số câu thiếu lời giải                     │  │
│ │                                                    │  │
│ │ [✓ Phê duyệt]           [✗ Từ chối]             │  │
│ └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

### 4. System Configuration Page

**Route**: `/admin/settings`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
SystemSettings/
├── SystemSettingsPage.jsx
├── SystemSettingsPage.css
├── index.js
└── components/
    ├── SubscriptionPlansTab.jsx   // Tab quản lý gói
    ├── PlanEditor.jsx             // Form tạo/sửa gói
    ├── SystemPoliciesTab.jsx      // Tab chính sách
    ├── CommissionConfig.jsx       // Cấu hình hoa hồng
    ├── DifficultyWeights.jsx      // Trọng số mức độ
    └── ValidationRules.jsx        // Quy định kiểm duyệt
```

**API Endpoints**:

```javascript
// Get all subscription plans
GET /api/admin/subscription-plans
// Response:
{
  "plans": [
    {
      "planId": "plan_001",
      "planName": "Free",
      "billingCycle": "Monthly",
      "price": 0,
      "entitlements": {
        "maxMonthlyTestGenerations": 5,
        "maxValidationRequests": 0,
        "priorityProcessing": false,
        "shareLimits": 2,
        "maxSubjects": 3,
        "accessPremiumContent": false
      },
      "status": "Active",
      "createdAt": "2025-01-01",
      "updatedAt": "2025-01-01"
    },
    {
      "planId": "plan_002",
      "planName": "Premium",
      "billingCycle": "Monthly",
      "price": 199000,
      "entitlements": {
        "maxMonthlyTestGenerations": "unlimited",
        "maxValidationRequests": 5,
        "priorityProcessing": true,
        "shareLimits": "unlimited",
        "maxSubjects": "unlimited",
        "accessPremiumContent": true
      },
      "status": "Active"
    }
  ]
}

// Create/Update subscription plan
POST /api/admin/subscription-plans
PATCH /api/admin/subscription-plans/:planId
{
  "planName": "Premium Plus",
  "billingCycle": "Yearly",
  "price": 1990000,
  "entitlements": { /* ... */ },
  "description": "Gói cao cấp nhất"
}

// Archive plan
PATCH /api/admin/subscription-plans/:planId/archive

// Get system policies
GET /api/admin/system-policies
// Response:
{
  "difficultyWeights": {
    "knowledge": 1.0,
    "comprehension": 1.25,
    "application": 1.5,
    "highApplication": 2.0
  },
  "commission": {
    "commissionPoolRate": 0.30,
    "ratePublished": 0.40,
    "rateValidated": 0.20,
    "validityPeriod": 180
  },
  "validation": {
    "expertProcessingDays": 7,
    "expertMaxRejectionsPerMonth": 3
  },
  "fileUpload": {
    "maxFileSizeMB": 20,
    "allowedTypes": ["pdf", "docx", "txt"]
  }
}

// Update system policies
PATCH /api/admin/system-policies
{
  "commission": {
    "commissionPoolRate": 0.35
  }
}
```

**UI Mockup - Subscription Plans Tab**:

```
┌─────────────────────────────────────────────────────────┐
│ ⚙️ Cài đặt Hệ thống                                    │
├─────────────────────────────────────────────────────────┤
│ [Gói dịch vụ] [Chính sách] [Hệ thống]                 │
│                                                          │
│ Quản lý Gói đăng ký                    [+ Tạo gói mới] │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 📦 Free                           [Sửa] [Archive] │  │
│ │ • Giá: 0₫ / Tháng                                 │  │
│ │ • Max đề/tháng: 5                                 │  │
│ │ • Yêu cầu xác thực: 0                             │  │
│ │ • Max môn học: 3                                  │  │
│ │ • Truy cập premium: ✗                             │  │
│ │ • Users hiện tại: 890                             │  │
│ ├────────────────────────────────────────────────────┤  │
│ │ 💎 Premium                        [Sửa] [Archive] │  │
│ │ • Giá: 199,000₫ / Tháng                           │  │
│ │ • Max đề/tháng: Unlimited                         │  │
│ │ • Yêu cầu xác thực: 5                             │  │
│ │ • Max môn học: Unlimited                          │  │
│ │ • Truy cập premium: ✓                             │  │
│ │ • Ưu tiên xử lý: ✓                                │  │
│ │ • Users hiện tại: 125                             │  │
│ └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**UI Mockup - System Policies Tab**:

```
┌─────────────────────────────────────────────────────────┐
│ ⚙️ Cài đặt Hệ thống                                    │
├─────────────────────────────────────────────────────────┤
│ [Gói dịch vụ] [Chính sách] [Hệ thống]                 │
│                                                          │
│ 📊 Trọng số Mức độ Khó                                 │
│ • Biết:           [1.00 ]                              │
│ • Hiểu:           [1.25 ]                              │
│ • Vận dụng:       [1.50 ]                              │
│ • Vận dụng cao:   [2.00 ]                              │
│                                                          │
│ 💰 Hoa hồng Chuyên gia                                 │
│ • Pool rate:      [30  ]%                              │
│ • Published:      [40  ]%                              │
│ • Validated:      [20  ]%                              │
│ • Validity period:[180 ] ngày                          │
│                                                          │
│ ✅ Quy định Kiểm duyệt                                 │
│ • Thời hạn xử lý: [7   ] ngày                          │
│ • Max từ chối:    [3   ] lần/tháng                     │
│                                                          │
│ 📁 File Upload                                          │
│ • Max size:       [20  ] MB                            │
│ • Types: PDF, DOCX, TXT                                 │
│                                                          │
│ [Hủy thay đổi]              [💾 Lưu cấu hình]         │
└─────────────────────────────────────────────────────────┘
```

---

## 📡 API Services

### adminRevenue.service.js

```javascript
/**
 * Admin Revenue Service
 */

import axiosInstance from "./axios.config";

const BASE_PATH = "/admin/revenue";

export const adminRevenueService = {
  getOverview: async () => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/overview`);
    return data;
  },

  getChartData: async (params = {}) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/chart`, { params });
    return data;
  },

  getTransactions: async (params = {}) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/transactions`, { params });
    return data;
  },

  exportReport: async (params) => {
    const response = await axiosInstance.post(`${BASE_PATH}/export`, params, {
      responseType: "blob",
    });
    return response.data;
  },
};
```

### adminExpertPayments.service.js

```javascript
/**
 * Admin Expert Payments Service
 */

import axiosInstance from "./axios.config";

const BASE_PATH = "/admin/expert-payments";

export const adminExpertPaymentsService = {
  getExperts: async (params = {}) => {
    const { data } = await axiosInstance.get(BASE_PATH, { params });
    return data;
  },

  getExpertDetails: async (expertId) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/${expertId}/details`);
    return data;
  },

  confirmPayment: async (expertId, payload) => {
    const { data } = await axiosInstance.post(`${BASE_PATH}/${expertId}/confirm-payment`, payload);
    return data;
  },

  getPaymentHistory: async (params = {}) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/history`, { params });
    return data;
  },
};
```

### adminContentApproval.service.js

```javascript
/**
 * Admin Content Approval Service
 */

import axiosInstance from "./axios.config";

const BASE_PATH = "/admin/content-approval";

export const adminContentApprovalService = {
  getPendingSets: async (params = {}) => {
    const { data } = await axiosInstance.get(BASE_PATH, { params });
    return data;
  },

  getSetDetails: async (setId) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/${setId}`);
    return data;
  },

  approve: async (setId, payload = {}) => {
    const { data } = await axiosInstance.post(`${BASE_PATH}/${setId}/approve`, payload);
    return data;
  },

  reject: async (setId, payload) => {
    const { data } = await axiosInstance.post(`${BASE_PATH}/${setId}/reject`, payload);
    return data;
  },
};
```

### adminSettings.service.js

```javascript
/**
 * Admin Settings Service
 */

import axiosInstance from "./axios.config";

export const adminSettingsService = {
  // Subscription Plans
  getPlans: async () => {
    const { data } = await axiosInstance.get("/admin/subscription-plans");
    return data;
  },

  createPlan: async (payload) => {
    const { data } = await axiosInstance.post("/admin/subscription-plans", payload);
    return data;
  },

  updatePlan: async (planId, payload) => {
    const { data } = await axiosInstance.patch(`/admin/subscription-plans/${planId}`, payload);
    return data;
  },

  archivePlan: async (planId) => {
    const { data } = await axiosInstance.patch(`/admin/subscription-plans/${planId}/archive`);
    return data;
  },

  // System Policies
  getPolicies: async () => {
    const { data } = await axiosInstance.get("/admin/system-policies");
    return data;
  },

  updatePolicies: async (payload) => {
    const { data } = await axiosInstance.patch("/admin/system-policies", payload);
    return data;
  },
};
```

---

## ✅ Implementation Checklist

### Phase 1: Revenue Dashboard (Sprint 7)

- [ ] **Setup Route**: `/admin/revenue`
- [ ] **Create API Service**: `adminRevenue.service.js`
- [ ] **Revenue Metrics Component**
- [ ] **Revenue Chart Component**
- [ ] **Transactions Table**
- [ ] **Export Report Modal**

### Phase 2: Expert Payments (Sprint 7)

- [ ] **Setup Route**: `/admin/expert-payments`
- [ ] **Create API Service**: `adminExpertPayments.service.js`
- [ ] **Experts Table Component**
- [ ] **Expert Earnings Details Modal**
- [ ] **Confirm Payment Modal**
- [ ] **Payment History Component**

### Phase 3: Content Approval (Sprint 8)

- [ ] **Setup Route**: `/admin/content-approval`
- [ ] **Create API Service**: `adminContentApproval.service.js`
- [ ] **Pending Sets Table**
- [ ] **Set Preview Component**
- [ ] **Approve/Reject Actions**
- [ ] **Reject Reason Modal**

### Phase 4: System Settings (Sprint 8)

- [ ] **Setup Route**: `/admin/settings`
- [ ] **Create API Service**: `adminSettings.service.js`
- [ ] **Subscription Plans Tab**
- [ ] **Plan Editor Component**
- [ ] **System Policies Tab**
- [ ] **Commission Config Component**
- [ ] **Validation Rules Component**

---

## 📝 Notes

### Business Rules

**Revenue Tracking**:

- Track all transactions with full audit trail
- Support refunds (negative transactions)
- Calculate MRR (Monthly Recurring Revenue)
- Track conversion funnel

**Expert Payments**:

- Payment cycle: Monthly (5th of next month)
- Minimum payout: 100,000₫
- Payment method: Bank transfer only
- Require transaction reference for audit

**Content Approval**:

- Auto quality score based on:
  - Question clarity (30%)
  - Answer accuracy (40%)
  - Explanation completeness (30%)
- Require admin review if score < 80%

**System Configuration**:

- Version all policy changes
- Notify affected users of changes
- Cannot delete plans with active users
- Commission changes apply to new transactions only

---

**Status**: Ready for Implementation
**Estimated Effort**: 3-4 sprints
**Dependencies**: Payment gateway integration, Commission calculation system, Email notifications
