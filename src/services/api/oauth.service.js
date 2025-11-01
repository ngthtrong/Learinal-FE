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
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
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
      // Get OAuth config from backend
      const config = await oauthService.getConfig();

      // Get OAuth state from backend
      const stateData = await oauthService.getState();

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
        scope: config.scope,
        state: stateData.state,
        ...pkceParams,
      });

      const authUrl = `${config.authEndpoint}?${params.toString()}`;

      // Redirect to Google OAuth
      window.location.href = authUrl;

      return { success: true };
    } catch (error) {
      console.error("Failed to initiate Google login:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  handleCallback: async (code, state) => {
    try {
      // Verify state matches
      const savedState = sessionStorage.getItem("oauth_state");

      if (state !== savedState) {
        throw new Error("State mismatch - possible CSRF attack");
      }

      // Get code verifier if PKCE was used
      const codeVerifier = sessionStorage.getItem("oauth_code_verifier");

      // Exchange code for tokens
      const response = await axiosInstance.post("/auth/exchange", {
        code,
        state, // Send state so backend can verify against cookie
        codeVerifier,
      });

      // Clean up
      sessionStorage.removeItem("oauth_state");
      sessionStorage.removeItem("oauth_code_verifier");

      return response.data;
    } catch (error) {
      console.error("OAuth callback failed:", error);
      throw error;
    }
  },
};

export default oauthService;
