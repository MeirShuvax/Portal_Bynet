import { apiCall } from './apiService';

/**
 * Fetches wishes for a specific honor (user's honor instance).
 * @param {number|string} honorId
 * @returns {Promise<Array<object>>}
 */
export async function getWishesForHonor(honorId) {
  return apiCall(`/wishes/honor/${honorId}`, 'GET');
}

/**
 * Adds a new wish for a specific honor.
 * @param {object} wishData { honor_id, message }
 * @returns {Promise<object>}
 */
export async function addWish(wishData) {
  return apiCall('/wishes', 'POST', wishData);
} 