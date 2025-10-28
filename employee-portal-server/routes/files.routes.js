const express = require('express');
const router = express.Router();
const filesService = require('../services/filesService');

/**
 * GET /api/files/:filename
 * הורדת קובץ ספציפי
 */
router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    // בדיקת פרמטרים
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'שם קובץ נדרש'
      });
    }

    // בדיקה שהקובץ קיים
    if (!filesService.fileExists(filename)) {
      return res.status(404).json({
        success: false,
        message: 'הקובץ לא נמצא'
      });
    }

    // בדיקת סוג קובץ מותר
    if (!filesService.isAllowedFileType(filename)) {
      return res.status(403).json({
        success: false,
        message: 'סוג קובץ לא מותר'
      });
    }

    // קבלת נתיב הקובץ
    const filePath = filesService.getFilePath(filename);

    // שליחת הקובץ
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'שגיאה בשליחת הקובץ'
          });
        }
      }
    });

  } catch (error) {
    console.error('Error in files route:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה פנימית בשרת'
    });
  }
});

/**
 * GET /api/files
 * קבלת רשימת קבצים זמינים
 */
router.get('/', async (req, res) => {
  try {
    const files = filesService.getAvailableFiles();
    
    const filesInfo = files.map(filename => filesService.getFileInfo(filename));

    res.json({
      success: true,
      data: filesInfo,
      count: filesInfo.length
    });

  } catch (error) {
    console.error('Error getting files list:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת רשימת הקבצים'
    });
  }
});

/**
 * GET /api/files/info/:filename
 * קבלת מידע על קובץ ספציפי
 */
router.get('/info/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'שם קובץ נדרש'
      });
    }

    const fileInfo = filesService.getFileInfo(filename);

    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: 'הקובץ לא נמצא'
      });
    }

    res.json({
      success: true,
      data: fileInfo
    });

  } catch (error) {
    console.error('Error getting file info:', error);
    res.status(500).json({
      success: false,
      message: 'שגיאה בקבלת מידע על הקובץ'
    });
  }
});

module.exports = router;
