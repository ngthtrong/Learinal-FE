/**
 * Payments Service
 * Handles all payment-related API calls
 */

import axiosInstance from "./axios.config";

export const paymentsService = {
  /**
   * Generate Sepay QR code for subscription payment
   */
  generateSepayQR: async (subscriptionPlanId) => {
    const response = await axiosInstance.post("/payments/sepay/qr", {
      subscriptionPlanId,
    });
    return response.data;
  },

  /**
   * List Sepay transactions
   */
  listSepayTransactions: async (params) => {
    const response = await axiosInstance.get("/payments/sepay/transactions", {
      params,
    });
    return response.data;
  },
};

export default paymentsService;
