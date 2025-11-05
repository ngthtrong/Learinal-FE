/**
 * Subscriptions Service
 * Handles user subscription APIs
 */

import axiosInstance from "./axios.config";
import { API_CONFIG } from "@/config/api.config";

const subscriptionsService = {
  async getUserSubscription() {
    const { data } = await axiosInstance.get(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.USER_SUBSCRIPTION);
    return data;
  },

  async getPlans() {
    const { data } = await axiosInstance.get(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.PLANS);
    return data;
  },

  async upgrade(payload) {
    const { data } = await axiosInstance.post(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.UPGRADE, payload);
    return data;
  },

  async cancel() {
    const { data } = await axiosInstance.post(API_CONFIG.ENDPOINTS.SUBSCRIPTIONS.CANCEL, {});
    return data;
  },
};

export default subscriptionsService;
