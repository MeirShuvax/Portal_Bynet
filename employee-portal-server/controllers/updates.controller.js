const { Op, literal } = require('sequelize');
const { Update, User } = require('../models');

// קבלת כל העדכונים, ממוינים לפי פעילים ואז פגי תוקף
exports.getAllUpdates = async (req, res) => {
  try {
    const updates = await Update.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name'] }],
      order: [
        [literal('CASE WHEN expiry_date >= NOW() THEN 1 ELSE 2 END'), 'ASC'],
        ['expiry_date', 'ASC'],
      ],
    });
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// קבלת עדכונים פעילים בלבד
exports.getActiveUpdates = async (req, res) => {
  try {
    const updates = await Update.findAll({
      where: {
        expiry_date: {
          [Op.gt]: new Date(),
        },
      },
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name'] }],
      order: [['expiry_date', 'ASC']],
    });
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// קבלת עדכון בודד
exports.getUpdateById = async (req, res) => {
  try {
    const update = await Update.findByPk(req.params.id);
    if (!update) return res.status(404).json({ error: 'Update not found' });
    res.json(update);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// יצירת עדכון (רק אדמין)
exports.createUpdate = async (req, res) => {
  try {
    const { title, date, expiry_date, content } = req.body;
    const update = await Update.create({
      title,
      date,
      expiry_date,
      content,
      updated_at: new Date(),
      updated_by: req.user.id
    });
    res.status(201).json(update);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// עדכון עדכון (רק אדמין)
exports.updateUpdate = async (req, res) => {
  try {
    const update = await Update.findByPk(req.params.id);
    if (!update) return res.status(404).json({ error: 'Update not found' });
    const { title, date, expiry_date, content } = req.body;
    await update.update({
      title,
      date,
      expiry_date,
      content,
      updated_at: new Date(),
      updated_by: req.user.id
    });
    res.json(update);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// מחיקת עדכון (רק אדמין)
exports.deleteUpdate = async (req, res) => {
  try {
    const update = await Update.findByPk(req.params.id);
    if (!update) return res.status(404).json({ error: 'Update not found' });
    await update.destroy();
    res.json({ message: 'Update deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 