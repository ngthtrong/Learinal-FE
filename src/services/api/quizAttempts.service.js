/**
 * Quiz Attempts Service
 * Handles all quiz attempt-related API calls
 */

import axiosInstance from "./axios.config";
import { API_CONFIG } from "../../config/api.config";

export const quizAttemptsService = {
  /**
   * Get list of quiz attempts (history)
   * @param {object} params - Query parameters
   */
  getAttempts: async (params = {}) => {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.QUIZ_ATTEMPTS.LIST, { params });
    return response.data;
  },

  /**
   * Get quiz attempts by question set ID
   * @param {string} questionSetId - Question set ID
   * @param {object} params - Query parameters
   */
  getAttemptsByQuestionSet: async (questionSetId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/question-sets/${questionSetId}/quiz-attempts`, {
        params,
      });
      console.log(`GET /question-sets/${questionSetId}/quiz-attempts response:`, response.data);

      // Backend may return { items: [...] } or { data: [...] }
      if (response.data.items) {
        return {
          data: response.data.items,
          meta: {
            page: 1,
            pageSize: response.data.items.length,
            total: response.data.items.length,
            totalPages: 1,
          },
        };
      }

      return response.data;
    } catch (error) {
      console.error(`Failed to get quiz attempts for question set ${questionSetId}:`, error);
      if (error.response?.status === 404) {
        return { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
      }
      throw error;
    }
  },

  /**
   * Get quiz attempt history
   * @param {object} params - Query parameters { setId?, page?, limit? }
   */
  getHistory: async (params = {}) => {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.QUIZ_ATTEMPTS.HISTORY, {
      params,
    });
    return response.data;
  },

  /**
   * Get attempt by ID
   * @param {string} id - Attempt ID
   */
  getAttemptById: async (id) => {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.QUIZ_ATTEMPTS.GET_BY_ID(id));
    return response.data;
  },

  /**
   * Start a new quiz attempt
   * @param {object} data - { setId, startTime }
   */
  createAttempt: async (data) => {
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.QUIZ_ATTEMPTS.CREATE, data);
    return response.data;
  },

  /**
   * Save answer (auto-save during quiz)
   * @param {string} attemptId - Attempt ID
   * @param {object} data - { questionId, selectedAnswerIndex }
   */
  saveAnswer: async (attemptId, data) => {
    const response = await axiosInstance.patch(
      `${API_CONFIG.ENDPOINTS.QUIZ_ATTEMPTS.GET_BY_ID(attemptId)}/answer`,
      data
    );
    return response.data;
  },

  /**
   * Submit quiz attempt
   * @param {string} attemptId - Attempt ID
   * @param {object} data - { endTime, userAnswers: [{ questionId, selectedAnswerIndex }] }
   */
  submitAttempt: async (attemptId, data) => {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.QUIZ_ATTEMPTS.SUBMIT(attemptId),
      data
    );
    return response.data;
  },
};

export default quizAttemptsService;
