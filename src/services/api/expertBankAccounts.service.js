import api from "./axios.config";
import { API_CONFIG } from "../../config/api.config";

/**
 * Expert Bank Account Service
 * Manage expert bank accounts for commission withdrawal
 */

/**
 * Get list of supported Vietnamese banks
 */
export const getBanks = async () => {
  const response = await api.get(API_CONFIG.ENDPOINTS.EXPERT_BANK_ACCOUNTS.BANKS);
  return response.data;
};

/**
 * Get expert's own bank account
 */
export const getMyBankAccount = async () => {
  const response = await api.get(API_CONFIG.ENDPOINTS.EXPERT_BANK_ACCOUNTS.GET_MY_ACCOUNT, {
    headers: { "Cache-Control": "no-cache" },
  });
  return response.data;
};

/**
 * Create or update bank account
 */
export const createOrUpdateBankAccount = async (data) => {
  const response = await api.post(API_CONFIG.ENDPOINTS.EXPERT_BANK_ACCOUNTS.CREATE_OR_UPDATE, data);
  return response.data;
};

/**
 * Deactivate own bank account
 */
export const deleteBankAccount = async () => {
  const response = await api.delete(API_CONFIG.ENDPOINTS.EXPERT_BANK_ACCOUNTS.DELETE_MY_ACCOUNT);
  return response.data;
};

/**
 * List all bank accounts (Admin only)
 */
export const listAllBankAccounts = async (params = {}) => {
  const response = await api.get(API_CONFIG.ENDPOINTS.EXPERT_BANK_ACCOUNTS.LIST_ALL, { params });
  return response.data;
};

/**
 * Verify bank account (Admin only)
 */
export const verifyBankAccount = async (id) => {
  const response = await api.patch(API_CONFIG.ENDPOINTS.EXPERT_BANK_ACCOUNTS.VERIFY(id));
  return response.data;
};

/**
 * Unverify bank account (Admin only)
 */
export const unverifyBankAccount = async (id) => {
  const response = await api.patch(API_CONFIG.ENDPOINTS.EXPERT_BANK_ACCOUNTS.UNVERIFY(id));
  return response.data;
};

export default {
  getBanks,
  getMyBankAccount,
  createOrUpdateBankAccount,
  deleteBankAccount,
  listAllBankAccounts,
  verifyBankAccount,
  unverifyBankAccount,
};
