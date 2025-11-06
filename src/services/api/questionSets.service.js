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
   * Get question sets by subject ID
   * @param {string} subjectId - Subject ID
   * @param {object} params { page?, pageSize?, status?, isShared? }
   */
  getQuestionSetsBySubject: async (subjectId, params = {}) => {
    try {
      const res = await api.get(`/subjects/${subjectId}/question-sets`, { params });
      console.log(`GET /subjects/${subjectId}/question-sets response:`, res.data);

      // Backend may return { items: [...] } or { data: [...] }
      // Normalize to { data: [...], meta: {...} }
      if (res.data.items) {
        return {
          data: res.data.items,
          meta: {
            page: 1,
            pageSize: res.data.items.length,
            total: res.data.items.length,
            totalPages: 1,
          },
        };
      }

      return res.data;
    } catch (error) {
      console.error(`Failed to get question sets for subject ${subjectId}:`, error);
      console.error("Error response:", error.response?.data);
      if (error.response?.status === 404) {
        return { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
      }
      throw error;
    }
  },

  /**
   * Advanced filter via /search/question-sets
   * @param {object} params { status?, difficulty?, startDate?, endDate?, creatorId?, isShared?, page?, pageSize? }
   */
  filterSets: async (params = {}) => {
    const res = await api.get(API_CONFIG.ENDPOINTS.SEARCH.QUESTION_SETS, { params });
    return res.data;
  },

  /**
   * Get question set by ID
   * @param {string} id - Question set ID
   */
  getSetById: async (id) => {
    const res = await api.get(API_CONFIG.ENDPOINTS.QUESTION_SETS.GET_BY_ID(id));
    return res.data;
  },

  /**
   * Generate question set from document using AI
   * @param {object} data - { subjectId, topics: [], numQuestions, difficulty: { know, understand, apply, analyze } }
   */
  generateQuestionSet: async (data) => {
    const res = await api.post(API_CONFIG.ENDPOINTS.QUESTION_SETS.GENERATE, data);
    return res.data;
  },

  /**
   * Check generation job status
   * @param {string} jobId - Job ID returned from generate
   */
  checkJobStatus: async (jobId) => {
    const res = await api.get(`/question-sets/jobs/${jobId}`);
    return res.data;
  },

  /**
   * Create question set manually
   * @param {object} data - Question set data
   */
  createSet: async (data) => {
    const res = await api.post(API_CONFIG.ENDPOINTS.QUESTION_SETS.CREATE, data);
    return res.data;
  },

  /**
   * Update question set
   * @param {string} id - Question set ID
   * @param {object} data - Updated data
   */
  updateSet: async (id, data) => {
    const res = await api.patch(API_CONFIG.ENDPOINTS.QUESTION_SETS.UPDATE(id), data);
    return res.data;
  },

  /**
   * Delete question set
   * @param {string} id - Question set ID
   */
  deleteSet: async (id) => {
    const res = await api.delete(API_CONFIG.ENDPOINTS.QUESTION_SETS.DELETE(id));
    return res.data;
  },

  /**
   * Share question set (generate public link)
   * @param {string} id - Question set ID
   */
  shareSet: async (id) => {
    const res = await api.post(`/question-sets/${id}/share`);
    return res.data;
  },

  /**
   * Unshare question set
   * @param {string} id - Question set ID
   */
  unshareSet: async (id) => {
    const res = await api.post(`/question-sets/${id}/unshare`);
    return res.data;
  },
};

export default questionSetsService;
