import { API_BASE_URL } from '../constants';
import toastService from './toastService';

const BASE_URL = API_BASE_URL;

class FilesService {
  /**
   * קבלת URL לקובץ
   * @param {string} filename - שם הקובץ
   * @returns {string}
   */
  getFileUrl(filename) {
    return `${API_BASE_URL}/api/files/${filename}`;
  }

  /**
   * פתיחת קובץ בחלון חדש
   * @param {string} filename - שם הקובץ
   */
  async openFile(filename) {
    let loadingToastId = null;
    try {
      // הצגת הודעת טעינה
      console.log('🔍 Starting file search for:', filename);
      loadingToastId = toastService.loading('מחפש קובץ...');
      console.log('📱 Loading toast ID:', loadingToastId);
      
      const token = localStorage.getItem('authToken');
      const fileUrl = this.getFileUrl(filename);
      
      // עיכוב מינימלי כדי שהמשתמש יראה את הלודינג
      const [response] = await Promise.all([
        fetch(fileUrl, {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        new Promise(resolve => setTimeout(resolve, 800)) // עיכוב של 800ms
      ]);

      // עדכון הודעת הלודינג
      if (loadingToastId) {
        console.log('🔄 Updating loading message to: בודק הרשאות...');
        toastService.remove(loadingToastId);
        loadingToastId = toastService.loading('בודק הרשאות...');
      }

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('הקובץ לא נמצא');
        } else if (response.status === 401) {
          throw new Error('אין הרשאה לגשת לקובץ');
        } else {
          throw new Error('שגיאה בטעינת הקובץ');
        }
      }
      
      // הסרת הודעת הטעינה
      if (loadingToastId) {
        toastService.remove(loadingToastId);
      }
      
      // פתיחת הקובץ בחלון חדש עם הטוקן ב-header
      // נצטרך לפתוח את הקובץ בצורה שונה כי window.open לא יכול לשלוח headers
      const fileResponse = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!fileResponse.ok) {
        throw new Error('שגיאה בטעינת הקובץ');
      }
      
      // יצירת blob URL מהתגובה
      const blob = await fileResponse.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // פתיחת הקובץ בחלון חדש
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      
      // ניקוי ה-blob URL אחרי זמן מה
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (error) {
      // הסרת הודעת הטעינה
      if (loadingToastId) {
        toastService.remove(loadingToastId);
      }
      
      // הצגת הודעת שגיאה
      toastService.error(error.message || 'שגיאה בפתיחת הקובץ');
      
      console.error('Error opening file:', error);
      throw error;
    }
  }

  /**
   * פתיחת תמונה ב-ImageViewer
   * @param {string} filename - שם הקובץ
   * @param {function} onImageOpen - callback להצגת התמונה
   */
  async openImage(filename, onImageOpen) {
    let loadingToastId = null;
    try {
      // הצגת הודעת טעינה
      loadingToastId = toastService.loading('מחפש תמונה...');
      
      const token = localStorage.getItem('authToken');
      const fileUrl = this.getFileUrl(filename);
      
      // עיכוב מינימלי כדי שהמשתמש יראה את הלודינג
      const [urlWithAuth] = await Promise.all([
        this.createAuthenticatedUrl(fileUrl, token),
        new Promise(resolve => setTimeout(resolve, 800)) // עיכוב של 800ms
      ]);
      
      // עדכון הודעת הלודינג
      if (loadingToastId) {
        toastService.remove(loadingToastId);
        loadingToastId = toastService.loading('טוען תמונה...');
      }
      
      // עיכוב נוסף להצגת הודעת הטעינה
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // הסרת הודעת הטעינה
      if (loadingToastId) {
        toastService.remove(loadingToastId);
      }
      
      // קריאה לפונקציה להצגת התמונה
      onImageOpen(urlWithAuth, filename);
    } catch (error) {
      // הסרת הודעת הטעינה
      if (loadingToastId) {
        toastService.remove(loadingToastId);
      }
      
      // הצגת הודעת שגיאה
      toastService.error(error.message || 'שגיאה בפתיחת התמונה');
      
      console.error('Error opening image:', error);
      throw error;
    }
  }

  /**
   * יצירת URL מאומת עם הטוקן ב-header
   * @param {string} url - ה-URL המקורי
   * @param {string} token - הטוקן
   * @returns {Promise<string>} - URL עם הטוקן
   */
  async createAuthenticatedUrl(url, token) {
    try {
      // יצירת blob עם הטוקן ב-header
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating authenticated URL:', error);
      throw error;
    }
  }

  /**
   * הורדת קובץ
   * @param {string} filename - שם הקובץ
   */
  async downloadFile(filename) {
    try {
      const fileUrl = this.getFileUrl(filename);
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  /**
   * קבלת רשימת קבצים זמינים
   * @returns {Promise<Array>}
   */
  async getAvailableFiles() {
    try {
      const response = await fetch(`${BASE_URL}/api/files`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error getting files list:', error);
      throw error;
    }
  }

  /**
   * קבלת מידע על קובץ
   * @param {string} filename - שם הקובץ
   * @returns {Promise<Object>}
   */
  async getFileInfo(filename) {
    try {
      const response = await fetch(`${BASE_URL}/api/files/info/${filename}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error getting file info:', error);
      throw error;
    }
  }
}

export default new FilesService();
