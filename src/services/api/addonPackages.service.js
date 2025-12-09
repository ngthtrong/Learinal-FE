/**
 * Addon Packages Service
 * Handles all addon package-related API calls
 */

import axiosInstance from "./axios.config";

export const addonPackagesService = {
  // ==================== USER ENDPOINTS ====================

  /**
   * Get all active addon packages (for users)
   */
  getActivePackages: async () => {
    const response = await axiosInstance.get("/addon-packages");
    return response.data;
  },

  /**
   * Get addon package details
   */
  getPackageById: async (id) => {
    const response = await axiosInstance.get(`/addon-packages/details/${id}`);
    return response.data;
  },

  /**
   * Get user's purchased addons
   */
  getMyAddons: async ({ status, page = 1, pageSize = 20 } = {}) => {
    const response = await axiosInstance.get("/addon-packages/my-addons", {
      params: { status, page, pageSize },
    });
    return response.data;
  },

  /**
   * Get user's remaining addon quota
   */
  getMyQuota: async () => {
    const response = await axiosInstance.get("/addon-packages/my-quota");
    return response.data;
  },

  /**
   * Generate payment QR for addon package
   */
  generatePaymentQR: async (addonPackageId) => {
    const response = await axiosInstance.post(`/addon-packages/${addonPackageId}/generate-qr`);
    return response.data;
  },

  // ==================== ADMIN ENDPOINTS ====================

  /**
   * Admin: Get all addon packages with pagination
   */
  getAllPackages: async ({ status, page = 1, pageSize = 20 } = {}) => {
    const response = await axiosInstance.get("/addon-packages/admin/all", {
      params: { status, page, pageSize },
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  },

  /**
   * Admin: Create new addon package
   */
  createPackage: async (payload) => {
    const response = await axiosInstance.post("/addon-packages/admin", payload);
    return response.data;
  },

  /**
   * Admin: Update addon package
   */
  updatePackage: async (id, payload) => {
    const response = await axiosInstance.put(`/addon-packages/admin/${id}`, payload);
    return response.data;
  },

  /**
   * Admin: Delete/Deactivate addon package
   */
  deletePackage: async (id, softDelete = true) => {
    const response = await axiosInstance.delete(`/addon-packages/admin/${id}`, {
      params: { softDelete },
    });
    return response.data;
  },
};

export default addonPackagesService;
