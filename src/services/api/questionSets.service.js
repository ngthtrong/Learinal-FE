/**
 * Question Sets Service
 */
import api from "./axios.config";
import { API_CONFIG } from "@/config/api.config";

export const questionSetsService = {
  /**
   * Get list of question sets
   * @param {object} params { q?: string, visibility?: 'public'|'private', limit?: number }
   */
  getSets: async (params = {}) => {
    const res = await api.get(API_CONFIG.ENDPOINTS.QUESTION_SETS.LIST, { params });
    return res.data;
  },
  /**
   * Advanced filter via /search/question-sets
   * @param {object} params { status?, difficulty?, startDate?, endDate?, creatorId?, isShared?, page?, pageSize? }
   */
  filterSets: async (params = {}) => {
    const res = await api.get(API_CONFIG.ENDPOINTS.SEARCH.QUESTION_SETS, { params });
    return res.data;
  },
  getSetById: async (id) => {
    const res = await api.get(API_CONFIG.ENDPOINTS.QUESTION_SETS.GET_BY_ID(id));
    return res.data;
  },
};

export default questionSetsService;
