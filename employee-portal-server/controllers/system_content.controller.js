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