class ToastService {
  constructor() {
    this.toasts = [];
    this.listeners = [];
  }

  /**
   * הוספת Toast חדש
   * @param {string} message - הודעה
   * @param {string} type - סוג (success, error, warning, info)
   * @param {number} duration - משך זמן (במילישניות)
   */
  show(message, type = 'info', duration = 4000) {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    console.log('🍞 Creating toast:', { id, message, type, duration });
    
    this.toasts.push(toast);
    this.notifyListeners();
    
    console.log('📋 Current toasts:', this.toasts.length);
    
    // הסרה אוטומטית (רק אם duration > 0)
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
    
    return id;
  }

  /**
   * הצגת הודעת הצלחה
   * @param {string} message - הודעה
   * @param {number} duration - משך זמן
   */
  success(message, duration = 4000) {
    return this.show(message, 'success', duration);
  }

  /**
   * הצגת הודעת שגיאה
   * @param {string} message - הודעה
   * @param {number} duration - משך זמן
   */
  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  }

  /**
   * הצגת הודעת אזהרה
   * @param {string} message - הודעה
   * @param {number} duration - משך זמן
   */
  warning(message, duration = 4000) {
    return this.show(message, 'warning', duration);
  }

  /**
   * הצגת הודעת מידע
   * @param {string} message - הודעה
   * @param {number} duration - משך זמן
   */
  info(message, duration = 4000) {
    return this.show(message, 'info', duration);
  }

  /**
   * הצגת הודעת טעינה
   * @param {string} message - הודעה
   * @param {number} duration - משך זמן (0 = אין סגירה אוטומטית)
   */
  loading(message, duration = 0) {
    return this.show(message, 'loading', duration);
  }

  /**
   * הסרת Toast
   * @param {string|number} id - מזהה ה-Toast
   */
  remove(id) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  /**
   * הסרת כל ה-Toasts
   */
  clear() {
    this.toasts = [];
    this.notifyListeners();
  }

  /**
   * קבלת כל ה-Toasts הנוכחיים
   * @returns {Array} - רשימת Toasts
   */
  getToasts() {
    return [...this.toasts];
  }

  /**
   * הוספת מאזין לשינויים
   * @param {function} listener - פונקציית callback
   */
  addListener(listener) {
    this.listeners.push(listener);
  }

  /**
   * הסרת מאזין
   * @param {function} listener - פונקציית callback
   */
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * עדכון כל המאזינים
   */
  notifyListeners() {
    console.log('🔔 Notifying listeners, toasts count:', this.toasts.length);
    this.listeners.forEach(listener => {
      try {
        listener(this.toasts);
      } catch (error) {
        console.error('Error in toast listener:', error);
      }
    });
  }
}

export default new ToastService();
