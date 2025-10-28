import { apiCall } from './apiService';

export const fetchImages = async () => {
  return apiCall('/system-contents/images');
}; 