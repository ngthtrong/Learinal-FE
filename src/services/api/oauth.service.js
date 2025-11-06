/**
 * OAuth Service
 * Handles OAuth authentication (Google)
 */

import axiosInstance from "./axios.config";
import { API_CONFIG } from "../../config/api.config";

/**
 * Generate random string for PKCE
 */
const generateRandomString = (length) => {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }

  return result;
};

/**
 * Generate SHA256 hash for PKCE challenge
 */
const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return hash;
};

/**
 * Base64 URL encode
 */
const base64UrlEncode = (arrayBuffer) => {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

/**
 * Generate PKCE code verifier and challenge
 */
const generatePKCE = async () => {
  const codeVerifier = generateRandomString(128);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(hashed);

  return { codeVerifier, codeChallenge };
};

export const oauthService = {
  /**
   * Get OAuth configuration from backend
   */
  getConfig: async () => {
    const response = await axiosInstance.get("/auth/config");
    return response.data;
  },

  /**
   * Get OAuth state from backend
   */
  getState: async () => {
    const response = await axiosInstance.get("/auth/state");
    return response.data;
  },

  /**
   * Initiate Google OAuth login
   */
  initiateGoogleLogin: async () => {
    try {
      // Clean up any previous OAuth state
      sessionStorage.removeItem("oauth_state");
      sessionStorage.removeItem("oauth_code_verifier");
      sessionStorage.removeItem("oauth_processed_code");

      // Get OAuth config from backend
      const config = await oauthService.getConfig();

      if (!config || !config.clientId || !config.redirectUri || !config.authEndpoint) {
        throw new Error("Invalid OAuth configuration from server");
      }

      // Get OAuth state from backend
      const stateData = await oauthService.getState();

      if (!stateData || !stateData.state) {
        throw new Error("Failed to generate OAuth state");
      }

      // Generate PKCE if required
      let pkceParams = {};
      if (config.pkceRequired) {
        const { codeVerifier, codeChallenge } = await generatePKCE();

        // Store code verifier in sessionStorage
        sessionStorage.setItem("oauth_code_verifier", codeVerifier);

        pkceParams = {
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
        };
      }

      // Store state in sessionStorage
      sessionStorage.setItem("oauth_state", stateData.state);

      // Build OAuth URL
      const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: "code",
        scope: config.scope || "openid email profile",
        state: stateData.state,
        access_type: "offline", // Request refresh token
        prompt: "select_account", // Always show account selection
        ...pkceParams,
      });

      const authUrl = `${config.authEndpoint}?${params.toString()}`;

      // Redirect to Google OAuth
      window.location.href = authUrl;

      return { success: true };
    } catch (error) {
      console.error("Failed to initiate Google login:", error);

      // Clean up on error
      sessionStorage.removeItem("oauth_state");
      sessionStorage.removeItem("oauth_code_verifier");

      return {
        success: false,
        error:
          error.response?.data?.message || error.message || "Không thể khởi tạo đăng nhập Google",
      };
    }
  },

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  handleCallback: async (code, state) => {
    try {
      // Validate inputs
      if (!code) {
        throw new Error("Authorization code is required");
      }

      if (!state) {
        throw new Error("State parameter is required");
      }

      // Verify state matches
      const savedState = sessionStorage.getItem("oauth_state");

      if (!savedState) {
        throw new Error("No saved OAuth state found. Please try logging in again.");
      }

      if (state !== savedState) {
        throw new Error("State mismatch - possible CSRF attack detected");
      }

      // Get code verifier if PKCE was used
      const codeVerifier = sessionStorage.getItem("oauth_code_verifier");

      // Build request payload
      const payload = {
        code,
        state,
      };

      // Only include codeVerifier if it exists
      if (codeVerifier) {
        payload.codeVerifier = codeVerifier;
      }

      // Exchange code for tokens
      const response = await axiosInstance.post("/auth/exchange", payload);

      // Validate response
      if (!response.data) {
        throw new Error("Empty response from server");
      }

      if (!response.data.accessToken) {
        throw new Error("No access token received from server");
      }

      if (!response.data.user) {
        throw new Error("No user data received from server");
      }

      // Clean up
      sessionStorage.removeItem("oauth_state");
      sessionStorage.removeItem("oauth_code_verifier");

      return response.data;
    } catch (error) {
      console.error("OAuth callback failed:", error);

      // Clean up on error
      sessionStorage.removeItem("oauth_state");
      sessionStorage.removeItem("oauth_code_verifier");

      // Re-throw with better error message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 400) {
        throw new Error("Mã xác thực không hợp lệ hoặc đã hết hạn");
      } else if (error.response?.status === 401) {
        throw new Error("Xác thực thất bại");
      } else {
        throw error;
      }
    }
  },
};

export default oauthService;
