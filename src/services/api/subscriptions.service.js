/**
 * Subscriptions Service
 * Handles all subscription-related API calls
 */

import axiosInstance from "./axios.config";
import { API_CONFIG } from "../../config/api.config";

export const subscriptionsService = {
  /**
   * Get all active subscription plans
   */
  getPlans: async () => {
    const response = await axiosInstance.get("/subscription-plans");
    return response.data;
  },

  /**
   * Get plan by ID
   */
  getPlanById: async (id) => {
    const response = await axiosInstance.get(`/subscription-plans/${id}`);
    return response.data;
  },

  /**
   * Get user's current subscription
   */
  getMySubscription: async () => {
    const response = await axiosInstance.get("/user-subscriptions/me");
    return response.data;
  },

  /**
   * Create new subscription
   * @param {string} planId - Subscription plan ID
   * @param {string} paymentReference - Payment reference number
   */
  createSubscription: async (planId, paymentReference) => {
    const response = await axiosInstance.post("/user-subscriptions", {
      planId,
      paymentReference,
    });
    return response.data;
  },

  /**
   * Cancel subscription
   * @param {string} subscriptionId - Subscription ID
   */
  cancelSubscription: async (subscriptionId) => {
    const response = await axiosInstance.post(
      `/user-subscriptions/${subscriptionId}/cancel`
    );
    return response.data;
  },
};

export default subscriptionsService;
