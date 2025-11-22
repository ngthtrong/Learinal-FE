/**
 * Validation Requests Service
 * Endpoints cho Learner/Expert/Admin tùy role từ backend.
 */
import axiosInstance from "./axios.config";
import { API_CONFIG } from "@/config/api.config";

const { VALIDATION_REQUESTS } = API_CONFIG.ENDPOINTS;

export const validationRequestsService = {
  list: async (params = {}) => {
    const { page = 1, pageSize = 20, status } = params;
    const response = await axiosInstance.get(VALIDATION_REQUESTS.LIST, {
      params: { page, pageSize, status: status || undefined },
    });
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(VALIDATION_REQUESTS.GET_BY_ID(id));
    return response.data;
  },
   getValidationRequestDetail: async (id) => {
     const response = await axiosInstance.get(VALIDATION_REQUESTS.GET_DETAIL(id));
     return response.data;
   },
  update: async (id, payload) => {
    const response = await axiosInstance.patch(VALIDATION_REQUESTS.UPDATE(id), payload);
    return response.data;
  },
  complete: async (id, payload) => {
    const response = await axiosInstance.patch(VALIDATION_REQUESTS.COMPLETE(id), payload);
    return response.data;
  },
  claim: async (id) => {
    const response = await axiosInstance.patch(VALIDATION_REQUESTS.CLAIM(id));
    return response.data;
  },
};

export default validationRequestsService;