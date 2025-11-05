/**
 * Documents Service
 * Handles all document-related API calls
 */

import axiosInstance from "./axios.config";
import { API_CONFIG } from "../../config/api.config";

export const documentsService = {
  /**
   * Get document by ID
   */
  getDocumentById: async (id) => {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.DOCUMENTS.GET_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Upload document file with subjectId
   * @param {File} file - The file to upload
   * @param {string} subjectId - The subject ID to associate with the document
   * @param {function} onUploadProgress - Progress callback
   */
  uploadDocument: async (file, subjectId, onUploadProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subjectId", subjectId);

    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.DOCUMENTS.CREATE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      }
    );
    return response.data;
  },

  /**
   * Get document summary
   * @param {string} id - Document ID
   */
  getDocumentSummary: async (id) => {
    const response = await axiosInstance.get(
      `${API_CONFIG.ENDPOINTS.DOCUMENTS.GET_BY_ID(id)}/summary`
    );
    return response.data;
  },
};

export default documentsService;
