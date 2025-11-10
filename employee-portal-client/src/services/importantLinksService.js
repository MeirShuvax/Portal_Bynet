import { apiCall } from './apiService';

export const getAllLinks = async () => {
  return apiCall('/important-links', 'GET');
};

export const createLink = async (linkData) => {
  return apiCall('/important-links', 'POST', linkData);
};

export const updateLink = async (linkId, linkData) => {
  return apiCall(`/important-links/${linkId}`, 'PUT', linkData);
};

export const deleteLink = async (linkId) => {
  return apiCall(`/important-links/${linkId}`, 'DELETE');
};
