const fs = require('fs');
const path = require('path');

class FilesService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '..', 'uploads');
  }

  /**
   * בדיקה אם קובץ קיים
   * @param {string} filename - שם הקובץ
   * @returns {boolean}
   */
  fileExists(filename) {
    const filePath = path.join(this.uploadsDir, filename);
    return fs.existsSync(filePath);
  }

  /**
   * קבלת נתיב מלא לקובץ
   * @param {string} filename - שם הקובץ
   * @returns {string}
   */
  getFilePath(filename) {
    return path.join(this.uploadsDir, filename);
  }

  /**
   * קבלת רשימת קבצים זמינים
   * @returns {Array<string>}
   */
  getAvailableFiles() {
    try {
      return fs.readdirSync(this.uploadsDir).filter(file => {
        const filePath = path.join(this.uploadsDir, file);
        return fs.statSync(filePath).isFile();
      });
    } catch (error) {
      console.error('Error reading uploads directory:', error);
      return [];
    }
  }

  /**
   * קבלת מידע על קובץ
   * @param {string} filename - שם הקובץ
   * @returns {Object|null}
   */
  getFileInfo(filename) {
    if (!this.fileExists(filename)) {
      return null;
    }

    const filePath = this.getFilePath(filename);
    const stats = fs.statSync(filePath);

    return {
      name: filename,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      extension: path.extname(filename)
    };
  }

  /**
   * בדיקת סוג קובץ מותר
   * @param {string} filename - שם הקובץ
   * @returns {boolean}
   */
  isAllowedFileType(filename) {
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'];
    const extension = path.extname(filename).toLowerCase();
    return allowedExtensions.includes(extension);
  }
}

module.exports = new FilesService();
