/**
 * Notifications Service
 * API calls for notifications
 */

import axiosInstance from "./axios.config";
import { API_CONFIG } from "../../config/api.config";

const notificationsService = {
  /**
   * Get list of notifications
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.pageSize - Items per page
   * @returns {Promise} List of notifications
   */
  getNotifications: async (params = {}) => {
    const { page = 1, pageSize = 20 } = params;
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST, {
      params: { page, pageSize },
    });
    return response.data;
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise} Updated notification
   */
  markAsRead: async (notificationId) => {
    const response = await axiosInstance.patch(`/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   * @returns {Promise}
   */
  markAllAsRead: async () => {
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    return response.data;
  },

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise}
   */
  deleteNotification: async (notificationId) => {
    const response = await axiosInstance.delete(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS.DELETE(notificationId)
    );
    return response.data;
  },

  /**
   * Get unread notification count
   * @returns {Promise<number>} Count of unread notifications
   */
  getUnreadCount: async () => {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST, {
      params: { page: 1, pageSize: 1 },
    });
    // Backend should return meta.unreadCount, but we can also calculate from items
    return response.data.meta?.unreadCount || 0;
  },
};

export default notificationsService;
