/**
 * Subjects Service
 */
import api from "./axios.config";
import { API_CONFIG } from "@/config/api.config";

export const subjectsService = {
  /**
   * Get list of subjects
   * @param {object} params { q?: string, visibility?: 'public'|'private', limit?: number }
   */
  getSubjects: async (params = {}) => {
    const res = await api.get(API_CONFIG.ENDPOINTS.SUBJECTS.LIST, { params });
    return res.data;
  },
  getSubjectById: async (id) => {
    const res = await api.get(API_CONFIG.ENDPOINTS.SUBJECTS.GET_BY_ID(id));
    return res.data;
  },
};

export default subjectsService;
