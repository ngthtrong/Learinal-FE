# Tổng quan Tính năng Frontend - Learinal

**Phiên bản**: 1.0
**Ngày cập nhật**: 05/11/2025
**Tác giả**: Learinal Development Team

---

## 📋 Mục đích tài liệu

Tài liệu này liệt kê đầy đủ các tính năng frontend mà dự án Learinal **đã hoàn thành** và **cần hoàn thành** để đạt được phiên bản hoàn chỉnh cuối cùng (v1.0), dựa trên:

- **SRS** (Software Requirements Specification)
- **SDD** (Software Design Document)
- **OpenAPI Documentation** (API endpoints)
- **Codebase hiện tại**

---

## 🎯 Phạm vi dự án

### Trong phạm vi (In Scope)

Learinal là ứng dụng **web responsive** hỗ trợ:

- **3 vai trò người dùng**: Learner (Người học), Expert (Chuyên gia), Admin (Quản trị viên)
- **Các tính năng cốt lõi**:
  - Quản lý tài khoản & xác thực (OAuth 2.0, JWT)
  - Quản lý môn học & tài liệu
  - Tạo câu hỏi tự động bằng AI (LLM)
  - Làm bài thi & theo dõi tiến độ
  - Quy trình xác thực câu hỏi bởi Expert
  - Hệ thống thanh toán & đăng ký gói
  - Quản trị hệ thống

### Ngoài phạm vi (Out of Scope)

- ❌ Native Mobile App (iOS/Android)
- ❌ Hệ thống nhắn tin/chat
- ❌ Video/audio processing
- ❌ Gamification (bảng xếp hạng, huy hiệu)
- ❌ Tích hợp LMS bên thứ ba
- ❌ Lớp học trực tuyến

---

## 📁 Cấu trúc tài liệu

Tài liệu được chia thành các file chi tiết:

### 1. [01-AUTHENTICATION.md](./01-AUTHENTICATION.md)

**Xác thực & Quản lý tài khoản**

- Đăng ký, đăng nhập, OAuth Google
- Quên mật khẩu, xác thực email
- Quản lý phiên đăng nhập

### 2. [02-SUBJECTS-DOCUMENTS.md](./02-SUBJECTS-DOCUMENTS.md)

**Quản lý Môn học & Tài liệu**

- CRUD môn học
- Upload/xử lý tài liệu (PDF, DOCX, TXT)
- Tạo mục lục & tóm tắt tự động
- Tóm tắt tài liệu (auto summary)

### 3. [03-QUESTIONS-QUIZ.md](./03-QUESTIONS-QUIZ.md)

**Câu hỏi & Bài thi**

- Tạo bộ câu hỏi tự động (AI)
- Làm bài thi trắc nghiệm
- Xem kết quả & đáp án
- Chia sẻ bộ đề

### 4. [04-VALIDATION-WORKFLOW.md](./04-VALIDATION-WORKFLOW.md)

**Quy trình xác thực**

- Gửi yêu cầu xác thực (Learner)
- Kiểm duyệt câu hỏi (Expert)
- Phân công yêu cầu (Admin)

### 5. [05-SUBSCRIPTIONS-PAYMENTS.md](./05-SUBSCRIPTIONS-PAYMENTS.md)

**Đăng ký gói & Thanh toán**

- Hiển thị gói đăng ký
- Thanh toán qua Sepay
- Quản lý đăng ký cá nhân

### 6. [06-NOTIFICATIONS.md](./06-NOTIFICATIONS.md)

**Hệ thống thông báo**

- Thông báo realtime (WebSocket)
- Đánh dấu đã đọc
- Lọc theo loại thông báo

### 7. [07-ADMIN-FEATURES.md](./07-ADMIN-FEATURES.md)

**Tính năng quản trị**

- Quản lý người dùng
- Thống kê & báo cáo
- Quản lý hoa hồng Expert
- Cấu hình hệ thống

### 8. [08-EXPERT-FEATURES.md](./08-EXPERT-FEATURES.md)

**Tính năng Chuyên gia**

- Dashboard kiểm duyệt
- Tạo nội dung premium
- Theo dõi thu nhập

### 9. [09-PROFILE-SETTINGS.md](./09-PROFILE-SETTINGS.md)

**Hồ sơ & Cài đặt**

- Xem/sửa hồ sơ cá nhân
- Thay đổi mật khẩu
- Cài đặt ngôn ngữ

### 10. [10-UI-UX-REQUIREMENTS.md](./10-UI-UX-REQUIREMENTS.md)

**Yêu cầu giao diện & trải nghiệm**

- Design system
- Responsive breakpoints
- Accessibility (WCAG)
- Internationalization (i18n)

### 11. [11-PERFORMANCE-SECURITY.md](./11-PERFORMANCE-SECURITY.md)

**Hiệu năng & Bảo mật**

- Caching strategy
- Loading states
- Error handling
- Security best practices

### 12. [12-IMPLEMENTATION-STATUS.md](./12-IMPLEMENTATION-STATUS.md)

**Trạng thái triển khai**

- ✅ Đã hoàn thành
- 🚧 Đang triển khai
- ❌ Chưa bắt đầu
- Roadmap phát triển

---

## 🏗️ Tech Stack Frontend

### Core

- **React 19.1.1** - UI Library
- **React Router v7** - Routing
- **Vite** - Build tool

### State Management

- React Context API (AuthContext)
- Local state với hooks

### HTTP Client

- **Axios** - API requests
- Interceptors cho authentication

### Styling

- CSS Modules / Global CSS
- Responsive design (mobile-first)

### Utilities

- ESLint - Code linting
- PropTypes / TypeScript (future)

---

## 📊 Thống kê tính năng

### Theo vai trò người dùng

| Vai trò     | Use Cases chính | Tính năng                                                        |
| ----------- | --------------- | ---------------------------------------------------------------- |
| **Learner** | 11              | Quản lý môn học, tài liệu, tạo đề thi, làm bài, theo dõi tiến độ |
| **Expert**  | 3               | Kiểm duyệt, tạo nội dung premium, quản lý thu nhập               |
| **Admin**   | 7               | Quản lý user, phân công, báo cáo, cấu hình                       |
| **Common**  | 2               | Authentication, Notifications                                    |

### Theo độ ưu tiên

- **CAO** (Critical): 15 tính năng
- **TRUNG BÌNH** (Medium): 6 tính năng
- **THẤP** (Low): 2 tính năng

---

## 🔗 Tài liệu liên quan

- [SRS for Learinal](../SRS%20for%20Learinal.md)
- [SDD - System Design Document](../SDD_Learinal.md)
- [OpenAPI Specification](../api/openapi-learinal-complete.yaml)
- [MongoDB Schema](../mongodb-schema.md)
- [README.md](../../README.md)

---

## 📝 Quy ước ký hiệu

Trong các tài liệu chi tiết:

- ✅ **Hoàn thành** - Tính năng đã được implement
- 🚧 **Đang làm** - Đang trong quá trình phát triển
- ❌ **Chưa làm** - Chưa bắt đầu
- ⚠️ **Cần cải thiện** - Đã có nhưng cần tối ưu
- 📌 **Ưu tiên cao** - Cần hoàn thành sớm
- 🔄 **Phụ thuộc** - Chờ API/backend
- 💡 **Gợi ý** - Best practices

---

## 🎯 Mục tiêu hoàn thiện

### Phase 1: MVP (Minimum Viable Product)

- ✅ Authentication & Authorization
- ✅ Basic CRUD operations
- 🚧 Document processing workflow
- 🚧 Question generation (AI)
- ❌ Quiz taking & results

### Phase 2: Core Features

- ❌ Validation workflow
- ❌ Subscription & payments
- ❌ Notifications system
- ❌ Progress tracking

### Phase 3: Advanced Features

- ❌ Expert dashboard
- ❌ Admin analytics
- ❌ Commission management
- ❌ System configuration

### Phase 4: Polish & Optimization

- ❌ Performance optimization
- ❌ i18n (Tiếng Việt + English)
- ❌ Accessibility improvements
- ❌ Error boundary & logging

---

## 📞 Liên hệ & Hỗ trợ

**Email**: dev@learinal.com
**Repository**: [Private - Learinal-FE]

---

**Lưu ý**: Tài liệu này là living document và sẽ được cập nhật liên tục theo tiến độ dự án.
