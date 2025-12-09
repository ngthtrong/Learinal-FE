/**
 * Notification Dropdown Component
 * Displays recent notifications in a dropdown
 */

import { useNotifications } from "../../contexts/NotificationContext";
import NotificationItem from "./NotificationItem";

function NotificationDropdown({ onViewAll, onClose }) {
  const { notifications, loading, markAllAsRead } = useNotifications();

  // Show only recent 5 notifications in dropdown
  const recentNotifications = notifications.slice(0, 5);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <>
      {/* Mobile Overlay Background */}
      <div 
        className="sm:hidden fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Dropdown Container */}
      <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto top-16 sm:top-auto sm:right-0 sm:mt-2 w-auto sm:w-80 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[70vh] sm:max-h-[500px] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Thông báo</h3>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Đánh dấu đã đọc
              </button>
            )}
            {/* Close button on mobile */}
            <button
              onClick={onClose}
              className="sm:hidden p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              aria-label="Đóng"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1">
        {loading && (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && recentNotifications.length === 0 && (
          <div className="text-center py-6 sm:py-8 px-4">
            <div className="flex justify-center mb-2">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Không có thông báo mới</p>
          </div>
        )}

        {!loading && recentNotifications.length > 0 && (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onViewAll}
            className="w-full px-4 py-2.5 sm:py-3 text-center text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            Xem tất cả thông báo
          </button>
        </div>
      )}
    </div>
    </>
  );
}

export default NotificationDropdown;
