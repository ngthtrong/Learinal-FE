/**
 * Documents Service
 * Handles all document-related API calls
 */

import axiosInstance from "./axios.config";
import { API_CONFIG } from "../../config/api.config";

export const documentsService = {
  /**
   * Get list of documents
   */
  getDocuments: async (params = {}) => {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.DOCUMENTS.LIST, { params });
    return response.data;
  },

  /**
   * Get documents by subject id
   */
  getDocumentsBySubject: async (subjectId, params = {}) => {
    const response = await axiosInstance.get(`/subjects/${subjectId}/documents`, { params });
    return response.data;
  },

  /**
   * Get document by ID
   */
  getDocumentById: async (id) => {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.DOCUMENTS.GET_BY_ID(id));
    return response.data;
  },

  /**
   * Create new document
   */
  createDocument: async (documentData) => {
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.DOCUMENTS.CREATE, documentData);
    return response.data;
  },

  /**
   * Upload document file
   */
  uploadDocument: async (file, subjectId, onUploadProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subjectId", subjectId);

    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.DOCUMENTS.UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * Get document summary
   * @param {string} id - Document ID
   */
  deleteDocument: async (id) => {
    const response = await axiosInstance.delete(API_CONFIG.ENDPOINTS.DOCUMENTS.DELETE(id));
    return response.data;
  },
};

export default documentsService;
