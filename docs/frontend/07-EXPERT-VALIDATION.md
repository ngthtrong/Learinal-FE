# 07 - Tính năng Chuyên gia: Kiểm duyệt & Xác thực

**Module**: Expert Validation & Content Review
**Vai trò**: Chuyên gia (Expert)
**Priority**: CAO
**Completion**: 0% (0/6 features)

---

## 📋 Tổng quan

Module này cung cấp công cụ cho Chuyên gia để thực hiện vai trò đảm bảo chất lượng học thuật:

- Tiếp nhận yêu cầu kiểm duyệt từ Admin
- Xem xét và chỉnh sửa bộ câu hỏi
- Phê duyệt hoặc từ chối nội dung
- Tạo bộ câu hỏi chuẩn (premium content)

---

## 🎯 Use Cases

### UC-012: Tiếp nhận và kiểm duyệt bộ câu hỏi

**Mô tả**: Chuyên gia nhận yêu cầu được phân công, xem xét, chỉnh sửa và phê duyệt/từ chối bộ câu hỏi.

**Priority**: CAO
**Status**: ❌ Chưa triển khai

**Actors**: Expert

**Preconditions**:

- Expert đã đăng nhập
- Có ít nhất 1 yêu cầu được Admin phân công (UC-015)

**Main Flow** (Success - Phê duyệt):

1. Expert truy cập dashboard kiểm duyệt cá nhân
2. Hệ thống hiển thị danh sách yêu cầu đang chờ xử lý
3. Expert chọn một yêu cầu để xử lý
4. Hệ thống hiển thị giao diện chỉnh sửa chi tiết:
   - Nội dung câu hỏi
   - Các lựa chọn (options)
   - Đáp án đúng (correctAnswerIndex)
   - Lời giải thích (explanation)
   - Mức độ khó (difficultyLevel)
5. Expert rà soát và chỉnh sửa (nếu cần)
6. Expert nhấn "Phê duyệt"
7. Hệ thống:
   - Cập nhật status bộ đề → "Validated"
   - Lưu lịch sử chỉnh sửa
   - Gửi thông báo cho Learner (người yêu cầu)

**Alternative Flow** (Từ chối):

- **5a. Chất lượng quá thấp**:
  1. Expert chọn "Từ chối"
  2. Hệ thống yêu cầu nhập lý do từ chối
  3. Expert nhập lý do và xác nhận
  4. Hệ thống:
     - Cập nhật status → "Rejected"
     - Gửi thông báo kèm lý do cho Learner

**Postconditions**:

- Bộ đề được cập nhật status mới (Validated/Rejected)
- Learner nhận thông báo
- Chuyên gia được ghi nhận hoa hồng (nếu phê duyệt)

---

### UC-013: Tạo bộ câu hỏi chuẩn

**Mô tả**: Chuyên gia tự soạn thảo bộ câu hỏi chất lượng cao để đóng góp vào kho đề premium.

**Priority**: TRUNG BÌNH
**Status**: ❌ Chưa triển khai

**Actors**: Expert

**Preconditions**: Expert đã đăng nhập

**Main Flow**:

1. Expert truy cập "Tạo bộ câu hỏi mới"
2. Hệ thống cung cấp form chi tiết:
   - Thông tin bộ đề (title, subject, description)
   - Danh sách câu hỏi với form cho mỗi câu:
     - Nội dung câu hỏi (questionText)
     - Các đáp án (options - array)
     - Đáp án đúng (correctAnswerIndex)
     - Mức độ khó (difficultyLevel)
     - Lời giải thích (explanation)
     - Topic tags (liên kết với mục lục)
3. Expert có thể:
   - Thêm/xóa câu hỏi
   - Sắp xếp thứ tự câu hỏi
   - Lưu dưới dạng "Draft" để hoàn thiện sau
4. Khi hoàn tất, Expert nhấn "Gửi duyệt"
5. Hệ thống:
   - Cập nhật status → "PendingApproval"
   - Đưa vào hàng đợi của Admin (UC-019)
   - Gửi thông báo xác nhận cho Expert

**Postconditions**:

- Bộ câu hỏi mới được tạo với status "PendingApproval"
- Admin nhận yêu cầu duyệt nội dung

---

## 🖥️ UI Components Cần Thiết

### 1. Expert Dashboard Page

**Route**: `/expert/dashboard`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
ExpertDashboardPage/
├── ExpertDashboardPage.jsx
├── ExpertDashboardPage.css
├── index.js
└── components/
    ├── ValidationStats.jsx        // Thống kê công việc
    ├── PendingRequestsList.jsx    // DS yêu cầu chờ
    ├── RecentActivity.jsx         // Hoạt động gần đây
    └── EarningsOverview.jsx       // Tổng quan thu nhập
```

**Features**:

- Hiển thị tổng quan:
  - Số yêu cầu đang chờ
  - Số yêu cầu đã hoàn thành (tháng này)
  - Tổng thu nhập (tháng này)
  - Số bộ đề premium đã tạo
- Quick actions:
  - "Xem yêu cầu mới"
  - "Tạo bộ đề mới"
  - "Xem thu nhập"

**UI Mockup**:

```
┌─────────────────────────────────────────────────┐
│ 📊 Expert Dashboard                             │
├─────────────────────────────────────────────────┤
│                                                 │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │ Chờ xử lý│ │ Hoàn tất │ │ Thu nhập │        │
│ │    8     │ │    24    │ │ 2.5M VND │        │
│ └──────────┘ └──────────┘ └──────────┘        │
│                                                 │
│ Yêu cầu đang chờ:                              │
│ ┌───────────────────────────────────────────┐  │
│ │ □ Bộ đề: Toán cao cấp A1              [>]│  │
│ │   Người yêu cầu: Nguyễn A | 2h trước      │  │
│ ├───────────────────────────────────────────┤  │
│ │ □ Bộ đề: Vật lý đại cương              [>]│  │
│ │   Người yêu cầu: Trần B | 5h trước        │  │
│ └───────────────────────────────────────────┘  │
│                                                 │
│ [Xem tất cả yêu cầu]  [Tạo bộ đề mới]         │
└─────────────────────────────────────────────────┘
```

---

### 2. Validation Requests List Page

**Route**: `/expert/validation-requests`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
ValidationRequestsList/
├── ValidationRequestsListPage.jsx
├── ValidationRequestsListPage.css
├── index.js
└── components/
    ├── RequestsFilter.jsx         // Bộ lọc (status, date)
    ├── RequestCard.jsx            // Card hiển thị request
    └── RequestsPagination.jsx     // Phân trang
```

**API Endpoints**:

```javascript
GET /api/validation-requests?expertId={id}&status={status}&page={n}
// Response:
{
  "data": [
    {
      "requestId": "req_001",
      "setId": "set_123",
      "setTitle": "Toán cao cấp A1",
      "learnerId": "user_456",
      "learnerName": "Nguyễn Văn A",
      "status": "Assigned",
      "requestTime": "2025-11-05T10:00:00Z",
      "questionCount": 20
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "totalItems": 8,
    "totalPages": 1
  }
}
```

**Features**:

- Danh sách yêu cầu với filters:
  - Status: All, Assigned, Completed
  - Date range
  - Search by title
- Mỗi request card hiển thị:
  - Tiêu đề bộ đề
  - Tên người yêu cầu
  - Thời gian yêu cầu
  - Số câu hỏi
  - Action button: "Xem chi tiết" / "Bắt đầu"
- Phân trang

---

### 3. Question Set Review Page

**Route**: `/expert/review/:requestId`
**Layout**: TopbarLayout (no sidebar, full width editor)
**Components**:

```
QuestionSetReview/
├── QuestionSetReviewPage.jsx
├── QuestionSetReviewPage.css
├── index.js
└── components/
    ├── ReviewHeader.jsx           // Thông tin request
    ├── QuestionEditor.jsx         // Editor cho từng câu
    ├── QuestionList.jsx           // Danh sách câu hỏi
    ├── ReviewActions.jsx          // Approve/Reject buttons
    └── RejectModal.jsx            // Modal nhập lý do từ chối
```

**API Endpoints**:

```javascript
// Get validation request details
GET /api/validation-requests/:requestId
// Response:
{
  "requestId": "req_001",
  "setId": "set_123",
  "set": {
    "setId": "set_123",
    "title": "Toán cao cấp A1",
    "questions": [
      {
        "questionId": "q_001",
        "questionText": "Tính đạo hàm của f(x) = x^2?",
        "options": ["2x", "x", "2", "x^2"],
        "correctAnswerIndex": 0,
        "explanation": "Theo quy tắc đạo hàm cơ bản...",
        "difficultyLevel": "Hiểu",
        "topicTags": ["topic_derivatives"]
      }
    ]
  },
  "learner": {
    "userId": "user_456",
    "fullName": "Nguyễn Văn A",
    "email": "nguyenvana@example.com"
  },
  "requestTime": "2025-11-05T10:00:00Z",
  "status": "Assigned"
}

// Update question set
PATCH /api/question-sets/:setId
{
  "questions": [/* updated questions array */]
}

// Approve validation request
POST /api/validation-requests/:requestId/approve
{
  "updatedSetId": "set_123"  // Optional if made changes
}

// Reject validation request
POST /api/validation-requests/:requestId/reject
{
  "reason": "Chất lượng câu hỏi chưa đạt, cần bổ sung lời giải..."
}
```

**Features**:

**Review Header**:

- Thông tin request (requester, time, subject)
- Progress indicator (câu đã review / tổng câu)

**Question Editor** (cho từng câu):

- Inline editing mode
- Fields:
  - Question text (textarea, rich text)
  - Options (array of inputs, add/remove)
  - Correct answer (radio select)
  - Difficulty level (select: Biết, Hiểu, Vận dụng, Vận dụng cao)
  - Explanation (textarea, rich text)
  - Topic tags (multi-select from subject's ToC)
- Validation:
  - Question text required
  - At least 2 options
  - One correct answer selected
  - Explanation recommended (warning if empty)

**Question List** (sidebar):

- Numbered list of all questions
- Click to navigate to specific question
- Visual indicator for edited questions

**Review Actions**:

- "Lưu thay đổi" (Save changes)
- "Phê duyệt" (Approve) - green button
- "Từ chối" (Reject) - red button

**Reject Modal**:

- Textarea for rejection reason (required)
- "Hủy" và "Xác nhận từ chối" buttons

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────────┐
│ ← Quay lại  │  Kiểm duyệt: Toán cao cấp A1                  │
│ Người yêu cầu: Nguyễn Văn A | 05/11/2025              [5/20]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌──────────┐  ┌───────────────────────────────────────────┐ │
│ │ Câu hỏi  │  │ Câu 1/20                                  │ │
│ │          │  │                                           │ │
│ │ 1. ✓     │  │ Nội dung câu hỏi:                        │ │
│ │ 2. ✓     │  │ ┌───────────────────────────────────────┐│ │
│ │ 3. ⚠     │  │ │ Tính đạo hàm của f(x) = x^2?         ││ │
│ │ 4.       │  │ └───────────────────────────────────────┘│ │
│ │ 5.       │  │                                           │ │
│ │ ...      │  │ Đáp án:                                  │ │
│ │          │  │ ○ A. 2x  ● B. x  ○ C. 2  ○ D. x^2       │ │
│ │          │  │                                           │ │
│ │          │  │ Mức độ: [Hiểu ▼]                        │ │
│ │          │  │                                           │ │
│ │          │  │ Giải thích:                              │ │
│ │          │  │ ┌───────────────────────────────────────┐│ │
│ │          │  │ │ Theo quy tắc đạo hàm cơ bản...       ││ │
│ │          │  │ └───────────────────────────────────────┘│ │
│ │          │  │                                           │ │
│ │          │  │ [← Câu trước]  [Lưu]  [Câu sau →]       │ │
│ └──────────┘  └───────────────────────────────────────────┘ │
│                                                               │
│               [💾 Lưu thay đổi]  [✓ Phê duyệt]  [✗ Từ chối]│
└─────────────────────────────────────────────────────────────┘
```

---

### 4. Create Premium Question Set Page

**Route**: `/expert/create-question-set`
**Layout**: TopbarLayout
**Components**:

```
CreateQuestionSet/
├── CreateQuestionSetPage.jsx
├── CreateQuestionSetPage.css
├── index.js
└── components/
    ├── SetInfoForm.jsx            // Thông tin bộ đề
    ├── QuestionBuilder.jsx        // Builder cho câu hỏi
    ├── QuestionListEditor.jsx     // Danh sách + reorder
    └── SaveDraftModal.jsx         // Modal lưu draft
```

**API Endpoints**:

```javascript
// Create new question set
POST /api/question-sets
{
  "title": "Toán cao cấp nâng cao",
  "subjectId": "subj_001",  // Optional, or create new
  "description": "Bộ đề chuyên sâu...",
  "questions": [
    {
      "questionText": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswerIndex": 0,
      "explanation": "...",
      "difficultyLevel": "Vận dụng cao",
      "topicTags": ["topic_001"]
    }
  ],
  "status": "Draft" | "PendingApproval"
}

// Update draft
PATCH /api/question-sets/:setId
{
  "title": "...",
  "questions": [...]
}

// Submit for approval
POST /api/question-sets/:setId/submit
```

**Features**:

**Set Info Section**:

- Title (required)
- Subject selection (dropdown or create new)
- Description (optional)

**Question Builder**:

- Add new question button
- For each question:
  - Question text (rich text editor)
  - Options (min 2, max 6, add/remove)
  - Mark correct answer (radio)
  - Difficulty level (select)
  - Explanation (rich text)
  - Topic tags (multi-select)
  - Delete question button
- Reorder questions (drag & drop)

**Actions**:

- "Lưu nháp" (Save as Draft)
- "Xem trước" (Preview)
- "Gửi duyệt" (Submit for Approval)

**Validation**:

- At least 5 questions for submission
- Each question must have:
  - Question text
  - At least 2 options
  - One correct answer
  - Difficulty level
- Warning if no explanation provided

---

## 📡 API Services

### validation.service.js

```javascript
/**
 * Validation Service
 * API methods for expert validation workflow
 */

import axiosInstance from "./axios.config";

const BASE_PATH = "/validation-requests";

export const validationService = {
  /**
   * Get validation requests assigned to expert
   * @param {Object} params - Query params
   * @param {string} params.status - Filter by status
   * @param {number} params.page - Page number
   * @returns {Promise<Object>}
   */
  getMyRequests: async (params = {}) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/my-requests`, {
      params,
    });
    return data;
  },

  /**
   * Get validation request details
   * @param {string} requestId
   * @returns {Promise<Object>}
   */
  getRequestDetails: async (requestId) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/${requestId}`);
    return data;
  },

  /**
   * Approve validation request
   * @param {string} requestId
   * @param {Object} payload
   * @param {string} payload.updatedSetId - Optional
   * @returns {Promise<Object>}
   */
  approve: async (requestId, payload = {}) => {
    const { data } = await axiosInstance.post(`${BASE_PATH}/${requestId}/approve`, payload);
    return data;
  },

  /**
   * Reject validation request
   * @param {string} requestId
   * @param {string} reason - Rejection reason
   * @returns {Promise<Object>}
   */
  reject: async (requestId, reason) => {
    const { data } = await axiosInstance.post(`${BASE_PATH}/${requestId}/reject`, { reason });
    return data;
  },
};
```

### expertQuestionSets.service.js

```javascript
/**
 * Expert Question Sets Service
 * API for creating premium question sets
 */

import axiosInstance from "./axios.config";

const BASE_PATH = "/question-sets";

export const expertQuestionSetsService = {
  /**
   * Create new question set
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  create: async (payload) => {
    const { data } = await axiosInstance.post(BASE_PATH, payload);
    return data;
  },

  /**
   * Update question set (draft)
   * @param {string} setId
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  update: async (setId, payload) => {
    const { data } = await axiosInstance.patch(`${BASE_PATH}/${setId}`, payload);
    return data;
  },

  /**
   * Submit question set for approval
   * @param {string} setId
   * @returns {Promise<Object>}
   */
  submit: async (setId) => {
    const { data } = await axiosInstance.post(`${BASE_PATH}/${setId}/submit`);
    return data;
  },

  /**
   * Get expert's question sets
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  getMySets: async (params = {}) => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/my-sets`, { params });
    return data;
  },

  /**
   * Delete draft question set
   * @param {string} setId
   * @returns {Promise<void>}
   */
  deleteDraft: async (setId) => {
    await axiosInstance.delete(`${BASE_PATH}/${setId}`);
  },
};
```

---

## ✅ Implementation Checklist

### Phase 1: Expert Dashboard (Sprint 4)

- [ ] **Setup Routes**

  - [ ] Add `/expert/dashboard` route
  - [ ] Add `/expert/validation-requests` route
  - [ ] Add `/expert/review/:requestId` route
  - [ ] Add `/expert/create-question-set` route
  - [ ] Add ProtectedRoute với role `Expert`

- [ ] **Create API Services**

  - [ ] `validation.service.js`
  - [ ] `expertQuestionSets.service.js`

- [ ] **Expert Dashboard Page**
  - [ ] ValidationStats component
  - [ ] PendingRequestsList component
  - [ ] RecentActivity component
  - [ ] EarningsOverview component (link to UC-014)
  - [ ] Loading/error states
  - [ ] Responsive design

### Phase 2: Validation Workflow (Sprint 4-5)

- [ ] **Validation Requests List**

  - [ ] RequestsFilter component
  - [ ] RequestCard component
  - [ ] Pagination
  - [ ] Empty state
  - [ ] Loading skeleton

- [ ] **Question Set Review Page**
  - [ ] ReviewHeader component
  - [ ] QuestionEditor component với:
    - [ ] Rich text editor for question
    - [ ] Options array editor
    - [ ] Correct answer selector
    - [ ] Difficulty level selector
    - [ ] Explanation editor
    - [ ] Topic tags selector
  - [ ] QuestionList sidebar navigation
  - [ ] Save changes functionality
  - [ ] RejectModal component
  - [ ] Approve/Reject actions
  - [ ] Validation logic
  - [ ] Unsaved changes warning

### Phase 3: Create Premium Content (Sprint 5)

- [ ] **Create Question Set Page**

  - [ ] SetInfoForm component
  - [ ] QuestionBuilder component
  - [ ] Add/remove questions
  - [ ] Reorder questions (drag & drop)
  - [ ] SaveDraftModal
  - [ ] Preview functionality
  - [ ] Submit for approval
  - [ ] Validation rules

- [ ] **My Question Sets Page**
  - [ ] List expert's question sets
  - [ ] Filter by status (Draft, Pending, Approved, Rejected)
  - [ ] Edit draft sets
  - [ ] Delete draft sets
  - [ ] View approved sets

### Phase 4: Testing & Polish

- [ ] **Integration Testing**

  - [ ] Test full validation workflow
  - [ ] Test create question set workflow
  - [ ] Test API error handling
  - [ ] Test notifications

- [ ] **UI/UX Polish**
  - [ ] Add loading indicators
  - [ ] Add success/error toasts
  - [ ] Improve form validation feedback
  - [ ] Add keyboard shortcuts
  - [ ] Accessibility review

---

## 🔗 Related Use Cases

- **UC-015**: Admin phân công yêu cầu xác thực
- **UC-014**: Quản lý thu nhập (Expert)
- **UC-019**: Admin duyệt nội dung Expert
- **UC-010**: Learner yêu cầu xác thực
- **UC-021**: Thông báo

---

## 📊 Success Metrics

- Thời gian trung bình để hoàn thành 1 yêu cầu kiểm duyệt
- Tỷ lệ phê duyệt / từ chối
- Số bộ đề premium được tạo mỗi tháng
- Chất lượng câu hỏi (feedback từ learners)
- Thu nhập trung bình của Expert

---

## 📝 Notes

### Business Logic

**Trọng số điểm theo mức độ**:

- Biết: 1.0
- Hiểu: 1.25
- Vận dụng: 1.5
- Vận dụng cao: 2.0

**Validation Rules**:

- Expert chỉ được phân công yêu cầu phù hợp với chuyên môn
- Expert có thời hạn 7 ngày để hoàn thành 1 yêu cầu
- Sau khi phê duyệt, bộ đề status → "Validated"
- Expert được hưởng hoa hồng trong 180 ngày từ ngày phê duyệt

**Commission Calculation**:

- Published content: 40% rate
- Validated content: 20% rate
- Tính theo số lượt làm bài của premium users
- Chi tiết công thức: xem SRS section 4.1.2

### Technical Notes

**Rich Text Editor**:

- Consider using: TinyMCE, Quill, or Draft.js
- Support: bold, italic, code, lists, formulas (MathJax)

**Drag & Drop**:

- Library: `react-beautiful-dnd` hoặc `dnd-kit`

**Auto-save**:

- Debounce user input (3 seconds)
- Save to localStorage as backup
- Show "Đã lưu" indicator

**Keyboard Shortcuts**:

- `Ctrl + S`: Save changes
- `Ctrl + Enter`: Next question
- `Ctrl + Shift + Enter`: Approve

---

**Status**: Ready for Implementation
**Estimated Effort**: 3-4 sprints
**Dependencies**: Authentication, Question Sets API, Notifications
