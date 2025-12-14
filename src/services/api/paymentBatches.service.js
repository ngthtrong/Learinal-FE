import apiClient from "./axios.config";

export const paymentBatchesService = {
  /**
   * Create payment batch (Admin)
   */
  async createBatch(expertId) {
    const response = await apiClient.post("/admin/commissions/payment-batches", { expertId });
    return response.data.data;
  },

  /**
   * Complete payment batch (Admin)
   */
  async completeBatch(id, paymentNote) {
    const response = await apiClient.put(`/admin/commissions/payment-batches/${id}/complete`, {
      paymentNote,
    });
    return response.data.data;
  },

  /**
   * Get all payment batches (Admin)
   */
  async getAllBatches(params = {}) {
    const response = await apiClient.get("/admin/commissions/payment-batches", { params });
    return response.data.data;
  },

  /**
   * Get batch by ID (Admin)
   */
  async getBatchById(id) {
    const response = await apiClient.get(`/admin/commissions/payment-batches/${id}`);
    return response.data.data;
  },
};
