# 01 - Authentication & User Management

**Module**: Xác thực & Quản lý tài khoản
**Priority**: 🔴 CAO (Critical)
**Status**: 🚧 Đang triển khai

---

## 📋 Tổng quan

Module Authentication là nền tảng của toàn bộ hệ thống, cung cấp:

- Đăng ký tài khoản mới
- Đăng nhập (Local + OAuth Google)
- Quản lý phiên đăng nhập (JWT)
- Xác thực email
- Khôi phục mật khẩu
- Bảo vệ routes theo vai trò (RBAC)

---

## 🎯 Use Cases

### UC-001: Đăng ký tài khoản

**Priority**: CAO
**Mô tả**: Người dùng tạo tài khoản mới với email/password

#### Luồng chính:

1. User truy cập `/register`
2. Nhập: fullName, email, password, confirmPassword
3. Submit form
4. Hệ thống tạo tài khoản (status: `PendingActivation`)
5. Gửi email xác thực
6. Hiển thị thông báo "Kiểm tra email để kích hoạt"

#### Validation rules:

```javascript
{
  fullName: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    unique: true // check via API
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: "Cần ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
  },
  confirmPassword: {
    required: true,
    match: 'password',
    message: "Mật khẩu xác nhận không khớp"
  }
}
```

#### API Endpoint:

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "fullName": "Nguyen Van A",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}

Response 201:
{
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.",
  "userId": "507f1f77bcf86cd799439011"
}

Response 400: Validation errors
Response 409: Email đã tồn tại
```

#### UI Components:

**✅ Đã có:**

```
/src/pages/auth/Register/
  ├── RegisterPage.jsx
  ├── RegisterPage.css
  └── index.js
```

**❌ Cần bổ sung:**

- Loading state khi submit
- Error display cho từng field
- Password strength indicator
- Terms & conditions checkbox
- Link to Login page

---

### UC-002: Đăng nhập

**Priority**: CAO
**Mô tả**: User đăng nhập với email/password hoặc OAuth Google

#### Luồng Local Auth:

1. User truy cập `/login`
2. Nhập email + password
3. Submit form
4. Backend xác thực & trả về JWT
5. Lưu tokens vào localStorage
6. Redirect đến dashboard theo role

#### Luồng OAuth Google:

1. User click "Đăng nhập với Google"
2. Call `/auth/state` để lấy CSRF token
3. Redirect đến Google OAuth consent screen
4. Google callback về `/oauth/google/callback?code=xxx`
5. Frontend gọi `/auth/exchange` với code
6. Nhận JWT tokens
7. Redirect đến dashboard

#### API Endpoints:

**Local Login:**

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "role": "Learner",
    "subscriptionStatus": "Active"
  }
}

Response 401: Thông tin đăng nhập không chính xác
Response 429: Too many requests (rate limit)
```

**OAuth Flow:**

```http
# Step 1: Get state token
GET /api/v1/auth/state

Response 200:
{
  "state": "random-csrf-token",
  "googleAuthUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}

# Step 2: Exchange code for tokens
POST /api/v1/auth/exchange
{
  "code": "4/0AX4XfWh...",
  "state": "random-csrf-token"
}

Response 200: Same as login response
```

#### State Management:

**AuthContext.jsx:**

```javascript
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: (credentials) => {},
  loginWithGoogle: () => {},
  logout: () => {},
  refreshToken: () => {},
});

// Token storage
const TOKEN_KEY = "learinal_access_token";
const REFRESH_TOKEN_KEY = "learinal_refresh_token";
const USER_KEY = "learinal_user";
```

#### UI Components:

**✅ Đã có:**

```
/src/pages/auth/Login/
  ├── LoginPage.jsx
  ├── LoginPage.css
  └── index.js

/src/pages/auth/OAuthCallback/
  ├── OAuthCallbackPage.jsx
  └── index.js

/src/contexts/
  └── AuthContext.jsx

/src/components/common/
  └── ProtectedRoute.jsx
```

**❌ Cần bổ sung:**

- "Remember me" checkbox
- Show/hide password toggle
- Social login buttons (Google icon)
- Forgot password link styling
- Rate limit warning message
- Session timeout warning (before token expires)

---

### UC-AUTH: Kiểm tra đăng nhập & quyền

**Priority**: CAO
**Mô tả**: Middleware/HOC bảo vệ protected routes

#### Implementation:

**ProtectedRoute Component:**

```javascript
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}

// Usage
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>;
```

**Axios Interceptor:**

```javascript
// Request interceptor - Add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 & refresh token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const { data } = await axios.post("/auth/refresh", { refreshToken });

        localStorage.setItem(TOKEN_KEY, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token expired - logout
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

**✅ Đã có:**

```
/src/components/common/ProtectedRoute.jsx
/src/services/api/axios.config.js
```

**❌ Cần bổ sung:**

- Token expiry warning (5 min before)
- Silent refresh trong background
- Logout toàn bộ tabs (BroadcastChannel API)
- Session tracking (last activity)

---

### UC-003: Xác thực Email

**Priority**: CAO
**Mô tả**: User kích hoạt tài khoản qua link trong email

#### Luồng:

1. User nhận email với link: `/verify-email?token=xxx`
2. Click vào link
3. Frontend gọi API verify
4. Hiển thị kết quả (success/error)
5. Redirect về login

#### API:

```http
POST /api/v1/auth/verify-email
{
  "token": "verification-token-from-email"
}

Response 200:
{
  "message": "Email đã được xác thực. Bạn có thể đăng nhập ngay."
}

Response 400: Token không hợp lệ hoặc hết hạn
```

#### UI Components:

**✅ Đã có:**

```
/src/pages/auth/VerifyEmail/
  ├── VerifyEmailPage.jsx
  └── index.js
```

**❌ Cần bổ sung:**

- Resend verification email button
- Token expiry countdown
- Success animation
- Auto redirect countdown (5s)

---

### UC-004: Quên mật khẩu

**Priority**: TRUNG BÌNH
**Mô tả**: User yêu cầu reset password khi quên

#### Luồng:

1. User click "Quên mật khẩu?" trên Login
2. Nhập email
3. Backend gửi email reset (rate limit: 3/hour)
4. User nhận email với link reset
5. Click link → `/reset-password?token=xxx`
6. Nhập mật khẩu mới
7. Submit → Password updated
8. Redirect về login

#### API:

**Request reset:**

```http
POST /api/v1/auth/forgot-password
{
  "email": "user@example.com"
}

Response 200:
{
  "message": "Nếu email tồn tại, chúng tôi đã gửi hướng dẫn reset mật khẩu."
}

Response 429: Quá nhiều yêu cầu (3/hour)
```

**Reset password:**

```http
POST /api/v1/auth/reset-password
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}

Response 200:
{
  "message": "Mật khẩu đã được cập nhật thành công."
}

Response 400: Token không hợp lệ/hết hạn
```

#### UI Components:

**✅ Đã có:**

```
/src/pages/auth/ForgotPassword/
  ├── ForgotPasswordPage.jsx
  └── index.js

/src/pages/auth/ResetPassword/
  ├── ResetPasswordPage.jsx
  └── index.js
```

**❌ Cần bổ sung:**

- Rate limit warning display
- Password strength meter
- Success confirmation modal
- Email sent confirmation page

---

### UC-005: Đăng xuất

**Priority**: CAO
**Mô tả**: User logout khỏi hệ thống

#### Luồng:

1. User click "Đăng xuất"
2. Call API để revoke refresh token
3. Clear localStorage
4. Reset AuthContext state
5. Redirect về `/login`

#### API:

```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>

Response 200:
{
  "message": "Đăng xuất thành công"
}
```

#### Implementation:

```javascript
const logout = async () => {
  try {
    await authService.logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Always clear local data
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  }
};
```

**✅ Đã có:**

- AuthContext.logout()
- Logout button in Header

**❌ Cần bổ sung:**

- Confirmation modal ("Bạn có chắc muốn đăng xuất?")
- Logout all devices option
- Clear all app data on logout

---

## 🔐 Security Requirements

### NFR-010: Mã hóa HTTPS

- ✅ Toàn bộ API qua HTTPS
- ✅ Secure flag cho cookies (production)

### NFR-011: Password Storage

- ✅ Backend hash với bcrypt (salt rounds: 10)
- ✅ Never log passwords
- ✅ Password validation regex

### NFR-012: RBAC (Role-Based Access Control)

- ✅ ProtectedRoute với allowedRoles
- ❌ Fine-grained permissions per feature
- ❌ Permission caching

### NFR-013: Common Attack Prevention

- 🚧 XSS: Sanitize user input
- ✅ CSRF: State token cho OAuth
- ❌ Rate limiting display
- ❌ Brute-force protection UI

---

## 📊 Implementation Status

| Feature             | Status | Priority | Notes                        |
| ------------------- | ------ | -------- | ---------------------------- |
| Register form       | ✅     | CAO      | Cần thêm validation feedback |
| Login (local)       | ✅     | CAO      | Cần remember me              |
| OAuth Google        | ✅     | CAO      | Đang test                    |
| Email verification  | ✅     | CAO      | Cần resend button            |
| Forgot password     | ✅     | TB       | Cần rate limit display       |
| Reset password      | ✅     | TB       | OK                           |
| Logout              | ✅     | CAO      | Cần confirmation             |
| Protected routes    | ✅     | CAO      | OK                           |
| Token refresh       | ✅     | CAO      | Cần silent refresh           |
| Session management  | 🚧     | CAO      | Đang làm                     |
| Multi-device logout | ❌     | THẤP     | Future                       |

---

## 🎨 UI/UX Requirements

### Loading States

```javascript
// Login form states
{
  idle: "Đăng nhập",
  loading: "Đang xử lý...",
  success: "Thành công! Đang chuyển hướng...",
  error: "Đăng nhập thất bại"
}
```

### Error Messages (i18n ready)

```javascript
const AUTH_ERRORS = {
  "auth/invalid-credentials": "Email hoặc mật khẩu không đúng",
  "auth/email-exists": "Email đã được sử dụng",
  "auth/weak-password": "Mật khẩu quá yếu",
  "auth/token-expired": "Phiên đăng nhập hết hạn",
  "auth/too-many-requests": "Quá nhiều yêu cầu. Vui lòng thử lại sau",
  "network-error": "Lỗi kết nối. Vui lòng kiểm tra mạng",
};
```

### Responsive Design

- Mobile: Form full-width, large inputs
- Tablet: Max-width 500px, centered
- Desktop: Max-width 400px, centered

---

## ✅ Checklist hoàn thiện

### Must Have (v1.0)

- [ ] Password strength indicator
- [ ] Remember me functionality
- [ ] Session timeout warning
- [ ] Resend verification email
- [ ] Rate limit feedback UI
- [ ] Loading & error states cho tất cả forms
- [ ] Logout confirmation modal
- [ ] Auto-refresh token (silent)

### Should Have

- [ ] Multi-factor authentication (MFA)
- [ ] Login history tracking
- [ ] Suspicious activity alerts
- [ ] Device management

### Nice to Have

- [ ] Biometric login (WebAuthn)
- [ ] Social login (Facebook, GitHub)
- [ ] SSO với SAML
- [ ] Magic link login

---

## 📚 Tài liệu tham khảo

- [SRS - UC-001 đến UC-002](../SRS%20for%20Learinal.md#3.1)
- [OpenAPI - Auth Endpoints](../api/openapi-paths-auth-users.yaml)
- [AuthContext Implementation](../../src/contexts/AuthContext.jsx)
- [OAuth 2.0 Best Practices](https://oauth.net/2/)
- [JWT Handbook](https://auth0.com/resources/ebooks/jwt-handbook)

---

**Cập nhật cuối**: 05/11/2025
**Người review**: [Tên reviewer]
**Next review**: 12/11/2025
