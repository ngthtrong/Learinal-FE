import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../../contexts/NotificationContext";
import { formatDateTime, formatDistanceToNow } from "../../../utils/dateFormat";
import { Footer } from "@/components/layout";

function NotificationListPage() {
  const navigate = useNavigate();
  const { notifications, loading, fetchNotifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState("all"); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.isRead;
    if (filter === "read") return notification.isRead;
    return true;
  });

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate to related entity if exists
    if (notification.relatedEntityType && notification.relatedEntityId) {
      const routes = {
        validation: `/validation-requests/${notification.relatedEntityId}`,
        quiz: `/quiz-attempts/${notification.relatedEntityId}`,
        document: `/documents/${notification.relatedEntityId}`,
        questionSet: `/question-sets/${notification.relatedEntityId}`,
        commission: `/commissions`,
        subscription: `/subscriptions`,
      };

      const route = routes[notification.relatedEntityType];
      if (route) {
        navigate(route);
      }
    }
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc muốn xóa thông báo này?")) {
      await deleteNotification(notificationId);
    }
  };

  const getNotificationStyle = (type) => {
    const styles = {
      info: { icon: "ℹ️", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
      success: { icon: "✅", bgColor: "bg-green-50", borderColor: "border-green-200" },
      warning: { icon: "⚠️", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
      error: { icon: "❌", bgColor: "bg-red-50", borderColor: "border-red-200" },
    };
    return styles[type] || styles.info;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Thông báo</h1>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Filter Tabs */}
              <div className="flex gap-1.5 sm:gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    filter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    filter === "unread"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Chưa đọc
                </button>
                <button
                  onClick={() => setFilter("read")}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    filter === "read"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Đã đọc
                </button>
              </div>

              {/* Mark all as read button */}
              {notifications.some((n) => !n.isRead) && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-medium overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!loading && filteredNotifications.length === 0 && (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="flex justify-center mb-3 sm:mb-4">
                <svg className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
                {filter === "unread"
                  ? "Không có thông báo chưa đọc"
                  : filter === "read"
                  ? "Không có thông báo đã đọc"
                  : "Bạn chưa có thông báo nào"}
              </p>
            </div>
          )}

          {!loading && filteredNotifications.length > 0 && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map((notification) => {
                const style = getNotificationStyle(notification.type);
                const timeAgo = formatDistanceToNow(notification.createdAt);
                const fullDate = formatDateTime(notification.createdAt);

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      !notification.isRead ? "bg-blue-50/30 dark:bg-blue-900/20" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full ${style.bgColor} dark:bg-opacity-20 flex items-center justify-center`}>
                        {notification.type === "info" && (
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {notification.type === "success" && (
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {notification.type === "warning" && (
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        )}
                        {notification.type === "error" && (
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className={`text-base sm:text-lg font-semibold truncate ${
                                !notification.isRead ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"
                              }`}>
                                {notification.title}
                              </h3>
                              {!notification.isRead && (
                                <span className="flex-shrink-0 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{notification.message}</p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500" title={fullDate}>
                                {timeAgo}
                              </p>
                              {notification.relatedEntityType && (
                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                  {notification.relatedEntityType}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => handleDelete(e, notification.id)}
                            className="flex-shrink-0 p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Xóa thông báo"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Footer */}
      <div className="mt-12">
        <Footer />
      </div>

    </div>
    
  );
}

export default NotificationListPage;
