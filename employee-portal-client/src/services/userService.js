import { apiCall } from './apiService';
import { API_BASE_URL } from '../constants';

export const fetchUsers = async () => {
  console.log('🔍 fetchUsers called');
  try {
    const result = await apiCall('/users/team');
    console.log('✅ fetchUsers result:', result);
    return result;
  } catch (error) {
    console.error('❌ fetchUsers error:', error);
    throw error;
  }
};

// יצירת משתמש חדש עם תמונה
export const createUserWithImage = async (userData, imageFile) => {
  console.log('🔍 createUserWithImage called');
  try {
    const formData = new FormData();
    
    // הוסף את פרטי המשתמש
    Object.keys(userData).forEach(key => {
      formData.append(key, userData[key]);
    });
    
    // הוסף את התמונה
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    const result = await fetch(`${API_BASE_URL}/api/users/with-image`, {
      method: 'POST',
      body: formData,
      // אל תשים Content-Type - הוא יקבע אוטומטית עם FormData
    });
    
    if (!result.ok) {
      const errorData = await result.json().catch(() => ({ message: 'An unknown server error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${result.status}`);
    }
    
    const data = await result.json();
    console.log('✅ createUserWithImage result:', data);
    return data;
  } catch (error) {
    console.error('❌ createUserWithImage error:', error);
    throw error;
  }
};

// עדכון תמונת פרופיל למשתמש קיים
export const updateUserProfileImage = async (userId, imageFile) => {
  console.log('🔍 updateUserProfileImage called for user:', userId);
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const result = await fetch(`${API_BASE_URL}/api/users/${userId}/profile-image`, {
      method: 'PUT',
      body: formData,
    });
    
    if (!result.ok) {
      const errorData = await result.json().catch(() => ({ message: 'An unknown server error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${result.status}`);
    }
    
    const data = await result.json();
    console.log('✅ updateUserProfileImage result:', data);
    return data;
  } catch (error) {
    console.error('❌ updateUserProfileImage error:', error);
    throw error;
  }
};

// מחיקת תמונת פרופיל
export const deleteUserProfileImage = async (userId) => {
  console.log('🔍 deleteUserProfileImage called for user:', userId);
  try {
    const result = await fetch(`${API_BASE_URL}/api/users/${userId}/profile-image`, {
      method: 'DELETE',
    });
    
    if (!result.ok) {
      const errorData = await result.json().catch(() => ({ message: 'An unknown server error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${result.status}`);
    }
    
    const data = await result.json();
    console.log('✅ deleteUserProfileImage result:', data);
    return data;
  } catch (error) {
    console.error('❌ deleteUserProfileImage error:', error);
    throw error;
  }
};

// קבלת מבנה ארגוני
export const fetchOrganizationalStructure = async () => {
  console.log('🔍 fetchOrganizationalStructure called');
  try {
    const result = await apiCall('/users/organizational-structure');
    console.log('✅ fetchOrganizationalStructure result:', result);
    return result;
  } catch (error) {
    console.error('❌ fetchOrganizationalStructure error:', error);
    throw error;
  }
};

// עדכון פרטי עובד במבנה הארגוני
export const updateEmployeeOrganizationalDetails = async (userId, employeeData) => {
  console.log('🔍 updateEmployeeOrganizationalDetails called for user:', userId);
  try {
    const result = await apiCall(`/users/${userId}/organizational-details`, 'PUT', employeeData);
    console.log('✅ updateEmployeeOrganizationalDetails result:', result);
    return result;
  } catch (error) {
    console.error('❌ updateEmployeeOrganizationalDetails error:', error);
    throw error;
  }
};

// קבלת רשימת מנהלים לבחירה
export const fetchManagers = async () => {
  console.log('🔍 fetchManagers called');
  try {
    const result = await apiCall('/users/managers');
    console.log('✅ fetchManagers result:', result);
    return result;
  } catch (error) {
    console.error('❌ fetchManagers error:', error);
    throw error;
  }
}; 