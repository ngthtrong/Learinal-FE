# Frontend Features Documentation - Learinal

📚 **Tài liệu đầy đủ về các tính năng Frontend của dự án Learinal**

---

## 📖 Giới thiệu

Bộ tài liệu này mô tả chi tiết **tất cả các tính năng frontend** mà dự án Learinal cần triển khai để đạt được phiên bản hoàn chỉnh v1.0, dựa trên:

- ✅ Software Requirements Specification (SRS)
- ✅ Software Design Document (SDD)
- ✅ OpenAPI Documentation (API specs)
- ✅ Current Codebase Analysis

---

## 🗂️ Cấu trúc tài liệu

### 📄 [00-OVERVIEW.md](./00-OVERVIEW.md)

**Tổng quan dự án**

- Phạm vi dự án (In scope / Out of scope)
- Tech stack
- Thống kê tính năng theo vai trò
- Quy ước ký hiệu

### 🔐 [01-AUTHENTICATION.md](./01-AUTHENTICATION.md)

**Xác thực & Quản lý tài khoản** (62.5% complete)

- UC-001: Đăng ký tài khoản
- UC-002: Đăng nhập (Local + OAuth Google)
- UC-AUTH: Protected routes & RBAC
- Email verification
- Forgot/Reset password
- Session management
- **Status**: 🟢 5/8 hoàn thành

### 📚 [02-SUBJECTS-DOCUMENTS.md](./02-SUBJECTS-DOCUMENTS.md)

**Quản lý Môn học & Tài liệu** (16.7% complete)

- UC-CREATE-SUBJECT: Tạo môn học
- UC-003: Upload & xử lý tài liệu (PDF/DOCX/TXT)
- UC-003A: Tóm tắt tự động từng tài liệu
- UC-004: Tạo mục lục & tóm tắt môn học (AI)
- UC-009: Xóa tài liệu
- **Status**: 🟡 2/12 hoàn thành

### 📝 [03-QUESTIONS-QUIZ.md](./03-QUESTIONS-QUIZ.md)

**Câu hỏi & Bài thi** (0% complete)

- UC-005: Tạo bộ câu hỏi tự động (AI)
- UC-006: Làm bài thi trắc nghiệm
- UC-007: Xem kết quả & đáp án
- UC-008: Dashboard tiến độ học tập
- UC-011: Chia sẻ bộ đề
- **Status**: 🔴 0/10 chưa bắt đầu

### 💳 [04-SUBSCRIPTIONS-PAYMENTS.md](./04-SUBSCRIPTIONS-PAYMENTS.md)

**Đăng ký gói & Thanh toán** (0% complete)

- UC-020: Xem gói dịch vụ & So sánh
- UC-PAYMENT: Thanh toán qua Sepay
- UC-MY-SUBSCRIPTION: Quản lý gói đăng ký
- UC-INVOICE: Tải hóa đơn điện tử
- **Status**: 🔴 0/6 chưa bắt đầu

### 🔔 [05-NOTIFICATIONS.md](./05-NOTIFICATIONS.md)

**Hệ thống thông báo** (0% complete)

- UC-021: Nhận thông báo realtime (WebSocket)
- UC-NOTIF-LIST: Xem danh sách thông báo
- UC-NOTIF-MARK: Đánh dấu đã đọc/chưa đọc
- UC-NOTIF-DELETE: Xóa thông báo
- UC-NOTIF-PREFS: Cài đặt thông báo
- **Status**: 🔴 0/5 chưa bắt đầu

### 👤 [06-PROFILE-SETTINGS.md](./06-PROFILE-SETTINGS.md)

**Hồ sơ & Cài đặt cá nhân** (0% complete)

- UC-PROFILE-VIEW: Xem hồ sơ cá nhân
- UC-PROFILE-EDIT: Chỉnh sửa hồ sơ
- UC-PASSWORD-CHANGE: Đổi mật khẩu
- UC-SETTINGS: Cài đặt ứng dụng
- UC-SECURITY: Quản lý bảo mật
- **Status**: 🔴 0/5 chưa bắt đầu

### � [04-SUBSCRIPTIONS-PAYMENTS.md](./04-SUBSCRIPTIONS-PAYMENTS.md) _(Chưa tạo)_

**Đăng ký gói & Thanh toán** (0% complete)

- Subscription plans page
- Sepay QR payment integration
- My subscription page
- Entitlements enforcement
- **Status**: 🔴 0/5 chưa bắt đầu

### 🔔 [05-NOTIFICATIONS.md](./05-NOTIFICATIONS.md) _(Chưa tạo)_

**Hệ thống thông báo** (0% complete)

- UC-021: Notification center
- WebSocket realtime
- Mark as read
- Notification types & filters
- **Status**: 🔴 0/4 chưa bắt đầu

### 👤 [06-PROFILE-SETTINGS.md](./06-PROFILE-SETTINGS.md) _(Chưa tạo)_

**Hồ sơ & Cài đặt cá nhân** (0% complete)

- View profile
- Edit profile
- Change password
- Notification preferences
- **Status**: 🔴 0/4 chưa bắt đầu

---

## 🎓 Expert Features (Chuyên gia)

### 🔍 [07-EXPERT-VALIDATION.md](./07-EXPERT-VALIDATION.md)

**Kiểm duyệt & Xác thực** (0% complete)

- UC-012: Tiếp nhận và kiểm duyệt bộ câu hỏi
- UC-013: Tạo bộ câu hỏi chuẩn (premium content)
- Expert dashboard
- Review workflow với editor
- **Status**: 🔴 0/6 chưa bắt đầu

### 💰 [08-EXPERT-EARNINGS.md](./08-EXPERT-EARNINGS.md)

**Quản lý Thu nhập** (0% complete)

- UC-014: Theo dõi thu nhập & hoa hồng
- Earnings overview & chart
- Commission history
- Export earnings report
- **Status**: 🔴 0/3 chưa bắt đầu

---

## 🎛️ Admin Features (Quản trị viên)

### 👥 [09-ADMIN-SYSTEM-PART1.md](./09-ADMIN-SYSTEM-PART1.md)

**Quản lý Hệ thống (Phần 1)** (0% complete)

- UC-015: Phân công yêu cầu xác thực
- UC-016: Quản lý người dùng
- Admin dashboard
- Validation requests management
- User management (view, edit, deactivate, change role)
- **Status**: 🔴 0/4 chưa bắt đầu

### 💵 [10-ADMIN-FINANCE.md](./10-ADMIN-FINANCE.md)

**Quản lý Tài chính & Nội dung (Phần 2)** (0% complete)

- UC-017: Theo dõi doanh thu
- UC-018: Quản lý thanh toán cho Expert
- UC-019: Duyệt và xuất bản nội dung Expert
- UC-020: Cấu hình gói dịch vụ & chính sách
- Revenue dashboard & reports
- Expert payment management
- Content approval workflow
- System settings & policies
- **Status**: 🔴 0/4 chưa bắt đầu

---

## 🎨 UI/UX & Cross-cutting Concerns

### 🎨 [11-UI-UX-REQUIREMENTS.md](./11-UI-UX-REQUIREMENTS.md) _(Chưa tạo)_

**Thiết kế & Trải nghiệm người dùng** (Partial)

- Design system & component library
- Responsive design guidelines
- Accessibility (WCAG 2.1 Level AA)
- Loading states & skeletons
- Error handling & empty states
- Toast notifications
- **Status**: � Một phần đã hoàn thành

### ⚡ [12-PERFORMANCE-SECURITY.md](./12-PERFORMANCE-SECURITY.md) _(Chưa tạo)_

**Hiệu năng & Bảo mật** (Partial)

- Performance optimization
- Code splitting & lazy loading
- Caching strategies
- Security best practices
- Input validation & sanitization
- HTTPS & CORS
- **Status**: 🟡 Một phần đã hoàn thành

---

## 📊 [13-IMPLEMENTATION-STATUS.md](./13-IMPLEMENTATION-STATUS.md)

### 💳 [04-SUBSCRIPTIONS-PAYMENTS.md](./04-SUBSCRIPTIONS-PAYMENTS.md) _(Chưa tạo)_

**Đăng ký gói & Thanh toán** (0% complete)

- UC-020: Quản lý gói đăng ký
- Sepay QR payment integration
- My subscription page
- Entitlements enforcement
- **Status**: 🔴 0/5 chưa bắt đầu

### 🔔 [05-NOTIFICATIONS.md](./05-NOTIFICATIONS.md) _(Chưa tạo)_

**Hệ thống thông báo** (0% complete)

- UC-021: Notification center
- WebSocket realtime
- Mark as read
- Notification types & filters
- **Status**: 🔴 0/4 chưa bắt đầu

### � [06-PROFILE-SETTINGS.md](./06-PROFILE-SETTINGS.md) _(Chưa tạo)_

**Hồ sơ & Cài đặt cá nhân** (0% complete)

- View profile
- Edit profile
- Change password
- Notification preferences
- **Status**: 🔴 0/4 chưa bắt đầu

---

## 🎓 Expert Features (Chuyên gia)

### � [07-EXPERT-VALIDATION.md](./07-EXPERT-VALIDATION.md)

**Kiểm duyệt & Xác thực** (0% complete)

- UC-012: Tiếp nhận và kiểm duyệt bộ câu hỏi
- UC-013: Tạo bộ câu hỏi chuẩn (premium content)
- Expert dashboard
- Review workflow với editor
- **Status**: 🔴 0/6 chưa bắt đầu

### 💰 [08-EXPERT-EARNINGS.md](./08-EXPERT-EARNINGS.md)

**Quản lý Thu nhập** (0% complete)

- UC-014: Theo dõi thu nhập & hoa hồng
- Earnings overview & chart
- Commission history
- Export earnings report
- **Status**: 🔴 0/3 chưa bắt đầu

---

## 🎛️ Admin Features (Quản trị viên)

### 👥 [09-ADMIN-SYSTEM-PART1.md](./09-ADMIN-SYSTEM-PART1.md)

**Quản lý Hệ thống (Phần 1)** (0% complete)

- UC-015: Phân công yêu cầu xác thực
- UC-016: Quản lý người dùng
- Admin dashboard
- Validation requests management
- User management (view, edit, deactivate, change role)
- **Status**: 🔴 0/4 chưa bắt đầu

### 💵 [10-ADMIN-FINANCE.md](./10-ADMIN-FINANCE.md)

**Quản lý Tài chính & Nội dung (Phần 2)** (0% complete)

- UC-017: Theo dõi doanh thu
- UC-018: Quản lý thanh toán cho Expert
- UC-019: Duyệt và xuất bản nội dung Expert
- UC-020: Cấu hình gói dịch vụ & chính sách
- Revenue dashboard & reports
- Expert payment management
- Content approval workflow
- System settings & policies
- **Status**: 🔴 0/4 chưa bắt đầu

---

## 🎨 UI/UX & Cross-cutting Concerns

### 🎨 [11-UI-UX-REQUIREMENTS.md](./11-UI-UX-REQUIREMENTS.md)

**Thiết kế & Trải nghiệm người dùng**

- Design system (colors, typography, spacing)
- Component library (Button, Input, Card, Modal, Toast)
- Responsive design guidelines
- Accessibility (WCAG 2.1 Level AA)
- Animations & micro-interactions
- Grid system & layouts
- i18n & number formatting
- Best practices checklist
- **Status**: � Tài liệu tham khảo

### ⚡ [12-PERFORMANCE-SECURITY.md](./12-PERFORMANCE-SECURITY.md)

**Hiệu năng & Bảo mật**

- Performance optimization (code splitting, lazy loading, memoization)
- Image optimization
- Virtual scrolling
- Debounce & throttle
- Bundle size optimization
- Authentication & authorization
- XSS & CSRF prevention
- Input validation & sanitization
- Error handling & monitoring
- Testing requirements
- **Status**: � Tài liệu tham khảo

---

## 📊 [13-IMPLEMENTATION-STATUS.md](./13-IMPLEMENTATION-STATUS.md)

## � [13-IMPLEMENTATION-STATUS.md](./13-IMPLEMENTATION-STATUS.md)

- Preferences
- Language settings (i18n)
- **Status**: 🔴 0/4 chưa bắt đầu

### 🎨 [10-UI-UX-REQUIREMENTS.md](./10-UI-UX-REQUIREMENTS.md) _(Chưa tạo)_

**Yêu cầu Giao diện & Trải nghiệm** (20% complete)

- Design system
- Component library
- Responsive breakpoints
- Accessibility (WCAG 2.1 AA)
- Internationalization (i18n)
- Loading & error states
- **Status**: 🟡 3/15 components done

### ⚡ [11-PERFORMANCE-SECURITY.md](./11-PERFORMANCE-SECURITY.md) _(Chưa tạo)_

**Hiệu năng & Bảo mật**

- Performance requirements (NFR-005 đến NFR-009)
- Security requirements (NFR-010 đến NFR-014)
- Caching strategies
- Code splitting
- Error boundaries
- Monitoring & logging

### 📊 [12-IMPLEMENTATION-STATUS.md](./12-IMPLEMENTATION-STATUS.md)

**Trạng thái Triển khai & Roadmap** ✅

- Tổng quan tiến độ (13% overall)
- Chi tiết theo từng module
- Sprint planning (10 sprints)
- Blockers & risks
- Definition of Done
- Metrics & KPIs

---

## 🎯 Quick Stats

### Tiến độ tổng thể

```
✅ Hoàn thành:     10 features (13%)
🚧 Đang làm:       13 features (17%)
❌ Chưa bắt đầu:   54 features (70%)
─────────────────────────────────────
📊 TỔNG:           77 features
```

### Theo vai trò người dùng

| Vai trò     | Use Cases | Tiến độ |
| ----------- | --------- | ------- |
| **Learner** | 11 UC     | 🟡 27%  |
| **Expert**  | 3 UC      | 🔴 0%   |
| **Admin**   | 7 UC      | 🔴 0%   |
| **Common**  | 2 UC      | 🟢 75%  |

### Theo độ ưu tiên

| Priority          | Count | Done | %   |
| ----------------- | ----- | ---- | --- |
| 🔴 **CAO**        | 45    | 8    | 18% |
| 🟡 **TRUNG BÌNH** | 25    | 2    | 8%  |
| 🟢 **THẤP**       | 7     | 0    | 0%  |

---

## 🚀 Getting Started

### Đọc tài liệu

**Lần đầu tiên:**

1. Đọc [00-OVERVIEW.md](./00-OVERVIEW.md) để hiểu tổng quan
2. Đọc [12-IMPLEMENTATION-STATUS.md](./12-IMPLEMENTATION-STATUS.md) để biết tiến độ
3. Chọn module bạn quan tâm và đọc chi tiết

**Khi phát triển tính năng mới:**

1. Tìm UC tương ứng trong tài liệu
2. Đọc kỹ API endpoints
3. Xem mockup/wireframe (nếu có)
4. Check dependencies
5. Implement theo checklist

### Cập nhật tài liệu

Khi hoàn thành một feature:

```bash
# 1. Update status trong file tương ứng
# Đổi ❌ thành ✅ hoặc 🚧

# 2. Update 12-IMPLEMENTATION-STATUS.md
# Cập nhật % complete và notes

# 3. Commit với message
git commit -m "docs: mark UC-XXX as complete"
```

---

## 📋 Checklist cho Developer

### Trước khi bắt đầu feature mới

- [ ] Đọc UC specification trong tài liệu
- [ ] Hiểu API endpoints & data models
- [ ] Check dependencies (backend APIs ready?)
- [ ] Review mockup/wireframe
- [ ] Tạo branch: `feature/UC-XXX-description`

### Khi implement

- [ ] Follow design system
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Handle empty states
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Accessibility (keyboard navigation)
- [ ] Form validation
- [ ] i18n strings (prepare for translation)

### Trước khi commit

- [ ] Test trên 3 breakpoints
- [ ] Test error scenarios
- [ ] Check console (no errors)
- [ ] Lighthouse score check
- [ ] Update documentation
- [ ] Create PR với description rõ ràng

---

## 🏗️ Tech Stack

### Core

- React 19.1.1
- React Router v7
- Vite (build tool)

### State Management

- React Context API
- Local state với hooks

### HTTP Client

- Axios với interceptors
- JWT authentication

### Styling

- CSS Modules
- Global CSS
- Responsive (mobile-first)

### Future Considerations

- TypeScript migration
- Zustand/Redux (nếu cần)
- React Query (data fetching)
- Tailwind CSS (styling)

---

## 📚 Tài liệu liên quan

- 📄 [SRS for Learinal](../SRS%20for%20Learinal.md)
- 📄 [SDD - System Design](../SDD_Learinal.md)
- 📄 [OpenAPI Specification](../api/openapi-learinal-complete.yaml)
- 📄 [MongoDB Schema](../mongodb-schema.md)
- 📄 [Project README](../../README.md)

---

## 🤝 Contributing

### Quy trình làm việc

1. **Pick a task** từ sprint backlog
2. **Create branch**: `feature/UC-XXX-name`
3. **Implement** theo tài liệu spec
4. **Test** thoroughly
5. **Update docs** (status, notes)
6. **Create PR** với description đầy đủ
7. **Code review** với team
8. **Merge** sau khi approved

### Coding Standards

- Follow ESLint config
- Use functional components & hooks
- PropTypes cho type checking (hoặc TypeScript)
- Meaningful component/variable names
- Comments cho logic phức tạp
- Reusable components trong `/components/common`

---

## 📊 Progress Tracking

### Tiến độ theo Sprint

| Sprint      | Duration   | Goal                         | Status |
| ----------- | ---------- | ---------------------------- | ------ |
| Sprint 1    | Week 1-2   | Authentication & Upload      | 🟢 80% |
| Sprint 2    | Week 3-4   | Subject Management           | 🟡 20% |
| Sprint 3    | Week 5-6   | AI Features (ToC, Questions) | 🔴 0%  |
| Sprint 4    | Week 7-8   | Quiz System                  | 🔴 0%  |
| Sprint 5    | Week 9-10  | Subscriptions                | 🔴 0%  |
| Sprint 6    | Week 11-12 | Validation Workflow          | 🔴 0%  |
| Sprint 7-8  | Week 13-16 | Admin Features               | 🔴 0%  |
| Sprint 9-10 | Week 17-20 | Polish & Launch              | 🔴 0%  |

### Mục tiêu từng Phase

**Phase 1: MVP** (Sprint 1-4)

- ✅ Authentication
- 🚧 Document processing
- 🔴 Question generation
- 🔴 Quiz taking

**Phase 2: Core** (Sprint 5-6)

- 🔴 Validation workflow
- 🔴 Subscriptions
- 🔴 Notifications

**Phase 3: Advanced** (Sprint 7-8)

- 🔴 Expert dashboard
- 🔴 Admin panel
- 🔴 Analytics

**Phase 4: Launch** (Sprint 9-10)

- 🔴 Performance optimization
- 🔴 i18n
- 🔴 Production ready

---

## ⚠️ Important Notes

### Critical Dependencies

🔴 **HIGH PRIORITY** blockers:

- LLM API stability (affects ToC, Questions, Summary)
- Sepay payment credentials (affects Subscriptions)
- WebSocket server (affects Notifications)

🟡 **MEDIUM PRIORITY**:

- File upload chunking (large files)
- Background job status tracking

### Known Issues

1. OAuth callback state validation cần strengthen
2. Token refresh race condition (đang fix)
3. File upload progress chưa accurate với large files
4. Mobile responsive cần improve một số pages

---

## 📞 Support & Contact

**Frontend Team Lead**: [Name]
**Slack**: #frontend-learinal
**Email**: dev@learinal.com

**Daily Standup**: 9:00 AM (UTC+7)
**Sprint Planning**: Monday 2:00 PM
**Sprint Review**: Friday 3:00 PM
**Retro**: Friday 4:00 PM

---

## 📝 Changelog

### Version 1.0 (05/11/2025)

- Initial documentation structure
- Complete Authentication module docs
- Complete Subjects & Documents module docs
- Implementation status tracking
- Sprint planning & roadmap

### Next Update (12/11/2025)

- [ ] Add remaining module docs (03-11)
- [ ] Update progress after Sprint 2
- [ ] Add component library documentation
- [ ] Add API integration examples

---

**Maintained by**: Learinal Frontend Team
**Last updated**: 05/11/2025
**Version**: 1.0
**Status**: 🟢 Active Development

---

## 🎯 Quick Links

- [Start here: Overview](./00-OVERVIEW.md)
- [Check progress: Implementation Status](./12-IMPLEMENTATION-STATUS.md)
- [Authentication Guide](./01-AUTHENTICATION.md)
- [Subjects & Docs Guide](./02-SUBJECTS-DOCUMENTS.md)
- [Main Project README](../../README.md)
- [API Documentation](../api/README-API-DOCS.md)

---

**Happy Coding! 🚀**
