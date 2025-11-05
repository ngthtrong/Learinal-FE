# 09 - Tính năng Admin: Quản lý Hệ thống (Phần 1)

**Module**: Admin System Management
**Vai trò**: Quản trị viên (Administrator)
**Priority**: CAO
**Completion**: 0% (0/8 features)

---

## 📋 Tổng quan Module

Module quản lý hệ thống cung cấp công cụ cho Admin để điều phối các hoạt động cốt lõi:

- **UC-015**: Phân công yêu cầu xác thực cho Expert
- **UC-016**: Quản lý người dùng (xem, tìm kiếm, khóa/mở khóa, thay đổi role)
- **UC-017**: Theo dõi doanh thu
- **UC-018**: Quản lý thanh toán cho Expert

Do nội dung nhiều, module Admin được chia thành 2 file:

- **09-ADMIN-SYSTEM-PART1.md** (file này): UC-015, UC-016
- **10-ADMIN-FINANCE.md**: UC-017, UC-018, UC-019, UC-020

---

## 🎯 Use Cases - Part 1

### UC-015: Phân công yêu cầu xác thực

**Mô tả**: Admin tiếp nhận yêu cầu xác thực từ Learner và phân công cho Expert phù hợp dựa trên lĩnh vực chuyên môn.

**Priority**: CAO
**Status**: ❌ Chưa triển khai

**Actors**: Administrator

**Preconditions**:

- Admin đã đăng nhập
- Có ít nhất 1 yêu cầu xác thực ở trạng thái "PendingAssignment" (từ UC-010)

**Main Flow**:

1. Admin truy cập dashboard "Quản lý yêu cầu xác thực"
2. Hệ thống hiển thị danh sách yêu cầu chưa được phân công với thông tin:
   - Tên bộ đề
   - Môn học/Chủ đề
   - Người yêu cầu (Learner)
   - Thời gian yêu cầu
   - Số câu hỏi
   - Priority (nếu có)
3. Admin chọn một yêu cầu, xem chi tiết:
   - Preview bộ câu hỏi
   - Thông tin môn học
   - Yêu cầu đặc biệt (nếu có)
4. Dựa trên thông tin đó, hệ thống gợi ý danh sách Expert phù hợp:
   - Chuyên môn khớp với môn học
   - Số yêu cầu đang xử lý (workload)
   - Tỷ lệ phê duyệt
   - Thời gian phản hồi trung bình
5. Admin chọn một Expert và nhấn "Phân công"
6. Hệ thống:
   - Cập nhật status yêu cầu → "Assigned"
   - Gán `expertId` cho yêu cầu
   - Gửi thông báo cho Expert được chọn
   - Ghi log hành động

**Alternative Flow**:

- **4a. Không có Expert phù hợp**:

  1. Admin có thể chọn Expert thủ công từ danh sách tất cả Expert
  2. Hoặc đánh dấu "Cần tuyển Expert" và để pending

- **5a. Expert từ chối**:
  1. Expert có thể từ chối yêu cầu với lý do
  2. Yêu cầu quay về trạng thái "PendingAssignment"
  3. Admin nhận thông báo và cần phân công lại

**Postconditions**:

- Yêu cầu xác thực được chuyển đến hàng đợi làm việc của Expert
- Expert sẵn sàng xử lý (UC-012)

---

### UC-016: Quản lý Người dùng

**Mô tả**: Admin có khả năng xem, tìm kiếm, và quản lý tất cả tài khoản người dùng (Learner, Expert).

**Priority**: CAO
**Status**: ❌ Chưa triển khai

**Actors**: Administrator

**Preconditions**: Admin đã đăng nhập

**Main Flow**:

1. Admin truy cập "Quản lý Người dùng"
2. Hệ thống hiển thị danh sách tất cả người dùng với:
   - Email
   - Họ tên
   - Vai trò (Role)
   - Trạng thái (Status)
   - Ngày tham gia
   - Gói đăng ký hiện tại
   - Phân trang (20 users/page)
3. Admin có thể:
   - **Tìm kiếm**: theo email, tên
   - **Lọc**: theo role, status, subscription plan
   - **Sắp xếp**: theo ngày tham gia, tên, email
4. Admin có thể thực hiện các hành động trên một hoặc nhiều tài khoản:
   - **Xem chi tiết**: Thông tin đầy đủ, lịch sử hoạt động
   - **Vô hiệu hóa/Kích hoạt lại**: Thay đổi status
   - **Thay đổi vai trò**: Nâng cấp Learner → Expert
   - **Reset mật khẩu**: Gửi link reset cho user
   - **Xóa tài khoản**: Xóa vĩnh viễn (cần xác nhận)

**Postconditions**:

- Thông tin hoặc trạng thái tài khoản được cập nhật
- Hành động được ghi vào audit log

**Notes**:

- Hành động thay đổi role hoặc status cần được ghi lại trong audit log
- Xóa tài khoản cần xác nhận 2 lần và ghi lý do

---

## 🖥️ UI Components

### 1. Admin Dashboard Page

**Route**: `/admin/dashboard`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
AdminDashboard/
├── AdminDashboardPage.jsx
├── AdminDashboardPage.css
├── index.js
└── components/
    ├── SystemStats.jsx            // Thống kê tổng quan
    ├── PendingRequestsWidget.jsx  // Yêu cầu chờ phân công
    ├── RecentActivities.jsx       // Hoạt động gần đây
    ├── RevenueChart.jsx           // Biểu đồ doanh thu
    └── QuickActions.jsx           // Quick action buttons
```

**API Endpoints**:

```javascript
GET /api/admin/dashboard/stats
// Response:
{
  "totalUsers": 1250,
  "activeUsers": 980,
  "totalExperts": 45,
  "pendingValidations": 23,
  "thisMonthRevenue": 150000000,
  "thisMonthNewUsers": 125,
  "thisMonthCompletedValidations": 89,
  "systemHealth": "good" // good, warning, critical
}
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────┐
│ 🎛️ Admin Dashboard                                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│ │ Users  │ │ Experts│ │ Pending│ │ Revenue│           │
│ │ 1,250  │ │   45   │ │   23   │ │ 150M ₫ │           │
│ └────────┘ └────────┘ └────────┘ └────────┘           │
│                                                          │
│ 📊 Doanh thu tháng                                      │
│ [Revenue Chart Component]                               │
│                                                          │
│ ⏳ Yêu cầu chờ phân công (23)          [Xem tất cả →]  │
│ ┌────────────────────────────────────────────────┐     │
│ │ • Toán cao cấp A1 | Nguyễn A | 2h         [>] │     │
│ │ • Vật lý đại cương | Trần B | 5h          [>] │     │
│ │ • Hóa học hữu cơ | Lê C | 1 ngày         [>] │     │
│ └────────────────────────────────────────────────┘     │
│                                                          │
│ 🔔 Hoạt động gần đây                                   │
│ • Admin123 phân công yêu cầu #VAL-456 - 10 phút       │
│ • Expert_NguyenX phê duyệt bộ đề #SET-789 - 1h        │
│ • User premium mới: user@example.com - 2h              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Validation Requests Management Page

**Route**: `/admin/validation-requests`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
ValidationRequestsManagement/
├── ValidationRequestsManagementPage.jsx
├── ValidationRequestsManagementPage.css
├── index.js
└── components/
    ├── RequestsTable.jsx          // Bảng danh sách
    ├── RequestFilters.jsx         // Bộ lọc
    ├── AssignExpertModal.jsx      // Modal phân công
    ├── ExpertSuggestions.jsx      // Gợi ý Expert
    └── RequestPreview.jsx         // Preview bộ đề
```

**API Endpoints**:

```javascript
// Get all validation requests
GET /api/admin/validation-requests?status={status}&page={n}
// Response:
{
  "data": [
    {
      "requestId": "req_001",
      "setId": "set_123",
      "setTitle": "Toán cao cấp A1",
      "subjectName": "Toán học",
      "learnerId": "user_456",
      "learnerName": "Nguyễn Văn A",
      "questionCount": 20,
      "requestTime": "2025-11-05T10:00:00Z",
      "status": "PendingAssignment", // Assigned, Completed
      "expertId": null,
      "expertName": null
    }
  ],
  "meta": { "page": 1, "totalItems": 23, "totalPages": 3 }
}

// Get suggested experts for a request
GET /api/admin/validation-requests/:requestId/suggest-experts
// Response:
{
  "suggestions": [
    {
      "expertId": "exp_001",
      "fullName": "TS. Nguyễn Văn X",
      "email": "expert@example.com",
      "expertise": ["Toán học", "Giải tích"],
      "currentWorkload": 3,          // Số yêu cầu đang xử lý
      "avgResponseTime": "2 ngày",   // Thời gian xử lý TB
      "approvalRate": 0.92,          // 92% approval rate
      "completedValidations": 45,
      "matchScore": 0.95             // 0-1, độ phù hợp
    },
    {
      "expertId": "exp_002",
      "fullName": "PGS. Trần Y",
      "matchScore": 0.87,
      // ...
    }
  ]
}

// Assign request to expert
POST /api/admin/validation-requests/:requestId/assign
{
  "expertId": "exp_001",
  "note": "Chuyên gia phù hợp nhất"  // Optional
}

// Reassign request (if expert rejected)
POST /api/admin/validation-requests/:requestId/reassign
{
  "expertId": "exp_002",
  "reason": "Expert trước từ chối"
}
```

**Features**:

**Requests Table**:

- Columns: Request ID, Bộ đề, Môn học, Người yêu cầu, Số câu, Thời gian, Status, Expert, Actions
- Color coding by status:
  - PendingAssignment: Yellow
  - Assigned: Blue
  - Completed: Green
- Actions per row:
  - Preview bộ đề
  - Phân công (if pending)
  - Xem chi tiết
  - Reassign (if assigned)

**Filters**:

- Status: All, Pending, Assigned, Completed
- Subject filter
- Date range
- Search by learner name, set title

**Assign Expert Modal**:

```
┌─────────────────────────────────────────────────┐
│ Phân công Chuyên gia                      [×]  │
├─────────────────────────────────────────────────┤
│ Bộ đề: Toán cao cấp A1                         │
│ Môn học: Toán học                               │
│ Số câu hỏi: 20                                  │
│                                                  │
│ Chuyên gia được gợi ý:                         │
│ ┌─────────────────────────────────────────┐    │
│ │ ○ TS. Nguyễn Văn X  (Khớp: 95%)       │    │
│ │   • Chuyên môn: Toán, Giải tích        │    │
│ │   • Đang xử lý: 3 yêu cầu              │    │
│ │   • Tỷ lệ duyệt: 92%                   │    │
│ │                                          │    │
│ │ ○ PGS. Trần Y  (Khớp: 87%)            │    │
│ │   • Chuyên môn: Toán, Đại số           │    │
│ │   • Đang xử lý: 5 yêu cầu              │    │
│ │   • Tỷ lệ duyệt: 88%                   │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ Hoặc chọn thủ công: [Chọn Expert ▼]           │
│                                                  │
│ Ghi chú (optional):                             │
│ ┌─────────────────────────────────────────┐    │
│ │                                          │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│        [Hủy]           [Phân công]             │
└─────────────────────────────────────────────────┘
```

---

### 3. User Management Page

**Route**: `/admin/users`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
UserManagement/
├── UserManagementPage.jsx
├── UserManagementPage.css
├── index.js
└── components/
    ├── UsersTable.jsx             // Bảng danh sách users
    ├── UserFilters.jsx            // Bộ lọc
    ├── UserDetailsModal.jsx       // Modal chi tiết user
    ├── ChangeRoleModal.jsx        // Modal đổi role
    ├── DeactivateUserModal.jsx    // Modal vô hiệu hóa
    └── DeleteUserModal.jsx        // Modal xóa user
```

**API Endpoints**:

```javascript
// Get all users
GET /api/admin/users?role={role}&status={status}&plan={plan}&page={n}&search={query}
// Response:
{
  "data": [
    {
      "userId": "user_001",
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "Learner",              // Learner, Expert, Admin
      "status": "Active",             // Active, Deactivated, PendingActivation
      "subscriptionPlan": "Premium",  // Free, Premium, etc.
      "subscriptionStatus": "Active",
      "createdAt": "2025-01-15T10:00:00Z",
      "lastLoginAt": "2025-11-05T08:30:00Z"
    }
  ],
  "meta": { "page": 1, "totalItems": 1250, "totalPages": 63 }
}

// Get user details
GET /api/admin/users/:userId
// Response:
{
  "userId": "user_001",
  "email": "user@example.com",
  "fullName": "Nguyễn Văn A",
  "role": "Learner",
  "status": "Active",
  "subscriptionPlan": "Premium",
  "subscriptionStatus": "Active",
  "subscriptionRenewalDate": "2025-12-15",
  "createdAt": "2025-01-15T10:00:00Z",
  "lastLoginAt": "2025-11-05T08:30:00Z",
  "stats": {
    "totalSubjects": 5,
    "totalDocuments": 23,
    "totalQuestionSets": 12,
    "totalQuizAttempts": 145
  },
  "recentActivities": [
    {
      "action": "Uploaded document",
      "details": "Toán cao cấp - Chapter 1.pdf",
      "timestamp": "2025-11-05T10:00:00Z"
    }
  ]
}

// Update user role
PATCH /api/admin/users/:userId/role
{
  "newRole": "Expert",
  "reason": "User có chuyên môn cao"
}

// Deactivate/Activate user
PATCH /api/admin/users/:userId/status
{
  "status": "Deactivated",  // or "Active"
  "reason": "Vi phạm điều khoản"
}

// Delete user (permanent)
DELETE /api/admin/users/:userId
{
  "reason": "Yêu cầu của user",
  "confirmEmail": "user@example.com"  // Must match
}

// Reset user password
POST /api/admin/users/:userId/reset-password
// Sends reset link to user's email
```

**Features**:

**Users Table**:

- Columns: Email, Tên, Role, Status, Plan, Ngày tham gia, Last Login, Actions
- Sortable columns
- Row selection (checkbox) for bulk actions
- Color coding:
  - Active: Green badge
  - Deactivated: Red badge
  - PendingActivation: Yellow badge
- Actions per row:
  - Xem chi tiết
  - Đổi role
  - Vô hiệu hóa/Kích hoạt
  - Reset mật khẩu
  - Xóa

**Filters**:

- Role: All, Learner, Expert, Admin
- Status: All, Active, Deactivated, PendingActivation
- Subscription Plan: All, Free, Premium
- Search: Email, Name
- Date joined: Date range

**Bulk Actions** (on selected users):

- Deactivate selected
- Activate selected
- Export selected (CSV)

**User Details Modal**:

```
┌─────────────────────────────────────────────────┐
│ Chi tiết Người dùng                       [×]  │
├─────────────────────────────────────────────────┤
│ 👤 Nguyễn Văn A                                │
│ ✉️ user@example.com                             │
│                                                  │
│ Thông tin cơ bản:                              │
│ • Vai trò: Learner                             │
│ • Trạng thái: ✅ Active                        │
│ • Gói: Premium (Active)                        │
│ • Ngày gia nhập: 15/01/2025                    │
│ • Đăng nhập gần nhất: 05/11/2025 08:30        │
│                                                  │
│ Thống kê hoạt động:                            │
│ • 5 môn học                                     │
│ • 23 tài liệu                                   │
│ • 12 bộ câu hỏi                                │
│ • 145 lượt làm bài                             │
│                                                  │
│ Hoạt động gần đây:                             │
│ • Upload tài liệu "..." - 2h trước            │
│ • Tạo bộ đề "..." - 1 ngày trước              │
│                                                  │
│ [Đổi Role] [Vô hiệu hóa] [Reset PW] [Xóa]    │
└─────────────────────────────────────────────────┘
```

**Change Role Modal**:

```
┌─────────────────────────────────────────────────┐
│ Thay đổi Vai trò                          [×]  │
├─────────────────────────────────────────────────┤
│ User: Nguyễn Văn A (user@example.com)          │
│                                                  │
│ Vai trò hiện tại: Learner                      │
│ Vai trò mới: [Expert ▼]                        │
│                                                  │
│ Lý do thay đổi:                                │
│ ┌─────────────────────────────────────────┐    │
│ │ User có chuyên môn về Toán học          │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ ⚠️ Thay đổi này sẽ:                            │
│ • Cấp quyền Expert cho user                    │
│ • Cho phép nhận yêu cầu kiểm duyệt            │
│ • Được ghi vào audit log                       │
│                                                  │
│        [Hủy]           [Xác nhận]              │
└─────────────────────────────────────────────────┘
```

**Deactivate User Modal**:

```
┌─────────────────────────────────────────────────┐
│ Vô hiệu hóa Tài khoản                     [×]  │
├─────────────────────────────────────────────────┤
│ ⚠️ Bạn có chắc muốn vô hiệu hóa tài khoản?    │
│                                                  │
│ User: Nguyễn Văn A                             │
│ Email: user@example.com                         │
│                                                  │
│ Lý do:                                          │
│ ┌─────────────────────────────────────────┐    │
│ │ Vi phạm điều khoản sử dụng             │    │
│ └─────────────────────────────────────────┘    │
│                                                  │
│ Sau khi vô hiệu hóa:                           │
│ • User không thể đăng nhập                    │
│ • Dữ liệu vẫn được giữ lại                   │
│ • Có thể kích hoạt lại sau                    │
│                                                  │
│        [Hủy]           [Vô hiệu hóa]          │
└─────────────────────────────────────────────────┘
```

---

## 📡 API Services

### adminValidation.service.js

```javascript
/**
 * Admin Validation Service
 * API for admin validation request management
 */

import axiosInstance from "./axios.config";

const BASE_PATH = "/admin/validation-requests";

export const adminValidationService = {
  /**
   * Get all validation requests
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  getAll: async (params = {}) => {
    const { data } = await axiosInstance.get(BASE_PATH, { params });
    return data;
  },

  /**
   * Get request details
   * @param {string} requestId
   * @returns {Promise<Object>}
   */
  getDetails: async (requestId) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/${requestId}`);
    return data;
  },

  /**
   * Get suggested experts for request
   * @param {string} requestId
   * @returns {Promise<Object>}
   */
  getSuggestedExperts: async (requestId) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/${requestId}/suggest-experts`);
    return data;
  },

  /**
   * Assign request to expert
   * @param {string} requestId
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  assign: async (requestId, payload) => {
    const { data } = await axiosInstance.post(`${BASE_PATH}/${requestId}/assign`, payload);
    return data;
  },

  /**
   * Reassign request
   * @param {string} requestId
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  reassign: async (requestId, payload) => {
    const { data } = await axiosInstance.post(`${BASE_PATH}/${requestId}/reassign`, payload);
    return data;
  },
};
```

### adminUsers.service.js

```javascript
/**
 * Admin Users Service
 * API for user management
 */

import axiosInstance from "./axios.config";

const BASE_PATH = "/admin/users";

export const adminUsersService = {
  /**
   * Get all users
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  getAll: async (params = {}) => {
    const { data } = await axiosInstance.get(BASE_PATH, { params });
    return data;
  },

  /**
   * Get user details
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  getDetails: async (userId) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/${userId}`);
    return data;
  },

  /**
   * Update user role
   * @param {string} userId
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  updateRole: async (userId, payload) => {
    const { data } = await axiosInstance.patch(`${BASE_PATH}/${userId}/role`, payload);
    return data;
  },

  /**
   * Update user status
   * @param {string} userId
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  updateStatus: async (userId, payload) => {
    const { data } = await axiosInstance.patch(`${BASE_PATH}/${userId}/status`, payload);
    return data;
  },

  /**
   * Delete user
   * @param {string} userId
   * @param {Object} payload
   * @returns {Promise<void>}
   */
  deleteUser: async (userId, payload) => {
    await axiosInstance.delete(`${BASE_PATH}/${userId}`, { data: payload });
  },

  /**
   * Reset user password
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  resetPassword: async (userId) => {
    const { data } = await axiosInstance.post(`${BASE_PATH}/${userId}/reset-password`);
    return data;
  },
};
```

---

## ✅ Implementation Checklist

### Phase 1: Admin Dashboard (Sprint 6)

- [ ] **Setup Routes**

  - [ ] Add `/admin/dashboard` route
  - [ ] Add `/admin/validation-requests` route
  - [ ] Add `/admin/users` route
  - [ ] Add ProtectedRoute với role `Admin`

- [ ] **Create API Services**

  - [ ] `adminValidation.service.js`
  - [ ] `adminUsers.service.js`

- [ ] **Admin Dashboard Page**
  - [ ] SystemStats component
  - [ ] PendingRequestsWidget
  - [ ] RecentActivities
  - [ ] RevenueChart (simple version)
  - [ ] QuickActions
  - [ ] Loading/error states

### Phase 2: Validation Requests Management (Sprint 6)

- [ ] **Validation Requests Page**

  - [ ] RequestsTable component
  - [ ] RequestFilters component
  - [ ] Pagination
  - [ ] Loading skeleton
  - [ ] Empty state

- [ ] **Assign Expert Modal**

  - [ ] ExpertSuggestions component
  - [ ] Display match score, workload, stats
  - [ ] Manual expert selection
  - [ ] Note field
  - [ ] Assign action

- [ ] **Request Preview**
  - [ ] Display question set preview
  - [ ] Subject info
  - [ ] Learner info

### Phase 3: User Management (Sprint 6-7)

- [ ] **Users Page**

  - [ ] UsersTable component
  - [ ] UserFilters component
  - [ ] Search functionality
  - [ ] Sortable columns
  - [ ] Bulk selection
  - [ ] Pagination

- [ ] **User Details Modal**

  - [ ] Display full user info
  - [ ] Activity stats
  - [ ] Recent activities
  - [ ] Action buttons

- [ ] **Action Modals**

  - [ ] ChangeRoleModal
  - [ ] DeactivateUserModal
  - [ ] DeleteUserModal
  - [ ] Confirmation flows
  - [ ] Reason input

- [ ] **Bulk Actions**
  - [ ] Deactivate selected
  - [ ] Activate selected
  - [ ] Export to CSV

### Phase 4: Testing & Polish

- [ ] **Integration Testing**

  - [ ] Test validation assignment workflow
  - [ ] Test user management actions
  - [ ] Test API error handling
  - [ ] Test audit logging

- [ ] **UI/UX Polish**
  - [ ] Add loading states
  - [ ] Add success/error toasts
  - [ ] Add confirmation dialogs
  - [ ] Improve table UX
  - [ ] Accessibility review

---

## 🔗 Related Use Cases

- **UC-012**: Expert tiếp nhận và kiểm duyệt
- **UC-010**: Learner yêu cầu xác thực
- **UC-017**: Theo dõi doanh thu
- **UC-018**: Quản lý thanh toán cho Expert

---

## 📝 Notes

### Business Rules

**Validation Assignment**:

- Expert matching dựa trên: expertise, workload, performance
- Expert có thể từ chối yêu cầu (max 3 lần/tháng)
- Yêu cầu quá 7 ngày chưa assign → cảnh báo
- Auto-suggest top 5 experts phù hợp nhất

**User Management**:

- Chỉ Admin mới có quyền thay đổi role
- Deactivate user không xóa dữ liệu
- Delete user cần xác nhận email
- Reset password gửi link có hiệu lực 24h
- Mọi thay đổi được ghi audit log

**Audit Log** (for compliance):

- Record: admin_id, action, target_user_id, timestamp, reason, old_value, new_value
- Actions logged: change_role, deactivate, activate, delete, reset_password
- Retention: 2 years

### Technical Considerations

**Expert Matching Algorithm**:

```javascript
function calculateMatchScore(expert, request) {
  let score = 0;

  // Expertise match (40%)
  if (expert.expertise.includes(request.subject)) {
    score += 0.4;
  }

  // Workload (30%)
  const workloadScore = Math.max(0, 1 - expert.currentWorkload / 10);
  score += workloadScore * 0.3;

  // Performance (30%)
  score += expert.approvalRate * 0.3;

  return score;
}
```

**Pagination Performance**:

- Use cursor-based pagination for large datasets
- Cache user list for 1 minute
- Index on frequently filtered fields (role, status, createdAt)

**Security**:

- Require re-authentication for destructive actions (delete user)
- Log all admin actions with IP address
- Implement rate limiting on admin endpoints
- Use RBAC middleware to verify admin role

---

**Status**: Ready for Implementation
**Estimated Effort**: 2-3 sprints
**Dependencies**: Authentication, Users API, Validation API, Audit Log system
