export const PRIMARY_RED = '#bf2e1a';
export const PRIMARY_BLACK = '#1a202c';
export const WHITE = '#FFFFFF';
export const SECONDARY_DARK = '#2d3748';
export const LIGHT_GRAY = '#e2e8f0';
export const MEDIUM_GRAY = '#cbd5e0';

// Dynamic API base URL
// In development, use localhost. In production, use the environment variable or empty string
const getApiBaseUrl = () => {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                        process.env.REACT_APP_ENV === 'development' ||
                        window.location.hostname === 'localhost' ||
                        window.location.hostname === '127.0.0.1';
  
  // If in development and no explicit URL is set, use localhost
  if (isDevelopment && !process.env.REACT_APP_API_URL) {
    return 'http://localhost:5000';
  }
  
  // Otherwise, use the environment variable or empty string (relative URLs)
  return process.env.REACT_APP_API_URL || '';
};

export const API_BASE_URL = getApiBaseUrl();

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