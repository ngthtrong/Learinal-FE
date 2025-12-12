import apiClient from "./axios.config";

export const bankAccountsService = {
  /**
   * Link or update bank account (Expert)
   */
  async linkBankAccount(data) {
    const response = await apiClient.post("/bank-accounts", data);
    return response.data.data;
  },

  /**
   * Get my bank account (Expert)
   */
  async getMyBankAccount() {
    const response = await apiClient.get("/bank-accounts");
    return response.data.data;
  },

  /**
   * Get all bank accounts (Admin)
   */
  async getAllBankAccounts(params = {}) {
    const response = await apiClient.get("/admin/commissions/bank-accounts", { params });
    return response.data.data;
  },

  /**
   * Verify bank account (Admin)
   */
  async verifyBankAccount(id) {
    const response = await apiClient.put(`/admin/commissions/bank-accounts/${id}/verify`);
    return response.data.data;
  },

  /**
   * Reject bank account (Admin)
   */
  async rejectBankAccount(id, reason) {
    const response = await apiClient.put(`/admin/commissions/bank-accounts/${id}/reject`, {
      reason,
    });
    return response.data.data;
  },
};
