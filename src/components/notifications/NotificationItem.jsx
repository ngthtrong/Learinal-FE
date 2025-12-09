/**
 * Notification Item Component
 * Individual notification display
 */

import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../contexts/NotificationContext";
import { formatDistanceToNow } from "../../utils/dateFormat";

function NotificationItem({ notification, onClose }) {
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();

  const handleClick = async () => {
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
        QuestionSet: `/question-sets/${notification.relatedEntityId}`,
        commission: `/commissions`,
        subscription: `/subscriptions`,
      };

      const route = routes[notification.relatedEntityType];
      if (route) {
        navigate(route);
        onClose?.();
      }
    }
  };

  // Get notification icon and color based on type
  const getNotificationStyle = (type) => {
    const styles = {
      info: {
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        iconColor: "text-blue-600 dark:text-blue-400",
      },
      success: {
        bgColor: "bg-green-50 dark:bg-green-900/20",
        iconColor: "text-green-600 dark:text-green-400",
      },
      warning: {
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        iconColor: "text-yellow-600 dark:text-yellow-400",
      },
      error: {
        bgColor: "bg-red-50 dark:bg-red-900/20",
        iconColor: "text-red-600 dark:text-red-400",
      },
    };

    return styles[type] || styles.info;
  };

  const style = getNotificationStyle(notification.type);
  const timeAgo = formatDistanceToNow(notification.createdAt);

  return (
    <div
      onClick={handleClick}
      className={`px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
        !notification.isRead ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
      }`}
    >
      <div className="flex items-start gap-2.5 sm:gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full ${style.bgColor} flex items-center justify-center`}>
          {notification.type === "info" && (
            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${style.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {notification.type === "success" && (
            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${style.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {notification.type === "warning" && (
            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${style.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {notification.type === "error" && (
            <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${style.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-xs sm:text-sm font-semibold ${!notification.isRead ? "text-gray-900 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}`}>
              {notification.title}
            </h4>
            {!notification.isRead && (
              <span className="flex-shrink-0 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-1"></span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-2">
            {notification.message}
          </p>

          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5 sm:mt-1">
            {timeAgo}
          </p>
        </div>
      </div>
    </div>
  );
}

export default NotificationItem;
