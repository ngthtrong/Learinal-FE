/**
 * Admin Service
 * Endpoints for admin features (users, stats, validations, ...)
 */
import axiosInstance from "./axios.config";
import { API_CONFIG } from "@/config/api.config";

const { ADMIN } = API_CONFIG.ENDPOINTS;

export const adminService = {
  /**
   * List users with filters and pagination
   * Accepts { page, pageSize, q, role, status } and maps to backend ({ search, role, status })
   */
  listUsers: async (params = {}) => {
    const { page, pageSize, q, role, status } = params;
    const query = {
      page,
      pageSize,
      search: q || undefined,
      role: role || undefined,
      status: status || undefined,
    };
    const response = await axiosInstance.get(ADMIN.USERS, {
      params: query,
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  },

  /** Get aggregated system stats */
  getStats: async () => {
    const response = await axiosInstance.get(ADMIN.STATS, {
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  },

  /** Monthly financial statistics */
  getFinancials: async ({ year, startDate, endDate } = {}) => {
    const params = {};
    if (year) params.year = year;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axiosInstance.get(`${ADMIN.STATS.replace("/stats", "")}/financials`, {
      // ADMIN.STATS is /admin/stats so derive /admin/financials
      params,
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  },
  /** List user subscription purchases (admin) */
  listUserSubscriptions: async ({ page = 1, pageSize = 20, search } = {}) => {
    const baseAdmin = ADMIN.STATS.replace("/stats", ""); // /admin
    const response = await axiosInstance.get(`${baseAdmin}/user-subscriptions`, {
      params: { page, pageSize, search: search || undefined },
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  },

  /**
   * Update basic user fields (fullName, email, status)
   */
  updateUser: async (userId, payload) => {
    const url = `${ADMIN.USERS}/${userId}`;
    const response = await axiosInstance.patch(url, payload);
    return response.data;
  },

  /** Change role using dedicated endpoint */
  changeRole: async (userId, role) => {
    const url = `${ADMIN.USERS}/${userId}/role`;
    const response = await axiosInstance.patch(url, { role });
    return response.data;
  },

  /** Activate user */
  activateUser: async (userId) => {
    const url = `${ADMIN.USERS}/${userId}/activate`;
    const response = await axiosInstance.post(url, {});
    return response.data;
  },

  /** Ban user */
  banUser: async (userId, reason = "") => {
    const url = `${ADMIN.USERS}/${userId}/ban`;
    const response = await axiosInstance.post(url, { reason });
    return response.data;
  },
};

export default adminService;
