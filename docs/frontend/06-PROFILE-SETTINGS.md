# 06 - Hồ sơ & Cài đặt

**Module**: Profile & Settings
**Vai trò**: Tất cả (Learner, Expert, Admin)
**Priority**: TRUNG BÌNH
**Completion**: 0% (0/5 features)

---

## 📋 Tổng quan

Module này cho phép người dùng:

- Xem thông tin hồ sơ cá nhân
- Chỉnh sửa profile (avatar, tên, bio, etc.)
- Đổi mật khẩu
- Cài đặt preferences (ngôn ngữ, theme, thông báo)
- Quản lý bảo mật (2FA, sessions)

---

## 🎯 Use Cases

### UC-PROFILE-VIEW: Xem hồ sơ cá nhân

**Mô tả**: Người dùng xem thông tin hồ sơ của chính mình.

**Priority**: TRUNG BÌNH
**Status**: ❌ Chưa triển khai

**Actors**: All users

**Preconditions**: User đã đăng nhập

**Main Flow**:

1. User click vào avatar dropdown → "Hồ sơ" hoặc truy cập `/profile`
2. Hệ thống hiển thị trang Profile với:
   - **Header Section**:
     - Avatar (large, circular)
     - Full name
     - Role badge (Learner/Expert/Admin)
     - Email
     - Member since date
   - **Stats Section** (role-specific):
     - **Learner**:
       - Tổng môn học
       - Tổng bộ đề đã tạo
       - Tổng lần làm bài
       - Điểm trung bình
     - **Expert**:
       - Số bộ đề đã duyệt
       - Số bộ đề đã tạo
       - Approval rate
       - Total earnings
     - **Admin**:
       - Total users
       - Total revenue
       - Active subscriptions
   - **Bio Section**:
     - Short bio (markdown supported)
     - Interests/tags
   - **Actions**:
     - "Chỉnh sửa hồ sơ" button

**Postconditions**: User hiểu được thông tin cá nhân

---

### UC-PROFILE-EDIT: Chỉnh sửa hồ sơ

**Mô tả**: Người dùng cập nhật thông tin hồ sơ cá nhân.

**Priority**: TRUNG BÌNH
**Status**: ❌ Chưa triển khai

**Actors**: All users

**Preconditions**: User đã đăng nhập

**Main Flow**:

1. User click "Chỉnh sửa hồ sơ"
2. Hệ thống hiển thị form với các trường:
   - **Avatar**:
     - Current avatar preview
     - Upload button
     - Remove button
   - **Personal Info**:
     - First name (required)
     - Last name (required)
     - Display name (optional)
     - Phone number (optional)
     - Date of birth (optional)
   - **Bio**:
     - Rich text editor (markdown)
     - Character limit: 500
   - **Interests** (Learner only):
     - Tags input (subjects interested in)
     - Max 10 tags
   - **Expertise** (Expert only):
     - Subject tags (areas of expertise)
     - Years of experience (number input)
3. User chỉnh sửa thông tin
4. User click "Lưu"
5. Hệ thống:
   - Validate form
   - Upload avatar (if changed)
   - Update user profile
   - Hiển thị success message
   - Redirect về trang Profile view

**Alternative Flow**:

- **5a. Validation error**:
  - Hiển thị lỗi dưới field tương ứng
  - User sửa và submit lại
- **5b. Avatar upload error**:
  - File quá lớn (> 2MB)
  - Format không hợp lệ (chỉ jpg, png, webp)
  - Hiển thị error message

**Postconditions**:

- Profile được cập nhật
- Avatar mới được hiển thị (nếu có)

**Business Rules**:

- Avatar max size: 2MB
- Supported formats: JPEG, PNG, WebP
- Bio max length: 500 chars
- Phone number phải đúng định dạng VN
- Display name không được chứa ký tự đặc biệt

---

### UC-PASSWORD-CHANGE: Đổi mật khẩu

**Mô tả**: Người dùng thay đổi mật khẩu hiện tại.

**Priority**: CAO
**Status**: ❌ Chưa triển khai

**Actors**: All users (trừ OAuth users)

**Preconditions**:

- User đã đăng nhập
- User không đăng nhập bằng OAuth (Google/Facebook)

**Main Flow**:

1. User truy cập Settings → Security → "Đổi mật khẩu"
2. Hệ thống hiển thị form:
   - Current password (required)
   - New password (required)
   - Confirm new password (required)
   - Password strength indicator
3. User nhập thông tin
4. User click "Đổi mật khẩu"
5. Hệ thống:
   - Verify current password
   - Validate new password (min 8 chars, uppercase, lowercase, number, special char)
   - Check new password != current password
   - Check new password == confirm password
   - Hash new password
   - Update trong DB
   - Invalidate all refresh tokens (force re-login on other devices)
   - Gửi email xác nhận
   - Hiển thị success message
6. User được redirect về Login page

**Alternative Flow**:

- **5a. Current password incorrect**:
  - Hiển thị error: "Mật khẩu hiện tại không đúng"
  - Không submit form
- **5b. New password weak**:
  - Hiển thị error: "Mật khẩu mới không đủ mạnh"
  - Suggestions để improve
- **5c. Passwords không match**:
  - Hiển thị error: "Mật khẩu xác nhận không khớp"

**Postconditions**:

- Password được cập nhật
- User phải login lại
- Email thông báo được gửi

**Business Rules**:

- Min length: 8 characters
- Phải có: uppercase, lowercase, number, special char
- Không được giống mật khẩu cũ
- Không được chứa email/username

---

### UC-SETTINGS: Cài đặt ứng dụng

**Mô tả**: Người dùng cấu hình preferences cho ứng dụng.

**Priority**: THẤP
**Status**: ❌ Chưa triển khai

**Actors**: All users

**Preconditions**: User đã đăng nhập

**Main Flow**:

1. User truy cập Settings
2. Hệ thống hiển thị các categories:
   - **General**:
     - Language: Dropdown (Tiếng Việt, English)
     - Timezone: Dropdown
     - Date format: Dropdown (DD/MM/YYYY, MM/DD/YYYY, etc.)
   - **Appearance**:
     - Theme: Radio (Light, Dark, Auto)
     - Font size: Slider (Small, Medium, Large)
     - Compact mode: Toggle
   - **Privacy**:
     - Profile visibility: Radio (Public, Private)
     - Show email: Toggle
     - Show stats: Toggle
   - **Notifications** (link to UC-NOTIF-PREFS):
     - Link to Notification Settings page
3. User thay đổi settings
4. Hệ thống auto-save (debounced)
5. Apply changes ngay lập tức

**Alternative Flow**:

- **4a. Save error**:
  - Hiển thị toast error
  - Revert changes
  - User có thể retry

**Postconditions**:

- Settings được persist
- UI cập nhật theo settings

---

### UC-SECURITY: Quản lý bảo mật

**Mô tả**: Người dùng quản lý các tùy chọn bảo mật như 2FA, sessions.

**Priority**: THẤP
**Status**: ❌ Chưa triển khai (v1.0)

**Actors**: All users

**Preconditions**: User đã đăng nhập

**Main Flow**:

1. User truy cập Settings → Security
2. Hệ thống hiển thị:
   - **Two-Factor Authentication** (future):
     - Status: Enabled/Disabled
     - Enable/Disable button
   - **Active Sessions**:
     - List of active sessions:
       - Device name
       - Browser
       - Location (IP)
       - Last active
       - Current session badge
     - "Đăng xuất tất cả" button
   - **Login History** (future):
     - Recent login activities
3. User có thể:
   - Revoke specific session
   - Logout all other sessions
   - Enable/Disable 2FA (future)

**Postconditions**:

- User kiểm soát được các phiên đăng nhập
- Tăng cường bảo mật

---

## 🖥️ UI Components

### 1. Profile View Page

**Route**: `/profile`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
ProfileView/
├── ProfileViewPage.jsx
├── ProfileViewPage.css
├── index.js
└── components/
    ├── ProfileHeader.jsx          // Avatar, name, role
    ├── ProfileStats.jsx           // Stats cards
    ├── ProfileBio.jsx             // Bio section
    └── ProfileActions.jsx         // Edit button
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────┐
│ 👤 Hồ sơ cá nhân                                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│              ┌──────────┐                          │
│              │          │                          │
│              │  Avatar  │   Nguyễn Văn A          │
│              │   150px  │   🎓 Learner            │
│              │          │   a@example.com          │
│              └──────────┘   Tham gia: 01/11/2025   │
│                                                      │
│                     [Chỉnh sửa hồ sơ]              │
│                                                      │
│ ┌──────────────────────────────────────────────┐  │
│ │ 📊 Thống kê                                  │  │
│ ├──────────────────────────────────────────────┤  │
│ │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐   │  │
│ │  │Môn học│  │Bộ đề │  │Lần thi│  │Điểm TB│   │  │
│ │  │  5   │  │  12  │  │  45  │  │ 7.8  │   │  │
│ │  └──────┘  └──────┘  └──────┘  └──────┘   │  │
│ └──────────────────────────────────────────────┘  │
│                                                      │
│ ┌──────────────────────────────────────────────┐  │
│ │ 📝 Giới thiệu                                │  │
│ ├──────────────────────────────────────────────┤  │
│ │ Sinh viên năm 2, đam mê học toán và lập      │  │
│ │ trình. Mục tiêu đạt GPA 3.5+ trong học kỳ    │  │
│ │ này.                                          │  │
│ └──────────────────────────────────────────────┘  │
│                                                      │
│ ┌──────────────────────────────────────────────┐  │
│ │ 🏷️ Sở thích                                  │  │
│ ├──────────────────────────────────────────────┤  │
│ │ [Toán học] [Vật lý] [Lập trình] [AI]        │  │
│ └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

### 2. Profile Edit Page

**Route**: `/profile/edit`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
ProfileEdit/
├── ProfileEditPage.jsx
├── ProfileEditPage.css
├── index.js
└── components/
    ├── AvatarUpload.jsx           // Avatar upload
    ├── PersonalInfoForm.jsx       // Form fields
    ├── BioEditor.jsx              // Markdown editor
    └── TagsInput.jsx              // Tags input
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────┐
│ ✏️ Chỉnh sửa hồ sơ                                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Avatar                                              │
│ ┌────────────────────────────────────────────┐     │
│ │   ┌──────────┐                             │     │
│ │   │          │  [Tải ảnh lên]  [Xóa]      │     │
│ │   │  Current │                             │     │
│ │   │  Avatar  │  Max 2MB, JPG/PNG/WebP      │     │
│ │   └──────────┘                             │     │
│ └────────────────────────────────────────────┘     │
│                                                      │
│ Thông tin cá nhân                                   │
│ ┌────────────────────────────────────────────┐     │
│ │ Họ *          [Nguyễn                    ] │     │
│ │ Tên *         [Văn A                     ] │     │
│ │ Tên hiển thị  [nguyenvana123             ] │     │
│ │ Số điện thoại [0901234567                ] │     │
│ │ Ngày sinh     [01/01/2000         ▼]      │     │
│ └────────────────────────────────────────────┘     │
│                                                      │
│ Giới thiệu                                          │
│ ┌────────────────────────────────────────────┐     │
│ │ ┌────────────────────────────────────────┐ │     │
│ │ │ Sinh viên năm 2, đam mê học toán...   │ │     │
│ │ │                                        │ │     │
│ │ │ [Markdown supported]                  │ │     │
│ │ └────────────────────────────────────────┘ │     │
│ │ 125/500 ký tự                             │     │
│ └────────────────────────────────────────────┘     │
│                                                      │
│ Sở thích                                            │
│ ┌────────────────────────────────────────────┐     │
│ │ [Toán học] ✕ [Vật lý] ✕ [Lập trình] ✕    │     │
│ │ Thêm tag...                                │     │
│ │ Max 10 tags                                │     │
│ └────────────────────────────────────────────┘     │
│                                                      │
│           [Hủy]              [Lưu thay đổi]        │
└─────────────────────────────────────────────────────┘
```

---

### 3. Security Settings Page

**Route**: `/settings/security`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
SecuritySettings/
├── SecuritySettingsPage.jsx
├── SecuritySettingsPage.css
├── index.js
└── components/
    ├── ChangePasswordForm.jsx     // Form đổi mật khẩu
    ├── PasswordStrengthMeter.jsx  // Strength indicator
    ├── ActiveSessionsList.jsx     // List sessions
    └── SessionCard.jsx            // Session item
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────┐
│ 🔒 Bảo mật                                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│ 🔑 Đổi mật khẩu                                    │
│ ┌────────────────────────────────────────────┐     │
│ │ Mật khẩu hiện tại * [••••••••••••        ] │     │
│ │                                             │     │
│ │ Mật khẩu mới *      [••••••••••••        ] │     │
│ │ Độ mạnh: ████████░░ Mạnh                   │     │
│ │                                             │     │
│ │ Xác nhận mật khẩu * [••••••••••••        ] │     │
│ │                                             │     │
│ │ Yêu cầu:                                    │     │
│ │ ✓ Ít nhất 8 ký tự                          │     │
│ │ ✓ Chữ hoa và chữ thường                    │     │
│ │ ✓ Số                                        │     │
│ │ ✗ Ký tự đặc biệt                           │     │
│ │                                             │     │
│ │              [Đổi mật khẩu]                │     │
│ └────────────────────────────────────────────┘     │
│                                                      │
│ 🖥️ Phiên đăng nhập                                │
│ ┌────────────────────────────────────────────┐     │
│ │ 💻 Windows - Chrome                        │     │
│ │    IP: 103.45.67.89 • Hà Nội              │     │
│ │    Hoạt động: Hiện tại     [Phiên này]    │     │
│ ├────────────────────────────────────────────┤     │
│ │ 📱 iPhone - Safari                         │     │
│ │    IP: 103.45.67.90 • Hà Nội              │     │
│ │    Hoạt động: 2 giờ trước  [Đăng xuất]    │     │
│ └────────────────────────────────────────────┘     │
│                                                      │
│              [Đăng xuất tất cả thiết bị]           │
│                                                      │
│ 🔐 Xác thực 2 yếu tố (2FA) - Coming soon           │
│ ┌────────────────────────────────────────────┐     │
│ │ Tăng cường bảo mật bằng 2FA                │     │
│ │ [Đang phát triển]                          │     │
│ └────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

---

### 4. App Settings Page

**Route**: `/settings`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
AppSettings/
├── AppSettingsPage.jsx
├── AppSettingsPage.css
├── index.js
└── components/
    ├── SettingsSection.jsx        // Section wrapper
    ├── LanguageSelector.jsx       // Dropdown
    ├── ThemeSelector.jsx          // Radio group
    └── PrivacyToggles.jsx         // Toggle switches
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────┐
│ ⚙️ Cài đặt                                         │
├─────────────────────────────────────────────────────┤
│                                                      │
│ 🌐 Chung                                           │
│ ┌────────────────────────────────────────────┐     │
│ │ Ngôn ngữ       [Tiếng Việt        ▼]      │     │
│ │ Múi giờ        [Asia/Ho_Chi_Minh  ▼]      │     │
│ │ Định dạng ngày [DD/MM/YYYY        ▼]      │     │
│ └────────────────────────────────────────────┘     │
│                                                      │
│ 🎨 Giao diện                                       │
│ ┌────────────────────────────────────────────┐     │
│ │ Chủ đề                                      │     │
│ │  ○ Sáng  ● Tối  ○ Tự động                 │     │
│ │                                             │     │
│ │ Kích thước chữ                             │     │
│ │  ○───●───○  Medium                         │     │
│ │  Nhỏ     Lớn                               │     │
│ │                                             │     │
│ │ Chế độ gọn   [OFF] ───○                    │     │
│ └────────────────────────────────────────────┘     │
│                                                      │
│ 🔒 Quyền riêng tư                                  │
│ ┌────────────────────────────────────────────┐     │
│ │ Hiển thị hồ sơ công khai [ON]  ●───        │     │
│ │ Hiển thị email           [OFF] ───○        │     │
│ │ Hiển thị thống kê        [ON]  ●───        │     │
│ └────────────────────────────────────────────┘     │
│                                                      │
│ 🔔 Thông báo                                       │
│ ┌────────────────────────────────────────────┐     │
│ │ [Quản lý thông báo →]                      │     │
│ └────────────────────────────────────────────┘     │
│                                                      │
│ 💾 Tự động lưu thay đổi                            │
└─────────────────────────────────────────────────────┘
```

---

## 📡 API Services

### users.service.js

```javascript
/**
 * Users Service
 * API for user profile and settings
 */

import axiosInstance from "./axios.config";

const BASE_PATH = "/users";

export const usersService = {
  /**
   * Get my profile
   * @returns {Promise<Object>}
   */
  getMyProfile: async () => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/me`);
    return data;
  },

  /**
   * Update my profile
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  updateProfile: async (payload) => {
    const { data } = await axiosInstance.patch(`${BASE_PATH}/me`, payload);
    return data;
  },

  /**
   * Upload avatar
   * @param {File} file
   * @returns {Promise<Object>}
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const { data } = await axiosInstance.post(`${BASE_PATH}/me/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /**
   * Delete avatar
   * @returns {Promise<void>}
   */
  deleteAvatar: async () => {
    await axiosInstance.delete(`${BASE_PATH}/me/avatar`);
  },

  /**
   * Change password
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  changePassword: async (payload) => {
    const { data } = await axiosInstance.post(`${BASE_PATH}/me/change-password`, payload);
    return data;
  },

  /**
   * Get my settings
   * @returns {Promise<Object>}
   */
  getSettings: async () => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/me/settings`);
    return data;
  },

  /**
   * Update settings
   * @param {Object} settings
   * @returns {Promise<Object>}
   */
  updateSettings: async (settings) => {
    const { data } = await axiosInstance.patch(`${BASE_PATH}/me/settings`, settings);
    return data;
  },

  /**
   * Get active sessions
   * @returns {Promise<Object>}
   */
  getActiveSessions: async () => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/me/sessions`);
    return data;
  },

  /**
   * Revoke session
   * @param {string} sessionId
   * @returns {Promise<void>}
   */
  revokeSession: async (sessionId) => {
    await axiosInstance.delete(`${BASE_PATH}/me/sessions/${sessionId}`);
  },

  /**
   * Logout all other sessions
   * @returns {Promise<void>}
   */
  logoutAllOtherSessions: async () => {
    await axiosInstance.post(`${BASE_PATH}/me/logout-all`);
  },
};
```

---

## ✅ Implementation Checklist

### Phase 1: Profile View/Edit (Sprint 7)

- [ ] **Setup Routes**

  - [ ] `/profile` - View profile
  - [ ] `/profile/edit` - Edit profile

- [ ] **Create API Services**

  - [ ] `users.service.js`
  - [ ] All profile methods

- [ ] **Profile View Page**

  - [ ] ProfileHeader component
  - [ ] ProfileStats component (role-specific)
  - [ ] ProfileBio component
  - [ ] ProfileActions component
  - [ ] Responsive design

- [ ] **Profile Edit Page**
  - [ ] AvatarUpload component
  - [ ] Image preview
  - [ ] PersonalInfoForm with validation
  - [ ] BioEditor (markdown support)
  - [ ] TagsInput component
  - [ ] Form submission
  - [ ] Success/error handling

### Phase 2: Security Settings (Sprint 7-8)

- [ ] **Password Change**

  - [ ] `/settings/security` route
  - [ ] ChangePasswordForm component
  - [ ] PasswordStrengthMeter
  - [ ] Validation logic
  - [ ] Handle OAuth users (disable for them)
  - [ ] Email notification

- [ ] **Active Sessions**
  - [ ] ActiveSessionsList component
  - [ ] SessionCard component
  - [ ] Revoke session
  - [ ] Logout all devices
  - [ ] Current session indicator

### Phase 3: App Settings (Sprint 8)

- [ ] **Settings Page**

  - [ ] `/settings` route
  - [ ] SettingsSection component
  - [ ] LanguageSelector
  - [ ] ThemeSelector
  - [ ] PrivacyToggles
  - [ ] Auto-save with debounce

- [ ] **Theme Support**
  - [ ] Light/Dark/Auto modes
  - [ ] CSS variables for theming
  - [ ] Persist theme preference
  - [ ] Apply on app load

### Phase 4: Testing & Polish

- [ ] **Form Validation**

  - [ ] Test all form fields
  - [ ] Test file upload (avatar)
  - [ ] Test password requirements
  - [ ] Test edge cases

- [ ] **UX Improvements**

  - [ ] Loading states
  - [ ] Success/error messages
  - [ ] Confirm dialogs
  - [ ] Smooth transitions
  - [ ] Responsive design

- [ ] **Accessibility**
  - [ ] ARIA labels
  - [ ] Keyboard navigation
  - [ ] Screen reader support

---

## 🔗 Related Use Cases

- **UC-001**: Login/Register (OAuth users)
- **UC-NOTIF-PREFS**: Notification preferences
- **UC-MY-SUBSCRIPTION**: Subscription info in profile

---

## 📊 Success Metrics

- Profile completion rate > 70%
- Avatar upload rate > 50%
- Password change success rate > 95%
- Settings change persistence > 99%

---

## 📝 Notes

### Avatar Upload Flow

```javascript
// Avatar upload with preview
const handleAvatarUpload = async (file) => {
  // Validate file
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("File size must be less than 2MB");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPG, PNG, WebP formats are allowed");
  }

  // Preview
  const reader = new FileReader();
  reader.onload = (e) => {
    setPreview(e.target.result);
  };
  reader.readAsDataURL(file);

  // Upload
  try {
    setUploading(true);
    const result = await usersService.uploadAvatar(file);
    setUser((prev) => ({ ...prev, avatarUrl: result.avatarUrl }));
    toast.success("Avatar đã được cập nhật");
  } catch (error) {
    toast.error("Upload avatar thất bại");
  } finally {
    setUploading(false);
  }
};
```

### Password Strength Checker

```javascript
const checkPasswordStrength = (password) => {
  let strength = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  strength = Object.values(checks).filter(Boolean).length;

  const levels = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"];
  const colors = ["red", "orange", "yellow", "lightgreen", "green"];

  return {
    strength,
    level: levels[strength],
    color: colors[strength],
    checks,
    percentage: (strength / 5) * 100,
  };
};

// Usage
const { strength, level, color, checks } = checkPasswordStrength(password);
```

### Theme Management

```javascript
// Theme context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'auto';
  });

  useEffect(() => {
    const applyTheme = () => {
      let activeTheme = theme;

      if (theme === 'auto') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        activeTheme = isDark ? 'dark' : 'light';
      }

      document.documentElement.setAttribute('data-theme', activeTheme);
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', applyTheme);

    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// CSS variables
:root[data-theme="light"] {
  --bg-primary: #ffffff;
  --text-primary: #000000;
  /* ... */
}

:root[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
  /* ... */
}
```

### Auto-save Settings

```javascript
// Debounced auto-save
const useAutoSaveSettings = () => {
  const [settings, setSettings] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const debouncedSave = useMemo(
    () =>
      debounce(async (newSettings) => {
        try {
          setIsSaving(true);
          await usersService.updateSettings(newSettings);
          toast.success("Đã lưu");
        } catch (error) {
          toast.error("Lưu thất bại");
        } finally {
          setIsSaving(false);
        }
      }, 1000),
    []
  );

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    debouncedSave(newSettings);
  };

  return { settings, updateSetting, isSaving };
};
```

---

**Status**: Ready for Implementation
**Estimated Effort**: 2 sprints
**Dependencies**: File upload service, Theme system
