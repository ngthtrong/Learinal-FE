# 12 - Performance & Security

**Module**: Non-Functional Requirements
**Priority**: CAO
**Scope**: Toàn bộ ứng dụng

---

## 📋 Tổng quan

Tài liệu này định nghĩa:

- Performance optimization strategies
- Security best practices
- Error handling patterns
- Monitoring & logging
- Testing requirements

---

## ⚡ Performance Optimization

### 1. Code Splitting & Lazy Loading

**Route-based Code Splitting**:

```javascript
// App.jsx
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Lazy load route components
const Login = lazy(() => import("./pages/auth/Login"));
const Dashboard = lazy(() => import("./pages/dashboard/DashboardPage"));
const SubjectList = lazy(() => import("./pages/subjects/SubjectList"));
const QuizTake = lazy(() => import("./pages/quiz/QuizTake"));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subjects" element={<SubjectList />} />
        <Route path="/quiz/:setId/take" element={<QuizTake />} />
      </Routes>
    </Suspense>
  );
}
```

**Component-level Lazy Loading**:

```javascript
// Load heavy components on demand
const ChartComponent = lazy(() => import("./components/ChartComponent"));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <button onClick={() => setShowChart(true)}>Show Chart</button>

      {showChart && (
        <Suspense fallback={<div>Loading chart...</div>}>
          <ChartComponent data={data} />
        </Suspense>
      )}
    </div>
  );
}
```

---

### 2. Image Optimization

**Lazy Loading Images**:

```javascript
// LazyImage component
import { useState, useEffect, useRef } from "react";

export const LazyImage = ({ src, alt, placeholder }) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(imgRef.current);
          }
        });
      },
      { rootMargin: "100px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return <img ref={imgRef} src={imageSrc} alt={alt} />;
};
```

**WebP with Fallback**:

```jsx
<picture>
  <source srcSet="avatar.webp" type="image/webp" />
  <source srcSet="avatar.jpg" type="image/jpeg" />
  <img src="avatar.jpg" alt="User avatar" />
</picture>
```

---

### 3. State Management Optimization

**React.memo for Expensive Components**:

```javascript
import { memo } from "react";

const QuestionCard = memo(
  ({ question, onAnswer }) => {
    return (
      <div className="question-card">
        <h3>{question.text}</h3>
        {/* ... */}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.question.id === nextProps.question.id;
  }
);
```

**useMemo for Expensive Calculations**:

```javascript
import { useMemo } from "react";

function QuizResult({ questions, userAnswers }) {
  const score = useMemo(() => {
    return calculateScore(questions, userAnswers);
  }, [questions, userAnswers]);

  const breakdown = useMemo(() => {
    return calculateBreakdown(questions, userAnswers);
  }, [questions, userAnswers]);

  return (
    <div>
      <h2>Score: {score}</h2>
      <DifficultyBreakdown data={breakdown} />
    </div>
  );
}
```

**useCallback for Event Handlers**:

```javascript
import { useCallback } from "react";

function QuizTake() {
  const [answers, setAnswers] = useState({});

  const handleAnswer = useCallback((questionId, answerIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  }, []);

  return (
    <div>
      {questions.map((q) => (
        <QuestionCard key={q.id} question={q} onAnswer={handleAnswer} />
      ))}
    </div>
  );
}
```

---

### 4. Virtual Scrolling

**For Long Lists** (using `react-window`):

```javascript
import { FixedSizeList } from "react-window";

function NotificationList({ notifications }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <NotificationItem notification={notifications[index]} />
    </div>
  );

  return (
    <FixedSizeList height={600} itemCount={notifications.length} itemSize={80} width="100%">
      {Row}
    </FixedSizeList>
  );
}
```

---

### 5. Debounce & Throttle

**Debounce Search Input**:

```javascript
import { useState, useEffect } from "react";
import { debounce } from "../utils/helpers";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      onSearch(query);
    }, 500);

    debouncedSearch();

    return () => debouncedSearch.cancel();
  }, [query, onSearch]);

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

**Throttle Scroll Handler**:

```javascript
import { useEffect } from "react";
import { throttle } from "../utils/helpers";

function InfiniteScroll({ onLoadMore }) {
  useEffect(() => {
    const handleScroll = throttle(() => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        onLoadMore();
      }
    }, 200);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [onLoadMore]);

  return <div>...</div>;
}
```

---

### 6. Bundle Size Optimization

**Vite Configuration**:

```javascript
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true }), // Bundle analysis
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor splitting
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          charts: ["chart.js", "react-chartjs-2"],
          utils: ["axios", "date-fns", "lodash-es"],
        },
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
});
```

**Tree Shaking** (Import only what you need):

```javascript
// ❌ Bad: Imports entire library
import _ from "lodash";

// ✅ Good: Tree-shakeable
import debounce from "lodash-es/debounce";
import throttle from "lodash-es/throttle";
```

---

## 🔒 Security Best Practices

### 1. Authentication & Authorization

**JWT Storage**:

```javascript
// utils/storage.js

// ❌ Never store in localStorage (vulnerable to XSS)
// localStorage.setItem('token', accessToken);

// ✅ Store access token in memory (secure)
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

// Refresh token in httpOnly cookie (set by backend)
// Cannot be accessed by JavaScript → XSS safe
```

**Axios Interceptor**:

```javascript
// services/api/axios.config.js
import axios from "axios";
import { getAccessToken, setAccessToken } from "../../utils/storage";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Send cookies (refresh token)
});

// Request interceptor: Add access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 (refresh token)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        setAccessToken(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed → logout
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

### 2. XSS Prevention

**Sanitize User Input**:

```javascript
import DOMPurify from "dompurify";

// Render user-generated HTML (bio, comments, etc.)
function UserBio({ bioHtml }) {
  const sanitizedHtml = DOMPurify.sanitize(bioHtml, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "ul", "ol", "li"],
    ALLOWED_ATTR: [],
  });

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
}
```

**Avoid `dangerouslySetInnerHTML` when possible**:

```javascript
// ❌ Vulnerable
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Safe (React escapes by default)
<div>{userInput}</div>
```

---

### 3. CSRF Protection

**Include CSRF Token in Requests**:

```javascript
// Get CSRF token from meta tag (set by backend)
const getCsrfToken = () => {
  return document.querySelector('meta[name="csrf-token"]')?.content;
};

// Add to axios config
axiosInstance.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }
  return config;
});
```

---

### 4. Content Security Policy (CSP)

**Configure in `index.html`**:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' https://api.learinal.com wss://ws.learinal.com;
    frame-ancestors 'none';
  "
/>
```

---

### 5. Input Validation

**Client-side Validation**:

```javascript
// utils/validators.js

export const validators = {
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Email không hợp lệ";
    }
    return null;
  },

  password: (value) => {
    if (value.length < 8) {
      return "Mật khẩu phải có ít nhất 8 ký tự";
    }
    if (!/[A-Z]/.test(value)) {
      return "Mật khẩu phải có ít nhất 1 chữ hoa";
    }
    if (!/[a-z]/.test(value)) {
      return "Mật khẩu phải có ít nhất 1 chữ thường";
    }
    if (!/[0-9]/.test(value)) {
      return "Mật khẩu phải có ít nhất 1 số";
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
      return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
    }
    return null;
  },

  phone: (value) => {
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (!phoneRegex.test(value)) {
      return "Số điện thoại không hợp lệ";
    }
    return null;
  },
};
```

**Form Validation Hook**:

```javascript
// hooks/useFormValidation.js
import { useState } from "react";

export const useFormValidation = (initialValues, validationSchema) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (name, value) => {
    const validator = validationSchema[name];
    if (validator) {
      const error = validator(value);
      setErrors((prev) => ({ ...prev, [name]: error }));
      return error;
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validate(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validate(name, value);
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(validationSchema).forEach((name) => {
      const error = validationSchema[name](values[name]);
      if (error) newErrors[name] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
  };
};
```

---

### 6. Secure File Uploads

**Validate File Type & Size**:

```javascript
const handleFileUpload = async (file) => {
  // Validate file type
  const allowedTypes = ["application/pdf", "application/msword", "text/plain"];
  if (!allowedTypes.includes(file.type)) {
    toast.error("Chỉ chấp nhận file PDF, DOCX, TXT");
    return;
  }

  // Validate file size (max 20MB)
  const maxSize = 20 * 1024 * 1024;
  if (file.size > maxSize) {
    toast.error("File không được vượt quá 20MB");
    return;
  }

  // Upload
  try {
    await documentsService.upload(file);
    toast.success("Upload thành công");
  } catch (error) {
    toast.error("Upload thất bại");
  }
};
```

---

## 🚨 Error Handling

### 1. Global Error Boundary

```javascript
// components/ErrorBoundary.jsx
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to monitoring service (Sentry, LogRocket, etc.)
    console.error("Error caught by boundary:", error, errorInfo);

    // Optional: Send to backend
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h1>Oops! Đã có lỗi xảy ra</h1>
          <p>Chúng tôi đang xử lý vấn đề này.</p>
          <button onClick={() => (window.location.href = "/")}>Về trang chủ</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Usage**:

```javascript
// main.jsx
import ErrorBoundary from "./components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
```

---

### 2. API Error Handling

**Centralized Error Handler**:

```javascript
// utils/errorHandler.js

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return { message: data.message || "Dữ liệu không hợp lệ" };
      case 401:
        return { message: "Phiên đăng nhập hết hạn", shouldLogout: true };
      case 403:
        return { message: "Bạn không có quyền truy cập" };
      case 404:
        return { message: "Không tìm thấy dữ liệu" };
      case 429:
        return { message: "Quá nhiều yêu cầu, vui lòng thử lại sau" };
      case 500:
        return { message: "Lỗi server, vui lòng thử lại sau" };
      default:
        return { message: data.message || "Đã có lỗi xảy ra" };
    }
  } else if (error.request) {
    // Request sent but no response
    return { message: "Không thể kết nối đến server" };
  } else {
    // Error in request setup
    return { message: error.message || "Đã có lỗi xảy ra" };
  }
};
```

**Usage in Components**:

```javascript
import { handleApiError } from "../utils/errorHandler";

const handleSubmit = async () => {
  try {
    setLoading(true);
    await questionSetsService.generate(payload);
    toast.success("Tạo bộ đề thành công");
  } catch (error) {
    const { message, shouldLogout } = handleApiError(error);
    toast.error(message);
    if (shouldLogout) {
      logout();
    }
  } finally {
    setLoading(false);
  }
};
```

---

## 📊 Monitoring & Logging

### 1. Performance Monitoring

**Web Vitals**:

```javascript
// utils/webVitals.js
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

export const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
};
```

**Usage**:

```javascript
// main.jsx
import { reportWebVitals } from "./utils/webVitals";

reportWebVitals((metric) => {
  console.log(metric);
  // Send to analytics
  // analytics.send(metric);
});
```

---

### 2. Error Tracking

**Sentry Integration** (optional):

```javascript
// main.jsx
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.1,
    environment: import.meta.env.MODE,
  });
}
```

---

### 3. User Analytics

**Track Page Views**:

```javascript
// hooks/usePageTracking.js
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view
    if (window.gtag) {
      window.gtag("config", "GA_MEASUREMENT_ID", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
};
```

**Track Events**:

```javascript
// utils/analytics.js

export const analytics = {
  trackEvent: (eventName, params = {}) => {
    if (window.gtag) {
      window.gtag("event", eventName, params);
    }
  },

  trackQuizCompleted: (quizId, score) => {
    analytics.trackEvent("quiz_completed", {
      quiz_id: quizId,
      score: score,
    });
  },

  trackSubscription: (planName, amount) => {
    analytics.trackEvent("subscription_purchased", {
      plan: planName,
      value: amount,
      currency: "VND",
    });
  },
};
```

---

## ✅ Testing Requirements

### 1. Unit Tests (Jest + React Testing Library)

```javascript
// components/Button/Button.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
  test("renders button with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  test("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("is disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText("Click me")).toBeDisabled();
  });
});
```

---

### 2. Integration Tests

```javascript
// pages/Login/Login.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "./LoginPage";
import { authService } from "../../services/api/auth.service";

jest.mock("../../services/api/auth.service");

describe("Login Page", () => {
  test("successful login redirects to dashboard", async () => {
    authService.login.mockResolvedValue({
      user: { id: "1", email: "test@example.com" },
      accessToken: "fake-token",
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });
  });
});
```

---

### 3. E2E Tests (Playwright/Cypress)

```javascript
// e2e/login.spec.js (Playwright)
import { test, expect } from "@playwright/test";

test("user can login successfully", async ({ page }) => {
  await page.goto("http://localhost:5173/login");

  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('input[name="password"]', "password123");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator("h1")).toContainText("Dashboard");
});
```

---

## 📈 Performance Budget

| Metric                             | Target  | Maximum |
| ---------------------------------- | ------- | ------- |
| **First Contentful Paint (FCP)**   | < 1.5s  | 2.5s    |
| **Largest Contentful Paint (LCP)** | < 2.5s  | 4s      |
| **Time to Interactive (TTI)**      | < 3.5s  | 5s      |
| **Total Blocking Time (TBT)**      | < 200ms | 600ms   |
| **Cumulative Layout Shift (CLS)**  | < 0.1   | 0.25    |
| **Bundle Size (JS)**               | < 200KB | 300KB   |
| **Bundle Size (CSS)**              | < 50KB  | 100KB   |

---

## 🔐 Security Checklist

- [ ] **Authentication**:

  - [ ] Access tokens stored in memory (not localStorage)
  - [ ] Refresh tokens in httpOnly cookies
  - [ ] Token expiry implemented
  - [ ] Auto-refresh on 401

- [ ] **Authorization**:

  - [ ] Protected routes check user role
  - [ ] API calls check permissions server-side
  - [ ] Sensitive actions require re-authentication

- [ ] **Input Validation**:

  - [ ] Client-side validation for UX
  - [ ] Server-side validation for security
  - [ ] Sanitize user-generated HTML
  - [ ] File upload restrictions enforced

- [ ] **HTTPS**:

  - [ ] All requests over HTTPS in production
  - [ ] Strict-Transport-Security header
  - [ ] Secure cookies (Secure flag)

- [ ] **Headers**:

  - [ ] Content-Security-Policy configured
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: DENY
  - [ ] X-XSS-Protection: 1; mode=block

- [ ] **Dependencies**:
  - [ ] Regular npm audit
  - [ ] Update vulnerable packages
  - [ ] Review third-party libraries

---

**Status**: Living Document
**Owner**: Frontend Team
**Last Updated**: Nov 2025
