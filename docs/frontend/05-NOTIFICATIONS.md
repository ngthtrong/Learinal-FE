# 05 - Thông báo

**Module**: Notifications
**Vai trò**: Tất cả (Learner, Expert, Admin)
**Priority**: TRUNG BÌNH
**Completion**: 0% (0/5 features)

---

## 📋 Tổng quan

Module thông báo giúp người dùng:

- Nhận thông báo realtime qua WebSocket
- Xem danh sách thông báo trong app
- Quản lý trạng thái đã đọc/chưa đọc
- Đánh dấu quan trọng
- Cài đặt preferences (bật/tắt từng loại)

---

## 🎯 Use Cases

### UC-021: Nhận thông báo realtime

**Mô tả**: Người dùng nhận thông báo realtime khi có sự kiện quan trọng xảy ra.

**Priority**: CAO
**Status**: ❌ Chưa triển khai

**Actors**: All users (Learner, Expert, Admin)

**Preconditions**: User đã đăng nhập

**Main Flow**:

1. User đăng nhập vào hệ thống
2. Frontend thiết lập WebSocket connection đến backend
3. Backend authenticate WebSocket connection qua JWT
4. Khi có sự kiện trigger notification:
   - Backend tạo Notification record
   - Backend gửi message qua WebSocket
   - Frontend nhận message
   - Hiển thị toast notification (bottom-right)
   - Cập nhật notification badge (topbar)
   - Phát âm thanh (nếu enabled)
5. User có thể:
   - Click vào toast → redirect đến page liên quan
   - Click vào notification bell → mở dropdown
   - Đóng toast

**Alternative Flow**:

- **3a. WebSocket connection bị mất**:
  - Frontend tự động reconnect (with exponential backoff)
  - Backend queue notifications trong lúc offline
  - Khi reconnect, gửi missed notifications
- **5a. User offline**:
  - Backend lưu notifications
  - User nhận khi login lại

**Postconditions**:

- Notification được lưu trong DB
- User được thông báo kịp thời

**Business Rules**:

- WebSocket sử dụng JWT authentication
- Max reconnect attempts: 5
- Reconnect delay: 1s, 2s, 4s, 8s, 16s (exponential)
- Notifications expire sau 30 ngày
- Max notifications per user: 100 (auto-delete oldest)

**Notification Types**:

**Learner**:

- `QUESTION_SET_GENERATED`: Bộ câu hỏi đã được tạo xong
- `VALIDATION_COMPLETED`: Bộ đề đã được Expert duyệt
- `SUBSCRIPTION_EXPIRING`: Gói Premium sắp hết hạn
- `SUBSCRIPTION_RENEWED`: Gia hạn thành công
- `PAYMENT_SUCCESS`: Thanh toán thành công

**Expert**:

- `VALIDATION_ASSIGNED`: Được giao nhiệm vụ kiểm duyệt
- `QUESTION_SET_PUBLISHED`: Bộ đề đã được xuất bản
- `COMMISSION_EARNED`: Nhận commission mới
- `PAYMENT_PROCESSED`: Thanh toán lương đã được xử lý

**Admin**:

- `VALIDATION_SUBMITTED`: Có yêu cầu xác thực mới
- `PAYMENT_RECEIVED`: Có thanh toán mới
- `USER_REGISTERED`: User mới đăng ký
- `EXPERT_APPLICATION`: Có đơn xin làm Expert

---

### UC-NOTIF-LIST: Xem danh sách thông báo

**Mô tả**: User xem tất cả thông báo trong Notification Center.

**Priority**: TRUNG BÌNH
**Status**: ❌ Chưa triển khai

**Actors**: All users

**Preconditions**: User đã đăng nhập

**Main Flow**:

1. User click vào notification bell icon (topbar)
2. Hệ thống hiển thị dropdown với:
   - **Header**:
     - Title: "Thông báo"
     - Badge: Số thông báo chưa đọc
     - Action: "Đánh dấu tất cả đã đọc"
   - **Tabs**:
     - Tất cả
     - Chưa đọc
   - **List** (virtual scroll):
     - Max 50 notifications
     - Mỗi item hiển thị:
       - Icon (theo type)
       - Title
       - Message
       - Timestamp (relative)
       - Unread indicator (dot)
   - **Footer**:
     - "Xem tất cả" → redirect to `/notifications`
3. User có thể:
   - Click vào notification → redirect + mark as read
   - Hover để xem full message
   - Click "X" để delete
4. Nếu có notification mới:
   - Realtime prepend vào list
   - Smooth animation

**Alternative Flow**:

- **2a. Không có notification**:
  - Hiển thị empty state
  - Message: "Bạn chưa có thông báo nào"

**Postconditions**: User cập nhật về các sự kiện

---

### UC-NOTIF-MARK: Đánh dấu đã đọc/chưa đọc

**Mô tả**: User đánh dấu thông báo là đã đọc hoặc chưa đọc.

**Priority**: THẤP
**Status**: ❌ Chưa triển khai

**Actors**: All users

**Main Flow**:

1. User mở notification dropdown hoặc trang `/notifications`
2. User click vào một notification
3. Hệ thống:
   - Đánh dấu `isRead = true`
   - Cập nhật UI (remove unread dot)
   - Giảm unread count badge
   - Redirect đến page liên quan (nếu có link)

**Alternative Flow - Mark all as read**:

1. User click "Đánh dấu tất cả đã đọc"
2. Hệ thống:
   - Cập nhật tất cả notifications → `isRead = true`
   - Clear unread badge
   - Refresh UI

**Alternative Flow - Mark as unread**:

1. User right-click notification (hoặc swipe left on mobile)
2. Hệ thống hiển thị context menu
3. User chọn "Đánh dấu chưa đọc"
4. Hệ thống:
   - Cập nhật `isRead = false`
   - Thêm unread indicator
   - Tăng unread count

---

### UC-NOTIF-DELETE: Xóa thông báo

**Mô tả**: User xóa thông báo không cần thiết.

**Priority**: THẤP
**Status**: ❌ Chưa triển khai

**Actors**: All users

**Main Flow**:

1. User hover over notification
2. Hiển thị delete button (X)
3. User click delete
4. Hệ thống:
   - Hiển thị confirmation (optional)
   - Xóa notification khỏi DB
   - Remove khỏi UI với animation
   - Giảm count nếu chưa đọc

**Alternative Flow - Delete all**:

1. User click "Xóa tất cả"
2. Hệ thống hiển thị confirmation:
   - "Bạn có chắc muốn xóa tất cả thông báo?"
3. User xác nhận
4. Hệ thống:
   - Xóa tất cả notifications
   - Clear UI
   - Reset badge = 0

---

### UC-NOTIF-PREFS: Cài đặt thông báo

**Mô tả**: User cài đặt preferences cho từng loại thông báo.

**Priority**: THẤP
**Status**: ❌ Chưa triển khai

**Actors**: All users

**Preconditions**: User đã đăng nhập

**Main Flow**:

1. User truy cập Settings → Notifications
2. Hệ thống hiển thị danh sách notification types:
   - Mỗi type có toggle switch
   - Grouped by category:
     - Học tập (Learner)
     - Kiểm duyệt (Expert)
     - Quản trị (Admin)
     - Thanh toán (All)
3. User bật/tắt từng loại
4. Hệ thống:
   - Lưu preferences vào DB
   - Apply ngay lập tức
   - Hiển thị thông báo "Đã lưu"

**Alternative Flow - Email notifications**:

1. User toggle "Gửi email thông báo"
2. Hệ thống:
   - Lưu `emailNotifications = true`
   - Gửi email test (optional)

**Postconditions**:

- User chỉ nhận notifications đã enable
- Preferences được persist

---

## 🖥️ UI Components

### 1. Notification Bell (Topbar)

**Location**: Topbar, right side
**Components**:

```
NotificationBell/
├── NotificationBell.jsx
├── NotificationBell.css
└── components/
    ├── NotificationBadge.jsx      // Badge số chưa đọc
    ├── NotificationDropdown.jsx   // Dropdown menu
    └── NotificationItem.jsx       // Mỗi notification
```

**UI Mockup**:

```
Topbar:
┌─────────────────────────────────────────────────┐
│ Learinal Logo    [Search]    🔔(3)  [Avatar ▼]│
└─────────────────────────────────────────────────┘
                                   │
                                   ▼
              ┌──────────────────────────────────┐
              │ Thông báo              [Đã đọc] │
              ├──────────────────────────────────┤
              │ [ Tất cả ] [ Chưa đọc (3) ]     │
              ├──────────────────────────────────┤
              │ 🔵 ✅ Bộ đề "Toán C1" đã được   │
              │     Expert duyệt                 │
              │     2 phút trước            [X]  │
              ├──────────────────────────────────┤
              │ 🔵 💰 Thanh toán Premium thành  │
              │     công: 99,000 VNĐ             │
              │     1 giờ trước             [X]  │
              ├──────────────────────────────────┤
              │ 🔵 🎯 Bộ câu hỏi đã được tạo    │
              │     xong: 20 câu                 │
              │     3 giờ trước             [X]  │
              ├──────────────────────────────────┤
              │    ⚫ Gói Premium sắp hết hạn    │
              │     vào 06/12/2025               │
              │     1 ngày trước            [X]  │
              ├──────────────────────────────────┤
              │         Xem tất cả →            │
              └──────────────────────────────────┘
```

---

### 2. Toast Notification (Realtime)

**Location**: Bottom-right corner
**Components**:

```
Toast/
├── ToastContainer.jsx
├── Toast.jsx
├── Toast.css
└── components/
    └── ToastQueue.jsx             // Manage multiple toasts
```

**UI Mockup**:

```
                            ┌──────────────────────────┐
                            │ ✅ Bộ đề đã được duyệt  │
                            │                          │
                            │ Bộ đề "Toán cao cấp C1"  │
                            │ đã được Expert xác thực. │
                            │                          │
                            │ [Xem ngay]        [X]   │
                            └──────────────────────────┘

                            ┌──────────────────────────┐
                            │ 💰 Thanh toán thành công│
                            │                          │
                            │ Gói Premium đã kích hoạt│
                            │                          │
                            │ [Đóng]            [X]   │
                            └──────────────────────────┘

[Auto dismiss after 5s or user click]
```

---

### 3. Notification List Page

**Route**: `/notifications`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
NotificationList/
├── NotificationListPage.jsx
├── NotificationListPage.css
├── index.js
└── components/
    ├── NotificationFilters.jsx    // Filter/tabs
    ├── NotificationCard.jsx       // Card cho mỗi notif
    ├── NotificationList.jsx       // List container
    └── EmptyState.jsx             // No notifications
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────┐
│ 🔔 Thông báo                                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│ [ Tất cả ]  [ Chưa đọc (3) ]     [Đánh dấu tất cả] │
│                                                      │
│ ┌─────────────────────────────────────────────────┐│
│ │ 🔵 ✅ Bộ đề "Toán cao cấp C1" đã được duyệt    ││
│ │                                                  ││
│ │ Expert đã xác thực bộ đề của bạn. Bây giờ bạn   ││
│ │ có thể chia sẻ với bạn bè hoặc đưa vào hệ thống ││
│ │ Premium.                                         ││
│ │                                                  ││
│ │ 2 phút trước                    [Xem] [Xóa]    ││
│ └─────────────────────────────────────────────────┘│
│                                                      │
│ ┌─────────────────────────────────────────────────┐│
│ │ 🔵 💰 Thanh toán thành công                     ││
│ │                                                  ││
│ │ Bạn đã thanh toán 99,000 VNĐ cho gói Premium.   ││
│ │ Gói có hiệu lực đến 06/12/2025.                 ││
│ │                                                  ││
│ │ 1 giờ trước              [Xem hóa đơn] [Xóa]   ││
│ └─────────────────────────────────────────────────┘│
│                                                      │
│ ┌─────────────────────────────────────────────────┐│
│ │ ⚫ 🎯 Bộ câu hỏi đã được tạo xong               ││
│ │                                                  ││
│ │ Hệ thống đã tạo xong 20 câu hỏi từ tài liệu     ││
│ │ "Chương 1 & 2". Bạn có thể bắt đầu làm bài.    ││
│ │                                                  ││
│ │ 3 giờ trước                    [Làm bài] [Xóa] ││
│ └─────────────────────────────────────────────────┘│
│                                                      │
│                [Tải thêm...]                        │
└─────────────────────────────────────────────────────┘
```

---

### 4. Notification Settings

**Route**: `/settings/notifications`
**Layout**: TopbarLayout + SidebarLayout
**Components**:

```
NotificationSettings/
├── NotificationSettingsPage.jsx
├── NotificationSettingsPage.css
├── index.js
└── components/
    ├── NotificationTypeToggle.jsx  // Toggle cho mỗi type
    └── CategorySection.jsx         // Group by category
```

**UI Mockup**:

```
┌─────────────────────────────────────────────────────┐
│ ⚙️ Cài đặt thông báo                                │
├─────────────────────────────────────────────────────┤
│                                                      │
│ 📚 Học tập                                          │
│ ┌─────────────────────────────────────────────────┐│
│ │ Bộ câu hỏi đã tạo xong              [ON]  ●─── ││
│ │ Bộ đề đã được duyệt                 [ON]  ●─── ││
│ │ Có bộ đề Premium mới                [OFF] ───○ ││
│ └─────────────────────────────────────────────────┘│
│                                                      │
│ 💳 Thanh toán & Gói dịch vụ                         │
│ ┌─────────────────────────────────────────────────┐│
│ │ Thanh toán thành công               [ON]  ●─── ││
│ │ Gói Premium sắp hết hạn             [ON]  ●─── ││
│ │ Gia hạn thành công                  [ON]  ●─── ││
│ └─────────────────────────────────────────────────┘│
│                                                      │
│ 🔧 Hệ thống                                         │
│ ┌─────────────────────────────────────────────────┐│
│ │ Cập nhật tính năng mới              [ON]  ●─── ││
│ │ Bảo trì hệ thống                    [ON]  ●─── ││
│ └─────────────────────────────────────────────────┘│
│                                                      │
│ 📧 Email notifications                              │
│ ┌─────────────────────────────────────────────────┐│
│ │ Gửi email cho thông báo quan trọng  [ON]  ●─── ││
│ │ Tóm tắt hàng tuần                   [OFF] ───○ ││
│ └─────────────────────────────────────────────────┘│
│                                                      │
│                      [Lưu cài đặt]                  │
└─────────────────────────────────────────────────────┘
```

---

## 📡 API Services

### notifications.service.js

```javascript
/**
 * Notifications Service
 * API for notification management
 */

import axiosInstance from "./axios.config";

const BASE_PATH = "/notifications";

export const notificationsService = {
  /**
   * Get all notifications
   * @param {Object} params - Filter params
   * @returns {Promise<Object>}
   */
  getAll: async (params = {}) => {
    const { data } = await axiosInstance.get(BASE_PATH, { params });
    return data;
  },

  /**
   * Get unread count
   * @returns {Promise<Object>}
   */
  getUnreadCount: async () => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/unread-count`);
    return data;
  },

  /**
   * Mark notification as read
   * @param {string} notificationId
   * @returns {Promise<Object>}
   */
  markAsRead: async (notificationId) => {
    const { data } = await axiosInstance.patch(`${BASE_PATH}/${notificationId}/read`);
    return data;
  },

  /**
   * Mark all as read
   * @returns {Promise<Object>}
   */
  markAllAsRead: async () => {
    const { data } = await axiosInstance.post(`${BASE_PATH}/mark-all-read`);
    return data;
  },

  /**
   * Delete notification
   * @param {string} notificationId
   * @returns {Promise<void>}
   */
  delete: async (notificationId) => {
    await axiosInstance.delete(`${BASE_PATH}/${notificationId}`);
  },

  /**
   * Delete all notifications
   * @returns {Promise<void>}
   */
  deleteAll: async () => {
    await axiosInstance.delete(`${BASE_PATH}/delete-all`);
  },

  /**
   * Get notification preferences
   * @returns {Promise<Object>}
   */
  getPreferences: async () => {
    const { data } = await axiosInstance.get(`${BASE_PATH}/preferences`);
    return data;
  },

  /**
   * Update notification preferences
   * @param {Object} preferences
   * @returns {Promise<Object>}
   */
  updatePreferences: async (preferences) => {
    const { data } = await axiosInstance.put(`${BASE_PATH}/preferences`, preferences);
    return data;
  },
};
```

### websocket.service.js

```javascript
/**
 * WebSocket Service
 * Realtime notification via WebSocket
 */

import { io } from "socket.io-client";
import { getAccessToken } from "../utils/storage";

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.socket?.connected) return;

    const token = getAccessToken();
    if (!token) {
      console.warn("No token found, skipping WebSocket connection");
      return;
    }

    this.socket = io(import.meta.env.VITE_WS_URL || "ws://localhost:5000", {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 16000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("WebSocket connected");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
    });

    this.socket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    // Listen for notifications
    this.socket.on("notification", (notification) => {
      this.listeners.forEach((callback) => callback(notification));
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Subscribe to notifications
   * @param {string} id - Unique listener ID
   * @param {Function} callback - Callback function
   */
  subscribe(id, callback) {
    this.listeners.set(id, callback);
  }

  /**
   * Unsubscribe from notifications
   * @param {string} id - Listener ID
   */
  unsubscribe(id) {
    this.listeners.delete(id);
  }

  /**
   * Emit event to server
   * @param {string} event
   * @param {any} data
   */
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }
}

export const websocketService = new WebSocketService();
```

---

## 🔧 React Hooks

### useNotifications.js

```javascript
/**
 * Custom hook for notifications
 */

import { useState, useEffect, useCallback } from "react";
import { notificationsService } from "../services/api/notifications.service";
import { websocketService } from "../services/websocket.service";
import { useAuth } from "./useAuth";

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const data = await notificationsService.getAll(params);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationsService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        await notificationsService.delete(notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        // Decrease unread count if notification was unread
        const notification = notifications.find((n) => n.id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("Failed to delete notification:", error);
      }
    },
    [notifications]
  );

  // Setup WebSocket
  useEffect(() => {
    if (!user) return;

    // Connect WebSocket
    websocketService.connect();

    // Subscribe to new notifications
    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast (handled by ToastContainer)
      window.dispatchEvent(new CustomEvent("show-toast", { detail: notification }));
    };

    websocketService.subscribe("notifications-hook", handleNewNotification);

    return () => {
      websocketService.unsubscribe("notifications-hook");
    };
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
```

---

## ✅ Implementation Checklist

### Phase 1: WebSocket Setup (Sprint 6)

- [ ] **Backend WebSocket**

  - [ ] Install socket.io (backend)
  - [ ] Setup WebSocket server
  - [ ] JWT authentication middleware
  - [ ] Notification event emitters

- [ ] **Frontend WebSocket**
  - [ ] Install socket.io-client
  - [ ] Create `websocket.service.js`
  - [ ] Connect on user login
  - [ ] Disconnect on logout
  - [ ] Handle reconnection logic

### Phase 2: Notification UI (Sprint 6)

- [ ] **Topbar Integration**

  - [ ] NotificationBell component
  - [ ] NotificationBadge (unread count)
  - [ ] NotificationDropdown
  - [ ] NotificationItem component
  - [ ] Mark as read on click
  - [ ] Delete notification

- [ ] **Toast Notifications**
  - [ ] ToastContainer component
  - [ ] Toast component with variants (success, info, warning, error)
  - [ ] ToastQueue manager
  - [ ] Auto-dismiss after 5s
  - [ ] Sound notification (optional)
  - [ ] Click to redirect

### Phase 3: Notification Page (Sprint 7)

- [ ] **Notification List Page**

  - [ ] `/notifications` route
  - [ ] NotificationFilters (tabs)
  - [ ] NotificationCard component
  - [ ] Virtual scrolling (for performance)
  - [ ] EmptyState component
  - [ ] Mark all as read
  - [ ] Delete all

- [ ] **API Services**

  - [ ] `notifications.service.js`
  - [ ] All CRUD methods

- [ ] **React Hook**
  - [ ] `useNotifications.js`
  - [ ] State management
  - [ ] WebSocket integration

### Phase 4: Notification Settings (Sprint 7)

- [ ] **Settings Page**

  - [ ] `/settings/notifications` route
  - [ ] NotificationTypeToggle component
  - [ ] CategorySection component
  - [ ] Save preferences
  - [ ] Email notification toggle

- [ ] **Backend**
  - [ ] User preferences schema
  - [ ] Filter notifications by preferences
  - [ ] Email notification service (optional)

### Phase 5: Testing & Polish

- [ ] **Testing**

  - [ ] Test WebSocket connection
  - [ ] Test reconnection logic
  - [ ] Test notification delivery
  - [ ] Test mark as read/unread
  - [ ] Test delete
  - [ ] Test preferences

- [ ] **Performance**

  - [ ] Virtual scrolling for long lists
  - [ ] Debounce API calls
  - [ ] Optimize WebSocket messages

- [ ] **UX Improvements**
  - [ ] Smooth animations
  - [ ] Loading states
  - [ ] Error handling
  - [ ] Responsive design
  - [ ] Accessibility (ARIA labels)

---

## 🔗 Related Use Cases

- **UC-005**: Thông báo khi generate questions xong
- **UC-006**: Thông báo khi quiz completed
- **UC-010**: Thông báo khi validation submitted
- **UC-012**: Thông báo khi Expert nhận nhiệm vụ
- **UC-020**: Thông báo subscription expiring/renewed

---

## 📊 Success Metrics

- WebSocket uptime > 99%
- Average notification delivery time < 1s
- Notification read rate > 60%
- User engagement with notifications > 40%
- Zero data loss during reconnections

---

## 📝 Notes

### WebSocket Authentication

```javascript
// Backend (Socket.io middleware)
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log(`User ${socket.userId} connected`);

  // Join user-specific room
  socket.join(`user:${socket.userId}`);

  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});
```

### Sending Notifications

```javascript
// Backend: Send notification to specific user
const sendNotification = async (userId, notification) => {
  // Save to database
  const saved = await Notification.create({
    userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    link: notification.link,
    isRead: false,
  });

  // Send via WebSocket
  io.to(`user:${userId}`).emit("notification", saved);

  // Send email if enabled (optional)
  const user = await User.findById(userId);
  if (user.preferences?.emailNotifications) {
    await sendEmail(user.email, notification);
  }
};

// Usage
await sendNotification(learnerId, {
  type: "QUESTION_SET_GENERATED",
  title: "Bộ câu hỏi đã được tạo xong",
  message: 'Bộ đề "Toán cao cấp C1" với 20 câu hỏi đã sẵn sàng.',
  link: `/quiz/${setId}`,
});
```

### Toast Component Pattern

```jsx
// ToastContainer.jsx
export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleShowToast = (event) => {
      const notification = event.detail;
      const id = Date.now();

      setToasts((prev) => [...prev, { ...notification, id }]);

      // Auto dismiss
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    };

    window.addEventListener("show-toast", handleShowToast);
    return () => window.removeEventListener("show-toast", handleShowToast);
  }, []);

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          notification={toast}
          onClose={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
        />
      ))}
    </div>
  );
};
```

### Notification Type Icons

```javascript
const NOTIFICATION_ICONS = {
  QUESTION_SET_GENERATED: "🎯",
  VALIDATION_COMPLETED: "✅",
  VALIDATION_ASSIGNED: "📋",
  SUBSCRIPTION_EXPIRING: "⚠️",
  SUBSCRIPTION_RENEWED: "🔄",
  PAYMENT_SUCCESS: "💰",
  PAYMENT_PROCESSED: "💸",
  COMMISSION_EARNED: "💵",
  QUESTION_SET_PUBLISHED: "📚",
  VALIDATION_SUBMITTED: "📝",
  PAYMENT_RECEIVED: "💳",
  USER_REGISTERED: "👤",
  EXPERT_APPLICATION: "🎓",
};

const getNotificationIcon = (type) => NOTIFICATION_ICONS[type] || "🔔";
```

---

**Status**: Ready for Implementation
**Estimated Effort**: 2 sprints
**Dependencies**: WebSocket server setup, Backend notification events
