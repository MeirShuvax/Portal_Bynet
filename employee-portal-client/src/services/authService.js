import microsoftAuthService from './microsoftAuthService';
import { API_BASE_URL } from '../constants';
import { apiCall } from './apiService';

class AuthService {
  constructor() {
    this.tokenKey = 'authToken';
    this.userKey = 'userData';
  }

  /**
   * Check if user is already authenticated
   * @returns {Promise<boolean>} True if authenticated
   */
  async isAuthenticated() {
    try {
      // First check if Microsoft account is connected
      const isMicrosoftConnected = await microsoftAuthService.isAuthenticated();
      if (!isMicrosoftConnected) {
        console.log('Microsoft account not connected; will attempt to continue with stored credentials if available.');
      }

      const token = this.getStoredToken();
      if (!token) {
        // Microsoft is connected but no local token - try to get token silently
        console.log('No local token found, attempting silent authentication...');
        if (!isMicrosoftConnected) {
          console.log('Unable to attempt silent authentication because Microsoft session is missing.');
          return false;
        }
        try {
          const accessToken = await microsoftAuthService.getAccessToken();
          if (accessToken) {
            // Try to authenticate with server using Microsoft token
            const response = await fetch(`${API_BASE_URL}/api/auth/microsoft`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ accessToken })
            });

            if (response.ok) {
              const data = await response.json();
              this.storeToken(data.token);
              this.storeUser(data.user);
              console.log('✅ Silent authentication successful!');
              return true;
            }
          }
        } catch (silentError) {
          console.log('⚠️ Silent authentication failed:', silentError.message);
        }
        // If silent auth failed, need to login
        return false;
      }

      // Verify token with server
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        const data = await response.json();
        this.storeUser(data.user);
        // Try to refresh token if it's expiring soon
        await this.refreshToken();
        return true;
      } else {
        // Token expired or invalid, but Microsoft is connected - try to refresh using Microsoft token
        console.log('Token expired, attempting to refresh using Microsoft token...');
        try {
          const accessToken = await microsoftAuthService.getAccessToken();
          if (accessToken) {
            const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/microsoft`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ accessToken })
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              this.storeToken(refreshData.token);
              this.storeUser(refreshData.user);
              console.log('✅ Token refreshed successfully!');
              return true;
            }
          }
        } catch (refreshError) {
          console.log('⚠️ Token refresh failed:', refreshError.message);
        }
        // If refresh failed, clear auth
        this.clearStoredAuth();
        return false;
      }
    } catch (error) {
      // Network error or server not ready - don't clear auth, just return false
      // This way user won't be logged out when server is restarting
      console.error('Authentication check failed (server might be restarting):', error);
      // Don't clear auth on network errors - let user keep their session
      return false;
    }
  }

  /**
   * Login with Microsoft
   * @returns {Promise<Object>} User data
   */
  async login() {
    try {
      console.log('🔐 Starting login process...');
      
      // Step 1: Login with Microsoft
      console.log('📱 Step 1: Login with Microsoft...');
      const loginResponse = await microsoftAuthService.login();
      
      // If login used redirect, we might not have a response yet
      if (!loginResponse) {
        console.log('🔄 Login used redirect, waiting for redirect response...');
        // The redirect will reload the page, so we'll handle it on page load
        return null;
      }
      
      // Step 2: Get access token from Microsoft
      console.log('🔑 Step 2: Getting access token from Microsoft...');
      const accessToken = await microsoftAuthService.getAccessToken();
      console.log('✅ Access token received, length:', accessToken.length);
      
      // Step 3: Authenticate with our server
      console.log('🌐 Step 3: Authenticating with server...');
      const response = await fetch(`${API_BASE_URL}/api/auth/microsoft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken })
      });

      console.log('📊 Server response status:', response.status);
      const data = await response.json();
      console.log('📄 Server response data:', data);

      if (!response.ok) {
        console.error('❌ Server authentication failed:', data);
        throw new Error(data.error || 'Authentication failed');
      }

      // Store token and user data
      console.log('💾 Storing token and user data...');
      this.storeToken(data.token);
      this.storeUser(data.user);

      // Initialize AI session after successful login
      try {
        console.log('🚀 Initializing AI session after login...');
        await this.initializeAISession();
        console.log('✅ AI session initialized successfully');
      } catch (error) {
        console.error('⚠️ Failed to initialize AI session:', error);
        // Don't fail the login if AI init fails
      }

      console.log('✅ Login successful!');
      return data.user;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      // Logout from Microsoft
      await microsoftAuthService.logout();
    } catch (error) {
      console.error('Microsoft logout failed:', error);
    } finally {
      // Clear local storage
      this.clearStoredAuth();
    }
  }

  /**
   * Get current user data
   * @returns {Object|null} User data or null
   */
  getCurrentUser() {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Get stored token
   * @returns {string|null} Token or null
   */
  getStoredToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Store token
   * @param {string} token - JWT token
   */
  storeToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Store user data
   * @param {Object} user - User data
   */
  storeUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Clear stored authentication data
   */
  clearStoredAuth() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * Refresh token if needed
   * @returns {Promise<boolean>} True if token was refreshed
   */
  async refreshToken() {
    try {
      const token = this.getStoredToken();
      if (!token) return false;

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.refreshed) {
          this.storeToken(data.token);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }


  /**
   * Make authenticated API call
   * @param {string} url - API URL
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} Fetch response
   */
  async authenticatedFetch(url, options = {}) {
    const token = this.getStoredToken();
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    // If token expired, try to refresh
    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry with new token
        const newToken = this.getStoredToken();
        const retryOptions = {
          ...defaultOptions,
          headers: {
            ...defaultOptions.headers,
            'Authorization': `Bearer ${newToken}`
          }
        };
        return fetch(url, { ...retryOptions, ...options });
      }
    }

    return response;
  }

  /**
   * Initialize AI session for the authenticated user
   */
  async initializeAISession() {
    try {
      await apiCall('/ai/init', 'POST');
      console.log('✅ AI session initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AI session:', error);
      throw error;
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
