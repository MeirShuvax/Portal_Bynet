export const PRIMARY_RED = '#bf2e1a';
export const PRIMARY_BLACK = '#1a202c';
export const WHITE = '#FFFFFF';
export const SECONDARY_DARK = '#2d3748';
export const LIGHT_GRAY = '#e2e8f0';
export const MEDIUM_GRAY = '#cbd5e0';

// Dynamic API base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to build image URL using server API
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Always use the server's /uploads endpoint
  // Remove any existing /uploads/ prefix to avoid duplication
  let cleanPath = imagePath;
  if (cleanPath.startsWith('/uploads/')) {
    cleanPath = cleanPath.replace('/uploads/', '');
  } else if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1); // Remove leading /
  }
  
  return `${API_BASE_URL}/uploads/${cleanPath}`;
}; 