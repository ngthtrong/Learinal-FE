import apiClient from "./axios.config";

export const banksService = {
  /**
   * Get list of Vietnamese banks
   */
  async getBanks() {
    const response = await apiClient.get("/banks");
    return response.data.data;
  },
};
