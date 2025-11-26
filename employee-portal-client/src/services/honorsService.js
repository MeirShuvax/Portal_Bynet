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

/**
 * Fetches all honors from the server.
 * @returns {Promise<Array<object>>} A list of all honors.
 */
export async function getAllHonors() {
  return apiCall('/honors', 'GET');
}

/**
 * Fetches active honors only.
 * @returns {Promise<Array<object>>} A list of active honors.
 */
export async function getActiveHonors() {
  return apiCall('/honors/active', 'GET');
}

/**
 * Creates a new honor.
 * @param {Object} honorData - The honor data (user_id, honors_type_id, display_until, description)
 * @returns {Promise<any>} The created honor.
 */
export async function createHonor(honorData) {
  return apiCall('/honors', 'POST', honorData);
}

/**
 * Updates an existing honor.
 * @param {number} id - The honor ID
 * @param {Object} honorData - The honor data
 * @returns {Promise<any>} The updated honor.
 */
export async function updateHonor(id, honorData) {
  return apiCall(`/honors/${id}`, 'PUT', honorData);
}

/**
 * Deletes a honor.
 * @param {number} id - The honor ID
 * @returns {Promise<any>} Success message.
 */
export async function deleteHonor(id) {
  return apiCall(`/honors/${id}`, 'DELETE');
}

export default {
  getHonorTypes,
  getActiveHonorsByType,
  getHonorsByType,
  getAllHonors,
  getActiveHonors,
  createHonor,
  updateHonor,
  deleteHonor
};