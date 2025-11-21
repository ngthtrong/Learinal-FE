/**
 * Validation Requests Service
 * Handles all validation request related API calls for Experts
 */

import axiosInstance from "./axios.config";
import { API_CONFIG } from "../../config/api.config";

export const validationRequestsService = {
  /**
   * List validation requests
   * @param {Object} params - { page, pageSize, status, search }
   */
  list: async (params) => {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.VALIDATION_REQUESTS.LIST, {
      params,
    });
    return response.data;
  },

  /**
   * Get validation request details
   * @param {string} id
   */
  getById: async (id) => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.VALIDATION_REQUESTS.GET_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Approve a validation request
   * @param {string} id
   * @param {Object} data - { feedback }
   */
  approve: async (id, data) => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.VALIDATION_REQUESTS.APPROVE(id),
      data
    );
    return response.data;
  },

  /**
   * Reject a validation request
   * @param {string} id
   * @param {Object} data - { reason }
   */
  reject: async (id, data) => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.VALIDATION_REQUESTS.REJECT(id),
      data
    );
    return response.data;
  },

  /**
   * Get validation history for expert
   * @param {Object} params
   */
  getHistory: async (params) => {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.VALIDATION_REQUESTS.HISTORY, {
      params,
    });
    return response.data;
  },

  /**
   * Get expert stats
   */
  getStats: async () => {
    // Placeholder if endpoint doesn't exist yet, or use a specific stats endpoint
    // const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.EXPERTS.STATS);
    // return response.data;
    return {
      pending: 0,
      completed: 0,
      commission: 0,
    };
  },
};

export default validationRequestsService;
