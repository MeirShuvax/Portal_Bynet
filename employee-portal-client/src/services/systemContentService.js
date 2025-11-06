import { apiCall } from './apiService';
import { API_BASE_URL } from '../constants';

export const fetchImages = async () => {
  return apiCall('/system-contents/images');
};

export const uploadImage = async (file, title, description) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title || '');
  formData.append('description', description || '');
  formData.append('type', 'image');

  const token = localStorage.getItem('authToken');
  
  const response = await fetch(`${API_BASE_URL}/api/system-contents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload image');
  }

  return response.json();
};

export const deleteImage = async (id) => {
  return apiCall(`/system-contents/${id}`, 'DELETE');
};
