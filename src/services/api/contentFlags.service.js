/**
 * Content Flags Service
 * For reporting and managing content issues
 */
import api from "./axios.config";

export const contentFlagsService = {
  /**
   * Create a content flag (report)
   * @param {object} data - { contentType, contentId, reason, description }
   */
  createFlag: async (data) => {
    const res = await api.post("/content-flags", data);
    return res.data;
  },

  /**
   * List content flags
   * @param {object} params - { page, pageSize, status, contentType }
   */
  listFlags: async (params = {}) => {
    const res = await api.get("/content-flags", { params });
    return res.data;
  },

  /**
   * Get flags by content IDs (for expert to see which sets have reports)
   * @param {string[]} contentIds - Array of content IDs
   */
  getFlagsByContent: async (contentIds) => {
    const res = await api.get("/content-flags/by-content", {
      params: { contentIds: contentIds.join(',') }
    });
    return res.data;
  },

  /**
   * Get single content flag by ID
   * @param {string} id - Flag ID
   */
  getFlagById: async (id) => {
    const res = await api.get(`/content-flags/${id}`);
    return res.data;
  },

  /**
   * Admin: Review a flag and take action
   * @param {string} id - Flag ID
   * @param {object} data - { action: 'Dismiss' | 'SendToExpert', adminNote }
   */
  adminReview: async (id, data) => {
    const res = await api.patch(`/content-flags/${id}/review`, data);
    return res.data;
  },

  /**
   * Expert: Respond to a flag after fixing the issue
   * @param {string} id - Flag ID
   * @param {object} data - { response }
   */
  expertRespond: async (id, data) => {
    const res = await api.patch(`/content-flags/${id}/expert-respond`, data);
    return res.data;
  },

  /**
   * Admin: Mark flag as resolved
   * @param {string} id - Flag ID
   * @param {object} data - { resolutionNote }
   */
  resolveFlag: async (id, data) => {
    const res = await api.patch(`/content-flags/${id}/resolve`, data);
    return res.data;
  },
};

export default contentFlagsService;
