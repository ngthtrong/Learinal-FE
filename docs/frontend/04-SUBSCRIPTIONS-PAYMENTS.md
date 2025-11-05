# 04 - Gói dịch vụ & Thanh toán

**Module**: Subscriptions & Payments
**Vai trò**: Người học (Learner)
**Priority**: CAO
**Completion**: 0% (0/6 features)

---

## 📋 Tổng quan

Module này cho phép người học:

- Xem các gói dịch vụ Premium
- So sánh tính năng Free vs Premium
- Đăng ký gói Premium qua Sepay
- Xem lịch sử thanh toán
- Quản lý subscription (gia hạn, hủy)
- Nhận hóa đơn điện tử

---

## 🎯 Use Cases

### UC-020: Xem gói dịch vụ & So sánh

**Mô tả**: Người học xem danh sách gói dịch vụ, so sánh tính năng và giá cả.

**Priority**: CAO
**Status**: ❌ Chưa triển khai

**Actors**: Learner (Guest có thể xem nhưng không subscribe)

**Preconditions**: Không có

**Main Flow**:

1. User truy cập trang "Gói dịch vụ" hoặc nhấn CTA "Nâng cấp"
2. Hệ thống hiển thị danh sách gói dịch vụ:
   - **Free Plan**:
     - Giá: 0 VNĐ/tháng
     - Tính năng giới hạn
   - **Premium Monthly**:
     - Giá: 99,000 VNĐ/tháng
     - Tính năng đầy đủ
   - **Premium Yearly**:
     - Giá: 990,000 VNĐ/năm (giảm 17%)
     - Tính năng đầy đủ + ưu đãi
3. Mỗi gói hiển thị:
   - Tên gói
   - Giá (VNĐ)
   - Chu kỳ thanh toán
   - Danh sách tính năng (✓/✗)
   - Badge: "Popular", "Best Value", etc.
   - CTA button: "Chọn gói"
4. User có thể:
   - So sánh tính năng side-by-side
   - Xem bảng so sánh chi tiết
   - Toggle Monthly/Yearly view
5. User chọn một gói
6. Nếu chưa đăng nhập:
   - Redirect đến trang Login
   - Sau khi login, quay lại trang này
7. Nếu đã đăng nhập:
   - Chuyển đến trang thanh toán (UC-PAYMENT)

**Alternative Flow**:

- **6a. User đã có Premium active**:
  - Hiển thị thông báo "Bạn đang dùng [Plan Name]"
  - CTA: "Quản lý gói" → My Subscription page

**Postconditions**: User hiểu rõ về các gói và lợi ích

**Business Rules**:

- Free plan luôn hiển thị (không thể ẩn)
- Chỉ hiển thị gói đang active (admin có thể disable gói)
- Giá hiển thị bao gồm VAT
- Yearly plan phải có discount (min 10%)

---

### UC-PAYMENT: Thanh toán qua Sepay

**Mô tả**: Người học thanh toán để kích hoạt gói Premium qua cổng Sepay.

**Priority**: CAO
**Status**: ❌ Chưa triển khai

**Actors**: Learner (đã đăng nhập)

**Preconditions**:

- Learner đã đăng nhập
- Đã chọn gói Premium (từ UC-020)

**Main Flow**:

1. Hệ thống hiển thị trang thanh toán với:
   - **Thông tin gói**:
     - Tên gói
     - Giá gốc
     - Giảm giá (nếu có)
     - Tổng thanh toán
   - **Thông tin người dùng**:
     - Họ tên
     - Email
     - Số điện thoại
   - **Phương thức thanh toán**:
     - QR Code (Sepay)
     - Chuyển khoản ngân hàng
2. User nhấn "Thanh toán"
3. Hệ thống:
   - Tạo Payment Intent
   - Gọi Sepay API để tạo QR code
   - Hiển thị QR code + thông tin chuyển khoản
   - Bắt đầu polling để kiểm tra trạng thái thanh toán
4. User quét QR code và thanh toán
5. Sepay gửi webhook đến backend
6. Backend:
   - Xác thực webhook signature
   - Cập nhật Payment status = "Completed"
   - Kích hoạt Subscription
   - Gửi email xác nhận
7. Frontend nhận update (qua polling hoặc WebSocket)
8. Hiển thị trang "Thanh toán thành công"
9. Chuyển hướng đến Dashboard sau 3s

**Alternative Flow**:

- **5a. Thanh toán thất bại**:
  - Webhook status = "Failed"
  - Backend cập nhật Payment status = "Failed"
  - Frontend hiển thị lỗi
  - CTA: "Thử lại"
- **5b. User hủy thanh toán**:
  - User đóng trang
  - Payment status = "Cancelled"
  - Có thể retry sau
- **Timeout (15 phút)**:
  - Payment status = "Expired"
  - Phải tạo payment mới

**Postconditions**:

- Payment record được tạo với status "Completed"
- Subscription được kích hoạt
- User nhận email xác nhận + hóa đơn

**Business Rules**:

- Mỗi payment có expiry time: 15 phút
- Sepay webhook phải verify signature
- Payment amount phải khớp với plan price
- Subscription bắt đầu ngay sau khi thanh toán thành công
- Free trial không áp dụng (v1.0)

---

### UC-MY-SUBSCRIPTION: Quản lý gói đăng ký

**Mô tả**: Người học xem thông tin gói hiện tại, lịch sử thanh toán, và quản lý subscription.

**Priority**: TRUNG BÌNH
**Status**: ❌ Chưa triển khai

**Actors**: Learner

**Preconditions**: Learner đã đăng nhập

**Main Flow**:

1. Learner truy cập "Quản lý gói" hoặc "My Subscription"
2. Hệ thống hiển thị:
   - **Current Subscription**:
     - Tên gói (Free / Premium Monthly / Premium Yearly)
     - Trạng thái: Active / Cancelled / Expired
     - Ngày bắt đầu
     - Ngày hết hạn (nếu có)
     - Auto-renewal status
   - **Entitlements** (quyền lợi):
     - Access premium content: ✓/✗
     - Max question sets/month: X
     - Priority support: ✓/✗
     - Export reports: ✓/✗
   - **Actions**:
     - "Gia hạn" (nếu sắp hết hạn)
     - "Nâng cấp" (nếu đang Free)
     - "Hủy gia hạn tự động" (nếu đang auto-renew)
3. Learner xem **Payment History**:
   - Danh sách các giao dịch
   - Mỗi giao dịch hiển thị:
     - Mã giao dịch
     - Ngày thanh toán
     - Gói dịch vụ
     - Số tiền
     - Trạng thái
     - Link tải hóa đơn
4. Learner có thể:
   - Tải hóa đơn PDF
   - Xem chi tiết giao dịch
   - Liên hệ hỗ trợ (nếu có vấn đề)

**Alternative Flow - Hủy auto-renewal**:

1. Learner nhấn "Hủy gia hạn tự động"
2. Hệ thống hiển thị confirmation dialog:
   - "Bạn có chắc muốn hủy gia hạn tự động?"
   - "Gói Premium sẽ hết hạn vào [date]"
   - "Sau đó, bạn sẽ quay về gói Free"
3. Learner xác nhận
4. Hệ thống:
   - Cập nhật `autoRenew = false`
   - Gửi email xác nhận hủy
   - Hiển thị thông báo thành công
5. Subscription vẫn active đến hết chu kỳ hiện tại

**Postconditions**:

- User hiểu rõ trạng thái subscription
- User có thể quản lý auto-renewal

---

### UC-INVOICE: Tải hóa đơn điện tử

**Mô tả**: Người học tải hóa đơn VAT cho giao dịch đã thanh toán.

**Priority**: TRUNG BÌNH
**Status**: ❌ Chưa triển khai

**Actors**: Learner

**Preconditions**: Có ít nhất 1 giao dịch thành công

**Main Flow**:

1. Learner truy cập Payment History
2. Learner nhấn "Tải hóa đơn" trên một giao dịch
3. Hệ thống:
   - Generate invoice PDF với template
   - Bao gồm:
     - Thông tin công ty Learinal
     - MST: [Company Tax ID]
     - Thông tin khách hàng
     - Chi tiết giao dịch
     - QR code tra cứu
     - Chữ ký điện tử
4. Download PDF về máy

**Alternative Flow**:

- **2a. Chưa có hóa đơn**:
  - Giao dịch mới (< 24h)
  - Hiển thị: "Đang xử lý, vui lòng quay lại sau"
- **2b. Request hóa đơn VAT đầy đủ**:
  - Learner nhấn "Yêu cầu hóa đơn VAT"
  - Điền form: Tên công ty, MST, Địa chỉ
  - Gửi request
  - Admin xử lý thủ công (v1.0)

**Postconditions**: Learner có hóa đơn để báo cáo chi phí

---

## 🖥️ UI Components

### 1. Subscription Plans Page

**Route**: `/subscriptions/plans`
**Layout**: TopbarLayout (có thể no sidebar - landing style)
**Components**:

```
SubscriptionPlans/
├── SubscriptionPlansPage.jsx
├── SubscriptionPlansPage.css
├── index.js
└── components/
    ├── PlanCard.jsx               // Card cho mỗi gói
    ├── PlansGrid.jsx              // Grid layout
    ├── FeatureComparison.jsx      // Bảng so sánh
    ├── PricingToggle.jsx          // Monthly/Yearly toggle
    └── UpgradeButton.jsx          // CTA button
```

**API Endpoints**:

```javascript
// Get all subscription plans
GET /api/subscription-plans
// Response:
{
  "plans": [
    {
      "planId": "plan_free",
      "name": "Free",
      "displayName": "Miễn phí",
      "description": "Dùng thử các tính năng cơ bản",
      "price": 0,
      "billingCycle": "monthly",
      "currency": "VND",
      "isActive": true,
      "features": {
        "accessPremiumContent": false,
        "maxQuestionSetsPerMonth": 5,
        "maxDocumentsPerSubject": 10,
        "prioritySupport": false,
        "exportReports": false,
        "adFree": false
      },
      "badge": null
    },
    {
      "planId": "plan_premium_monthly",
      "name": "Premium Monthly",
      "displayName": "Premium - Tháng",
      "description": "Trải nghiệm đầy đủ tính năng",
      "price": 99000,
      "originalPrice": 99000,
      "billingCycle": "monthly",
      "currency": "VND",
      "isActive": true,
      "features": {
        "accessPremiumContent": true,
        "maxQuestionSetsPerMonth": -1,  // unlimited
        "maxDocumentsPerSubject": -1,
        "prioritySupport": true,
        "exportReports": true,
        "adFree": true
      },
      "badge": "Popular"
    },
    {
      "planId": "plan_premium_yearly",
      "name": "Premium Yearly",
      "displayName": "Premium - Năm",
      "description": "Tiết kiệm hơn khi đăng ký năm",
      "price": 990000,
      "originalPrice": 1188000,
      "discount": 0.17,
      "billingCycle": "yearly",
      "currency": "VND",
      "isActive": true,
      "features": {
        "accessPremiumContent": true,
        "maxQuestionSetsPerMonth": -1,
        "maxDocumentsPerSubject": -1,
        "prioritySupport": true,
        "exportReports": true,
        "adFree": true
      },
      "badge": "Best Value"
    }
  ]
}
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────────┐
│              🎓 Chọn gói phù hợp với bạn                   │
│                                                              │
│              [ Tháng ]  [ Năm ] ← Toggle                    │
│                                                              │
│ ┌──────────┐  ┌──────────────┐  ┌──────────────┐          │
│ │   Free   │  │  Premium     │  │  Premium     │          │
│ │          │  │ ⭐ Popular   │  │ 💎 Best Value│          │
│ ├──────────┤  ├──────────────┤  ├──────────────┤          │
│ │          │  │              │  │              │          │
│ │ 0 VNĐ    │  │ 99,000 VNĐ   │  │ 990,000 VNĐ  │          │
│ │ /tháng   │  │ /tháng       │  │ /năm         │          │
│ │          │  │              │  │ 82,500/tháng │          │
│ │          │  │              │  │ Tiết kiệm 17%│          │
│ ├──────────┤  ├──────────────┤  ├──────────────┤          │
│ │          │  │              │  │              │          │
│ │ ✗ Premium│  │ ✓ Premium    │  │ ✓ Premium    │          │
│ │   content│  │   content    │  │   content    │          │
│ │ 5 đề/    │  │ ∞ Unlimited  │  │ ∞ Unlimited  │          │
│ │   tháng  │  │   đề thi     │  │   đề thi     │          │
│ │ 10 tài   │  │ ∞ Unlimited  │  │ ∞ Unlimited  │          │
│ │   liệu   │  │   tài liệu   │  │   tài liệu   │          │
│ │ ✗ Hỗ trợ │  │ ✓ Ưu tiên    │  │ ✓ Ưu tiên    │          │
│ │   ưu tiên│  │   hỗ trợ     │  │   hỗ trợ     │          │
│ │ ✗ Export │  │ ✓ Export     │  │ ✓ Export     │          │
│ │          │  │              │  │ + Ưu đãi đặc │          │
│ │          │  │              │  │   biệt       │          │
│ │          │  │              │  │              │          │
│ │ [Hiện tại│  │ [Chọn gói]   │  │ [Chọn gói]   │          │
│ │  dùng]   │  │              │  │              │          │
│ └──────────┘  └──────────────┘  └──────────────┘          │
│                                                              │
│ 📊 So sánh chi tiết các gói                                │
│ [Xem bảng so sánh đầy đủ ▼]                                │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Payment Page (Sepay Integration)

**Route**: `/subscriptions/checkout/:planId`
**Layout**: Minimal layout (focus on payment)
**Components**:

```
Checkout/
├── CheckoutPage.jsx
├── CheckoutPage.css
├── index.js
└── components/
    ├── OrderSummary.jsx           // Tóm tắt đơn hàng
    ├── UserInfoForm.jsx           // Thông tin người dùng
    ├── PaymentMethodSelector.jsx  // Chọn phương thức
    ├── SepayQRCode.jsx            // QR code Sepay
    ├── PaymentStatus.jsx          // Polling status
    └── SuccessModal.jsx           // Thành công
```

**API Endpoints**:

```javascript
// Create payment intent
POST /api/payments/create-intent
{
  "planId": "plan_premium_monthly",
  "billingInfo": {
    "fullName": "Nguyen Van A",
    "email": "a@example.com",
    "phone": "0901234567"
  }
}
// Response:
{
  "paymentIntentId": "pi_123",
  "amount": 99000,
  "currency": "VND",
  "status": "pending",
  "qrCodeUrl": "https://sepay.vn/qr/...",
  "transferInfo": {
    "bankName": "Vietcombank",
    "accountNumber": "1234567890",
    "accountName": "CONG TY LEARINAL",
    "content": "LEARINAL pi_123"
  },
  "expiresAt": "2025-11-06T11:15:00Z"
}

// Check payment status (polling)
GET /api/payments/:paymentIntentId/status
// Response:
{
  "paymentIntentId": "pi_123",
  "status": "completed",  // pending, completed, failed, expired, cancelled
  "paidAt": "2025-11-06T11:05:00Z",
  "subscription": {
    "subscriptionId": "sub_789",
    "status": "Active",
    "currentPeriodEnd": "2025-12-06"
  }
}

// Cancel payment
POST /api/payments/:paymentIntentId/cancel
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────┐
│ ← Quay lại              Thanh toán                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌───────────────────┐  ┌───────────────────────────┐  │
│ │ Thông tin đơn hàng│  │ Phương thức thanh toán    │  │
│ ├───────────────────┤  ├───────────────────────────┤  │
│ │                   │  │                           │  │
│ │ Premium Monthly   │  │ 🏦 Chuyển khoản ngân hàng │  │
│ │ 99,000 VNĐ/tháng  │  │                           │  │
│ │                   │  │ Quét mã QR để thanh toán: │  │
│ │ Giảm giá: 0 VNĐ   │  │                           │  │
│ │ ─────────────────│  │   ┌───────────────┐       │  │
│ │ Tổng: 99,000 VNĐ  │  │   │               │       │  │
│ │                   │  │   │  [QR CODE]    │       │  │
│ │                   │  │   │               │       │  │
│ │ Thông tin:        │  │   └───────────────┘       │  │
│ │ • Nguyễn Văn A    │  │                           │  │
│ │ • a@example.com   │  │ Hoặc chuyển khoản:        │  │
│ │ • 0901234567      │  │ • Ngân hàng: Vietcombank  │  │
│ │                   │  │ • STK: 1234567890         │  │
│ │                   │  │ • Chủ TK: CONG TY LEARINAL│  │
│ │                   │  │ • Nội dung: LEARINAL pi_123│  │
│ │                   │  │                           │  │
│ │                   │  │ ⏱️ Hết hạn sau: 14:23     │  │
│ │                   │  │                           │  │
│ │                   │  │ 🔄 Đang chờ thanh toán... │  │
│ └───────────────────┘  └───────────────────────────┘  │
│                                                          │
│ 🔒 Thanh toán an toàn với Sepay                        │
└─────────────────────────────────────────────────────────┘

[Success Modal:]
┌─────────────────────────────────────┐
│       ✅ Thanh toán thành công      │
├─────────────────────────────────────┤
│                                      │
│  Gói Premium đã được kích hoạt!     │
│                                      │
│  • Số tiền: 99,000 VNĐ              │
│  • Gói: Premium Monthly              │
│  • Có hiệu lực đến: 06/12/2025      │
│                                      │
│  Email xác nhận đã được gửi.        │
│                                      │
│  Chuyển hướng sau 3 giây...         │
│                                      │
│        [Về Dashboard]                │
└─────────────────────────────────────┘
```

---

### 3. My Subscription Page

**Route**: `/subscriptions/my`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
MySubscription/
├── MySubscriptionPage.jsx
├── MySubscriptionPage.css
├── index.js
└── components/
    ├── CurrentPlanCard.jsx        // Gói hiện tại
    ├── EntitlementsTable.jsx      // Quyền lợi
    ├── PaymentHistoryTable.jsx    // Lịch sử
    ├── RenewalSettings.jsx        // Cài đặt gia hạn
    ├── CancelModal.jsx            // Hủy auto-renew
    └── InvoiceDownloadButton.jsx  // Tải hóa đơn
```

**API Endpoints**:

```javascript
// Get my subscription
GET /api/subscriptions/me
// Response:
{
  "subscriptionId": "sub_789",
  "planId": "plan_premium_monthly",
  "planName": "Premium Monthly",
  "status": "Active",  // Active, Cancelled, Expired
  "startDate": "2025-11-06",
  "currentPeriodStart": "2025-11-06",
  "currentPeriodEnd": "2025-12-06",
  "autoRenew": true,
  "cancelledAt": null,
  "entitlements": {
    "accessPremiumContent": true,
    "maxQuestionSetsPerMonth": -1,
    "maxDocumentsPerSubject": -1,
    "prioritySupport": true,
    "exportReports": true
  }
}

// Get payment history
GET /api/payments/my-history
// Response:
{
  "payments": [
    {
      "paymentId": "pay_001",
      "paymentIntentId": "pi_123",
      "amount": 99000,
      "currency": "VND",
      "status": "Completed",
      "planName": "Premium Monthly",
      "paidAt": "2025-11-06T11:05:00Z",
      "invoiceUrl": "/api/invoices/inv_001/download"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 3 }
}

// Cancel auto-renewal
POST /api/subscriptions/:subscriptionId/cancel-renewal
// Response:
{
  "subscriptionId": "sub_789",
  "autoRenew": false,
  "willExpireAt": "2025-12-06"
}

// Reactivate auto-renewal
POST /api/subscriptions/:subscriptionId/reactivate-renewal
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────┐
│ 💳 Quản lý gói đăng ký                                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ 🎯 Gói hiện tại: Premium Monthly                │    │
│ ├─────────────────────────────────────────────────┤    │
│ │ Trạng thái: ✅ Đang hoạt động                   │    │
│ │ Ngày bắt đầu: 06/11/2025                        │    │
│ │ Hết hạn: 06/12/2025                             │    │
│ │ Gia hạn tự động: ✓ Bật                          │    │
│ │                                                  │    │
│ │ [Nâng cấp lên Yearly]  [Hủy gia hạn tự động]   │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ 📋 Quyền lợi của bạn                                   │
│ ┌─────────────────────────────────────────────────┐    │
│ │ ✓ Truy cập nội dung Premium                     │    │
│ │ ✓ Tạo không giới hạn bộ đề                      │    │
│ │ ✓ Upload không giới hạn tài liệu                │    │
│ │ ✓ Hỗ trợ ưu tiên                                │    │
│ │ ✓ Xuất báo cáo PDF                              │    │
│ │ ✓ Không quảng cáo                               │    │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ 📜 Lịch sử thanh toán                                  │
│ ┌─────────────────────────────────────────────────┐    │
│ │ Ngày       │ Gói            │ Số tiền   │ Hóa đơn│   │
│ ├────────────┼────────────────┼───────────┼────────┤   │
│ │ 06/11/2025 │ Premium Monthly│ 99,000 VNĐ│ [📥]  │   │
│ │ 06/10/2025 │ Premium Monthly│ 99,000 VNĐ│ [📥]  │   │
│ │ 06/09/2025 │ Premium Monthly│ 99,000 VNĐ│ [📥]  │   │
│ └─────────────────────────────────────────────────┘    │
│                                                          │
│ 💡 Tip: Chuyển sang gói Yearly để tiết kiệm 17%!       │
└─────────────────────────────────────────────────────────┘
```

---

## 📡 API Services

### subscriptions.service.js

```javascript
/**
 * Subscriptions Service
 * API for subscription plans and management
 */

import axiosInstance from "./axios.config";

const BASE_PATH = "/subscription-plans";
const SUB_PATH = "/subscriptions";

export const subscriptionsService = {
  /**
   * Get all available subscription plans
   * @returns {Promise<Object>}
   */
  getPlans: async () => {
    const { data } = await axiosInstance.get(BASE_PATH);
    return data;
  },

  /**
   * Get my current subscription
   * @returns {Promise<Object>}
   */
  getMy: async () => {
    const { data } = await axiosInstance.get(`${SUB_PATH}/me`);
    return data;
  },

  /**
   * Cancel auto-renewal
   * @param {string} subscriptionId
   * @returns {Promise<Object>}
   */
  cancelRenewal: async (subscriptionId) => {
    const { data } = await axiosInstance.post(`${SUB_PATH}/${subscriptionId}/cancel-renewal`);
    return data;
  },

  /**
   * Reactivate auto-renewal
   * @param {string} subscriptionId
   * @returns {Promise<Object>}
   */
  reactivateRenewal: async (subscriptionId) => {
    const { data } = await axiosInstance.post(`${SUB_PATH}/${subscriptionId}/reactivate-renewal`);
    return data;
  },
};
```

### payments.service.js

```javascript
/**
 * Payments Service
 * API for payment processing (Sepay integration)
 */

import axiosInstance from "./axios.config";

const BASE_PATH = "/payments";

export const paymentsService = {
  /**
   * Create payment intent
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  createIntent: async (payload) => {
    const { data } = await axiosInstance.post(`${BASE_PATH}/create-intent`, payload);
    return data;
  },

  /**
   * Check payment status (for polling)
   * @param {string} paymentIntentId
   * @returns {Promise<Object>}
   */
  checkStatus: async (paymentIntentId) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/${paymentIntentId}/status`);
    return data;
  },

  /**
   * Cancel payment
   * @param {string} paymentIntentId
   * @returns {Promise<Object>}
   */
  cancel: async (paymentIntentId) => {
    const { data } = await axiosInstance.post(`${BASE_PATH}/${paymentIntentId}/cancel`);
    return data;
  },

  /**
   * Get my payment history
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  getHistory: async (params = {}) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/my-history`, { params });
    return data;
  },
};
```

### invoices.service.js

```javascript
/**
 * Invoices Service
 * API for invoice generation and download
 */

import axiosInstance from "./axios.config";

const BASE_PATH = "/invoices";

export const invoicesService = {
  /**
   * Download invoice PDF
   * @param {string} invoiceId
   * @returns {Promise<Blob>}
   */
  download: async (invoiceId) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/${invoiceId}/download`, {
      responseType: "blob",
    });
    return data;
  },

  /**
   * Request VAT invoice (for company)
   * @param {string} paymentId
   * @param {Object} companyInfo
   * @returns {Promise<Object>}
   */
  requestVATInvoice: async (paymentId, companyInfo) => {
    const { data } = await axiosInstance.post(`${BASE_PATH}/request-vat`, {
      paymentId,
      ...companyInfo,
    });
    return data;
  },
};
```

---

## ✅ Implementation Checklist

### Phase 1: Subscription Plans Display (Sprint 5)

- [ ] **Setup Routes**

  - [ ] `/subscriptions/plans`
  - [ ] Add CTA buttons trong app (navbar, dashboard, etc.)

- [ ] **Create API Services**

  - [ ] `subscriptions.service.js`
  - [ ] All methods implemented

- [ ] **Subscription Plans Page**
  - [ ] PlanCard component (responsive)
  - [ ] PlansGrid layout
  - [ ] PricingToggle (Monthly/Yearly)
  - [ ] FeatureComparison table
  - [ ] Handle plan selection
  - [ ] Redirect to checkout

### Phase 2: Payment Integration (Sprint 5-6)

- [ ] **Sepay Integration**

  - [ ] Research Sepay API docs
  - [ ] Setup Sepay credentials
  - [ ] Implement webhook handler (backend)
  - [ ] Test webhook signature verification

- [ ] **Create API Services**

  - [ ] `payments.service.js`

- [ ] **Checkout Page**
  - [ ] OrderSummary component
  - [ ] UserInfoForm with validation
  - [ ] PaymentMethodSelector
  - [ ] SepayQRCode display
  - [ ] Payment status polling (every 3s)
  - [ ] Handle success/failure
  - [ ] SuccessModal with redirect

### Phase 3: Subscription Management (Sprint 6)

- [ ] **My Subscription Page**

  - [ ] `/subscriptions/my` route
  - [ ] CurrentPlanCard component
  - [ ] EntitlementsTable
  - [ ] PaymentHistoryTable
  - [ ] RenewalSettings
  - [ ] Cancel renewal flow
  - [ ] Reactivate renewal flow
  - [ ] CancelModal with confirmation

- [ ] **Invoice Features**
  - [ ] `invoices.service.js`
  - [ ] InvoiceDownloadButton
  - [ ] Generate PDF template (backend)
  - [ ] Download invoice
  - [ ] Request VAT invoice form (future)

### Phase 4: Testing & Edge Cases

- [ ] **Payment Flow Testing**

  - [ ] Test successful payment
  - [ ] Test failed payment
  - [ ] Test timeout/expiry
  - [ ] Test user cancellation
  - [ ] Test webhook failures

- [ ] **Subscription Logic Testing**

  - [ ] Test auto-renewal
  - [ ] Test cancellation
  - [ ] Test reactivation
  - [ ] Test subscription expiry
  - [ ] Test entitlements enforcement

- [ ] **UX Improvements**
  - [ ] Loading states
  - [ ] Error handling
  - [ ] Success messages
  - [ ] Confirm dialogs
  - [ ] Responsive design

---

## 🔗 Related Use Cases

- **UC-003**: Check entitlements before upload
- **UC-005**: Check quota before generating questions
- **UC-013**: Premium question sets
- **UC-021**: Thông báo khi subscription sắp hết hạn

---

## 📊 Success Metrics

- Conversion rate (Free → Premium) > 5%
- Payment success rate > 95%
- Average time to complete payment < 3 phút
- Churn rate < 10%/tháng
- Yearly plan adoption > 30%

---

## 📝 Notes

### Sepay Webhook Security

```javascript
// Backend: Verify Sepay webhook signature
const crypto = require("crypto");

function verifySepayWebhook(payload, signature, secret) {
  const hash = crypto.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex");

  return hash === signature;
}

// Express route
app.post("/webhooks/sepay", (req, res) => {
  const signature = req.headers["x-sepay-signature"];
  const isValid = verifySepayWebhook(req.body, signature, SEPAY_SECRET);

  if (!isValid) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Process webhook...
  const { paymentIntentId, status, amount } = req.body;

  if (status === "success") {
    // Activate subscription
  }

  res.status(200).json({ received: true });
});
```

### Payment Status Polling

```javascript
// Frontend: Poll payment status
const usePaymentPolling = (paymentIntentId) => {
  const [status, setStatus] = useState("pending");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!paymentIntentId || status !== "pending") return;

    const interval = setInterval(async () => {
      try {
        const result = await paymentsService.checkStatus(paymentIntentId);
        setStatus(result.status);

        if (result.status !== "pending") {
          clearInterval(interval);
        }

        setAttempts((prev) => prev + 1);

        // Stop after 5 minutes (100 attempts × 3s)
        if (attempts > 100) {
          clearInterval(interval);
          setStatus("timeout");
        }
      } catch (error) {
        console.error("Poll error:", error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [paymentIntentId, status, attempts]);

  return { status };
};
```

### Subscription Entitlements Check

```javascript
// Check entitlements before action
const checkEntitlement = (user, feature) => {
  const { subscriptionStatus, entitlements } = user;

  if (subscriptionStatus !== "Active") {
    return { allowed: false, reason: "No active subscription" };
  }

  const isAllowed = entitlements[feature];

  if (feature === "maxQuestionSetsPerMonth") {
    const limit = entitlements[feature];
    if (limit === -1) return { allowed: true }; // Unlimited

    // Check usage this month
    const usage = getUserUsageThisMonth(user.id, "questionSets");
    if (usage >= limit) {
      return { allowed: false, reason: `Limit reached: ${limit}/month` };
    }
  }

  return { allowed: isAllowed };
};

// Usage in component
const handleGenerateQuestions = async () => {
  const check = checkEntitlement(user, "maxQuestionSetsPerMonth");

  if (!check.allowed) {
    showUpgradeModal(check.reason);
    return;
  }

  // Proceed...
};
```

### Discount Calculation

```javascript
// Calculate discount for yearly plan
const calculateYearlyDiscount = (monthlyPrice) => {
  const yearlyFullPrice = monthlyPrice * 12;
  const yearlyPrice = Math.round(monthlyPrice * 12 * 0.83); // 17% off
  const discount = yearlyFullPrice - yearlyPrice;
  const discountPercent = 0.17;

  return {
    yearlyPrice,
    yearlyFullPrice,
    discount,
    discountPercent,
    monthlyEquivalent: Math.round(yearlyPrice / 12),
  };
};

// Example
const result = calculateYearlyDiscount(99000);
console.log(result);
// {
//   yearlyPrice: 990000,
//   yearlyFullPrice: 1188000,
//   discount: 198000,
//   discountPercent: 0.17,
//   monthlyEquivalent: 82500
// }
```

---

**Status**: Ready for Implementation
**Estimated Effort**: 2-3 sprints
**Dependencies**: Sepay API integration, Subscription backend logic
