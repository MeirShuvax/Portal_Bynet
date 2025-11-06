const path = require('path');
const { SystemContent } = require('../models');

// הוספת תוכן מערכת (תמונה או קישור)
exports.createSystemContent = async (req, res) => {
  try {
    let { type, url, title, description } = req.body;
    // אם יש קובץ, נעדכן את ה-url לנתיב הקובץ
    if (req.file) {
      type = 'image';
      url = `/uploads/${req.file.filename}`;
    }
    if (!type || !url) {
      return res.status(400).json({ message: 'type ו-url נדרשים' });
    }
    const content = await SystemContent.create({ type, url, title, description });
    res.status(201).json(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאה ביצירת תוכן מערכת' });
  }
};

// שליפת כל תכני המערכת
exports.getAllSystemContents = async (req, res) => {
  try {
    const contents = await SystemContent.findAll({ order: [['createdAt', 'DESC']] });
    res.json(contents);
  } catch (err) {
    res.status(500).json({ message: 'שגיאה בשליפת תכני מערכת' });
  }
};

// שליפת כל התמונות בלבד
exports.getAllImages = async (req, res) => {
  try {
    const images = await SystemContent.findAll({
      where: { type: 'image' },
      order: [['createdAt', 'DESC']]
    });
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: 'שגיאה בשליפת תמונות' });
  }
};

// שליפת כל הקישורים בלבד
exports.getAllLinks = async (req, res) => {
  try {
    const links = await SystemContent.findAll({
      where: { type: 'link' },
      order: [['createdAt', 'DESC']]
    });
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: 'שגיאה בשליפת קישורים' });
  }
};

// מחיקת תוכן מערכת
exports.deleteSystemContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await SystemContent.findByPk(id);
    
    if (!content) {
      return res.status(404).json({ message: 'תוכן לא נמצא' });
    }

    // אם זה תמונה, מחק את הקובץ מהדיסק
    if (content.type === 'image' && content.url) {
      try {
        const fs = require('fs');
        const path = require('path');
        const uploadsDir = process.env.UPLOADS_PATH || path.join(__dirname, '..', 'uploads');
        
        // ניקוי הנתיב - הסר /uploads/ אם יש
        let imageFilename = content.url;
        if (imageFilename.startsWith('/uploads/')) {
          imageFilename = imageFilename.replace('/uploads/', '');
        } else if (imageFilename.startsWith('/')) {
          imageFilename = imageFilename.substring(1);
        }
        
        const imagePath = path.join(uploadsDir, imageFilename);
        
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('🗑️ Deleted image file:', imagePath);
        }
      } catch (deleteError) {
        console.log('⚠️ Could not delete image file:', deleteError.message);
        // לא נכשל אם לא הצלחנו למחוק - נמשיך למחוק מה-DB
      }
    }

    await content.destroy();
    res.json({ message: 'תוכן נמחק בהצלחה' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'שגיאה במחיקת תוכן' });
  }
}; 