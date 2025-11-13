import { apiCall } from './apiService';

/**
 * Fetches all available honor types from the server.
 * @returns {Promise<Array<object>>} A list of honor types.
 */
export async function getHonorTypes() {
  return apiCall('/honors-types', 'GET');
}

/**
 * Fetches active honors by honor type ID (returns users for that type).
 * @param {number|string} typeId
 * @returns {Promise<Array<object>>}
 */
export async function getActiveHonorsByType(typeId) {
  return apiCall(`/honors/by-type/${typeId}/active`, 'GET');
}

/**
 * Fetch honors by type ID.
 * @param {number|string} typeId
 * @param {{ includeExpired?: boolean }} [options]
 * @returns {Promise<Array<object>>}
 */
export async function getHonorsByType(typeId, options = {}) {
  const { includeExpired = false } = options;
  const query = includeExpired ? '?includeExpired=true' : '';
  return apiCall(`/honors/by-type/${typeId}${query}`, 'GET');
}