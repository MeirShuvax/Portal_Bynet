import { API_BASE_URL } from '../constants';

const API_BASE_URL_WITH_API = `${API_BASE_URL}/api`;

/**
 * A centralized API call function.
 * @param {string} endpoint The API endpoint to call (e.g., '/ai/message').
 * @param {string} [method='GET'] The HTTP method.
 * @param {object} [body=null] The request body for POST/PUT requests.
 * @returns {Promise<any>} The JSON response from the server.
 */
export async function apiCall(endpoint, method = 'GET', body = null) {
  // Get the stored token
  const token = localStorage.getItem('authToken');
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add Authorization header if token exists
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  const fullUrl = `${API_BASE_URL_WITH_API}${endpoint}`;
  console.log('🌐 API call to:', fullUrl);

  try {
    const response = await fetch(fullUrl, config);
    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      // Try to parse error response, otherwise throw generic error
      const errorData = await response.json().catch(() => ({ message: 'An unknown server error occurred' }));
      console.error('❌ API error:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API response data:', data);
    return data;
  } catch (error) {
    console.error('❌ API call failed:', error);
    // Re-throw the error so the calling component can handle it
    throw error;
  }
}

export const getActiveUpdates = () => apiCall('/updates/active');
export const getAllUpdates = () => apiCall('/updates');

export const getMe = () => apiCall('/users/me'); 