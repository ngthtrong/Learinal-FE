import api from "./axios.config";
import { API_CONFIG } from "../../config/api.config";

/**
 * Withdrawal Request Service
 * Manage expert withdrawal requests for commission payouts
 */

/**
 * Create a new withdrawal request
 */
export const createWithdrawalRequest = async (data) => {
  const response = await api.post(API_CONFIG.ENDPOINTS.WITHDRAWAL_REQUESTS.CREATE, data);
  return response.data;
};

/**
 * Get expert's own withdrawal requests
 */
export const getMyWithdrawalRequests = async (params = {}) => {
  const response = await api.get(API_CONFIG.ENDPOINTS.WITHDRAWAL_REQUESTS.GET_MY_REQUESTS, { params });
  return response.data;
};

/**
 * Get expert's withdrawal statistics
 */
export const getMyWithdrawalStats = async () => {
  const response = await api.get(API_CONFIG.ENDPOINTS.WITHDRAWAL_REQUESTS.GET_MY_STATS);
  return response.data;
};

/**
 * Cancel a withdrawal request
 */
export const cancelWithdrawalRequest = async (id) => {
  const response = await api.post(API_CONFIG.ENDPOINTS.WITHDRAWAL_REQUESTS.CANCEL(id));
  return response.data;
};

/**
 * List all withdrawal requests (Admin only)
 */
export const listAllWithdrawalRequests = async (params = {}) => {
  const response = await api.get(API_CONFIG.ENDPOINTS.WITHDRAWAL_REQUESTS.LIST_ALL, { params });
  return response.data;
};

/**
 * Process withdrawal request - Generate QR code (Admin only)
 */
export const processWithdrawalRequest = async (id, data) => {
  const response = await api.post(API_CONFIG.ENDPOINTS.WITHDRAWAL_REQUESTS.PROCESS(id), data);
  return response.data;
};

/**
 * Reject withdrawal request (Admin only)
 */
export const rejectWithdrawalRequest = async (id, data) => {
  const response = await api.post(API_CONFIG.ENDPOINTS.WITHDRAWAL_REQUESTS.REJECT(id), data);
  return response.data;
};

/**
 * Complete withdrawal request after manual transfer (Admin only)
 */
export const completeWithdrawalRequest = async (id, data) => {
  const response = await api.post(API_CONFIG.ENDPOINTS.WITHDRAWAL_REQUESTS.COMPLETE(id), data);
  return response.data;
};

/**
 * Get withdrawal request details
 */
export const getWithdrawalRequestById = async (id) => {
  const response = await api.get(API_CONFIG.ENDPOINTS.WITHDRAWAL_REQUESTS.GET_BY_ID(id));
  return response.data;
};

export default {
  createWithdrawalRequest,
  getMyWithdrawalRequests,
  getMyWithdrawalStats,
  cancelWithdrawalRequest,
  listAllWithdrawalRequests,
  processWithdrawalRequest,
  rejectWithdrawalRequest,
  completeWithdrawalRequest,
  getWithdrawalRequestById,
};
