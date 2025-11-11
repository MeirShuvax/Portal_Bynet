import { apiCall } from './apiService';

export const fetchCompanyPosts = async () => {
  const response = await apiCall('/linkedin/posts');
  return response?.items || [];
};

