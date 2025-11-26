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

/**
 * Creates a new update.
 * @param {Object} updateData - The update data (title, date, expiry_date, content)
 * @returns {Promise<any>} The created update.
 */
export async function createUpdate(updateData) {
  return apiCall('/updates', 'POST', updateData);
}

/**
 * Updates an existing update.
 * @param {number} id - The update ID
 * @param {Object} updateData - The update data (title, date, expiry_date, content)
 * @returns {Promise<any>} The updated update.
 */
export async function updateUpdate(id, updateData) {
  return apiCall(`/updates/${id}`, 'PUT', updateData);
}

/**
 * Deletes an update.
 * @param {number} id - The update ID
 * @returns {Promise<any>} Success message.
 */
export async function deleteUpdate(id) {
  return apiCall(`/updates/${id}`, 'DELETE');
}

export default {
  getActiveUpdates,
  getAllUpdates,
  createUpdate,
  updateUpdate,
  deleteUpdate
}; 