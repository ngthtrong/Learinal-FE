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
   * According to API spec: GET /subjects/{subjectId}/documents
   *
   * Query params: page, pageSize, status
   *
   * Backend returns: { items: Document[] }
   * We normalize to: { data: Document[], meta: {...} }
   *
   * @param {string} subjectId - Subject ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} { data: Document[], meta: PaginationMeta }
   */
  getDocumentsBySubject: async (subjectId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/subjects/${subjectId}/documents`, { params });
      console.log(`GET /subjects/${subjectId}/documents response:`, response.data);

      // Backend returns { items: [...] }, normalize to { data: [...] }
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
      console.error(`Failed to get documents for subject ${subjectId}:`, error);
      // If 404 or no documents, return empty structure
      if (error.response?.status === 404) {
        return { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
      }
      throw error;
    }
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
   * This endpoint is NOT used for file upload
   */
  createDocument: async (documentData) => {
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.DOCUMENTS.CREATE, documentData);
    return response.data;
  },

  /**
   * Upload document file
   * According to API spec: POST /documents with multipart/form-data
   * This creates a new document with file upload in one request
   *
   * File limits:
   * - Max size: 20MB
   * - Formats: .pdf, .docx, .txt
   *
   * Process:
   * 1. File uploaded to storage
   * 2. Text extraction (async)
   * 3. AI summary generation (async)
   * 4. Status updates: Uploading → Processing → Completed/Error
   *
   * @param {File} file - Document file
   * @param {string} subjectId - Subject ID
   * @param {Function} onUploadProgress - Progress callback
   * @returns {Promise<Document>} Created document with status "Uploading"
   */
  uploadDocument: async (file, subjectId, onUploadProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subjectId", subjectId);

    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.DOCUMENTS.CREATE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
    return response.data;
  },

  /**
   * Upload multiple document files
   * Uploads files sequentially and reports progress for each
   *
   * @param {File[]} files - Array of document files
   * @param {string} subjectId - Subject ID
   * @param {Function} onFileProgress - Progress callback (fileIndex, progress, fileName)
   * @param {Function} onFileComplete - Callback when a file completes (fileIndex, result, fileName)
   * @param {Function} onFileError - Callback when a file fails (fileIndex, error, fileName)
   * @returns {Promise<Object>} { successful: Document[], failed: {file, error}[] }
   */
  uploadMultipleDocuments: async (files, subjectId, onFileProgress, onFileComplete, onFileError) => {
    const results = {
      successful: [],
      failed: [],
    };

    // Upload all files at once (batch upload)
    try {
      const formData = new FormData();
      
      // DEBUG: Log files being uploaded
      console.log("[uploadMultipleDocuments] Starting batch upload:", {
        filesCount: files.length,
        fileNames: files.map(f => f.name),
        subjectId
      });
      
      // Append all files with the same key "files"
      files.forEach((file, index) => {
        console.log(`[uploadMultipleDocuments] Appending file ${index + 1}:`, file.name, file.size);
        formData.append("files", file);
      });
      formData.append("subjectId", subjectId);
      
      // DEBUG: Log FormData contents
      console.log("[uploadMultipleDocuments] FormData entries:");
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size})` : value);
      }

      const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.DOCUMENTS.CREATE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Report overall progress
          if (onFileProgress) {
            files.forEach((file, i) => {
              onFileProgress(i, progress, file.name);
            });
          }
        },
      });

      // Process response - backend now returns { documents: [], successCount, failureCount, errors }
      if (response.data.documents) {
        response.data.documents.forEach((doc, i) => {
          results.successful.push(doc);
          if (onFileComplete) {
            onFileComplete(i, doc, files[i].name);
          }
        });
      }

      // Handle errors if any
      if (response.data.errors && response.data.errors.length > 0) {
        response.data.errors.forEach((error) => {
          const fileIndex = files.findIndex(f => f.name === error.fileName);
          results.failed.push({ file: files[fileIndex], error: error.error });
          if (onFileError) {
            onFileError(fileIndex, new Error(error.error), error.fileName);
          }
        });
      }
    } catch (error) {
      // If the entire batch upload fails, mark all files as failed
      files.forEach((file, i) => {
        results.failed.push({ file: file, error: error.response?.data?.message || error.message });
        if (onFileError) {
          onFileError(i, error, file.name);
        }
      });
    }

    return results;
  },

  /**
   * Delete document
   * @param {string} id - Document ID
   */
  deleteDocument: async (id) => {
    const response = await axiosInstance.delete(API_CONFIG.ENDPOINTS.DOCUMENTS.DELETE(id));
    return response.data;
  },

  /**
   * Get document summary
   * According to API spec: GET /documents/{id}/summary
   *
   * Returns:
   * - summaryShort: Short summary (3-5 sentences)
   * - summaryFull: Full summary
   * - summaryUpdatedAt: When summary was last updated
   * - tableOfContents: Array of TOC items
   *
   * @param {string} id - Document ID
   * @returns {Promise<Object>} Document summary
   */
  getDocumentSummary: async (id) => {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.DOCUMENTS.GET_SUMMARY(id));
    return response.data;
  },

  /**
   * Check document upload limit for a subject
   * Combines subscription limits with current document count
   * 
   * @param {string} subjectId - Subject ID to check
   * @returns {Promise<Object>} { currentCount, maxAllowed, remaining, canUpload, isUnlimited }
   */
  checkDocumentLimit: async (subjectId) => {
    try {
      // Get usage info from subscription
      const usageResponse = await axiosInstance.get("/user-subscriptions/me/usage");
      const usage = usageResponse.data?.data || usageResponse.data || {};
      
      // Get current document count for this subject
      const docsResponse = await axiosInstance.get(`/subjects/${subjectId}/documents`);
      const docs = docsResponse.data?.items || docsResponse.data?.data || [];
      const currentCount = Array.isArray(docs) ? docs.length : 0;
      
      // Get max documents per subject from usage data
      const maxAllowed = usage.maxDocumentsPerSubject;
      
      // Check if unlimited
      const isUnlimited = maxAllowed === "unlimited" || maxAllowed === -1 || !maxAllowed;
      
      return {
        currentCount,
        maxAllowed: isUnlimited ? "unlimited" : maxAllowed,
        remaining: isUnlimited ? Infinity : Math.max(0, maxAllowed - currentCount),
        canUpload: isUnlimited || currentCount < maxAllowed,
        isUnlimited,
      };
    } catch (error) {
      console.error("Failed to check document limit:", error);
      // Default to allowing upload if we can't check
      return {
        currentCount: 0,
        maxAllowed: "unlimited",
        remaining: Infinity,
        canUpload: true,
        isUnlimited: true,
      };
    }
  },
};

export default documentsService;
