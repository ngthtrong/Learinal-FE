# 02 - Subjects & Documents Management

**Module**: Quản lý Môn học & Tài liệu
**Priority**: 🔴 CAO (Critical)
**Status**: 🚧 Đang triển khai

---

## 📋 Tổng quan

Module này cung cấp các chức năng cốt lõi để:

- Quản lý môn học (CRUD)
- Upload & xử lý tài liệu (PDF, DOCX, TXT)
- Tạo mục lục tự động bằng AI
- Tạo tóm tắt tài liệu (document summary)
- Tạo tóm tắt môn học (subject summary)
- Theo dõi trạng thái xử lý

---

## 🎯 Use Cases

### SF-02: Quản lý và Xử lý Tài liệu học tập

---

### UC-CREATE-SUBJECT: Tạo môn học mới

**Priority**: CAO
**Role**: Learner

#### Luồng:

1. User click "Tạo môn học mới"
2. Nhập: subjectName, description (optional)
3. Submit form
4. Backend tạo Subject với empty tableOfContents
5. Redirect đến trang chi tiết môn học

#### API:

```http
POST /api/v1/subjects
Authorization: Bearer <token>
Content-Type: application/json

{
  "subjectName": "Toán Cao Cấp A1",
  "description": "Môn học về vi tích phân và đại số tuyến tính"
}

Response 201:
{
  "id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439022",
  "subjectName": "Toán Cao Cấp A1",
  "description": "Môn học về vi tích phân và đại số tuyến tính",
  "tableOfContents": [],
  "summary": null,
  "documentCount": 0,
  "questionSetCount": 0,
  "createdAt": "2025-11-05T10:30:00Z",
  "updatedAt": "2025-11-05T10:30:00Z"
}
```

#### Validation:

```javascript
{
  subjectName: {
    required: true,
    minLength: 3,
    maxLength: 200,
    unique: true // per user
  },
  description: {
    maxLength: 1000
  }
}
```

#### UI Components:

**❌ Cần tạo:**

```
/src/pages/subjects/SubjectCreate/
  ├── SubjectCreatePage.jsx
  ├── SubjectCreatePage.css
  └── index.js

/src/components/subjects/
  ├── SubjectForm.jsx        // Reusable form
  └── SubjectCard.jsx        // Display subject
```

**Mockup:**

```
┌─────────────────────────────────────┐
│ Tạo Môn Học Mới                    │
├─────────────────────────────────────┤
│ Tên môn học *                       │
│ ┌─────────────────────────────────┐ │
│ │ Toán Cao Cấp A1                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Mô tả (tùy chọn)                   │
│ ┌─────────────────────────────────┐ │
│ │ Môn học về vi tích phân...      │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Hủy]  [Tạo môn học]              │
└─────────────────────────────────────┘
```

---

### UC-LIST-SUBJECTS: Danh sách môn học

**Priority**: CAO
**Role**: Learner

#### Luồng:

1. User truy cập `/subjects`
2. Hiển thị grid/list các môn học
3. Hỗ trợ sort, filter, search
4. Pagination (20 items/page)

#### API:

```http
GET /api/v1/subjects?page=1&pageSize=20&sort=-createdAt
Authorization: Bearer <token>

Response 200:
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "subjectName": "Toán Cao Cấp A1",
      "description": "...",
      "documentCount": 5,
      "questionSetCount": 3,
      "lastUpdated": "2025-11-05T10:30:00Z",
      "thumbnailUrl": null
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 45,
    "totalPages": 3
  }
}
```

#### Features:

- Grid view / List view toggle
- Sort by: newest, oldest, name (A-Z), most documents
- Search by name
- Empty state với CTA "Tạo môn học đầu tiên"

#### UI Components:

**✅ Đã có:**

```
/src/pages/subjects/SubjectList/
```

**❌ Cần bổ sung:**

- Pagination component
- Sort & filter controls
- View toggle (grid/list)
- Search bar
- Loading skeleton

---

### UC-003: Tải lên và xử lý tài liệu

**Priority**: CAO
**Role**: Learner

#### Luồng chính:

1. User chọn môn học
2. Click "Tải tài liệu lên"
3. Chọn file (PDF/DOCX/TXT, max 20MB)
4. Preview file info (name, size, type)
5. (Optional) Nhập title override
6. Click "Upload"
7. File upload lên server
8. Backend đưa vào queue xử lý
9. Hiển thị trạng thái "Đang xử lý..."
10. Nhận thông báo khi xong

#### API:

**Upload:**

```http
POST /api/v1/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  file: <binary>,
  subjectId: "507f1f77bcf86cd799439011",
  title: "Chương 1 - Giới thiệu" // optional
}

Response 201:
{
  "id": "507f1f77bcf86cd799439033",
  "subjectId": "507f1f77bcf86cd799439011",
  "originalFileName": "chuong1.pdf",
  "title": "Chương 1 - Giới thiệu",
  "fileType": "application/pdf",
  "fileSize": 2048576,
  "status": "Processing",
  "uploadedAt": "2025-11-05T10:35:00Z",
  "storagePath": "documents/507f.../chuong1.pdf"
}

Response 400: File too large / Invalid format
Response 413: Payload too large
```

**Check status:**

```http
GET /api/v1/documents/507f1f77bcf86cd799439033
Authorization: Bearer <token>

Response 200:
{
  "id": "507f1f77bcf86cd799439033",
  "status": "Completed", // or "Processing", "Error"
  "extractedText": "...", // available when Completed
  "summaryShort": "Chương này giới thiệu...",
  "summaryFull": "...",
  "processedAt": "2025-11-05T10:37:00Z",
  "errorMessage": null
}
```

#### File constraints:

```javascript
const UPLOAD_CONSTRAINTS = {
  maxFileSize: 20 * 1024 * 1024, // 20MB
  allowedTypes: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
  ],
  allowedExtensions: [".pdf", ".docx", ".doc", ".txt"],
};
```

#### Processing states:

```javascript
const DOCUMENT_STATUS = {
  UPLOADING: "Uploading",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  ERROR: "Error",
};

const STATUS_MESSAGES = {
  Uploading: "Đang tải lên...",
  Processing: "Đang xử lý tài liệu...",
  Completed: "Hoàn tất",
  Error: "Lỗi xử lý",
};
```

#### UI Components:

**✅ Đã có:**

```
/src/pages/documents/DocumentUpload/
  ├── DocumentUploadPage.jsx
  ├── DocumentUploadPage.css
  └── index.js
```

**❌ Cần tạo:**

```
/src/components/documents/
  ├── FileDropZone.jsx       // Drag & drop area
  ├── FilePreview.jsx        // Preview before upload
  ├── UploadProgress.jsx     // Progress bar
  ├── DocumentStatusBadge.jsx // Status indicator
  └── DocumentCard.jsx       // Document item
```

**Mockup - Upload:**

```
┌─────────────────────────────────────┐
│ Tải Tài Liệu Lên                   │
├─────────────────────────────────────┤
│ Môn học: Toán Cao Cấp A1           │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  📁 Kéo thả file vào đây        │ │
│ │     hoặc                        │ │
│ │  [Chọn file]                   │ │
│ │                                 │ │
│ │  Hỗ trợ: PDF, DOCX, TXT        │ │
│ │  Tối đa: 20MB                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ File đã chọn:                      │
│ ┌─────────────────────────────────┐ │
│ │ 📄 chuong1.pdf (2.1 MB)        │ │
│ │ ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 50%      │ │
│ │ [✕]                            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Hủy]  [Upload]                   │
└─────────────────────────────────────┘
```

---

### UC-003A: Hiển thị tóm tắt tự động cho từng tài liệu

**Priority**: CAO
**Role**: Learner

#### Luồng:

1. User mở trang chi tiết tài liệu
2. Hệ thống hiển thị khung "Tóm tắt" ở đầu
3. Mặc định hiển thị `summaryShort` (3-5 câu)
4. User click "Xem đầy đủ" → expand `summaryFull`
5. User click "Thu gọn" → collapse
6. (Optional) Click "Làm mới tóm tắt" → regenerate

#### API:

**Get document summary:**

```http
GET /api/v1/documents/507f1f77bcf86cd799439033/summary
Authorization: Bearer <token>

Response 200:
{
  "documentId": "507f1f77bcf86cd799439033",
  "summaryShort": "Chương này giới thiệu các khái niệm cơ bản về giới hạn và liên tục. Nội dung bao gồm định nghĩa epsilon-delta và các định lý quan trọng.",
  "summaryFull": "## Tóm tắt chi tiết\n\n1. **Giới hạn của hàm số**\n   - Định nghĩa epsilon-delta...\n2. **Tính liên tục**\n   - Điều kiện liên tục tại một điểm...",
  "summaryUpdatedAt": "2025-11-05T10:37:00Z",
  "canRegenerate": true
}
```

**Regenerate summary:**

```http
POST /api/v1/documents/507f1f77bcf86cd799439033/summary/regenerate
Authorization: Bearer <token>

Response 202:
{
  "message": "Đang tạo lại tóm tắt...",
  "jobId": "job-123-456"
}
```

#### UI Component:

**❌ Cần tạo:**

```
/src/components/documents/
  ├── DocumentSummary.jsx
  │   ├── Collapsible summary card
  │   ├── Short/Full view toggle
  │   └── Regenerate button
  └── DocumentDetail.jsx
      └── Full document viewer
```

**Mockup:**

```
┌─────────────────────────────────────────┐
│ 📄 Chương 1 - Giới thiệu               │
├─────────────────────────────────────────┤
│ 💡 Tóm tắt                  [Làm mới]  │
│ ┌───────────────────────────────────┐  │
│ │ Chương này giới thiệu các khái    │  │
│ │ niệm cơ bản về giới hạn và liên   │  │
│ │ tục...                            │  │
│ │                                   │  │
│ │ [▼ Xem đầy đủ]                   │  │
│ └───────────────────────────────────┘  │
│                                        │
│ 📝 Nội dung tài liệu                   │
│ ┌───────────────────────────────────┐  │
│ │ ... extracted text ...            │  │
│ └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

### UC-004: Tạo mục lục và tóm tắt môn học

**Priority**: CAO
**Role**: Learner

#### Luồng:

1. User vào trang Subject detail
2. Click "Tạo/Cập nhật mục lục"
3. Backend tổng hợp tất cả documents của subject
4. Gọi LLM để tạo tableOfContents + summary
5. Hiển thị kết quả
6. User có thể edit trực tiếp mục lục

#### API:

**Generate Table of Contents:**

```http
POST /api/v1/subjects/507f1f77bcf86cd799439011/generate-toc
Authorization: Bearer <token>

Response 202:
{
  "message": "Đang tạo mục lục...",
  "jobId": "job-toc-789",
  "estimatedTime": 120 // seconds
}

// Poll for result
GET /api/v1/subjects/507f1f77bcf86cd799439011
Response 200:
{
  "id": "507f1f77bcf86cd799439011",
  "tableOfContents": [
    {
      "topicId": "topic-1",
      "topicName": "Chương 1: Giới hạn và Liên tục",
      "order": 1,
      "childTopics": [
        {
          "topicId": "topic-1-1",
          "topicName": "1.1 Định nghĩa giới hạn",
          "order": 1,
          "documentIds": ["507f...033", "507f...044"]
        }
      ]
    }
  ],
  "summary": "Môn học bao gồm 3 chương chính...",
  "tocGeneratedAt": "2025-11-05T10:40:00Z"
}
```

**Update Table of Contents (manual edit):**

```http
PATCH /api/v1/subjects/507f1f77bcf86cd799439011
Authorization: Bearer <token>
Content-Type: application/json

{
  "tableOfContents": [
    // Updated structure
  ]
}
```

#### UI Components:

**❌ Cần tạo:**

```
/src/pages/subjects/SubjectDetail/
  ├── SubjectDetailPage.jsx
  ├── components/
  │   ├── TableOfContents.jsx
  │   ├── TOCEditor.jsx         // Drag-drop tree
  │   └── SubjectSummary.jsx
  └── SubjectDetailPage.css
```

**Features:**

- Tree view với expand/collapse
- Drag & drop để reorder
- Add/edit/delete topics
- Link topics to documents
- Generate button với progress

**Mockup:**

```
┌─────────────────────────────────────────┐
│ Toán Cao Cấp A1                        │
├─────────────────────────────────────────┤
│ 📚 Mục lục         [Tạo lại] [Sửa]    │
│ ┌───────────────────────────────────┐  │
│ │ ▼ Chương 1: Giới hạn và Liên tục │  │
│ │   ├─ 1.1 Định nghĩa giới hạn     │  │
│ │   ├─ 1.2 Tính chất               │  │
│ │   └─ 1.3 Bài tập                 │  │
│ │ ▼ Chương 2: Đạo hàm               │  │
│ │   ├─ 2.1 Định nghĩa               │  │
│ │   └─ 2.2 Quy tắc                 │  │
│ └───────────────────────────────────┘  │
│                                        │
│ 📝 Tóm tắt môn học                     │
│ ┌───────────────────────────────────┐  │
│ │ Môn học bao gồm 3 chương chính... │  │
│ └───────────────────────────────────┘  │
│                                        │
│ 📄 Tài liệu (5)    [Thêm tài liệu]    │
│ 📊 Bộ đề (3)       [Tạo đề mới]      │
└─────────────────────────────────────────┘
```

---

### UC-009: Xóa tài liệu học tập

**Priority**: TRUNG BÌNH
**Role**: Learner

#### Luồng:

1. User vào danh sách tài liệu
2. Click icon xóa trên document card
3. Hiển thị confirmation modal
4. User xác nhận
5. Backend xóa file + extracted text
6. Update subject's tableOfContents (remove references)
7. Mark related questions as `topicStatus: disabled`

#### API:

```http
DELETE /api/v1/documents/507f1f77bcf86cd799439033
Authorization: Bearer <token>

Response 204: No Content

Response 409: Conflict (nếu document đang được sử dụng)
{
  "error": "Không thể xóa. Tài liệu đang được tham chiếu bởi 3 bộ đề."
}
```

#### Side effects:

```javascript
// After delete document
1. Remove file from storage
2. Delete Document record
3. Update Subject.tableOfContents:
   - Remove topics linked only to this document
   - Update topics linked to multiple documents
4. Update QuestionSet.questions:
   - Set topicStatus = 'disabled' where topicId references deleted topics
5. Send notification to user
```

#### UI:

**Confirmation modal:**

```
┌─────────────────────────────────────┐
│ ⚠️  Xác nhận xóa tài liệu           │
├─────────────────────────────────────┤
│ Bạn có chắc muốn xóa:              │
│                                     │
│ 📄 Chương 1 - Giới thiệu           │
│                                     │
│ ⚠️  Hành động này không thể hoàn   │
│    tác. Mục lục và câu hỏi liên    │
│    quan có thể bị ảnh hưởng.       │
│                                     │
│ [Hủy]  [Xóa]                      │
└─────────────────────────────────────┘
```

---

## 📊 Data Models

### Subject

```typescript
interface Subject {
  id: string;
  userId: string;
  subjectName: string;
  description?: string;
  tableOfContents: TableOfContentsItem[];
  summary?: string;
  documentCount: number;
  questionSetCount: number;
  createdAt: Date;
  updatedAt: Date;
  tocGeneratedAt?: Date;
}

interface TableOfContentsItem {
  topicId: string;
  topicName: string;
  order: number;
  childTopics?: TableOfContentsItem[];
  documentIds?: string[];
}
```

### Document

```typescript
interface Document {
  id: string;
  subjectId: string;
  originalFileName: string;
  title?: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  status: "Uploading" | "Processing" | "Completed" | "Error";
  extractedText?: string;
  summaryShort?: string;
  summaryFull?: string;
  summaryUpdatedAt?: Date;
  uploadedAt: Date;
  processedAt?: Date;
  errorMessage?: string;
}
```

---

## 🎨 UI/UX Requirements

### Responsive Design

```css
/* Mobile first */
.subject-grid {
  display: grid;
  grid-template-columns: 1fr; /* Mobile */
  gap: 1rem;
}

@media (min-width: 768px) {
  .subject-grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet */
  }
}

@media (min-width: 1280px) {
  .subject-grid {
    grid-template-columns: repeat(3, 1fr); /* Desktop */
  }
}
```

### Loading States

- Skeleton loaders cho cards
- Shimmer effect
- Progress bars cho upload
- Spinner cho background processing

### Empty States

```
Chưa có môn học
─────────────────
📚 Bắt đầu bằng cách tạo môn học đầu tiên

[+ Tạo môn học]
```

---

## ✅ Implementation Checklist

### Subjects

- [x] List subjects (basic)
- [ ] Create subject form
- [ ] Subject detail page
- [ ] Edit subject
- [ ] Delete subject (with confirmation)
- [ ] Generate ToC
- [ ] Edit ToC (drag-drop tree)
- [ ] Subject summary
- [ ] Search & filter
- [ ] Pagination
- [ ] Sort options

### Documents

- [x] Upload page (basic)
- [ ] File dropzone (drag & drop)
- [ ] Upload progress
- [ ] Multiple file upload
- [ ] File type validation
- [ ] File size validation
- [ ] Document list in subject
- [ ] Document detail view
- [ ] Document summary (short/full)
- [ ] Regenerate summary
- [ ] Delete document
- [ ] Processing status polling
- [ ] Error handling & retry

### ToC & Summary

- [ ] Auto-generate ToC
- [ ] Tree view component
- [ ] Edit ToC (add/edit/delete topics)
- [ ] Reorder topics (drag-drop)
- [ ] Link topics to documents
- [ ] Subject summary generation
- [ ] Update ToC when doc deleted

---

## 🔗 Dependencies

- **Backend APIs**: `/subjects`, `/documents`
- **LLM Service**: Text extraction, ToC generation, summarization
- **Storage Service**: S3/Cloudinary for file storage
- **Queue Service**: Redis/RabbitMQ for background jobs

---

## 📚 References

- [SRS - UC-003, UC-003A, UC-004, UC-009](../SRS%20for%20Learinal.md)
- [OpenAPI - Subjects & Documents](../api/openapi-paths-subjects-docs-questions.yaml)
- [MongoDB Schema - Subjects, Documents](../mongodb-schema.md)

---

**Cập nhật**: 05/11/2025
