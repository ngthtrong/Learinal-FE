/**
 * Subjects Service
 */
import api from "./axios.config";
import { API_CONFIG } from "@/config/api.config";

export const subjectsService = {
  /**
   * Get list of subjects
   * @param {object} params { page?: number, pageSize?: number }
   */
  getSubjects: async (params = {}) => {
    const res = await api.get(API_CONFIG.ENDPOINTS.SUBJECTS.LIST, { params });
    return res.data;
  },

  /**
   * Get subject by ID
   * @param {string} id - Subject ID
   */
  getSubjectById: async (id) => {
    const res = await api.get(API_CONFIG.ENDPOINTS.SUBJECTS.GET_BY_ID(id));
    return res.data;
  },

  /**
   * Create new subject
   * @param {object} data { subjectName, description?, tableOfContents?, summary? }
   */
  createSubject: async (data) => {
    const res = await api.post(API_CONFIG.ENDPOINTS.SUBJECTS.CREATE, data);
    return res.data;
  },

  /**
   * Update subject
   * @param {string} id - Subject ID
   * @param {object} data - Update data
   */
  updateSubject: async (id, data) => {
    const res = await api.patch(API_CONFIG.ENDPOINTS.SUBJECTS.UPDATE(id), data);
    return res.data;
  },

  /**
   * Delete subject
   * @param {string} id - Subject ID
   */
  deleteSubject: async (id) => {
    await api.delete(API_CONFIG.ENDPOINTS.SUBJECTS.DELETE(id));
  },

  /**
   * Generate Table of Contents for subject (AI-powered)
   * @param {string} id - Subject ID
   */
  generateTableOfContents: async (id) => {
    const res = await api.post(API_CONFIG.ENDPOINTS.SUBJECTS.GENERATE_TOC(id));
    return res.data;
  },

  /**
   * Generate summary for subject (AI-powered)
   * @param {string} id - Subject ID
   */
  generateSummary: async (id) => {
    const res = await api.post(API_CONFIG.ENDPOINTS.SUBJECTS.GENERATE_SUMMARY(id));
    return res.data;
  },
};

export default subjectsService;
