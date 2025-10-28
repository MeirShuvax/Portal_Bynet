import { PublicClientApplication } from '@azure/msal-browser';
import { API_BASE_URL } from '../constants';

// Microsoft MSAL configuration
const msalConfig = {
  auth: {
    clientId: '18d62b55-f089-48a6-a467-789ba2f4d75d',
    authority: 'https://login.microsoftonline.com/b5f3202f-73b3-40a8-a61e-596ab18836ea',
    redirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'localStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    allowNativeBroker: false, // Disable native broker to avoid COOP issues
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 0: // LogLevel.Error
            console.error(message);
            break;
          case 1: // LogLevel.Warning
            console.warn(message);
            break;
          case 2: // LogLevel.Info
            console.info(message);
            break;
          case 3: // LogLevel.Verbose
            console.debug(message);
            break;
          default:
            console.log(message);
            break;
        }
      }
    }
  }
};

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Login request configuration
const loginRequest = {
  scopes: ['User.Read', 'User.ReadBasic.All', 'profile'],
  prompt: 'login'
};

class MicrosoftAuthService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await msalInstance.initialize();
      this.isInitialized = true;
      console.log('✅ MSAL initialized successfully');
      
      // Handle redirect response if we're coming back from a redirect
      const response = await msalInstance.handleRedirectPromise();
      if (response) {
        console.log('✅ Redirect response handled:', response);
        msalInstance.setActiveAccount(response.account);
      }
    } catch (error) {
      console.error('❌ MSAL initialization failed:', error);
      throw error;
    }
  }

  async login() {
    try {
      await this.initialize();
      
      console.log('🔐 Starting Microsoft login...');
      
      // Try popup first, fallback to redirect if popup fails
      try {
        const response = await msalInstance.loginPopup(loginRequest);
        console.log('✅ Microsoft login successful (popup):', response);
        return response;
      } catch (popupError) {
        console.warn('⚠️ Popup login failed, trying redirect:', popupError);
        
        // If popup fails due to COOP issues, use redirect
        if (popupError.message && popupError.message.includes('Cross-Origin-Opener-Policy')) {
          console.log('🔄 Using redirect flow due to COOP policy...');
          await msalInstance.loginRedirect(loginRequest);
          return null; // Redirect will handle the response
        }
        
        throw popupError;
      }
    } catch (error) {
      console.error('❌ Microsoft login failed:', error);
      throw error;
    }
  }

  async getAccessToken() {
    try {
      await this.initialize();
      
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const silentRequest = {
        scopes: ['User.Read', 'User.ReadBasic.All', 'profile'],
        account: accounts[0]
      };

      const response = await msalInstance.acquireTokenSilent(silentRequest);
      console.log('✅ Access token acquired:', response);
      return response.accessToken;
    } catch (error) {
      console.error('❌ Failed to get access token:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.initialize();
      
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await msalInstance.logoutPopup({
          account: accounts[0]
        });
      }
      
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  }

  async isAuthenticated() {
    try {
      await this.initialize();
      
      const accounts = msalInstance.getAllAccounts();
      return accounts.length > 0;
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      return false;
    }
  }

  async getCurrentUser() {
    try {
      await this.initialize();
      
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length === 0) {
        return null;
      }

      return accounts[0];
    } catch (error) {
      console.error('❌ Failed to get current user:', error);
      return null;
    }
  }

  async authenticateWithServer() {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${API_BASE_URL}/api/auth/microsoft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store token and user info
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log('✅ Server authentication successful:', data.user);
      return data;
    } catch (error) {
      console.error('❌ Server authentication failed:', error);
      throw error;
    }
  }

  getStoredToken() {
    return localStorage.getItem('authToken');
  }

  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  clearStoredAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
}

// Create singleton instance
const microsoftAuthService = new MicrosoftAuthService();

export default microsoftAuthService;
