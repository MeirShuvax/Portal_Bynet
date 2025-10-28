import { apiCall } from './apiService';

/**
 * Fetches only the active (non-expired) updates from the server.
 * @returns {Promise<any>} A list of active updates.
 */
export async function getActiveUpdates() {
  return apiCall('/updates/active', 'GET');
}


/**
 * Fetches all updates from the server.
 * @returns {Promise<any>} A list of updates.
 */
export async function getAllUpdates() {
  return apiCall('/updates', 'GET');
} 