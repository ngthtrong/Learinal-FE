/**
 * Notification Context
 * Manages notifications state and real-time updates
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "../components/common/ToastContainer";
import websocketService from "../services/api/websocket.service";
import notificationsService from "../services/api/notifications.service";

const NotificationContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(async (page = 1, pageSize = 20) => {
    try {
      setLoading(true);
      const data = await notificationsService.getNotifications({ page, pageSize });
      setNotifications(data.items || []);
      
      // Calculate unread count
      const unread = (data.items || []).filter((n) => !n.isRead).length;
      setUnreadCount(unread);
      
      return data;
    } catch (error) {
      console.error("[Notifications] Failed to fetch notifications:", error);
      return { items: [], meta: {} };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationsService.markAsRead(notificationId);
      
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      
      // Decrease unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("[Notifications] Failed to mark as read:", error);
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("[Notifications] Failed to mark all as read:", error);
    }
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationsService.deleteNotification(notificationId);
      
      // Update local state
      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount((count) => Math.max(0, count - 1));
        }
        return prev.filter((n) => n.id !== notificationId);
      });
    } catch (error) {
      console.error("[Notifications] Failed to delete notification:", error);
    }
  }, []);

  /**
   * Add new notification to the list (from real-time event)
   */
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
    
    // Show toast notification
    if (toast) {
      toast.success(notification.message);
    }
    
    // Show browser notification if permission granted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/logo.png",
        tag: notification.id,
      });
    }
  }, [toast]);

  /**
   * Setup WebSocket connection and event listeners
   */
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect if not authenticated
      websocketService.disconnect();
      setConnected(false);
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Connect to WebSocket
    websocketService.connect();

    // Listen to connection status
    const handleConnectionStatus = (data) => {
      setConnected(data.connected);
    };

    // Listen to real-time notification events
    const handleNotification = (data) => {
      console.log("[NotificationContext] New notification:", data);
      
      if (data.data) {
        addNotification({
          id: Date.now().toString(), // Temporary ID until we fetch from API
          title: data.data.title,
          message: data.data.message,
          type: data.data.type || "info",
          isRead: false,
          createdAt: data.timestamp,
        });
      }
    };

    const handleValidationAssigned = (data) => {
      addNotification({
        id: Date.now().toString(),
        title: "Yêu cầu xác thực mới",
        message: "Bạn có yêu cầu xác thực mới cần xử lý",
        type: "info",
        isRead: false,
        createdAt: data.timestamp,
        relatedEntityType: "validation",
        relatedEntityId: data.data?.validationRequestId,
      });
    };

    const handleValidationCompleted = (data) => {
      addNotification({
        id: Date.now().toString(),
        title: "Xác thực hoàn tất",
        message: "Yêu cầu xác thực của bạn đã được xử lý",
        type: "success",
        isRead: false,
        createdAt: data.timestamp,
        relatedEntityType: "validation",
        relatedEntityId: data.data?.validationRequestId,
      });
    };

    const handleQuizCompleted = (data) => {
      addNotification({
        id: Date.now().toString(),
        title: "Quiz hoàn thành",
        message: `Bạn đã hoàn thành quiz với điểm ${data.data?.score || 0}/${data.data?.totalQuestions || 0}`,
        type: "success",
        isRead: false,
        createdAt: data.timestamp,
        relatedEntityType: "quiz",
        relatedEntityId: data.data?.quizAttemptId,
      });
    };

    const handleDocumentProcessed = (data) => {
      addNotification({
        id: Date.now().toString(),
        title: "Tài liệu đã xử lý",
        message: `Tài liệu "${data.data?.fileName}" đã được xử lý xong`,
        type: "success",
        isRead: false,
        createdAt: data.timestamp,
        relatedEntityType: "document",
        relatedEntityId: data.data?.documentId,
      });
    };

    const handleQuestionSetGenerated = (data) => {
      console.log("[NotificationContext] Question set generated event received:", data);
      const notification = {
        id: Date.now().toString(),
        title: "Bộ câu hỏi đã tạo",
        message: `Bộ câu hỏi "${data.data?.title}" với ${data.data?.totalQuestions || 0} câu hỏi đã được tạo thành công!`,
        type: "success",
        isRead: false,
        createdAt: data.timestamp,
        relatedEntityType: "questionSet",
        relatedEntityId: data.data?.questionSetId,
      };
      console.log("[NotificationContext] Adding notification:", notification);
      addNotification(notification);
    };

    const handleCommissionEarned = (data) => {
      addNotification({
        id: Date.now().toString(),
        title: "Hoa hồng mới",
        message: `Bạn đã nhận được hoa hồng ${data.data?.amount?.toLocaleString()} VNĐ`,
        type: "success",
        isRead: false,
        createdAt: data.timestamp,
        relatedEntityType: "commission",
        relatedEntityId: data.data?.commissionId,
      });
    };

    const handleSubscriptionUpdated = (data) => {
      addNotification({
        id: Date.now().toString(),
        title: "Gói đăng ký cập nhật",
        message: `Gói đăng ký ${data.data?.planName} của bạn đã được cập nhật`,
        type: "info",
        isRead: false,
        createdAt: data.timestamp,
        relatedEntityType: "subscription",
        relatedEntityId: data.data?.subscriptionId,
      });
    };

    const handleSystemAnnouncement = (data) => {
      addNotification({
        id: Date.now().toString(),
        title: data.data?.title || "Thông báo hệ thống",
        message: data.data?.message || "",
        type: "warning",
        isRead: false,
        createdAt: data.timestamp,
      });
    };

    // Register event handlers
    websocketService.on("connection.status", handleConnectionStatus);
    websocketService.on("notification", handleNotification);
    websocketService.on("validation.assigned", handleValidationAssigned);
    websocketService.on("validation.completed", handleValidationCompleted);
    websocketService.on("quiz.completed", handleQuizCompleted);
    websocketService.on("document.processed", handleDocumentProcessed);
    websocketService.on("questionSet.generated", handleQuestionSetGenerated);
    websocketService.on("commission.earned", handleCommissionEarned);
    websocketService.on("subscription.updated", handleSubscriptionUpdated);
    websocketService.on("system.announcement", handleSystemAnnouncement);

    // Fetch initial notifications
    fetchNotifications();

    // Request browser notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      websocketService.off("connection.status", handleConnectionStatus);
      websocketService.off("notification", handleNotification);
      websocketService.off("validation.assigned", handleValidationAssigned);
      websocketService.off("validation.completed", handleValidationCompleted);
      websocketService.off("quiz.completed", handleQuizCompleted);
      websocketService.off("document.processed", handleDocumentProcessed);
      websocketService.off("questionSet.generated", handleQuestionSetGenerated);
      websocketService.off("commission.earned", handleCommissionEarned);
      websocketService.off("subscription.updated", handleSubscriptionUpdated);
      websocketService.off("system.announcement", handleSystemAnnouncement);
    };
  }, [isAuthenticated, user, fetchNotifications, addNotification]);

  const value = {
    notifications,
    unreadCount,
    loading,
    connected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
