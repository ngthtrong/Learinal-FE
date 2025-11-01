# Learinal Frontend

Ứng dụng học tập thông minh với AI - Frontend React Application

## 🚀 Công nghệ sử dụng

- **React 19.1.1** - Thư viện UI
- **Vite** - Build tool và dev server
- **React Router** - Routing
- **Axios** - HTTP client
- **ESLint** - Code linting

## 📁 Cấu trúc thư mục

```
src/
├── assets/              # Tài nguyên tĩnh (images, fonts, etc.)
├── components/          # React components
│   ├── common/         # Components dùng chung (Button, Input, etc.)
│   ├── layout/         # Layout components (Header, Footer, Sidebar)
│   ├── auth/           # Authentication components
│   ├── documents/      # Document-related components
│   ├── questions/      # Question components
│   ├── quiz/           # Quiz components
│   ├── subjects/       # Subject components
│   ├── subscriptions/  # Subscription components
│   ├── notifications/  # Notification components
│   └── admin/          # Admin components
├── pages/              # Page components
│   ├── auth/           # Login, Register, etc.
│   ├── documents/      # Document pages
│   ├── quiz/           # Quiz pages
│   ├── subjects/       # Subject pages
│   ├── subscriptions/  # Subscription pages
│   ├── admin/          # Admin pages
│   └── profile/        # User profile pages
├── services/           # API services
│   └── api/            # API service modules
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
├── utils/              # Utility functions
├── config/             # Configuration files
├── constants/          # Constants and enums
├── types/              # Type definitions
└── styles/             # Global styles
```

## 🛠️ Cài đặt

```bash
# Cài đặt dependencies
npm install

# Tạo file .env từ .env.example
cp .env.example .env

# Cập nhật các biến môi trường trong .env
```

## 🏃 Chạy dự án

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🌐 Biến môi trường

Tạo file `.env` với các biến sau:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APP_NAME=Learinal
VITE_APP_ENV=development
```

## 📦 Modules chính

### Config

- `api.config.js` - Cấu hình API endpoints
- `app.config.js` - Cấu hình ứng dụng

### Services

- `auth.service.js` - Authentication API
- `users.service.js` - User management API
- `documents.service.js` - Document management API
- `axios.config.js` - Axios instance với interceptors

### Contexts

- `AuthContext` - Quản lý authentication state

### Utils

- `storage.js` - LocalStorage helpers
- `validators.js` - Form validation
- `formatters.js` - Data formatting

### Constants

- `routes.js` - Application routes
- `roles.js` - User roles và permissions
- `status.js` - Status constants

## 🎨 Components

### Common Components

- `Button` - Reusable button component
- `Input` - Input field với validation
- `Modal` - Modal dialog
- `Loading` - Loading indicator
- `Alert` - Alert/notification component

### Layout Components

- `Header` - Main header với navigation
- `Footer` - Application footer
- `Sidebar` - Sidebar navigation
- `Container` - Page container wrapper

## 🔒 Authentication

Ứng dụng sử dụng JWT-based authentication với:

- Access token và refresh token
- Automatic token refresh
- Protected routes
- Role-based access control

## 📱 Responsive Design

Ứng dụng được thiết kế responsive cho:

- Desktop (1280px+)
- Tablet (768px - 1279px)
- Mobile (< 768px)

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test
```

## 📝 Coding Standards

- Sử dụng functional components và hooks
- PropTypes hoặc TypeScript cho type checking
- ESLint configuration tuân theo best practices
- Component documentation với JSDoc
- CSS Modules hoặc styled-components cho styling

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

This project is private and proprietary.

## 👥 Team

Learinal Development Team

---

Để biết thêm thông tin, vui lòng liên hệ team phát triển.
