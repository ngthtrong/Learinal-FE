/**
 * Commission Records Service
 * Endpoints for experts and admins to manage commission records
 */
import axiosInstance from "./axios.config";
import { API_CONFIG } from "@/config/api.config";

const { COMMISSIONS } = API_CONFIG.ENDPOINTS;

export const commissionRecordsService = {
  /**
   * List commission records
   * Accepts { page, pageSize } as backend supports; extra filters are ignored server-side
   */
  list: async (params = {}) => {
    const { page = 1, pageSize = 20, status, q } = params;
    const response = await axiosInstance.get(COMMISSIONS.LIST, {
      params: { page, pageSize, status: status || undefined, q: q || undefined },
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  },

  /** Get single record by id */
  getById: async (id) => {
    const response = await axiosInstance.get(COMMISSIONS.GET_BY_ID(id));
    return response.data;
  },

  /** Expert earnings summary with optional month filter and expertId (for admin) */
  summary: async (month = null, expertId = null) => {
    const params = {};
    if (month) params.month = month;
    if (expertId) params.expertId = expertId;
    const response = await axiosInstance.get(COMMISSIONS.SUMMARY, {
      params,
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  },

  /** Expert detailed stats (Hybrid Model breakdown) */
  stats: async (month = null) => {
    const params = month ? { month } : {};
    const response = await axiosInstance.get(COMMISSIONS.STATS, {
      params,
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  },

  /** Get commission config (Admin) */
  getConfig: async () => {
    const response = await axiosInstance.get(COMMISSIONS.CONFIG);
    return response.data;
  },

  /** Admin: mark a commission as paid */
  markPaid: async (id, paymentReference) => {
    const response = await axiosInstance.patch(COMMISSIONS.MARK_PAID(id), {
      paymentReference,
    });
    return response.data;
  },
};

export default commissionRecordsService;
